import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BILLING-CREATE-CHECKOUT] ${step}${detailsStr}`);
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
    logStep("Checkout session creation started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) throw new Error(userErr.message);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { planId, billingCycle = 'monthly' } = body;
    
    if (!planId) throw new Error("planId is required");
    
    logStep("Request parameters", { planId, billingCycle });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get plan details from database
    const { data: plan, error: planErr } = await supabaseService
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();
    
    if (planErr || !plan) {
      throw new Error(`Plan not found: ${planId}`);
    }
    
    logStep("Plan retrieved", { planName: plan.plan_name, cost: plan.monthly_cost });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({ 
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    } else {
      logStep("Existing Stripe customer found", { customerId });
    }

    // Upsert billing customer record
    await supabaseService.from("billing_customers").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      status: "active"
    }, { onConflict: 'user_id' });

    // Calculate price based on billing cycle
    const unitAmount = billingCycle === 'yearly' 
      ? Math.round(plan.monthly_cost * 12 * 0.8 * 100) // 20% yearly discount
      : Math.round(plan.monthly_cost * 100);

    const interval = billingCycle === 'yearly' ? 'year' : 'month';
    
    logStep("Calculated pricing", { unitAmount, interval });

    // Create Stripe checkout session
    const origin = req.headers.get("origin") || "https://lovable.dev";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${plan.plan_name} Plan`,
              description: `Access to ${plan.plan_name} features and modules`,
            },
            unit_amount: unitAmount,
            recurring: { interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      trial_period_days: planId !== 'free' ? 30 : undefined, // 30-day trial for paid plans
      metadata: {
        userId: user.id,
        planId: plan.id,
        billingCycle
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      success: true, 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in checkout creation", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});