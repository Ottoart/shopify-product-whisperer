import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId as string | undefined;

    // Check admin
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
    const effectiveUserId = isAdmin && targetUserId ? targetUserId : user.id;

    // Fetch local records
    const { data: customer } = await supabaseService
      .from("billing_customers")
      .select("*")
      .eq("user_id", effectiveUserId)
      .maybeSingle();

    const { data: sub } = await supabaseService
      .from("subscriptions")
      .select("*, plans:plan_id(id, plan_name, monthly_cost, features, stripe_price_id), entitlements:plan_id(subscription_entitlements(*))")
      .eq("user_id", effectiveUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Optionally query Stripe for latest status
    let stripeStatus: any = null;
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (stripeKey && customer?.stripe_customer_id) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      const subs = await stripe.subscriptions.list({ customer: customer.stripe_customer_id, limit: 1 });
      if (subs.data.length > 0) {
        const s = subs.data[0];
        stripeStatus = {
          id: s.id,
          status: s.status,
          current_period_end: new Date(s.current_period_end * 1000).toISOString(),
          items: s.items.data.map((i) => ({ price: i.price.id, amount: i.price.unit_amount }))
        };
      }
    }

    return new Response(
      JSON.stringify({ success: true, customer, subscription: sub, stripeStatus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message } ), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
    });
  }
});
