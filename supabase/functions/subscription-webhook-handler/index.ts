import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK-HANDLER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook handler started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      throw new Error('No Stripe signature found');
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook verified", { type: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    // Handle subscription events
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated' || 
        event.type === 'customer.subscription.deleted') {
      
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      logStep("Processing subscription event", { 
        subscriptionId: subscription.id, 
        customerId, 
        status: subscription.status 
      });

      // Get customer details
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) {
        throw new Error('Customer has been deleted');
      }

      const customerEmail = customer.email;
      if (!customerEmail) {
        throw new Error('Customer email not found');
      }

      // Determine subscription details
      const isActive = subscription.status === 'active';
      const planName = subscription.items.data[0]?.price.nickname || 'Unknown';
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

      // Determine entitlements based on plan
      const getEntitlements = (plan: string) => {
        switch (plan.toLowerCase()) {
          case 'starter':
            return { shipping: true, repricing: false, fulfillment: false, product_management: false };
          case 'pro':
            return { shipping: true, repricing: true, fulfillment: true, product_management: false };
          case 'business':
            return { shipping: true, repricing: true, fulfillment: true, product_management: true };
          default:
            return { shipping: false, repricing: false, fulfillment: false, product_management: false };
        }
      };

      const entitlements = getEntitlements(planName);

      // Update or create subscription in Supabase
      const { data: existingSubscription } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (existingSubscription) {
        // Update existing subscription
        await supabaseClient
          .from('subscriptions')
          .update({
            plan_name: planName,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update entitlements
        await supabaseClient
          .from('subscription_entitlements')
          .upsert({
            subscription_id: existingSubscription.id,
            shipping: entitlements.shipping,
            repricing: entitlements.repricing,
            fulfillment: entitlements.fulfillment,
            product_management: entitlements.product_management,
            updated_at: new Date().toISOString()
          });

        logStep("Subscription updated", { subscriptionId: existingSubscription.id });
      } else {
        // Find user by email
        const { data: authUser } = await supabaseClient.auth.admin.listUsers();
        const user = authUser.users.find(u => u.email === customerEmail);
        
        if (!user) {
          logStep("User not found for email", { email: customerEmail });
          return new Response('User not found', { status: 404 });
        }

        // Create new subscription
        const { data: newSubscription } = await supabaseClient
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_name: planName,
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end
          })
          .select()
          .single();

        if (newSubscription) {
          // Create entitlements
          await supabaseClient
            .from('subscription_entitlements')
            .insert({
              subscription_id: newSubscription.id,
              shipping: entitlements.shipping,
              repricing: entitlements.repricing,
              fulfillment: entitlements.fulfillment,
              product_management: entitlements.product_management
            });

          logStep("New subscription created", { subscriptionId: newSubscription.id });
        }
      }

      // Log the webhook event for audit
      await supabaseClient.from('audit_logs').insert({
        event_type: 'stripe_webhook',
        details: {
          webhook_type: event.type,
          subscription_id: subscription.id,
          customer_id: customerId,
          customer_email: customerEmail,
          plan_name: planName,
          status: subscription.status
        }
      });
    }

    logStep("Webhook processed successfully");
    return new Response('Webhook processed', { status: 200, headers: corsHeaders });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});