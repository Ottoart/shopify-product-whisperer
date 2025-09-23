import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    let options: any = {};
    if (req.method === 'POST') {
      try {
        options = await req.json();
      } catch (e) {
        // Use defaults if no body
      }
    }

    console.log('Starting bulk order status cleanup...');
    console.log('Options:', options);

    // Strategy 1: Mark very old orders as delivered (older than 60 days and still "awaiting")
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: oldOrders, error: oldOrdersError } = await supabase
      .from('orders')
      .select('id, order_number, order_date, store_name')
      .eq('user_id', user.id)
      .eq('status', 'awaiting')
      .is('shipped_date', null)
      .is('delivered_date', null)
      .lt('order_date', sixtyDaysAgo.toISOString());

    if (oldOrdersError) {
      throw new Error(`Failed to fetch old orders: ${oldOrdersError.message}`);
    }

    let oldOrdersUpdated = 0;
    if (oldOrders && oldOrders.length > 0) {
      console.log(`Found ${oldOrders.length} orders older than 60 days still marked as awaiting`);
      
      const { error: updateOldError } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', oldOrders.map(order => order.id));

      if (updateOldError) {
        console.error('Error updating old orders:', updateOldError);
      } else {
        oldOrdersUpdated = oldOrders.length;
        console.log(`Marked ${oldOrdersUpdated} old orders as delivered`);
      }
    }

    // Strategy 2: For newer orders (last 60 days), check with Shopify for accurate status
    let shopifyUpdated = 0;
    if (!options.skipShopifyCheck) {
      console.log('Checking recent orders against Shopify...');
      
      const { data: storeConfigs, error: configError } = await supabase
        .from('store_configurations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .eq('platform', 'shopify');

      if (configError) {
        console.warn('Could not fetch store configurations:', configError.message);
      } else if (storeConfigs && storeConfigs.length > 0) {
        for (const storeConfig of storeConfigs) {
          const storeResult = await updateRecentOrdersFromShopify(storeConfig, user, supabase, sixtyDaysAgo);
          shopifyUpdated += storeResult.updated;
        }
      }
    }

    // Strategy 3: Handle orders that might be refunded/cancelled
    const { data: potentiallyCancelledOrders, error: cancelledError } = await supabase
      .from('orders')
      .select('id, order_number, order_date, total_amount')
      .eq('user_id', user.id)
      .eq('status', 'awaiting')
      .is('shipped_date', null)
      .is('delivered_date', null)
      .gte('order_date', sixtyDaysAgo.toISOString());

    let cancelledUpdated = 0;
    if (cancelledError) {
      console.warn('Could not fetch potentially cancelled orders:', cancelledError.message);
    } else if (potentiallyCancelledOrders && potentiallyCancelledOrders.length > 0) {
      // For now, we'll just log these - in a real scenario, you'd check with the platform
      console.log(`Found ${potentiallyCancelledOrders.length} recent orders still awaiting that need manual review`);
      
      // If user wants to force update these, mark them as shipped
      if (options.forceUpdateRecent) {
        const { error: forceUpdateError } = await supabase
          .from('orders')
          .update({
            status: 'shipped',
            shipped_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .in('id', potentiallyCancelledOrders.map(order => order.id));

        if (!forceUpdateError) {
          cancelledUpdated = potentiallyCancelledOrders.length;
          console.log(`Force updated ${cancelledUpdated} recent orders to shipped status`);
        }
      }
    }

    const totalUpdated = oldOrdersUpdated + shopifyUpdated + cancelledUpdated;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Bulk cleanup completed. Total orders updated: ${totalUpdated}`,
        breakdown: {
          oldOrdersMarkedDelivered: oldOrdersUpdated,
          shopifyStatusUpdates: shopifyUpdated,
          recentOrdersUpdated: cancelledUpdated,
          totalUpdated
        },
        recommendations: potentiallyCancelledOrders && potentiallyCancelledOrders.length > 0 ? 
          `${potentiallyCancelledOrders.length} recent orders still need review. Consider running with forceUpdateRecent: true if these should be updated.` : 
          'All orders have been processed.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in bulk update:', error);
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

async function updateRecentOrdersFromShopify(storeConfig: any, user: any, supabase: any, sinceDate: Date) {
  try {
    // Get recent orders that might need status updates
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, status, order_date')
      .eq('user_id', user.id)
      .eq('store_name', storeConfig.store_name)
      .eq('store_platform', 'shopify')
      .eq('status', 'awaiting')
      .is('shipped_date', null)
      .is('delivered_date', null)
      .gte('order_date', sinceDate.toISOString());

    if (ordersError || !recentOrders || recentOrders.length === 0) {
      console.log(`No recent orders to update for ${storeConfig.store_name}`);
      return { updated: 0 };
    }

    console.log(`Checking ${recentOrders.length} recent orders against Shopify for ${storeConfig.store_name}`);

    let baseUrl;
    if (storeConfig.domain.includes('.myshopify.com')) {
      baseUrl = `https://${storeConfig.domain}/admin/api/2024-01`;
    } else {
      baseUrl = `https://${storeConfig.domain}.myshopify.com/admin/api/2024-01`;
    }

    let updatedCount = 0;

    // Process in smaller batches to respect rate limits
    const batchSize = 5;
    for (let i = 0; i < recentOrders.length; i += batchSize) {
      const batch = recentOrders.slice(i, i + batchSize);
      
      for (const dbOrder of batch) {
        try {
          const orderUrl = `${baseUrl}/orders.json?name=${encodeURIComponent(dbOrder.order_number)}&status=any&fields=id,name,financial_status,fulfillment_status,cancelled_at,closed_at,fulfillments`;
          
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
            // Order not found in Shopify - might be deleted/cancelled
            console.log(`Order ${dbOrder.order_number} not found in Shopify, marking as cancelled`);
            
            const { error: updateError } = await supabase
              .from('orders')
              .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
              .eq('id', dbOrder.id);

            if (!updateError) {
              updatedCount++;
            }
            continue;
          }

          const shopifyOrder = shopifyOrders[0];
          
          // Determine new status
          let newStatus = 'awaiting';
          let shippedDate = null;
          let deliveredDate = null;

          if (shopifyOrder.cancelled_at) {
            newStatus = 'cancelled';
          } else if (shopifyOrder.fulfillment_status === 'fulfilled') {
            newStatus = 'delivered';
            deliveredDate = shopifyOrder.fulfillments?.[0]?.updated_at || new Date().toISOString();
          } else if (shopifyOrder.fulfillment_status === 'partial') {
            newStatus = 'shipped';
            shippedDate = shopifyOrder.fulfillments?.[0]?.created_at || new Date().toISOString();
          } else if (shopifyOrder.fulfillments && shopifyOrder.fulfillments.length > 0) {
            newStatus = 'shipped';
            shippedDate = shopifyOrder.fulfillments[0].created_at;
          }

          // Update if status changed
          if (dbOrder.status !== newStatus) {
            const updateData: any = {
              status: newStatus,
              updated_at: new Date().toISOString()
            };

            if (shippedDate) updateData.shipped_date = shippedDate;
            if (deliveredDate) updateData.delivered_date = deliveredDate;

            const { error: updateError } = await supabase
              .from('orders')
              .update(updateData)
              .eq('id', dbOrder.id);

            if (!updateError) {
              updatedCount++;
              console.log(`Updated order ${dbOrder.order_number}: ${dbOrder.status} -> ${newStatus}`);
            }
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
          console.error(`Error checking order ${dbOrder.order_number}:`, error);
        }
      }
    }

    return { updated: updatedCount };

  } catch (error) {
    console.error(`Error updating recent orders for ${storeConfig.store_name}:`, error);
    return { updated: 0 };
  }
}