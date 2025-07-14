import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestData {
  insight_type?: string;
  force_refresh?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const authResult = await supabaseClient.auth.getUser()
    if (authResult.error || !authResult.data.user) {
      console.error('Authentication failed:', authResult.error)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = authResult.data.user
    console.log('Generating AI insights for user:', user.id)

    const { insight_type = 'all', force_refresh = false }: RequestData = 
      req.method === 'POST' ? await req.json() : {}

    // Check for existing recent insights unless force refresh
    if (!force_refresh) {
      const { data: existingInsights } = await supabaseClient
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()) // Last 6 hours
        .order('created_at', { ascending: false })

      if (existingInsights && existingInsights.length > 0) {
        return new Response(
          JSON.stringify({ 
            insights: existingInsights,
            cached: true,
            message: 'Returning cached insights from the last 6 hours'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch user data for analysis
    const [productsResult, ordersResult, priceChangesResult, storesResult] = await Promise.all([
      supabaseClient.from('products').select('*').eq('user_id', user.id).limit(100),
      supabaseClient.from('orders').select('*').eq('user_id', user.id).limit(50),
      supabaseClient.from('price_changes').select('*').eq('user_id', user.id).limit(30),
      supabaseClient.from('store_configurations').select('*').eq('user_id', user.id)
    ])

    const products = productsResult.data || []
    const orders = ordersResult.data || []
    const priceChanges = priceChangesResult.data || []
    const stores = storesResult.data || []

    console.log(`Analyzing data: ${products.length} products, ${orders.length} orders, ${priceChanges.length} price changes`)

    // Generate AI insights based on data patterns
    const insights = []

    // Pricing insights
    if (insight_type === 'all' || insight_type === 'pricing') {
      if (products.length > 0) {
        const avgPrice = products.reduce((sum, p) => sum + (p.variant_price || 0), 0) / products.length
        const lowPricedProducts = products.filter(p => (p.variant_price || 0) < avgPrice * 0.7).length
        
        if (lowPricedProducts > products.length * 0.3) {
          insights.push({
            user_id: user.id,
            insight_type: 'pricing',
            title: 'Pricing Optimization Opportunity',
            description: `${lowPricedProducts} products (${Math.round(lowPricedProducts/products.length*100)}%) are priced significantly below average. Consider price testing to increase revenue.`,
            confidence_score: 0.85,
            data_points: {
              total_products: products.length,
              low_priced_count: lowPricedProducts,
              average_price: avgPrice,
              potential_revenue_increase: lowPricedProducts * avgPrice * 0.15
            },
            action_items: [
              'Review pricing for underpriced products',
              'Implement A/B testing for price increases',
              'Analyze competitor pricing'
            ],
            priority: 'high'
          })
        }
      }

      if (priceChanges.length > 5) {
        const recentChanges = priceChanges.filter(pc => 
          new Date(pc.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )
        const avgPriceIncrease = recentChanges
          .filter(pc => (pc.new_price || 0) > (pc.old_price || 0))
          .reduce((sum, pc) => sum + ((pc.new_price || 0) - (pc.old_price || 0)), 0) / recentChanges.length

        if (avgPriceIncrease > 0) {
          insights.push({
            user_id: user.id,
            insight_type: 'pricing',
            title: 'Dynamic Pricing is Working',
            description: `Your recent price optimizations have resulted in an average increase of $${avgPriceIncrease.toFixed(2)} per product. Keep monitoring for optimal results.`,
            confidence_score: 0.92,
            data_points: {
              recent_changes: recentChanges.length,
              avg_increase: avgPriceIncrease,
              total_potential_gain: avgPriceIncrease * products.length
            },
            action_items: [
              'Continue monitoring conversion rates',
              'Expand dynamic pricing to more products',
              'Set up automated price alerts'
            ],
            priority: 'medium'
          })
        }
      }
    }

    // Inventory insights
    if (insight_type === 'all' || insight_type === 'inventory') {
      const lowStockProducts = products.filter(p => (p.variant_inventory_qty || 0) < 10).length
      const outOfStockProducts = products.filter(p => (p.variant_inventory_qty || 0) === 0).length

      if (lowStockProducts > 0) {
        insights.push({
          user_id: user.id,
          insight_type: 'inventory',
          title: 'Inventory Alert',
          description: `${lowStockProducts} products have low stock levels, with ${outOfStockProducts} completely out of stock. Immediate restocking needed to avoid lost sales.`,
          confidence_score: 0.95,
          data_points: {
            low_stock_count: lowStockProducts,
            out_of_stock_count: outOfStockProducts,
            total_products: products.length,
            risk_level: outOfStockProducts > 0 ? 'high' : 'medium'
          },
          action_items: [
            'Reorder low stock items immediately',
            'Set up automatic reorder points',
            'Review demand forecasting'
          ],
          priority: outOfStockProducts > 0 ? 'critical' : 'high'
        })
      }
    }

    // Performance insights
    if (insight_type === 'all' || insight_type === 'trends') {
      if (orders.length > 0) {
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        const avgOrderValue = totalRevenue / orders.length
        const recentOrders = orders.filter(o => 
          new Date(o.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        )

        insights.push({
          user_id: user.id,
          insight_type: 'trends',
          title: 'Business Performance Summary',
          description: `Your store has processed ${orders.length} orders with an average order value of $${avgOrderValue.toFixed(2)}. ${recentOrders.length} orders in the last 7 days.`,
          confidence_score: 0.9,
          data_points: {
            total_orders: orders.length,
            total_revenue: totalRevenue,
            avg_order_value: avgOrderValue,
            recent_orders: recentOrders.length,
            growth_trend: recentOrders.length > orders.length / 4 ? 'positive' : 'stable'
          },
          action_items: [
            'Focus on increasing average order value',
            'Implement cross-selling strategies',
            'Review customer retention tactics'
          ],
          priority: 'medium'
        })
      }
    }

    // Store health insights
    if (insight_type === 'all' || insight_type === 'marketing') {
      const activeStores = stores.filter(s => s.is_active).length
      const unpublishedProducts = products.filter(p => !p.published).length

      if (unpublishedProducts > products.length * 0.2) {
        insights.push({
          user_id: user.id,
          insight_type: 'marketing',
          title: 'Product Visibility Opportunity',
          description: `${unpublishedProducts} products (${Math.round(unpublishedProducts/products.length*100)}%) are unpublished. Publishing these could increase your catalog visibility and sales potential.`,
          confidence_score: 0.88,
          data_points: {
            unpublished_count: unpublishedProducts,
            total_products: products.length,
            visibility_percentage: Math.round((products.length - unpublishedProducts) / products.length * 100)
          },
          action_items: [
            'Review and publish quality products',
            'Optimize product descriptions and images',
            'Set up automated publishing rules'
          ],
          priority: 'medium'
        })
      }
    }

    // Save insights to database
    if (insights.length > 0) {
      const { data: savedInsights, error: insertError } = await supabaseClient
        .from('ai_insights')
        .insert(insights)
        .select()

      if (insertError) {
        console.error('Error saving insights:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to save insights' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Generated and saved ${insights.length} insights`)

      return new Response(
        JSON.stringify({ 
          insights: savedInsights,
          generated: insights.length,
          message: 'AI insights generated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          insights: [],
          message: 'No new insights to generate at this time'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error in AI insights generation:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})