import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user')
    }

    console.log(`Starting eBay data cleanup for user: ${user.id}`);

    // 1. Clean up corrupted variant_title data in products table
    const { data: corruptedProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, variant_title, handle, sku')
      .eq('user_id', user.id)
      .eq('variant_title', '[object Object]');

    if (fetchError) {
      console.error('Error fetching corrupted products:', fetchError);
    } else {
      console.log(`Found ${corruptedProducts?.length || 0} products with corrupted variant_title`);
      
      // Update corrupted variant titles to null
      if (corruptedProducts && corruptedProducts.length > 0) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ variant_title: null })
          .eq('user_id', user.id)
          .eq('variant_title', '[object Object]');

        if (updateError) {
          console.error('Error updating corrupted products:', updateError);
        } else {
          console.log(`Updated ${corruptedProducts.length} products with corrupted variant_title`);
        }
      }
    }

    // 2. Clean up corrupted variant_title data in order_items table
    const { data: corruptedOrderItems, error: fetchOrderError } = await supabase
      .from('order_items')
      .select('id, variant_title, order_id')
      .like('variant_title', '%[object Object]%');

    if (fetchOrderError) {
      console.error('Error fetching corrupted order items:', fetchOrderError);
    } else {
      console.log(`Found ${corruptedOrderItems?.length || 0} order items with corrupted variant_title`);
      
      // Update corrupted variant titles to null
      if (corruptedOrderItems && corruptedOrderItems.length > 0) {
        const { error: updateOrderError } = await supabase
          .from('order_items')
          .update({ variant_title: null })
          .like('variant_title', '%[object Object]%');

        if (updateOrderError) {
          console.error('Error updating corrupted order items:', updateOrderError);
        } else {
          console.log(`Updated ${corruptedOrderItems.length} order items with corrupted variant_title`);
        }
      }
    }

    // 3. Delete old eBay orders (older than 7 days) to clean up test data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: oldOrders, error: oldOrdersError } = await supabase
      .from('orders')
      .select('id, order_number, created_at')
      .eq('user_id', user.id)
      .eq('store_platform', 'ebay')
      .lt('created_at', sevenDaysAgo.toISOString());

    if (oldOrdersError) {
      console.error('Error fetching old orders:', oldOrdersError);
    } else {
      console.log(`Found ${oldOrders?.length || 0} old eBay orders to potentially clean up`);
    }

    // 4. Get current eBay order count for debugging
    const { count: currentEbayOrders, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('store_platform', 'ebay')
      .in('status', ['awaiting', 'awaiting_payment', 'pending', 'processing', 'ready_to_ship']);

    if (countError) {
      console.error('Error counting eBay orders:', countError);
    } else {
      console.log(`Current eBay orders awaiting shipment: ${currentEbayOrders}`);
    }

    // 5. Get eBay store configuration status
    const { data: storeConfig, error: storeError } = await supabase
      .from('store_configurations')
      .select('store_name, is_active, platform')
      .eq('user_id', user.id)
      .eq('platform', 'shopify'); // Check if eBay orders are being mapped to Shopify stores

    if (storeError) {
      console.error('Error fetching store config:', storeError);
    } else {
      console.log(`Store configurations:`, storeConfig);
    }

    return new Response(
      JSON.stringify({
        success: true,
        cleaned_products: corruptedProducts?.length || 0,
        cleaned_order_items: corruptedOrderItems?.length || 0,
        old_orders_found: oldOrders?.length || 0,
        current_ebay_orders: currentEbayOrders || 0,
        store_configs: storeConfig
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in cleanup-ebay-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});