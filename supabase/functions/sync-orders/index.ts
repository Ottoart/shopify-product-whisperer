import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShopifyOrder {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  total_price: string;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    title: string;
    variant_title: string | null;
    sku: string | null;
    quantity: number;
    price: string;
    grams: number;
  }>;
  tags: string;
  note: string | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get Shopify credentials
    const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
    const shopifyAccessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');

    if (!shopifyDomain || !shopifyAccessToken) {
      throw new Error('Shopify credentials not configured');
    }

    console.log('Fetching orders from Shopify...');

    // Fetch orders from Shopify
    const shopifyResponse = await fetch(
      `https://${shopifyDomain}/admin/api/2023-10/orders.json?status=any&limit=250`,
      {
        headers: {
          'X-Shopify-Access-Token': shopifyAccessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!shopifyResponse.ok) {
      throw new Error(`Shopify API error: ${shopifyResponse.statusText}`);
    }

    const shopifyData = await shopifyResponse.json();
    const shopifyOrders = shopifyData.orders || [];

    console.log(`Found ${shopifyOrders.length} orders from Shopify`);

    // Transform and insert orders
    const ordersToInsert = [];
    const itemsToInsert = [];

    for (const shopifyOrder of shopifyOrders) {
      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', shopifyOrder.name)
        .eq('user_id', user.id)
        .single();

      if (existingOrder) {
        console.log(`Order ${shopifyOrder.name} already exists, skipping...`);
        continue;
      }

      // Map Shopify status to our status
      const getOrderStatus = (financial: string, fulfillment: string | null) => {
        if (fulfillment === 'fulfilled') return 'delivered';
        if (fulfillment === 'partial') return 'shipped';
        if (fulfillment === null && financial === 'paid') return 'awaiting';
        if (financial === 'pending') return 'processing';
        return 'awaiting';
      };

      const orderData = {
        user_id: user.id,
        order_number: shopifyOrder.name,
        customer_name: shopifyOrder.shipping_address 
          ? `${shopifyOrder.shipping_address.first_name} ${shopifyOrder.shipping_address.last_name}`
          : shopifyOrder.email,
        customer_email: shopifyOrder.email,
        store_name: shopifyDomain.split('.')[0],
        store_platform: 'shopify',
        status: getOrderStatus(shopifyOrder.financial_status, shopifyOrder.fulfillment_status),
        total_amount: parseFloat(shopifyOrder.total_price),
        currency: shopifyOrder.currency,
        shipping_address_line1: shopifyOrder.shipping_address?.address1 || '',
        shipping_address_line2: shopifyOrder.shipping_address?.address2,
        shipping_city: shopifyOrder.shipping_address?.city || '',
        shipping_state: shopifyOrder.shipping_address?.province || '',
        shipping_zip: shopifyOrder.shipping_address?.zip || '',
        shipping_country: shopifyOrder.shipping_address?.country || 'US',
        address_validated: true, // Shopify addresses are generally validated
        weight_lbs: shopifyOrder.line_items.reduce((total, item) => total + (item.grams * item.quantity / 453.592), 0), // Convert grams to lbs
        tags: shopifyOrder.tags ? shopifyOrder.tags.split(', ') : [],
        notes: shopifyOrder.note,
        priority_level: 1,
        order_date: shopifyOrder.created_at,
        updated_at: shopifyOrder.updated_at
      };

      ordersToInsert.push(orderData);

      // Prepare order items
      shopifyOrder.line_items.forEach((item: any) => {
        itemsToInsert.push({
          order_number: shopifyOrder.name, // We'll need to map this to order_id after insert
          product_title: item.title,
          variant_title: item.variant_title,
          sku: item.sku,
          quantity: item.quantity,
          price: parseFloat(item.price),
          weight_lbs: item.grams / 453.592 // Convert grams to lbs
        });
      });
    }

    if (ordersToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new orders to sync',
          synced: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Inserting ${ordersToInsert.length} new orders...`);

    // Insert orders
    const { data: insertedOrders, error: ordersError } = await supabase
      .from('orders')
      .insert(ordersToInsert)
      .select('id, order_number');

    if (ordersError) {
      throw new Error(`Failed to insert orders: ${ordersError.message}`);
    }

    // Create order_id mapping for items
    const orderMapping = new Map();
    insertedOrders.forEach(order => {
      orderMapping.set(order.order_number, order.id);
    });

    // Map items to order IDs and insert
    const mappedItems = itemsToInsert.map(item => ({
      ...item,
      order_id: orderMapping.get(item.order_number),
      order_number: undefined // Remove this field
    })).filter(item => item.order_id); // Only include items with valid order_id

    if (mappedItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(mappedItems);

      if (itemsError) {
        console.error('Failed to insert order items:', itemsError.message);
      }
    }

    console.log(`Successfully synced ${ordersToInsert.length} orders with ${mappedItems.length} items`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${ordersToInsert.length} orders from Shopify`,
        synced: ordersToInsert.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error syncing orders:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});