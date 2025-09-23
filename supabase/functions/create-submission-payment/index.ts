import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { submissionId } = await req.json();

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get submission details with total cost
    const { data: submission, error: submissionError } = await supabaseService
      .from("inventory_submissions")
      .select("*")
      .eq("id", submissionId)
      .eq("user_id", user.id)
      .single();

    if (submissionError || !submission) {
      throw new Error("Submission not found or unauthorized");
    }

    // Calculate total amount in cents
    const totalCents = Math.round((submission.total_prep_cost || 0) * 100);
    
    if (totalCents <= 0) {
      throw new Error("Invalid amount for payment");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Inventory Submission - ${submission.submission_number}`,
              description: `Prep services for ${submission.total_items} items`
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/send-inventory?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/send-inventory?payment=canceled`,
      metadata: {
        submission_id: submissionId,
        user_id: user.id,
      },
    });

    // Create payment record
    const { error: paymentError } = await supabaseService
      .from("submission_payments")
      .insert({
        submission_id: submissionId,
        stripe_session_id: session.id,
        amount_cents: totalCents,
        status: "pending",
      });

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      throw new Error("Failed to create payment record");
    }

    // Update submission status
    await supabaseService
      .from("inventory_submissions")
      .update({ 
        status: "payment_pending",
        payment_status: "pending"
      })
      .eq("id", submissionId);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});