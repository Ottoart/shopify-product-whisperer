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

interface WalmartOrder {
  purchaseOrderId: string;
  customerOrderId: string;
  customerEmailId: string;
  orderDate: number;
  shippingInfo: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderLines: {
    lineItems: Array<{
      lineNumber: string;
      item: {
        productName: string;
        sku: string;
      };
      charges: Array<{
        chargeType: string;
        chargeName: string;
        chargeAmount: {
          currency: string;
          amount: number;
        };
      }>;
      orderLineQuantity: {
        unitOfMeasurement: string;
        amount: string;
      };
    }>;
  };
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

    // Parse request body to check for store filter
    let storeFilter = null;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        storeFilter = body.storeFilter || body.storeName;
        console.log(`Store filter requested: ${storeFilter}`);
      } catch (e) {
        // No body or invalid JSON, proceed without filter
        console.log('No request body or invalid JSON, syncing all stores');
      }
    }

    // Get active store configurations for the user
    let storeQuery = supabase
      .from('store_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Apply store filter if provided
    if (storeFilter) {
      storeQuery = storeQuery.eq('store_name', storeFilter);
    }

    const { data: storeConfigs, error: configError } = await storeQuery;

    if (configError) {
      throw new Error(`Failed to fetch store configurations: ${configError.message}`);
    }

    if (!storeConfigs || storeConfigs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No active stores configured. Please add your store configuration first.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Found ${storeConfigs.length} active store(s) to sync`);

    const syncResults = [];

    // Process each store configuration
    for (const storeConfig of storeConfigs) {
      console.log(`Fetching orders from ${storeConfig.store_name} (${storeConfig.platform})...`);

      try {
        if (storeConfig.platform === 'shopify') {
          await syncShopifyOrders(storeConfig, user, supabase, syncResults);
        } else if (storeConfig.platform === 'walmart') {
          await syncWalmartOrders(storeConfig, user, supabase, syncResults);
        }
        
      } catch (storeError: any) {
        console.error(`Error syncing orders from ${storeConfig.store_name}:`, storeError);
        syncResults.push({
          store: storeConfig.store_name,
          error: storeError.message
        });
      }
    }

    const totalSynced = syncResults.reduce((sum, result) => sum + (result.synced || 0), 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sync completed. Total orders synced: ${totalSynced}`,
        synced: totalSynced,
        results: syncResults
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

async function syncShopifyOrders(storeConfig: any, user: any, supabase: any, syncResults: any[]) {
  // Fetch orders from Shopify
  // Use the domain as-is, or construct proper URL
  let apiUrl;
  if (storeConfig.domain.includes('.myshopify.com') || storeConfig.domain.includes('.myshopifystore.com')) {
    // Domain already includes the full shopify domain
    apiUrl = `https://${storeConfig.domain}/admin/api/2023-10/orders.json?status=any&limit=250`;
  } else {
    // Domain is just the shop name, add .myshopify.com
    apiUrl = `https://${storeConfig.domain}.myshopify.com/admin/api/2023-10/orders.json?status=any&limit=250`;
  }
  
  console.log(`Fetching orders from: ${apiUrl}`);
  const shopifyResponse = await fetch(apiUrl,
    {
      headers: {
        'X-Shopify-Access-Token': storeConfig.access_token,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!shopifyResponse.ok) {
    const errorText = await shopifyResponse.text();
    console.error(`Shopify API error for ${storeConfig.store_name}: ${shopifyResponse.status} ${shopifyResponse.statusText}`, errorText);
    throw new Error(`Shopify API error for ${storeConfig.store_name}: ${shopifyResponse.status} ${shopifyResponse.statusText}`);
  }

  const responseText = await shopifyResponse.text();
  console.log(`Shopify response for ${storeConfig.store_name}:`, responseText.substring(0, 500));
  
  let shopifyData;
  try {
    shopifyData = JSON.parse(responseText);
  } catch (parseError) {
    console.error(`Failed to parse JSON response from ${storeConfig.store_name}:`, parseError);
    throw new Error(`Invalid JSON response from Shopify for ${storeConfig.store_name}. Check if domain and access token are correct.`);
  }
  const shopifyOrders = shopifyData.orders || [];

  console.log(`Found ${shopifyOrders.length} orders from ${storeConfig.store_name}`);

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
      store_name: storeConfig.store_name,
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

  if (ordersToInsert.length > 0) {
    console.log(`Inserting ${ordersToInsert.length} new orders from ${storeConfig.store_name}...`);

    // Insert orders
    const { data: insertedOrders, error: ordersError } = await supabase
      .from('orders')
      .insert(ordersToInsert)
      .select('id, order_number');

    if (ordersError) {
      throw new Error(`Failed to insert orders from ${storeConfig.store_name}: ${ordersError.message}`);
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
        console.error(`Failed to insert order items from ${storeConfig.store_name}:`, itemsError.message);
      }
    }

    syncResults.push({
      store: storeConfig.store_name,
      synced: ordersToInsert.length
    });

    console.log(`Successfully synced ${ordersToInsert.length} orders from ${storeConfig.store_name}`);
  } else {
    console.log(`No new orders to sync from ${storeConfig.store_name}`);
    syncResults.push({
      store: storeConfig.store_name,
      synced: 0
    });
  }
}

async function syncWalmartOrders(storeConfig: any, user: any, supabase: any, syncResults: any[]) {
  // Walmart Marketplace API endpoint for orders
  const apiUrl = `https://marketplace.walmartapis.com/v3/orders`;
  
  console.log(`Fetching orders from Walmart API: ${apiUrl}`);
  
  // For Walmart API, we need to generate an access token using client credentials
  // access_token field contains Client ID, domain field contains Client Secret
  const clientId = storeConfig.access_token;
  const clientSecret = storeConfig.domain;
  
  console.log(`Using Walmart credentials: Client ID: ${clientId.substring(0, 8)}...`);
  
  // First, get access token
  const tokenResponse = await fetch('https://marketplace.walmartapis.com/v3/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error(`Walmart token error: ${tokenResponse.status} ${tokenResponse.statusText}`, errorText);
    throw new Error(`Failed to get Walmart access token: ${tokenResponse.status} ${tokenResponse.statusText}`);
  }

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Now fetch orders with the access token
  const ordersResponse = await fetch(apiUrl, {
    headers: {
      'WM_SEC.ACCESS_TOKEN': accessToken,
      'WM_QOS.CORRELATION_ID': crypto.randomUUID(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  if (!ordersResponse.ok) {
    const errorText = await ordersResponse.text();
    console.error(`Walmart orders API error: ${ordersResponse.status} ${ordersResponse.statusText}`, errorText);
    throw new Error(`Walmart orders API error: ${ordersResponse.status} ${ordersResponse.statusText}`);
  }

  const responseText = await ordersResponse.text();
  console.log(`Walmart response for ${storeConfig.store_name}:`, responseText.substring(0, 500));
  
  let walmartData;
  try {
    walmartData = JSON.parse(responseText);
  } catch (parseError) {
    console.error(`Failed to parse JSON response from Walmart ${storeConfig.store_name}:`, parseError);
    throw new Error(`Invalid JSON response from Walmart for ${storeConfig.store_name}. Check if credentials are correct.`);
  }

  const walmartOrders = walmartData.list?.elements || [];
  console.log(`Found ${walmartOrders.length} orders from ${storeConfig.store_name}`);

  const ordersToInsert = [];
  const itemsToInsert = [];

  for (const walmartOrder of walmartOrders) {
    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', walmartOrder.purchaseOrderId)
      .eq('user_id', user.id)
      .single();

    if (existingOrder) {
      console.log(`Order ${walmartOrder.purchaseOrderId} already exists, skipping...`);
      continue;
    }

    // Calculate total amount from line items
    let totalAmount = 0;
    if (walmartOrder.orderLines?.lineItems) {
      for (const lineItem of walmartOrder.orderLines.lineItems) {
        const productCharges = lineItem.charges?.filter(charge => charge.chargeType === 'PRODUCT') || [];
        totalAmount += productCharges.reduce((sum, charge) => sum + charge.chargeAmount.amount, 0);
      }
    }

    const orderData = {
      user_id: user.id,
      order_number: walmartOrder.purchaseOrderId,
      customer_name: walmartOrder.shippingInfo 
        ? `${walmartOrder.shippingInfo.firstName} ${walmartOrder.shippingInfo.lastName}`
        : walmartOrder.customerEmailId,
      customer_email: walmartOrder.customerEmailId,
      store_name: storeConfig.store_name,
      store_platform: 'walmart',
      status: 'awaiting', // Walmart orders are typically awaiting fulfillment
      total_amount: totalAmount,
      currency: 'USD', // Walmart typically uses USD
      shipping_address_line1: walmartOrder.shippingInfo?.address1 || '',
      shipping_address_line2: walmartOrder.shippingInfo?.address2,
      shipping_city: walmartOrder.shippingInfo?.city || '',
      shipping_state: walmartOrder.shippingInfo?.state || '',
      shipping_zip: walmartOrder.shippingInfo?.postalCode || '',
      shipping_country: walmartOrder.shippingInfo?.country || 'US',
      address_validated: true,
      weight_lbs: 0, // Walmart doesn't provide weight in orders API
      tags: [],
      notes: null,
      priority_level: 1,
      order_date: new Date(walmartOrder.orderDate).toISOString(),
      updated_at: new Date().toISOString()
    };

    ordersToInsert.push(orderData);

    // Prepare order items
    if (walmartOrder.orderLines?.lineItems) {
      walmartOrder.orderLines.lineItems.forEach((lineItem: any) => {
        const productCharges = lineItem.charges?.filter(charge => charge.chargeType === 'PRODUCT') || [];
        const itemPrice = productCharges.reduce((sum, charge) => sum + charge.chargeAmount.amount, 0);
        
        itemsToInsert.push({
          order_number: walmartOrder.purchaseOrderId,
          product_title: lineItem.item.productName,
          variant_title: null,
          sku: lineItem.item.sku,
          quantity: parseInt(lineItem.orderLineQuantity.amount),
          price: itemPrice,
          weight_lbs: 0 // Not provided by Walmart
        });
      });
    }
  }

  if (ordersToInsert.length > 0) {
    console.log(`Inserting ${ordersToInsert.length} new orders from ${storeConfig.store_name}...`);

    // Insert orders
    const { data: insertedOrders, error: ordersError } = await supabase
      .from('orders')
      .insert(ordersToInsert)
      .select('id, order_number');

    if (ordersError) {
      throw new Error(`Failed to insert orders from ${storeConfig.store_name}: ${ordersError.message}`);
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
    })).filter(item => item.order_id);

    if (mappedItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(mappedItems);

      if (itemsError) {
        console.error(`Failed to insert order items from ${storeConfig.store_name}:`, itemsError.message);
      }
    }

    syncResults.push({
      store: storeConfig.store_name,
      synced: ordersToInsert.length
    });

    console.log(`Successfully synced ${ordersToInsert.length} orders from ${storeConfig.store_name}`);
  } else {
    console.log(`No new orders to sync from ${storeConfig.store_name}`);
    syncResults.push({
      store: storeConfig.store_name,
      synced: 0
    });
  }
}