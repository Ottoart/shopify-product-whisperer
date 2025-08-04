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

    // Get request body to check sync preferences
    const body = await req.json().catch(() => ({}));
    const syncActiveOnly = body.syncActiveOnly !== undefined ? body.syncActiveOnly : true;
    
    // Load user sync settings from database
    const { data: syncSettings } = await supabase
      .from('sync_settings')
      .select('sync_active_only')
      .eq('user_id', user.id)
      .eq('platform', 'ebay')
      .maybeSingle();
    
    const shouldSyncActiveOnly = syncSettings?.sync_active_only ?? syncActiveOnly;
    console.log('Sync settings - Active only:', shouldSyncActiveOnly);

    // Parse access token from stored credentials
    let accessToken = ebayConfig.access_token;
    let ebayUserId: string | null = null;
    
    if (typeof accessToken === 'string' && accessToken.startsWith('{')) {
      try {
        const tokenData = JSON.parse(accessToken);
        accessToken = tokenData.access_token || accessToken;
        ebayUserId = tokenData.external_user_id || tokenData.user_id;
        console.log('Parsed eBay credentials, found user ID:', !!ebayUserId);
      } catch (e) {
        console.log('Access token is already a string, using directly');
      }
    }

    // Validate token
    if (!accessToken || accessToken.length < 10) {
      throw new Error('Invalid eBay access token. Please reconnect your eBay account.');
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
            
            // Use parsed user ID or fallback to other sources
            let fallbackUserId = ebayUserId || ebayConfig.external_user_id || ebayConfig.store_name;
            
            if (!fallbackUserId) {
              throw new Error('No eBay user ID found for Browse API fallback. Please reconnect your eBay account.');
            }
            
            const browseApiUrl = `https://api.ebay.com/buy/browse/v1/item_summary/search?filter=seller:${encodeURIComponent(fallbackUserId)}&limit=${limit}&offset=${offset}`;
            
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

    // Filter products based on user preference
    let itemsToSync = allItems;
    let skippedCount = 0;
    
    if (shouldSyncActiveOnly) {
      const activeItems = allItems.filter((item: any) => {
        if (item.product) {
          // Inventory API format - check availability
          const quantity = item.availability?.shipToLocationAvailability?.quantity || 0;
          return quantity > 0;
        } else if (item.itemId) {
          // Browse API format - check if item has buying options
          return item.buyingOptions && item.buyingOptions.length > 0;
        } else {
          // Legacy format - check quantity
          return (item.quantity || 0) > 0;
        }
      });
      
      itemsToSync = activeItems;
      skippedCount = allItems.length - activeItems.length;
      console.log(`Filtered to ${activeItems.length} active eBay items (${skippedCount} inactive items excluded)`);
    } else {
      console.log(`Syncing all ${allItems.length} eBay items (including inactive ones)`);
    }

    // Group items by listing and track status counts
    const listingGroups = new Map();
    const statusCounts = {
      active: 0,
      ended: 0,
      draft: 0,
      unsold: 0,
      scheduled: 0
    };

    // Process each item to group by parent listing
    itemsToSync.forEach((item: any) => {
      // Determine listing status
      let listingStatus = 'unknown';
      if (item.product) {
        // Inventory API - check availability for status
        const quantity = item.availability?.shipToLocationAvailability?.quantity || 0;
        listingStatus = quantity > 0 ? 'active' : 'unsold';
      } else if (item.itemId) {
        // Browse API - if item appears in browse, it's likely active
        listingStatus = item.buyingOptions && item.buyingOptions.length > 0 ? 'active' : 'ended';
      }

      // Count by status
      if (listingStatus === 'active') statusCounts.active++;
      else if (listingStatus === 'ended') statusCounts.ended++;
      else if (listingStatus.includes('draft')) statusCounts.draft++;
      else if (listingStatus.includes('unsold')) statusCounts.unsold++;
      else if (listingStatus.includes('scheduled')) statusCounts.scheduled++;

      // Use SKU or item ID as grouping key - eBay variants typically share the same base SKU
      const listingId = item.sku || item.itemId || `ebay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const parentId = listingId.split('-')[0]; // Group variants that share base SKU
      
      if (!listingGroups.has(parentId)) {
        listingGroups.set(parentId, {
          parentListing: item,
          variants: [],
          status: listingStatus
        });
      }
      
      listingGroups.get(parentId).variants.push({...item, determinedStatus: listingStatus});
    });

    console.log(`eBay listing status counts:`, statusCounts);

    // Transform grouped listings into product records
    const productRecords = Array.from(listingGroups.values()).map(({ parentListing, variants, status }) => {
      // Handle different API response formats for the parent listing
      let itemData: any = {};
      
      if (parentListing.product) {
        // Inventory API format - most comprehensive data
        itemData = {
          sku: parentListing.sku,
          title: parentListing.product.title,
          description: parentListing.product.description,
          imageUrls: parentListing.product.imageUrls,
          price: parentListing.product.aspects?.Price?.[0],
          condition: parentListing.product.condition || parentListing.product.aspects?.Condition?.[0],
          brand: parentListing.product.brand,
          category: parentListing.product.aspects?.Category?.[0],
          quantity: parentListing.availability?.shipToLocationAvailability?.quantity || 0,
          weight: parentListing.product.weight?.value,
          weightUnit: parentListing.product.weight?.unit,
          packageType: parentListing.packageWeightAndSize?.packageType,
        };
      } else if (parentListing.itemId) {
        // Browse API format - fallback format
        itemData = {
          sku: parentListing.itemId,
          title: parentListing.title,
          description: parentListing.shortDescription,
          imageUrls: parentListing.image ? [parentListing.image.imageUrl] : [],
          price: parentListing.price?.value,
          condition: parentListing.condition,
          brand: parentListing.brand,
          category: parentListing.categories?.[0]?.categoryName,
          quantity: 1, // Browse API doesn't provide quantity
          categoryId: parentListing.categories?.[0]?.categoryId,
        };
      } else {
        // Legacy or other format
        itemData = {
          sku: parentListing.sku || parentListing.itemId || `ebay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: parentListing.title || parentListing.name || 'Untitled eBay Product',
          description: parentListing.description,
          imageUrls: parentListing.imageUrls || [parentListing.imageUrl],
          price: parentListing.price?.value || parentListing.currentPrice?.value,
          condition: parentListing.condition,
          brand: parentListing.brand,
          category: parentListing.categoryPath,
          quantity: parentListing.quantity || 1,
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

      // Calculate total quantity across all variants
      const totalQuantity = variants.reduce((sum: number, variant: any) => {
        if (variant.product) {
          return sum + (variant.availability?.shipToLocationAvailability?.quantity || 0);
        } else if (variant.itemId) {
          return sum + 1; // Browse API doesn't provide quantity
        }
        return sum + (variant.quantity || 1);
      }, 0);

      return {
        user_id: user.id,
        handle: handle,
        title: itemData.title || 'Untitled eBay Product',
        vendor: 'eBay',
        type: itemData.brand || 'eBay Item',
        tags: ['eBay', itemData.condition || 'Used', itemData.category].filter(Boolean).join(', '),
        published: status === 'active',
        body_html: itemData.description || `<p>${itemData.title || 'eBay Product'}</p>`,
        category: itemData.category || null,
        
        // Variant data from eBay listing
        variant_sku: itemData.sku || null,
        variant_title: variants.length > 1 ? 
          variants.map((v, i) => `Variant ${i + 1}${v.determinedStatus ? ` (${v.determinedStatus})` : ''}`).join(', ') :
          null,
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

        // New eBay-specific listing fields
        listing_status: status,
        parent_listing_id: itemData.sku || handle,
        listing_type: variants.length > 1 ? 'variant' : 'single',
        ebay_listing_id: itemData.sku || handle,
        quantity_available: totalQuantity,
        quantity_sold: 0, // Would need separate API call to get sales data
        start_time: null, // Would need listing details API call
        end_time: null    // Would need listing details API call
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

    // Update marketplace sync status with detailed information including listing status counts
    await supabase
      .from('marketplace_sync_status')
      .upsert({
        user_id: user.id,
        marketplace: 'ebay',
        sync_status: 'completed',
        last_sync_at: new Date().toISOString(),
        products_synced: productRecords.length,
        total_products_found: allItems.length,
        active_products_synced: shouldSyncActiveOnly ? productRecords.length : statusCounts.active,
        inactive_products_skipped: shouldSyncActiveOnly ? skippedCount : undefined,
        active_listings: statusCounts.active,
        ended_listings: statusCounts.ended,
        draft_listings: statusCounts.draft,
        unsold_listings: statusCounts.unsold,
        scheduled_listings: statusCounts.scheduled,
        sync_settings: {
          active_only: shouldSyncActiveOnly,
          sync_timestamp: new Date().toISOString()
        },
        error_message: null
      }, {
        onConflict: 'user_id,marketplace'
      });

    console.log(`eBay sync completed for user ${user.id}. Synced ${productRecords.length} products (${allItems.length} total found, ${skippedCount} skipped).`);

    const filterMessage = shouldSyncActiveOnly ? ' (active products only)' : ' (all products)';
    
    return new Response(JSON.stringify({
      success: true,
      productsSynced: productRecords.length,
      totalFound: allItems.length,
      skippedCount: skippedCount,
      activeOnly: shouldSyncActiveOnly,
      message: `Successfully synced ${productRecords.length} products from eBay${filterMessage}`
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