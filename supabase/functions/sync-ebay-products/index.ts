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

    // eBay Inventory API endpoint
    const ebayApiUrl = 'https://api.ebay.com/sell/inventory/v1/inventory_item';
    
    const response = await fetch(`${ebayApiUrl}?limit=100`, {
      headers: {
        'Authorization': `Bearer ${ebayConfig.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('eBay API error:', response.status, errorText);
      throw new Error(`eBay API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const inventoryItems = data.inventoryItems || [];

    console.log(`Fetched ${inventoryItems.length} eBay inventory items`);

    // Transform eBay inventory items to our product format
    const productRecords = inventoryItems.map((item: any) => {
      const product = item.product || {};
      const availability = item.availability || {};
      const packageWeightAndSize = item.packageWeightAndSize || {};
      
      return {
        user_id: user.id,
        handle: item.sku?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `ebay-${item.sku}`,
        title: product.title || 'Untitled eBay Product',
        vendor: 'eBay',
        type: product.brand || null,
        tags: product.aspects ? Object.entries(product.aspects).map(([key, values]: [string, any]) => 
          `${key}: ${Array.isArray(values) ? values.join(', ') : values}`
        ).join('; ') : null,
        published: true,
        body_html: product.description || null,
        category: product.aspects?.Category?.[0] || null,
        
        // Variant data from eBay inventory
        variant_sku: item.sku || null,
        variant_price: product.aspects?.Price?.[0] ? parseFloat(product.aspects.Price[0]) : null,
        variant_inventory_qty: availability.shipToLocationAvailability?.quantity || 0,
        variant_grams: packageWeightAndSize.weight?.value ? 
          Math.round(parseFloat(packageWeightAndSize.weight.value) * 453.592) : null, // Convert lbs to grams
        variant_requires_shipping: true,
        variant_taxable: true,
        
        // Image data
        image_src: product.imageUrls?.[0] || null,
        image_position: 1,
        
        // eBay specific fields
        google_shopping_condition: product.aspects?.Condition?.[0] || 'Used',
        google_shopping_gender: product.aspects?.Gender?.[0] || null,
        google_shopping_age_group: product.aspects?.['Age Group']?.[0] || null,
        
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