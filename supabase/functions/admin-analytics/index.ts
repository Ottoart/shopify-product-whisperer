import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { validateAdminAuth } from "../_shared/admin-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-ANALYTICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Admin analytics request started");

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin auth using shared validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const authResult = await validateAdminAuth(authHeader);
    if (authResult.error) {
      throw new Error(authResult.error);
    }

    const user = authResult.user!;
    const adminRole = authResult.adminRole;
    logStep("Admin authenticated", { userId: user.id, email: user.email, role: adminRole });

    // Fetch analytics data
    const analytics = {
      totalUsers: 0,
      activeSubscriptions: 0,
      trialUsers: 0,
      expiredSubscriptions: 0,
      revenueThisMonth: 0,
      topEvents: [],
      subscriptionTrends: [],
      moduleUsage: []
    };

    // Get total users count
    const { count: totalUsers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    analytics.totalUsers = totalUsers || 0;

    // Get subscription statistics
    const { data: subscriptions } = await supabaseClient
      .from('subscriptions')
      .select('status, plan_name, current_period_end, created_at');

    if (subscriptions) {
      analytics.activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
      analytics.trialUsers = subscriptions.filter(s => s.status === 'trialing').length;
      analytics.expiredSubscriptions = subscriptions.filter(s => 
        s.status === 'canceled' || s.status === 'past_due'
      ).length;

      // Calculate revenue this month (simplified - would need actual pricing data)
      const thisMonth = new Date();
      thisMonth.setDate(1);
      analytics.revenueThisMonth = subscriptions
        .filter(s => s.status === 'active')
        .length * 99; // Simplified calculation
    }

    // Get top events from analytics
    const { data: eventCounts } = await supabaseClient
      .from('analytics_events')
      .select('event_type')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (eventCounts) {
      const eventMap = eventCounts.reduce((acc: Record<string, number>, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {});

      analytics.topEvents = Object.entries(eventMap)
        .map(([event_type, count]) => ({ event_type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    // Get subscription trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const { data: subscriptionsByDate } = await supabaseClient
      .from('subscriptions')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (subscriptionsByDate) {
      const dateMap = subscriptionsByDate.reduce((acc: Record<string, number>, sub) => {
        const date = new Date(sub.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      analytics.subscriptionTrends = Object.entries(dateMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    // Get module usage statistics
    const { data: entitlements } = await supabaseClient
      .from('subscription_entitlements')
      .select('shipping, repricing, fulfillment, product_management');

    if (entitlements) {
      const moduleStats = {
        shipping: entitlements.filter(e => e.shipping).length,
        repricing: entitlements.filter(e => e.repricing).length,
        fulfillment: entitlements.filter(e => e.fulfillment).length,
        productManagement: entitlements.filter(e => e.product_management).length
      };

      analytics.moduleUsage = Object.entries(moduleStats)
        .map(([module, users]) => ({ module, users }));
    }

    logStep("Analytics data compiled successfully", { 
      totalUsers: analytics.totalUsers, 
      activeSubscriptions: analytics.activeSubscriptions 
    });

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in admin analytics", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});