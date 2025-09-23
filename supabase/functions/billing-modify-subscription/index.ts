import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user) throw new Error("Not authenticated");

    const body = await req.json();
    const userId = body.userId as string;
    const planId = body.planId as string;
    if (!userId || !planId) throw new Error("userId and planId are required");

    // Admin guard
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) throw new Error("Admin privileges required");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Fetch plan
    const { data: plan, error: planErr } = await supabaseService
      .from("plans")
      .select("id, plan_name, stripe_price_id")
      .eq("id", planId)
      .single();
    if (planErr) throw planErr;

    // Fetch billing customer
    const { data: customer, error: custErr } = await supabaseService
      .from("billing_customers")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (custErr) throw custErr;

    let stripeInfo: any = null;
    if (plan.stripe_price_id && customer?.stripe_customer_id) {
      // Try to find active subscription
      const list = await stripe.subscriptions.list({ customer: customer.stripe_customer_id, status: "active", limit: 1 });
      if (list.data.length > 0) {
        const current = list.data[0];
        // Update first item to new price
        const updated = await stripe.subscriptions.update(current.id, {
          items: [ { id: current.items.data[0].id, price: plan.stripe_price_id } ],
          proration_behavior: "create_prorations",
        });
        stripeInfo = { id: updated.id, status: updated.status, current_period_end: new Date(updated.current_period_end * 1000).toISOString() };
      } else {
        // Create a new subscription - assumes payment method on file
        const created = await stripe.subscriptions.create({
          customer: customer.stripe_customer_id,
          items: [{ price: plan.stripe_price_id }],
          payment_behavior: "default_incomplete",
          expand: ["latest_invoice.payment_intent"],
        });
        stripeInfo = { id: created.id, status: created.status, current_period_end: new Date(created.current_period_end * 1000).toISOString() };
      }
    }

    // Upsert local subscription record
    const now = new Date().toISOString();
    const { error: insErr } = await supabaseService.from("subscriptions").insert({
      user_id: userId,
      plan_id: plan.id,
      plan_name: plan.plan_name,
      status: stripeInfo?.status || 'active',
      current_period_start: now,
      current_period_end: stripeInfo?.current_period_end || null,
      cancel_at_period_end: false,
    });
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ success: true, message: "Subscription updated", stripe: stripeInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
    });
  }
});
