import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header and extract the user
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get Shopify store configuration
    const { data: storeConfig, error: configError } = await supabase
      .from('store_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'shopify')
      .eq('is_active', true)
      .single()

    if (configError || !storeConfig) {
      return new Response(
        JSON.stringify({ error: 'No active Shopify store configuration found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { store_url: shopDomain, access_token: accessToken } = storeConfig

    if (!shopDomain || !accessToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid store configuration' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch orders from Shopify
    let allOrders = []
    let nextPageUrl = `https://${shopDomain}/admin/api/2023-10/orders.json?status=any&limit=250`

    while (nextPageUrl) {
      const response = await fetch(nextPageUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Shopify API error:', errorText)
        return new Response(
          JSON.stringify({ error: `Shopify API error: ${response.status}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await response.json()
      allOrders = allOrders.concat(data.orders)

      // Check for next page
      const linkHeader = response.headers.get('Link')
      nextPageUrl = null
      
      if (linkHeader) {
        const nextMatch = linkHeader.match(/<([^>]+)>;\s*rel="next"/)
        if (nextMatch) {
          nextPageUrl = nextMatch[1]
        }
      }
    }

    console.log(`Fetched ${allOrders.length} orders from Shopify`)

    // Process and insert orders
    const ordersToInsert = []
    const orderItemsToInsert = []

    for (const shopifyOrder of allOrders) {
      // Map Shopify order status to internal status
      const getOrderStatus = (order: any) => {
        if (order.cancelled_at) return 'cancelled'
        if (order.fulfillment_status === 'fulfilled') return 'shipped'
        if (order.financial_status === 'paid') return 'awaiting'
        return 'pending'
      }

      const orderData = {
        user_id: user.id,
        order_number: shopifyOrder.order_number?.toString() || shopifyOrder.name,
        store_platform: 'shopify',
        store_name: storeConfig.store_name,
        customer_name: `${shopifyOrder.billing_address?.first_name || ''} ${shopifyOrder.billing_address?.last_name || ''}`.trim() || 'Unknown',
        customer_email: shopifyOrder.email || '',
        order_date: new Date(shopifyOrder.created_at).toISOString(),
        total_amount: parseFloat(shopifyOrder.total_price || '0'),
        status: getOrderStatus(shopifyOrder),
        shipping_address_line1: shopifyOrder.shipping_address?.address1 || '',
        shipping_address_line2: shopifyOrder.shipping_address?.address2 || null,
        shipping_city: shopifyOrder.shipping_address?.city || '',
        shipping_state: shopifyOrder.shipping_address?.province || '',
        shipping_zip: shopifyOrder.shipping_address?.zip || '',
        shipping_country: shopifyOrder.shipping_address?.country_code || 'US',
        currency: shopifyOrder.currency || 'USD',
        tags: shopifyOrder.tags ? shopifyOrder.tags.split(', ') : null,
        notes: shopifyOrder.note || null,
        tracking_number: shopifyOrder.fulfillments?.[0]?.tracking_number || null,
        shipped_date: shopifyOrder.fulfillments?.[0]?.created_at ? new Date(shopifyOrder.fulfillments[0].created_at).toISOString() : null
      }

      ordersToInsert.push(orderData)

      // Process line items
      for (const lineItem of shopifyOrder.line_items || []) {
        const itemData = {
          order_id: null, // Will be updated after order insertion
          product_title: lineItem.title,
          variant_title: lineItem.variant_title || null,
          sku: lineItem.sku || null,
          quantity: lineItem.quantity,
          price: parseFloat(lineItem.price),
          weight_lbs: lineItem.grams ? lineItem.grams * 0.00220462 : null,
          product_handle: lineItem.product_id?.toString() || null
        }

        orderItemsToInsert.push({
          ...itemData,
          shopify_order_number: orderData.order_number
        })
      }
    }

    // Insert orders (upsert to handle duplicates)
    let insertedCount = 0
    
    for (const order of ordersToInsert) {
      const { data: insertedOrder, error: insertError } = await supabase
        .from('orders')
        .upsert(order, { 
          onConflict: 'user_id,order_number,store_platform',
          ignoreDuplicates: false 
        })
        .select('id, order_number')
        .single()

      if (!insertError && insertedOrder) {
        insertedCount++

        // Insert order items for this order
        const itemsForThisOrder = orderItemsToInsert.filter(
          item => item.shopify_order_number === insertedOrder.order_number
        )

        for (const item of itemsForThisOrder) {
          const { shopify_order_number, ...itemWithoutOrderNumber } = item
          await supabase
            .from('order_items')
            .upsert({
              ...itemWithoutOrderNumber,
              order_id: insertedOrder.id
            })
        }
      }
    }

    console.log(`Inserted/updated ${insertedCount} orders`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${insertedCount} orders from Shopify`,
        orders_processed: allOrders.length,
        orders_inserted: insertedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error syncing Shopify orders:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error during sync' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})