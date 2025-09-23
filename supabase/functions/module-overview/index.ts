import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, module } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Fetching ${module || 'all'} module overview for user:`, userId);

    let result = {};

    // Fetch data based on module request
    if (!module || module === 'shipping') {
      result = { ...result, shipping: await fetchShippingOverview(supabase, userId) };
    }
    
    if (!module || module === 'repricing') {
      result = { ...result, repricing: await fetchRepricingOverview(supabase, userId) };
    }
    
    if (!module || module === 'fulfillment') {
      result = { ...result, fulfillment: await fetchFulfillmentOverview(supabase, userId) };
    }
    
    if (!module || module === 'productManagement') {
      result = { ...result, productManagement: await fetchProductManagementOverview(supabase, userId) };
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in module-overview function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchShippingOverview(supabase: any, userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  console.log('📦 Fetching shipping overview for user:', userId);

  // Use optimized queries with proper joins
  const [ordersResult, labelsResult, packSessionsResult] = await Promise.all([
    supabase
      .from('orders')
      .select('status, created_at')
      .eq('user_id', userId),
    supabase
      .from('shipping_labels')
      .select('carrier, shipping_cost, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('pack_sessions')
      .select('actual_time_minutes, completed_at, created_at')
      .eq('user_id', userId)
      .not('actual_time_minutes', 'is', null)
      .gte('created_at', thirtyDaysAgo.toISOString())
  ]);

  const orders = ordersResult.data || [];
  const labels = labelsResult.data || [];
  const packSessions = packSessionsResult.data || [];

  // Calculate metrics
  const pendingOrdersCount = orders.filter(o => 
    ['pending', 'awaiting', 'processing'].includes(o.status)
  ).length;

  const labelsLast7Days = labels.filter(l => 
    new Date(l.created_at) >= sevenDaysAgo
  ).length;

  const labelsLast30Days = labels.length;

  const totalShippingSpend = labels.reduce((sum, l) => sum + (l.shipping_cost || 0), 0);
  
  const avgPackTimeMinutes = packSessions.length > 0 
    ? packSessions.reduce((sum, p) => sum + p.actual_time_minutes, 0) / packSessions.length
    : 0;

  // Get top carriers
  const carrierCounts = labels.reduce((acc, l) => {
    if (l.carrier) {
      acc[l.carrier] = (acc[l.carrier] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const commonCarriers = Object.entries(carrierCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([carrier]) => carrier);

  // Recent activity
  const recentActivity = labels
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(label => ({
      type: 'label_created',
      description: `Label created for ${label.carrier} shipping`,
      timestamp: label.created_at
    }));

  return {
    pendingOrdersCount,
    labelsLast7Days,
    labelsLast30Days,
    totalShippingSpend,
    totalShippingSavings: totalShippingSpend * 0.15,
    avgPackTimeMinutes: Math.round(avgPackTimeMinutes),
    commonCarriers,
    recentActivity
  };
}

async function fetchRepricingOverview(supabase: any, userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  console.log('💰 Fetching repricing overview for user:', userId);

  const { data: recommendations } = await supabase
    .from('ai_pricing_recommendations')
    .select('status, confidence_score, created_at, applied_at, recommendation_data')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  const recos = recommendations || [];

  const activeListingsCount = recos.filter(r => r.status === 'active').length;
  
  const priceChangesLast7Days = recos.filter(r => 
    r.applied_at && new Date(r.applied_at) >= sevenDaysAgo
  ).length;

  const priceChangesLast30Days = recos.filter(r => 
    r.applied_at && new Date(r.applied_at) >= thirtyDaysAgo
  ).length;

  const avgConfidenceScore = recos.length > 0 
    ? recos.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / recos.length
    : 0;

  // Calculate revenue impact
  const totalRevenueImpact = recos
    .filter(r => r.recommendation_data?.estimated_revenue_impact)
    .reduce((sum, r) => sum + (r.recommendation_data.estimated_revenue_impact || 0), 0);

  const recentActivity = recos
    .filter(r => r.applied_at)
    .sort((a, b) => new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime())
    .slice(0, 5)
    .map(reco => ({
      type: 'recommendation_applied',
      description: `Pricing recommendation applied (${Math.round(reco.confidence_score * 100)}% confidence)`,
      timestamp: reco.applied_at
    }));

  return {
    activeListingsCount,
    priceChangesLast7Days,
    priceChangesLast30Days,
    totalRevenueImpact,
    avgConfidenceScore,
    strategiesCount: 3, // Would come from strategies table
    recentActivity
  };
}

async function fetchFulfillmentOverview(supabase: any, userId: string) {
  console.log('📦 Fetching fulfillment overview for user:', userId);

  const [submissionsResult, alertsResult] = await Promise.all([
    supabase
      .from('inventory_submissions')
      .select('status, created_at, total_items')
      .eq('user_id', userId),
    supabase
      .from('low_stock_alerts')
      .select('is_acknowledged, created_at')
      .eq('is_acknowledged', false)
  ]);

  const submissions = submissionsResult.data || [];
  const alerts = alertsResult.data || [];

  const activeSubmissionsCount = submissions.filter(s => 
    ['submitted', 'receiving', 'approved'].includes(s.status)
  ).length;

  const totalItemsInStock = submissions
    .filter(s => s.status === 'approved')
    .reduce((sum, s) => sum + (s.total_items || 0), 0);

  const openReceivingTasks = submissions.filter(s => s.status === 'receiving').length;

  const recentActivity = submissions
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(sub => ({
      type: 'submission_created',
      description: `Inventory submission ${sub.status}`,
      timestamp: sub.created_at
    }));

  return {
    activeSubmissionsCount,
    totalItemsInStock,
    recentOrdersFulfilled: 0, // Would need pack sessions data
    openReceivingTasks,
    lowStockAlertsCount: alerts.length,
    avgFulfillmentTimeMinutes: 30, // Mock average
    recentActivity
  };
}

async function fetchProductManagementOverview(supabase: any, userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  console.log('🛠️ Fetching product management overview for user:', userId);

  const [editHistoryResult, syncStatusResult, marketplacesResult] = await Promise.all([
    supabase
      .from('product_edit_history')
      .select('edit_type, created_at')
      .eq('user_id', userId)
      .eq('edit_type', 'ai_optimize')
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('marketplace_sync_status')
      .select('last_sync_at, products_synced')
      .eq('user_id', userId)
      .order('last_sync_at', { ascending: false })
      .limit(1),
    supabase
      .from('marketplace_configurations')
      .select('platform, is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
  ]);

  const editHistory = editHistoryResult.data || [];
  const syncStatus = syncStatusResult.data?.[0];
  const marketplaces = marketplacesResult.data || [];

  const productsOptimizedCount = editHistory.length;

  // Calculate sync health
  const lastSync = syncStatus?.last_sync_at ? new Date(syncStatus.last_sync_at) : null;
  const hoursSinceLastSync = lastSync ? (Date.now() - lastSync.getTime()) / (1000 * 60 * 60) : 999;
  
  const syncHealthScore = hoursSinceLastSync < 24 ? 100 : 
                         hoursSinceLastSync < 72 ? 75 : 
                         hoursSinceLastSync < 168 ? 50 : 25;

  const lastSyncStatus = syncStatus?.products_synced ? 'success' : 
                        lastSync ? 'error' : 
                        'pending';

  const recentActivity = editHistory
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(edit => ({
      type: 'product_optimized',
      description: 'Product optimized with AI recommendations',
      timestamp: edit.created_at
    }));

  return {
    productsOptimizedCount,
    pendingDraftsCount: 0,
    syncHealthScore,
    marketplacesConnected: marketplaces.length,
    lastSyncStatus,
    totalProductsManaged: syncStatus?.products_synced || 0,
    recentActivity
  };
}