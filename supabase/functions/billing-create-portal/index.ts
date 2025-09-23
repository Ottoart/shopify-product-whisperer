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

    const body = await req.json().catch(() => ({}));
    const targetUserId = body.userId as string | undefined;

    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
    const effectiveUserId = isAdmin && targetUserId ? targetUserId : user.id;

    // Ensure billing customer exists for self; for admin-targeted, require existing record
    let { data: customer } = await supabaseService
      .from("billing_customers")
      .select("*")
      .eq("user_id", effectiveUserId)
      .maybeSingle();

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    if (!customer) {
      if (effectiveUserId === user.id) {
        // Create a Stripe customer for the current user using their email
        const email = user.email ?? undefined;
        const stripeCustomer = await stripe.customers.create({ email });
        const ins = await supabaseService.from("billing_customers").insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomer.id,
          status: "active",
        }).select("*").single();
        customer = ins.data as any;
      } else {
        throw new Error("No billing customer found for target user. Please set a Stripe customer first.");
      }
    }

    // Create a portal session
    const origin = req.headers.get("origin") || "https://lovable.dev";
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id!,
      return_url: `${origin}/admin/subscriptions`,
    });

    return new Response(JSON.stringify({ success: true, url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
    });
  }
});
