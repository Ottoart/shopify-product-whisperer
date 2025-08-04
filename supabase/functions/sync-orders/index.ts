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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    console.log('🔍 Processing auth header...');
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.error('❌ Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication: ' + authError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    if (!user) {
      console.error('❌ No user found');
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
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

    console.log(`Found ${storeConfigs.length} active store(s) to sync:`, storeConfigs.map(s => `${s.store_name} (${s.platform})`));

    const syncResults = [];

    // Process each store configuration
    for (const storeConfig of storeConfigs) {
      console.log(`Fetching orders from ${storeConfig.store_name} (${storeConfig.platform})...`);

      try {
        if (storeConfig.platform === 'shopify') {
          await syncShopifyOrders(storeConfig, user, supabase, syncResults);
        } else if (storeConfig.platform === 'walmart') {
          await syncWalmartOrders(storeConfig, user, supabase, syncResults);
        } else if (storeConfig.platform === 'ebay') {
          await syncEbayOrders(storeConfig, user, supabase, syncResults);
        } else {
          console.log(`Unsupported platform: ${storeConfig.platform} for store ${storeConfig.store_name}`);
          syncResults.push({
            store: storeConfig.store_name,
            error: `Platform ${storeConfig.platform} is not supported yet`
          });
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
    const totalStatusUpdated = syncResults.reduce((sum, result) => sum + (result.statusUpdated || 0), 0);
    const totalErrors = syncResults.filter(result => result.error).length;
    const totalStores = syncResults.length;
    
    // Determine overall success - if all stores failed, it's a failure
    const isSuccess = totalErrors < totalStores; // Success if at least one store worked
    
    const message = totalErrors === 0 
      ? `Sync completed successfully. New orders: ${totalSynced}, Status updates: ${totalStatusUpdated}`
      : totalErrors === totalStores
      ? `Sync failed for all stores. No orders synced.`
      : `Sync partially completed. New orders: ${totalSynced}, Status updates: ${totalStatusUpdated} from ${totalStores - totalErrors} of ${totalStores} stores.`;

    return new Response(
      JSON.stringify({ 
        success: isSuccess, 
        message,
        synced: totalSynced,
        results: syncResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isSuccess ? 200 : 400
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
  // Step 1: Update existing order statuses first
  console.log(`Updating existing order statuses for ${storeConfig.store_name}...`);
  const statusUpdateResult = await updateExistingOrderStatuses(storeConfig, user, supabase);
  
  // Step 2: Fetch new orders from Shopify
  // Use the domain as-is, or construct proper URL
  let apiUrl;
  if (storeConfig.domain.includes('.myshopify.com') || storeConfig.domain.includes('.myshopifystore.com')) {
    // Domain already includes the full shopify domain
    apiUrl = `https://${storeConfig.domain}/admin/api/2024-01/orders.json?status=any&limit=250&fulfillment_status=any`;
  } else {
    // Domain is just the shop name, add .myshopify.com
    apiUrl = `https://${storeConfig.domain}.myshopify.com/admin/api/2024-01/orders.json?status=any&limit=250&fulfillment_status=any`;
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
  
  // Check how many existing orders we have in the database for this store
  const { data: existingOrdersCount } = await supabase
    .from('orders')
    .select('order_number', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('store_name', storeConfig.store_name);
    
  console.log(`Existing orders in database for ${storeConfig.store_name}: ${existingOrdersCount}`);
  
  // Log some order details for debugging
  if (shopifyOrders.length > 0) {
    console.log(`Sample order from Shopify:`, {
      name: shopifyOrders[0].name,
      created_at: shopifyOrders[0].created_at,
      financial_status: shopifyOrders[0].financial_status,
      fulfillment_status: shopifyOrders[0].fulfillment_status
    });
  }

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
        product_handle: item.sku || `product-${item.id}`, // Use SKU as handle or generate one
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
      order_id: orderMapping.get(item.order_number),
      product_handle: item.product_handle,
      product_title: item.product_title,
      variant_title: item.variant_title,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      weight_lbs: item.weight_lbs
    })).filter(item => item.order_id); // Only include items with valid order_id

    console.log(`Mapped ${mappedItems.length} items for insertion`);
    console.log('Sample mapped item:', mappedItems[0]);

    if (mappedItems.length > 0) {
      console.log(`Inserting ${mappedItems.length} order items from ${storeConfig.store_name}...`);
      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(mappedItems)
        .select('id');

      if (itemsError) {
        console.error(`Failed to insert order items from ${storeConfig.store_name}:`, itemsError.message);
        console.error('Error details:', itemsError);
        // Don't throw error, just log it - orders are already inserted
        console.warn(`Orders synced but ${mappedItems.length} items failed to sync from ${storeConfig.store_name}`);
      } else {
        console.log(`Successfully inserted ${insertedItems?.length || mappedItems.length} order items from ${storeConfig.store_name}`);
      }
    }

    syncResults.push({
      store: storeConfig.store_name,
      synced: ordersToInsert.length,
      statusUpdated: statusUpdateResult.updated,
      details: `New orders: ${ordersToInsert.length}, Status updates: ${statusUpdateResult.updated}`
    });

    console.log(`Successfully synced ${ordersToInsert.length} new orders and updated ${statusUpdateResult.updated} existing orders from ${storeConfig.store_name}`);
  } else {
    console.log(`No new orders to sync from ${storeConfig.store_name}, but updated ${statusUpdateResult.updated} existing orders`);
    syncResults.push({
      store: storeConfig.store_name,
      synced: 0,
      statusUpdated: statusUpdateResult.updated,
      details: `New orders: 0, Status updates: ${statusUpdateResult.updated}`
    });
  }
}

async function updateExistingOrderStatuses(storeConfig: any, user: any, supabase: any) {
  try {
    // Get orders that might need status updates (awaiting, processing, shipped)
    const { data: existingOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, updated_at')
      .eq('user_id', user.id)
      .eq('store_name', storeConfig.store_name)
      .eq('store_platform', 'shopify')
      .in('status', ['awaiting', 'processing', 'shipped']);

    if (ordersError || !existingOrders || existingOrders.length === 0) {
      console.log(`No existing orders to update for ${storeConfig.store_name}`);
      return { updated: 0 };
    }

    console.log(`Checking ${existingOrders.length} existing orders for status updates`);

    // Build API URL
    let baseUrl;
    if (storeConfig.domain.includes('.myshopify.com')) {
      baseUrl = `https://${storeConfig.domain}/admin/api/2024-01`;
    } else {
      baseUrl = `https://${storeConfig.domain}.myshopify.com/admin/api/2024-01`;
    }

    let updatedCount = 0;

    // Process in batches of 10 to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < existingOrders.length; i += batchSize) {
      const batch = existingOrders.slice(i, i + batchSize);
      
      for (const dbOrder of batch) {
        try {
          // Fetch current order status from Shopify
          const orderUrl = `${baseUrl}/orders.json?name=${encodeURIComponent(dbOrder.order_number)}&status=any&fields=id,name,financial_status,fulfillment_status,cancelled_at,fulfillments`;
          
          const response = await fetch(orderUrl, {
            headers: {
              'X-Shopify-Access-Token': storeConfig.access_token,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.warn(`Failed to fetch order ${dbOrder.order_number}: ${response.status}`);
            continue;
          }

          const data = await response.json();
          const shopifyOrders = data.orders || [];

          if (shopifyOrders.length === 0) {
            continue;
          }

          const shopifyOrder = shopifyOrders[0];
          
          // Determine new status
          const newStatus = determineShopifyOrderStatus(shopifyOrder);
          const shippedDate = getShopifyShippedDate(shopifyOrder);
          const deliveredDate = getShopifyDeliveredDate(shopifyOrder);

          // Check if status needs updating
          if (dbOrder.status !== newStatus) {
            console.log(`Updating order ${dbOrder.order_number}: ${dbOrder.status} -> ${newStatus}`);
            
            const updateData: any = {
              status: newStatus,
              updated_at: new Date().toISOString()
            };

            if (shippedDate) updateData.shipped_date = shippedDate;
            if (deliveredDate) updateData.delivered_date = deliveredDate;

            // Get tracking info if available
            const trackingInfo = getShopifyTrackingInfo(shopifyOrder);
            if (trackingInfo.tracking_number) {
              updateData.tracking_number = trackingInfo.tracking_number;
              updateData.carrier = trackingInfo.carrier;
            }

            const { error: updateError } = await supabase
              .from('orders')
              .update(updateData)
              .eq('id', dbOrder.id);

            if (!updateError) {
              updatedCount++;
            }
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
          console.error(`Error processing order ${dbOrder.order_number}:`, error);
        }
      }
    }

    console.log(`Updated ${updatedCount} order statuses for ${storeConfig.store_name}`);
    return { updated: updatedCount };

  } catch (error) {
    console.error(`Error updating order statuses for ${storeConfig.store_name}:`, error);
    return { updated: 0 };
  }
}

function determineShopifyOrderStatus(shopifyOrder: any): string {
  if (shopifyOrder.cancelled_at) return 'cancelled';
  if (shopifyOrder.fulfillment_status === 'fulfilled') return 'delivered';
  if (shopifyOrder.fulfillment_status === 'partial') return 'shipped';
  
  if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
    const latestFulfillment = shopifyOrder.fulfillments
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
    
    if (latestFulfillment.status === 'success') return 'shipped';
  }
  
  if (shopifyOrder.fulfillment_status === null && shopifyOrder.financial_status === 'paid') return 'awaiting';
  if (shopifyOrder.financial_status === 'pending') return 'processing';
  
  return 'awaiting';
}

function getShopifyShippedDate(shopifyOrder: any): string | null {
  if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
    const fulfillment = shopifyOrder.fulfillments.find((f: any) => f.status === 'success');
    return fulfillment ? fulfillment.created_at : null;
  }
  return null;
}

function getShopifyDeliveredDate(shopifyOrder: any): string | null {
  if (shopifyOrder.fulfillment_status === 'fulfilled' && shopifyOrder.fulfillments) {
    const fulfillment = shopifyOrder.fulfillments.find((f: any) => f.status === 'success');
    return fulfillment ? fulfillment.updated_at : null;
  }
  return null;
}

function getShopifyTrackingInfo(shopifyOrder: any): { tracking_number: string | null, carrier: string | null } {
  if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
    const fulfillmentWithTracking = shopifyOrder.fulfillments.find((f: any) => f.tracking_number);
    if (fulfillmentWithTracking) {
      return {
        tracking_number: fulfillmentWithTracking.tracking_number,
        carrier: fulfillmentWithTracking.tracking_company
      };
    }
  }
  return { tracking_number: null, carrier: null };
}

async function syncWalmartOrders(storeConfig: any, user: any, supabase: any, syncResults: any[]) {
  // Walmart Marketplace API endpoint for orders
  const apiUrl = `https://marketplace.walmartapis.com/v3/orders`;
  
  console.log(`Fetching orders from Walmart API: ${apiUrl}`);
  
  // For Walmart API, we'll use the stored access_token directly as the bearer token
  // This assumes the access_token is already a valid Walmart API token
  const accessToken = storeConfig.access_token;
  
  console.log(`Using Walmart access token: ${accessToken.substring(0, 8)}...`);

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
          product_handle: lineItem.item.sku || `product-${lineItem.lineNumber}`, // Use SKU as handle or generate one
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
      order_id: orderMapping.get(item.order_number),
      product_handle: item.product_handle,
      product_title: item.product_title,
      variant_title: item.variant_title,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      weight_lbs: item.weight_lbs
    })).filter(item => item.order_id); // Only include items with valid order_id

    console.log(`Mapped ${mappedItems.length} items for insertion`);
    console.log('Sample mapped item:', mappedItems[0]);

    if (mappedItems.length > 0) {
      console.log(`Inserting ${mappedItems.length} order items from ${storeConfig.store_name}...`);
      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(mappedItems)
        .select('id');

      if (itemsError) {
        console.error(`Failed to insert order items from ${storeConfig.store_name}:`, itemsError.message);
        console.error('Error details:', itemsError);
        // Don't throw error, just log it - orders are already inserted
        console.warn(`Orders synced but ${mappedItems.length} items failed to sync from ${storeConfig.store_name}`);
      } else {
        console.log(`Successfully inserted ${insertedItems?.length || mappedItems.length} order items from ${storeConfig.store_name}`);
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

async function syncEbayOrders(storeConfig: any, user: any, supabase: any, syncResults: any[]) {
  console.log(`Fetching orders from eBay Store (${storeConfig.platform})...`);
  
  // Parse the eBay access token from the stored JSON
  let ebayAuth;
  try {
    ebayAuth = JSON.parse(storeConfig.access_token);
  } catch (error) {
    throw new Error(`Invalid eBay access token format for ${storeConfig.store_name}`);
  }

  let accessToken = ebayAuth.access_token;
  const refreshToken = ebayAuth.refresh_token;
  
  if (!accessToken) {
    throw new Error(`No eBay access token found for ${storeConfig.store_name}`);
  }

  // eBay Sell Fulfillment API endpoint for orders with full shipping details for sellers
  // Add date filter to get only recent orders (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateFilter = thirtyDaysAgo.toISOString();
  const apiUrl = `https://api.ebay.com/sell/fulfillment/v1/order?filter=orderfulfillmentstatus:{NOT_STARTED|IN_PROGRESS}%20AND%20creationdate:[${dateFilter}..&limit=50`;
  
  console.log(`Fetching orders from eBay API: ${apiUrl}`);
  
  // Function to refresh eBay access token
  const refreshEbayToken = async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available for eBay authentication');
    }

    const clientId = Deno.env.get('EBAY_CLIENT_ID');
    const clientSecret = Deno.env.get('EBAY_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('eBay client credentials not configured');
    }

    const credentials = btoa(`${clientId}:${clientSecret}`);
    
    const tokenResponse = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('eBay token refresh failed:', errorText);
      throw new Error('Failed to refresh eBay access token. Please reconnect your eBay store.');
    }

    const tokenData = await tokenResponse.json();
    
    // Update the stored access token
    const updatedAuth = {
      ...ebayAuth,
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      connected_at: new Date().toISOString()
    };

    await supabase
      .from('store_configurations')
      .update({ access_token: JSON.stringify(updatedAuth) })
      .eq('id', storeConfig.id);

    console.log('eBay access token refreshed successfully');
    return tokenData.access_token;
  };

  // Try to fetch orders with current token
  let ordersResponse = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // If token expired (401), refresh it and try again
  if (ordersResponse.status === 401) {
    console.log('eBay access token expired, refreshing...');
    try {
      accessToken = await refreshEbayToken();
      
      // Retry with new token
      ordersResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    } catch (refreshError) {
      console.error('Failed to refresh eBay token:', refreshError);
      throw new Error('eBay authentication failed. Please reconnect your eBay store in settings.');
    }
  }

  if (!ordersResponse.ok) {
    const errorText = await ordersResponse.text();
    console.error(`eBay orders API error: ${ordersResponse.status} ${ordersResponse.statusText}`, errorText);
    throw new Error(`eBay orders API error: ${ordersResponse.status} ${ordersResponse.statusText}`);
  }

  const responseText = await ordersResponse.text();
  console.log(`eBay response for ${storeConfig.store_name}:`, responseText.substring(0, 500));
  
  let ebayData;
  try {
    ebayData = JSON.parse(responseText);
  } catch (parseError) {
    console.error(`Failed to parse JSON response from eBay ${storeConfig.store_name}:`, parseError);
    throw new Error(`Invalid JSON response from eBay for ${storeConfig.store_name}. Check if credentials are correct.`);
  }

  const ebayOrders = ebayData.orders || [];
  console.log(`Found ${ebayOrders.length} orders from ${storeConfig.store_name}`);

  const ordersToInsert = [];
  const itemsToInsert = [];

  for (const ebayOrder of ebayOrders) {
    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', ebayOrder.orderId)
      .eq('user_id', user.id)
      .single();

    if (existingOrder) {
      console.log(`Order #${ebayOrder.orderId} already exists, skipping...`);
      continue;
    }

    // Calculate total amount from line items
    let totalAmount = 0;
    const currency = ebayOrder.pricingSummary?.total?.currency || 'USD';
    totalAmount = parseFloat(ebayOrder.pricingSummary?.total?.value || '0');

    // Map eBay order status to our status
    let orderStatus = 'awaiting';
    switch (ebayOrder.orderFulfillmentStatus) {
      case 'FULFILLED':
        orderStatus = 'shipped';
        break;
      case 'IN_PROGRESS':
        orderStatus = 'processing';
        break;
      case 'NOT_STARTED':
        orderStatus = 'awaiting';
        break;
      default:
        orderStatus = 'awaiting';
    }

    // Get buyer info - eBay provides full buyer details in fulfillment API
    const buyer = ebayOrder.buyer || {};
    
    // Extract customer name from fulfillment instructions
    const fulfillmentStartInstructions = ebayOrder.fulfillmentStartInstructions || [];
    const shippingStep = fulfillmentStartInstructions.find(step => step.shippingStep);
    const shipTo = shippingStep?.shippingStep?.shipTo || {};
    
    // Use full name from shipping address, fallback to buyer username
    const customerName = shipTo.fullName || 
                        `${shipTo.firstName || ''} ${shipTo.lastName || ''}`.trim() || 
                        buyer.username || 
                        'eBay Customer';
    
    // Use buyer email if available, otherwise construct from username
    const customerEmail = buyer.email || `${buyer.username}@ebay.marketplace`;

    // Get full shipping address from fulfillment instructions
    const shippingAddress = shipTo.contactAddress || {};

    const orderData = {
      user_id: user.id,
      order_number: ebayOrder.orderId,
      customer_name: customerName,
      customer_email: customerEmail,
      order_date: ebayOrder.creationDate || new Date().toISOString(),
      total_amount: totalAmount,
      currency: currency,
      status: orderStatus,
      store_name: storeConfig.store_name,
      store_platform: 'ebay',
      shipping_address_line1: shippingAddress.addressLine1 || '',
      shipping_address_line2: shippingAddress.addressLine2 || null,
      shipping_city: shippingAddress.city || '',
      shipping_state: shippingAddress.stateOrProvince || '',
      shipping_zip: shippingAddress.postalCode || '',
      shipping_country: shippingAddress.countryCode || 'US',
      shipped_date: orderStatus === 'shipped' ? ebayOrder.lastModifiedDate : null,
      tags: ['ebay', 'marketplace'],
      notes: `eBay Order ID: ${ebayOrder.orderId}`
    };

    ordersToInsert.push(orderData);

    // Process line items
    const lineItems = ebayOrder.lineItems || [];
    for (const item of lineItems) {
      const itemPrice = parseFloat(item.total?.value || '0');
      
      itemsToInsert.push({
        order_number: ebayOrder.orderId,
        product_handle: item.sku || item.lineItemId,
        product_title: item.title || 'eBay Item',
        variant_title: item.variationAspects ? 
          Object.entries(item.variationAspects)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') : null,
        sku: item.sku || null,
        quantity: parseInt(item.quantity) || 1,
        price: itemPrice,
        weight_lbs: 0 // eBay doesn't always provide weight
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
      order_id: orderMapping.get(item.order_number),
      product_handle: item.product_handle,
      product_title: item.product_title,
      variant_title: item.variant_title,
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      weight_lbs: item.weight_lbs
    })).filter(item => item.order_id); // Only include items with valid order_id

    console.log(`Mapped ${mappedItems.length} items for insertion`);

    if (mappedItems.length > 0) {
      console.log(`Inserting ${mappedItems.length} order items from ${storeConfig.store_name}...`);
      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(mappedItems)
        .select('id');

      if (itemsError) {
        console.error(`Failed to insert order items from ${storeConfig.store_name}:`, itemsError.message);
        console.error('Error details:', itemsError);
        // Don't throw error, just log it - orders are already inserted
        console.warn(`Orders synced but ${mappedItems.length} items failed to sync from ${storeConfig.store_name}`);
      } else {
        console.log(`Successfully inserted ${insertedItems?.length || mappedItems.length} order items from ${storeConfig.store_name}`);
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