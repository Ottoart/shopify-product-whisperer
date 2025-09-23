import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShopifyOrder {
  id: number;
  name: string;
  financial_status: string;
  fulfillment_status: string | null;
  updated_at: string;
  created_at: string;
  cancelled_at: string | null;
  closed_at: string | null;
  fulfillments?: Array<{
    id: number;
    status: string;
    tracking_number: string | null;
    tracking_company: string | null;
    created_at: string;
    updated_at: string;
    shipment_status: string | null;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body for options
    let options = {};
    if (req.method === 'POST') {
      try {
        options = await req.json();
      } catch (e) {
        // Use defaults if no body
      }
    }

    console.log('Starting comprehensive order status update...');

    // Get active Shopify store configurations
    const { data: storeConfigs, error: configError } = await supabase
      .from('store_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .eq('platform', 'shopify');

    if (configError) {
      throw new Error(`Failed to fetch store configurations: ${configError.message}`);
    }

    if (!storeConfigs || storeConfigs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No active Shopify stores configured.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const results = [];
    let totalUpdated = 0;

    // Process each store
    for (const storeConfig of storeConfigs) {
      console.log(`Updating order statuses for ${storeConfig.store_name}...`);
      
      try {
        const storeResult = await updateStoreOrderStatuses(storeConfig, user, supabase);
        results.push({
          store: storeConfig.store_name,
          updated: storeResult.updated,
          details: storeResult.details
        });
        totalUpdated += storeResult.updated;
      } catch (error) {
        console.error(`Error updating statuses for ${storeConfig.store_name}:`, error);
        results.push({
          store: storeConfig.store_name,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully updated ${totalUpdated} order statuses`,
        totalUpdated,
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error updating order statuses:', error);
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

async function updateStoreOrderStatuses(storeConfig: any, user: any, supabase: any) {
  // Get all existing orders for this store that might need status updates
  const { data: existingOrders, error: ordersError } = await supabase
    .from('orders')
    .select('id, order_number, status, updated_at')
    .eq('user_id', user.id)
    .eq('store_name', storeConfig.store_name)
    .eq('store_platform', 'shopify');

  if (ordersError) {
    throw new Error(`Failed to fetch existing orders: ${ordersError.message}`);
  }

  if (!existingOrders || existingOrders.length === 0) {
    console.log(`No existing orders found for ${storeConfig.store_name}`);
    return { updated: 0, details: 'No orders to update' };
  }

  console.log(`Found ${existingOrders.length} existing orders to check`);

  // Build API URL
  let baseUrl;
  if (storeConfig.domain.includes('.myshopify.com')) {
    baseUrl = `https://${storeConfig.domain}/admin/api/2024-01`;
  } else {
    baseUrl = `https://${storeConfig.domain}.myshopify.com/admin/api/2024-01`;
  }

  let updatedCount = 0;
  const updateDetails = [];

  // Process orders in batches to avoid overwhelming the API
  const batchSize = 50;
  for (let i = 0; i < existingOrders.length; i += batchSize) {
    const batch = existingOrders.slice(i, i + batchSize);
    
    for (const dbOrder of batch) {
      try {
        // Fetch current order status from Shopify
        const orderUrl = `${baseUrl}/orders.json?name=${encodeURIComponent(dbOrder.order_number)}&status=any`;
        
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
          console.log(`Order ${dbOrder.order_number} not found in Shopify`);
          continue;
        }

        const shopifyOrder = shopifyOrders[0];
        
        // Determine current status
        const newStatus = determineOrderStatus(shopifyOrder);
        const newShippedDate = getShippedDate(shopifyOrder);
        const newDeliveredDate = getDeliveredDate(shopifyOrder);

        // Check if status needs updating
        const needsUpdate = dbOrder.status !== newStatus;
        
        if (needsUpdate) {
          console.log(`Updating order ${dbOrder.order_number}: ${dbOrder.status} -> ${newStatus}`);
          
          const updateData: any = {
            status: newStatus,
            updated_at: new Date().toISOString()
          };

          if (newShippedDate) {
            updateData.shipped_date = newShippedDate;
          }

          if (newDeliveredDate) {
            updateData.delivered_date = newDeliveredDate;
          }

          // Get tracking info if available
          const trackingInfo = getTrackingInfo(shopifyOrder);
          if (trackingInfo.tracking_number) {
            updateData.tracking_number = trackingInfo.tracking_number;
            updateData.carrier = trackingInfo.carrier;
          }

          const { error: updateError } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', dbOrder.id);

          if (updateError) {
            console.error(`Failed to update order ${dbOrder.order_number}:`, updateError);
          } else {
            updatedCount++;
            updateDetails.push({
              order_number: dbOrder.order_number,
              old_status: dbOrder.status,
              new_status: newStatus,
              shipped_date: newShippedDate,
              delivered_date: newDeliveredDate,
              tracking_number: trackingInfo.tracking_number
            });
          }
        }

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing order ${dbOrder.order_number}:`, error);
      }
    }
  }

  return { 
    updated: updatedCount, 
    details: `Updated ${updatedCount} orders. Sample updates: ${JSON.stringify(updateDetails.slice(0, 3))}` 
  };
}

function determineOrderStatus(shopifyOrder: ShopifyOrder): string {
  // Handle cancelled orders
  if (shopifyOrder.cancelled_at) {
    return 'cancelled';
  }

  // Handle fulfilled orders
  if (shopifyOrder.fulfillment_status === 'fulfilled') {
    return 'delivered';
  }

  // Handle partially fulfilled orders
  if (shopifyOrder.fulfillment_status === 'partial') {
    return 'shipped';
  }

  // Check fulfillments for more detailed status
  if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
    const latestFulfillment = shopifyOrder.fulfillments
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
    
    if (latestFulfillment.status === 'success' || latestFulfillment.shipment_status === 'delivered') {
      return 'delivered';
    }
    
    if (latestFulfillment.status === 'success' || latestFulfillment.shipment_status === 'in_transit') {
      return 'shipped';
    }
  }

  // Handle unfulfilled but paid orders
  if (shopifyOrder.fulfillment_status === null && shopifyOrder.financial_status === 'paid') {
    return 'awaiting';
  }

  // Handle pending payment
  if (shopifyOrder.financial_status === 'pending') {
    return 'processing';
  }

  // Default to awaiting
  return 'awaiting';
}

function getShippedDate(shopifyOrder: ShopifyOrder): string | null {
  if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
    const fulfillment = shopifyOrder.fulfillments.find(f => f.status === 'success');
    if (fulfillment) {
      return fulfillment.created_at;
    }
  }
  return null;
}

function getDeliveredDate(shopifyOrder: ShopifyOrder): string | null {
  if (shopifyOrder.fulfillment_status === 'fulfilled') {
    if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
      const deliveredFulfillment = shopifyOrder.fulfillments.find(f => 
        f.shipment_status === 'delivered' || 
        (f.status === 'success' && shopifyOrder.fulfillment_status === 'fulfilled')
      );
      if (deliveredFulfillment) {
        return deliveredFulfillment.updated_at;
      }
    }
  }
  return null;
}

function getTrackingInfo(shopifyOrder: ShopifyOrder): { tracking_number: string | null, carrier: string | null } {
  if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
    const fulfillmentWithTracking = shopifyOrder.fulfillments.find(f => f.tracking_number);
    if (fulfillmentWithTracking) {
      return {
        tracking_number: fulfillmentWithTracking.tracking_number,
        carrier: fulfillmentWithTracking.tracking_company
      };
    }
  }
  return { tracking_number: null, carrier: null };
}