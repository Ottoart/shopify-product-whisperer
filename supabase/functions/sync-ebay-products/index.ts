import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Get the user's eBay store configuration
    const { data: ebayConfig, error: configError } = await supabase
      .from('store_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'ebay')
      .eq('is_active', true)
      .single();

    if (configError || !ebayConfig) {
      throw new Error('eBay store configuration not found. Please connect your eBay account first.');
    }

    if (!ebayConfig.access_token) {
      throw new Error('eBay access token not found. Please reconnect your eBay account.');
    }

    console.log(`Starting eBay product sync for user ${user.id}`);

    // Parse access token from stored credentials
    let accessToken = ebayConfig.access_token;
    if (typeof accessToken === 'string' && accessToken.startsWith('{')) {
      try {
        const tokenData = JSON.parse(accessToken);
        accessToken = tokenData.access_token;
      } catch (e) {
        console.log('Access token is already a string, using directly');
      }
    }

    // eBay Sell Inventory API - Primary method for getting active listings
    // This API provides comprehensive product data including inventory items
    let allItems: any[] = [];
    let offset = 0;
    const limit = 100; // eBay recommends smaller batches for better performance
    let hasMore = true;
    
    try {
      // Add timeout to prevent infinite hanging
      const timeout = 30000; // 30 seconds per API call
      
      while (hasMore && offset < 2000) { // Increased safety limit but still reasonable
        console.log(`Fetching eBay inventory items, offset: ${offset}, limit: ${limit}`);
        
        const inventoryApiUrl = `https://api.ebay.com/sell/inventory/v1/inventory_item?limit=${limit}&offset=${offset}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const inventoryResponse = await fetch(inventoryApiUrl, {
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Accept-Language': 'en-US',
              'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
            },
          });
          
          clearTimeout(timeoutId);
        
          if (!inventoryResponse.ok) {
            const errorText = await inventoryResponse.text();
            console.error('eBay Inventory API error:', inventoryResponse.status, errorText);
            
            // If auth error, stop immediately
            if (inventoryResponse.status === 401) {
              throw new Error('eBay authentication failed. Please reconnect your eBay account.');
            }
            
            // If rate limited, add delay and retry
            if (inventoryResponse.status === 429) {
              console.log('Rate limited, waiting 2 seconds...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              continue; // Retry same offset
            }
            
            // If Inventory API fails with other errors, try the Browse API as fallback
            console.log('Inventory API failed, trying Browse API for seller items...');
            
            // For store_configurations, we might not have external_user_id
            // Extract from access_token or use store name as fallback
            let ebayUserId = ebayConfig.external_user_id || ebayConfig.store_name;
            if (!ebayUserId) {
              // Try to extract from access token metadata if it's a JSON object
              try {
                if (typeof ebayConfig.access_token === 'string' && ebayConfig.access_token.startsWith('{')) {
                  const tokenData = JSON.parse(ebayConfig.access_token);
                  ebayUserId = tokenData.external_user_id || tokenData.user_id;
                }
              } catch (e) {
                console.log('Could not parse access token for user ID');
              }
            }
            
            if (!ebayUserId) {
              throw new Error('No eBay user ID found. Cannot use Browse API fallback.');
            }
            
            const browseApiUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?filter=seller:${ebayUserId}&limit=${limit}&offset=${offset}`;
            
            const browseController = new AbortController();
            const browseTimeoutId = setTimeout(() => browseController.abort(), timeout);
            
            try {
              const browseResponse = await fetch(browseApiUrl, {
                signal: browseController.signal,
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                },
              });
              
              clearTimeout(browseTimeoutId);
              
              if (!browseResponse.ok) {
                const browseErrorText = await browseResponse.text();
                console.error('eBay Browse API error:', browseResponse.status, browseErrorText);
                
                // If both APIs fail, stop the sync
                if (allItems.length === 0) {
                  throw new Error(`Both eBay APIs failed: Inventory API (${inventoryResponse.status}), Browse API (${browseResponse.status})`);
                } else {
                  console.log(`Browse API failed but we have ${allItems.length} items, stopping sync here.`);
                  hasMore = false;
                  break;
                }
              }
              
              const browseData = await browseResponse.json();
              console.log(`Browse API response (offset ${offset}):`, JSON.stringify(browseData, null, 2));
              const browserItems = browseData.itemSummaries || [];
              allItems.push(...browserItems);
              hasMore = browseData.total > (offset + limit) && browserItems.length === limit;
              
            } catch (browseError) {
              clearTimeout(browseTimeoutId);
              console.error('Browse API timeout or error:', browseError);
              
              if (allItems.length === 0) {
                throw new Error('Both eBay APIs failed or timed out');
              } else {
                console.log(`Continuing with ${allItems.length} items collected so far`);
                hasMore = false;
                break;
              }
            }
            
          } else {
            const inventoryData = await inventoryResponse.json();
            console.log(`Inventory API response (offset ${offset}): Found ${inventoryData.inventoryItems?.length || 0} items`);
            
            const inventoryItems = inventoryData.inventoryItems || [];
            allItems.push(...inventoryItems);
            
            // Check if there are more items to fetch
            hasMore = inventoryItems.length === limit;
            
            // Add small delay to be respectful to eBay's API
            if (hasMore) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
          
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError.name === 'AbortError') {
            console.error(`API call timed out after ${timeout}ms`);
            throw new Error(`eBay API request timed out. This may indicate connectivity issues.`);
          }
          
          throw fetchError;
        }
        
        offset += limit;
        
        // Safety check to prevent infinite loops
        if (offset > 10000) {
          console.log('Safety limit reached, stopping sync to prevent infinite loop');
          break;
        }
      }
    } catch (error) {
      console.error('eBay API sync failed:', error);
      throw error;
    }

    console.log(`Found ${allItems.length} eBay items`);

    // Transform eBay items to our product format
    const productRecords = allItems.map((item: any) => {
      // Handle different API response formats
      let itemData: any = {};
      
      if (item.product) {
        // Inventory API format - most comprehensive data
        itemData = {
          sku: item.sku,
          title: item.product.title,
          description: item.product.description,
          imageUrls: item.product.imageUrls,
          price: item.product.aspects?.Price?.[0],
          condition: item.product.condition || item.product.aspects?.Condition?.[0],
          brand: item.product.brand,
          category: item.product.aspects?.Category?.[0],
          quantity: item.availability?.shipToLocationAvailability?.quantity || 0,
          weight: item.product.weight?.value,
          weightUnit: item.product.weight?.unit,
          packageType: item.packageWeightAndSize?.packageType,
        };
      } else if (item.itemId) {
        // Browse API format - fallback format
        itemData = {
          sku: item.itemId,
          title: item.title,
          description: item.shortDescription,
          imageUrls: item.image ? [item.image.imageUrl] : [],
          price: item.price?.value,
          condition: item.condition,
          brand: item.brand,
          category: item.categories?.[0]?.categoryName,
          quantity: 1, // Browse API doesn't provide quantity
          categoryId: item.categories?.[0]?.categoryId,
        };
      } else {
        // Legacy or other format
        itemData = {
          sku: item.sku || item.itemId || `ebay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: item.title || item.name || 'Untitled eBay Product',
          description: item.description,
          imageUrls: item.imageUrls || [item.imageUrl],
          price: item.price?.value || item.currentPrice?.value,
          condition: item.condition,
          brand: item.brand,
          category: item.categoryPath,
          quantity: item.quantity || 1,
        };
      }
      
      // Create proper handle from SKU or title
      const handle = (itemData.sku || itemData.title || `ebay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Convert weight to grams if available
      let weightInGrams = null;
      if (itemData.weight && itemData.weightUnit) {
        if (itemData.weightUnit === 'POUND') {
          weightInGrams = parseFloat(itemData.weight) * 453.592;
        } else if (itemData.weightUnit === 'OUNCE') {
          weightInGrams = parseFloat(itemData.weight) * 28.3495;
        } else if (itemData.weightUnit === 'KILOGRAM') {
          weightInGrams = parseFloat(itemData.weight) * 1000;
        } else if (itemData.weightUnit === 'GRAM') {
          weightInGrams = parseFloat(itemData.weight);
        }
      }

      return {
        user_id: user.id,
        handle: handle,
        title: itemData.title || 'Untitled eBay Product',
        vendor: 'eBay',
        type: itemData.brand || 'eBay Item',
        tags: ['eBay', itemData.condition || 'Used', itemData.category].filter(Boolean).join(', '),
        published: true,
        body_html: itemData.description || `<p>${itemData.title || 'eBay Product'}</p>`,
        category: itemData.category || null,
        
        // Variant data from eBay listing
        variant_sku: itemData.sku || null,
        variant_price: itemData.price ? parseFloat(itemData.price.toString()) : null,
        variant_inventory_qty: itemData.quantity || 0,
        variant_grams: weightInGrams,
        variant_requires_shipping: true,
        variant_taxable: true,
        
        // Image data - handle both single images and arrays
        image_src: Array.isArray(itemData.imageUrls) && itemData.imageUrls.length > 0 
          ? itemData.imageUrls[0] 
          : (typeof itemData.imageUrls === 'string' ? itemData.imageUrls : null),
        image_position: 1,
        
        // eBay specific fields
        google_shopping_condition: itemData.condition || 'Used',
        google_shopping_gender: null,
        google_shopping_age_group: null,
        
        // SEO fields
        seo_title: itemData.title || 'eBay Product',
        seo_description: itemData.description ? 
          itemData.description.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 
          `${itemData.title || 'eBay Product'} - Available on eBay`,
        
        // Sync status
        shopify_sync_status: null, // This is an eBay product, not Shopify
        shopify_synced_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    // Upsert products (update if exists, insert if new)
    if (productRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('products')
        .upsert(productRecords, { 
          onConflict: 'user_id,handle',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw new Error(`Failed to save products: ${upsertError.message}`);
      }
    }

    // Update marketplace sync status
    await supabase
      .from('marketplace_sync_status')
      .upsert({
        user_id: user.id,
        marketplace: 'ebay',
        last_sync_at: new Date().toISOString(),
        products_synced: productRecords.length,
        sync_status: 'completed',
        error_message: null
      }, {
        onConflict: 'user_id,marketplace'
      });

    console.log(`eBay sync completed. Synced ${productRecords.length} products`);

    return new Response(JSON.stringify({
      success: true,
      productsSynced: productRecords.length,
      message: `Successfully synced ${productRecords.length} products from eBay`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-ebay-products:', error);
    
    // Try to update sync status with error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          await supabase
            .from('marketplace_sync_status')
            .upsert({
              user_id: user.id,
              marketplace: 'ebay',
              sync_status: 'failed',
              error_message: error.message,
              last_sync_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,marketplace'
            });
        }
      }
    } catch (updateError) {
      console.error('Failed to update sync status:', updateError);
    }

    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});