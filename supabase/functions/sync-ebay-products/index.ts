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

    // Get the user's eBay marketplace configuration
    const { data: ebayConfig, error: configError } = await supabase
      .from('marketplace_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'ebay')
      .eq('is_active', true)
      .single();

    if (configError || !ebayConfig) {
      throw new Error('eBay marketplace configuration not found. Please connect your eBay account first.');
    }

    if (!ebayConfig.access_token) {
      throw new Error('eBay access token not found. Please reconnect your eBay account.');
    }

    console.log(`Starting eBay product sync for user ${user.id}`);

    // eBay Sell Marketing API to get seller's active listings
    const ebayApiUrl = 'https://api.ebay.com/sell/marketing/v1/item';
    
    let allItems: any[] = [];
    let offset = 0;
    const limit = 200;
    
    try {
      // First, try to get listings using the Sell API
      const response = await fetch(`${ebayApiUrl}?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${ebayConfig.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Language': 'en-US',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      });

      if (!response.ok) {
        // If that fails, try the Inventory API which should list items
        console.log('Marketing API failed, trying Inventory API for listings...');
        const inventoryResponse = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item?limit=200', {
          headers: {
            'Authorization': `Bearer ${ebayConfig.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'en-US',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        });
        
        if (!inventoryResponse.ok) {
          const errorText = await inventoryResponse.text();
          console.error('eBay Inventory API error:', inventoryResponse.status, errorText);
          throw new Error(`eBay API error: ${inventoryResponse.status} - ${errorText}`);
        }
        
        const inventoryData = await inventoryResponse.json();
        console.log('Inventory API response:', JSON.stringify(inventoryData, null, 2));
        allItems = inventoryData.inventoryItems || [];
      } else {
        const data = await response.json();
        console.log('Marketing API response:', JSON.stringify(data, null, 2));
        allItems = data.items || [];
      }
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }

    console.log(`Found ${allItems.length} eBay items`);

    // Transform eBay items to our product format
    const productRecords = allItems.map((item: any) => {
      // Handle different API response formats
      let itemData: any = {};
      
      if (item.product) {
        // Inventory API format
        itemData = {
          sku: item.sku,
          title: item.product.title,
          description: item.product.description,
          imageUrls: item.product.imageUrls,
          price: item.product.aspects?.Price?.[0],
          condition: item.product.aspects?.Condition?.[0],
          brand: item.product.brand,
          category: item.product.aspects?.Category?.[0],
          quantity: item.availability?.shipToLocationAvailability?.quantity,
        };
      } else {
        // Marketing API or other format
        itemData = {
          sku: item.sku || item.itemId,
          title: item.title || item.name,
          description: item.description,
          imageUrls: item.imageUrls || [item.imageUrl],
          price: item.price?.value || item.currentPrice?.value,
          condition: item.condition,
          brand: item.brand,
          category: item.categoryPath,
          quantity: item.quantity || 1,
        };
      }
      
      return {
        user_id: user.id,
        handle: (itemData.sku || `ebay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`).toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: itemData.title || 'Untitled eBay Product',
        vendor: 'eBay',
        type: itemData.brand || null,
        tags: ['eBay', itemData.condition || 'Used', itemData.category].filter(Boolean).join(', '),
        published: true,
        body_html: itemData.description || null,
        category: itemData.category || null,
        
        // Variant data from eBay listing
        variant_sku: itemData.sku || null,
        variant_price: itemData.price ? parseFloat(itemData.price.toString()) : null,
        variant_inventory_qty: itemData.quantity || 1,
        variant_grams: null, // Not available in API response
        variant_requires_shipping: true,
        variant_taxable: true,
        
        // Image data
        image_src: Array.isArray(itemData.imageUrls) ? itemData.imageUrls[0] : itemData.imageUrls || null,
        image_position: 1,
        
        // eBay specific fields
        google_shopping_condition: itemData.condition || 'Used',
        google_shopping_gender: null,
        google_shopping_age_group: null,
        
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