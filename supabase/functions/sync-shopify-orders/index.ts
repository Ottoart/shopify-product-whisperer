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

    const { storeUrl, accessToken, dateFrom, dateTo, limit = 250 } = await req.json();
    
    if (!storeUrl || !accessToken) {
      throw new Error('Store URL and access token are required');
    }

    // Clean and prepare access token
    let cleanAccessToken = accessToken.toString().trim();
    try {
      const parsed = JSON.parse(cleanAccessToken);
      if (parsed.access_token) {
        cleanAccessToken = parsed.access_token;
      }
    } catch (e) {
      // Not JSON, continue with string cleaning
    }
    
    cleanAccessToken = cleanAccessToken
      .replace(/[\s\n\r\t\u2028\u2029]/g, '')
      .split(/\s+/)[0]
      .replace(/[^\w-]/g, '');
    
    const shpatMatch = cleanAccessToken.match(/shpat_[a-zA-Z0-9]+/);
    if (shpatMatch) {
      cleanAccessToken = shpatMatch[0];
    }
    
    if (!cleanAccessToken.startsWith('shpat_')) {
      throw new Error('Invalid Shopify access token format');
    }

    // Clean domain
    let shopifyDomain = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (shopifyDomain.includes('_')) {
      shopifyDomain = shopifyDomain.split('_')[0];
    }
    const baseUrl = `https://${shopifyDomain}/admin/api/2023-10`;

    console.log(`Starting order sync for user ${user.id}`);

    // Build orders URL with comprehensive fields
    let url = `${baseUrl}/orders.json?limit=${limit}&status=any&fields=id,order_number,email,phone,customer,financial_status,fulfillment_status,total_price,subtotal_price,total_tax,total_discounts,currency,order_status_url,tags,note,gateway,test,total_line_items_price,taxes_included,total_weight,confirmed,total_tip_received,checkout_id,source_name,referring_site,landing_site,cancelled_at,cancel_reason,processed_at,created_at,updated_at,billing_address,shipping_address,line_items`;
    
    // Add date filtering if provided
    if (dateFrom) {
      url += `&created_at_min=${dateFrom}`;
    }
    if (dateTo) {
      url += `&created_at_max=${dateTo}`;
    }

    console.log('Fetching orders from:', url.substring(0, 100) + '...');

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': cleanAccessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0'
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const orders = data.orders || [];
    
    console.log(`Processing ${orders.length} orders for batch`);

    // Transform orders for database
    const orderRecords = orders.map(order => {
      const billingAddress = order.billing_address || {};
      const shippingAddress = order.shipping_address || {};
      
      return {
        user_id: user.id,
        shopify_order_id: order.id?.toString(),
        order_number: order.order_number || order.name,
        email: order.email,
        phone: order.phone,
        customer_id: order.customer?.id?.toString(),
        financial_status: order.financial_status,
        fulfillment_status: order.fulfillment_status,
        total_price: order.total_price ? parseFloat(order.total_price) : null,
        subtotal_price: order.subtotal_price ? parseFloat(order.subtotal_price) : null,
        total_tax: order.total_tax ? parseFloat(order.total_tax) : null,
        total_discounts: order.total_discounts ? parseFloat(order.total_discounts) : null,
        currency: order.currency || 'USD',
        order_status_url: order.order_status_url,
        tags: order.tags,
        note: order.note,
        gateway: order.gateway,
        test: order.test || false,
        total_line_items_price: order.total_line_items_price ? parseFloat(order.total_line_items_price) : null,
        taxes_included: order.taxes_included,
        total_weight: order.total_weight,
        confirmed: order.confirmed,
        total_tip_received: order.total_tip_received ? parseFloat(order.total_tip_received) : null,
        checkout_id: order.checkout_id?.toString(),
        source_name: order.source_name,
        referring_site: order.referring_site,
        landing_site: order.landing_site,
        cancelled_at: order.cancelled_at,
        cancel_reason: order.cancel_reason,
        processed_at: order.processed_at,
        created_at: order.created_at || new Date().toISOString(),
        updated_at: order.updated_at || new Date().toISOString(),
        
        // Billing address
        billing_first_name: billingAddress.first_name,
        billing_last_name: billingAddress.last_name,
        billing_company: billingAddress.company,
        billing_address1: billingAddress.address1,
        billing_address2: billingAddress.address2,
        billing_city: billingAddress.city,
        billing_province: billingAddress.province,
        billing_country: billingAddress.country,
        billing_zip: billingAddress.zip,
        billing_phone: billingAddress.phone,
        
        // Shipping address
        shipping_first_name: shippingAddress.first_name,
        shipping_last_name: shippingAddress.last_name,
        shipping_company: shippingAddress.company,
        shipping_address1: shippingAddress.address1,
        shipping_address2: shippingAddress.address2,
        shipping_city: shippingAddress.city,
        shipping_province: shippingAddress.province,
        shipping_country: shippingAddress.country,
        shipping_zip: shippingAddress.zip,
        shipping_phone: shippingAddress.phone,
      };
    });

    // Upsert orders
    if (orderRecords.length > 0) {
      const { error: orderError } = await supabase
        .from('shopify_orders')
        .upsert(orderRecords, { 
          onConflict: 'user_id,shopify_order_id',
          ignoreDuplicates: false 
        });

      if (orderError) {
        console.error('Order upsert error:', orderError);
        throw new Error(`Failed to save orders: ${orderError.message}`);
      }

      // Process line items for each order
      const allLineItems = [];
      for (const order of orders) {
        if (order.line_items && order.line_items.length > 0) {
          // Find the order record we just inserted to get the UUID
          const { data: orderRecord } = await supabase
            .from('shopify_orders')
            .select('id')
            .eq('user_id', user.id)
            .eq('shopify_order_id', order.id?.toString())
            .single();

          if (orderRecord) {
            const lineItems = order.line_items.map(item => ({
              user_id: user.id,
              order_id: orderRecord.id,
              shopify_line_item_id: item.id?.toString(),
              shopify_product_id: item.product_id?.toString(),
              shopify_variant_id: item.variant_id?.toString(),
              title: item.title,
              name: item.name,
              sku: item.sku,
              vendor: item.vendor,
              quantity: item.quantity,
              price: item.price ? parseFloat(item.price) : 0,
              total_discount: item.total_discount ? parseFloat(item.total_discount) : 0,
              fulfillment_service: item.fulfillment_service,
              fulfillment_status: item.fulfillment_status,
              requires_shipping: item.requires_shipping,
              taxable: item.taxable,
              gift_card: item.gift_card,
              product_exists: item.product_exists,
              variant_inventory_management: item.variant_inventory_management,
              properties: item.properties || {},
              created_at: new Date().toISOString(),
            }));
            allLineItems.push(...lineItems);
          }
        }
      }

      // Upsert line items
      if (allLineItems.length > 0) {
        const { error: lineItemError } = await supabase
          .from('shopify_order_line_items')
          .upsert(allLineItems, { 
            onConflict: 'user_id,shopify_line_item_id',
            ignoreDuplicates: false 
          });

        if (lineItemError) {
          console.error('Line item upsert error:', lineItemError);
          throw new Error(`Failed to save line items: ${lineItemError.message}`);
        }
      }
    }

    // Get next page info from Link header
    const linkHeader = response.headers.get('Link');
    let nextPageInfo = null;
    
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        nextPageInfo = nextMatch[1];
      }
    }

    console.log(`Order sync completed. Processed ${orders.length} orders, ${allLineItems?.length || 0} line items`);

    return new Response(JSON.stringify({
      success: true,
      ordersProcessed: orders.length,
      lineItemsProcessed: allLineItems?.length || 0,
      hasMorePages: Boolean(nextPageInfo),
      nextPageInfo: nextPageInfo,
      message: `Synced ${orders.length} orders with ${allLineItems?.length || 0} line items`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-shopify-orders:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});