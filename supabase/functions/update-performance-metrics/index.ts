import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MetricsData {
  date?: string;
  revenue?: number;
  orders?: number;
  cost_savings?: number;
  products_optimized?: number;
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
    console.log('Updating performance metrics for user:', user.id)

    const { date, revenue, orders, cost_savings, products_optimized }: MetricsData = 
      req.method === 'POST' ? await req.json() : {}

    const metricDate = date || new Date().toISOString().split('T')[0]

    // Get existing orders and products data for calculations
    const [ordersResult, productsResult, priceChangesResult] = await Promise.all([
      supabaseClient.from('orders').select('*').eq('user_id', user.id),
      supabaseClient.from('products').select('*').eq('user_id', user.id),
      supabaseClient.from('price_changes').select('*').eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ])

    const allOrders = ordersResult.data || []
    const allProducts = productsResult.data || []
    const todayPriceChanges = priceChangesResult.data || []

    // Calculate metrics if not provided
    const todayOrders = allOrders.filter(o => 
      o.created_at.startsWith(metricDate)
    )

    const calculatedRevenue = revenue !== undefined ? revenue : 
      todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

    const calculatedOrders = orders !== undefined ? orders : todayOrders.length

    const avgOrderValue = calculatedOrders > 0 ? calculatedRevenue / calculatedOrders : 0

    // Calculate conversion rate (simplified - orders vs products viewed)
    const conversionRate = allProducts.length > 0 ? (calculatedOrders / allProducts.length) * 100 : 0

    // Calculate profit margin (simplified estimation)
    const estimatedCosts = calculatedRevenue * 0.6 // Assume 60% cost of goods
    const profitMargin = calculatedRevenue > 0 ? ((calculatedRevenue - estimatedCosts) / calculatedRevenue) * 100 : 0

    // Calculate cost savings from price optimizations
    const calculatedCostSavings = cost_savings !== undefined ? cost_savings :
      todayPriceChanges.reduce((sum, pc) => {
        const saving = ((pc.new_price || 0) - (pc.old_price || 0)) * 10 // Estimate 10 units sold
        return sum + (saving > 0 ? saving : 0)
      }, 0)

    const calculatedProductsOptimized = products_optimized !== undefined ? products_optimized :
      todayPriceChanges.length

    const metricsData = {
      user_id: user.id,
      metric_date: metricDate,
      total_revenue: calculatedRevenue,
      total_orders: calculatedOrders,
      avg_order_value: avgOrderValue,
      conversion_rate: conversionRate,
      profit_margin: profitMargin,
      cost_savings: calculatedCostSavings,
      products_optimized: calculatedProductsOptimized,
      price_changes: todayPriceChanges.length
    }

    // Upsert metrics (insert or update if exists for the date)
    const { data: updatedMetrics, error: upsertError } = await supabaseClient
      .from('performance_metrics')
      .upsert(metricsData, { onConflict: 'user_id,metric_date' })
      .select()
      .single()

    if (upsertError) {
      console.error('Error upserting metrics:', upsertError)
      return new Response(
        JSON.stringify({ error: 'Failed to update metrics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get historical data for trends (last 30 days)
    const { data: historicalMetrics } = await supabaseClient
      .from('performance_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('metric_date', { ascending: true })

    // Calculate trends
    const trends = calculateTrends(historicalMetrics || [])

    console.log(`Updated metrics for ${metricDate}:`, updatedMetrics)

    return new Response(
      JSON.stringify({ 
        metrics: updatedMetrics,
        historical: historicalMetrics,
        trends,
        message: 'Performance metrics updated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error updating performance metrics:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function calculateTrends(metrics: any[]) {
  if (metrics.length < 2) {
    return {
      revenue: { trend: 'stable', change: 0 },
      orders: { trend: 'stable', change: 0 },
      conversion: { trend: 'stable', change: 0 },
      savings: { trend: 'stable', change: 0 }
    }
  }

  const latest = metrics[metrics.length - 1]
  const previous = metrics[metrics.length - 2]

  const revenueTrend = calculateTrendDirection(latest.total_revenue, previous.total_revenue)
  const ordersTrend = calculateTrendDirection(latest.total_orders, previous.total_orders)
  const conversionTrend = calculateTrendDirection(latest.conversion_rate, previous.conversion_rate)
  const savingsTrend = calculateTrendDirection(latest.cost_savings, previous.cost_savings)

  return {
    revenue: revenueTrend,
    orders: ordersTrend,
    conversion: conversionTrend,
    savings: savingsTrend
  }
}

function calculateTrendDirection(current: number, previous: number) {
  if (previous === 0) return { trend: 'stable', change: 0 }
  
  const changePercent = ((current - previous) / previous) * 100
  
  if (changePercent > 5) return { trend: 'up', change: changePercent }
  if (changePercent < -5) return { trend: 'down', change: changePercent }
  return { trend: 'stable', change: changePercent }
}