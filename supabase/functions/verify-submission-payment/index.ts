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

    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    // Create service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseService
      .from("submission_payments")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Payment record not found");
    }

    // Verify submission belongs to user
    const { data: submission, error: submissionError } = await supabaseService
      .from("inventory_submissions")
      .select("*")
      .eq("id", payment.submission_id)
      .eq("user_id", user.id)
      .single();

    if (submissionError || !submission) {
      throw new Error("Submission not found or unauthorized");
    }

    let updatedPayment;
    let updatedSubmission;

    if (session.payment_status === "paid") {
      // Update payment record
      const { data: paymentUpdate, error: paymentUpdateError } = await supabaseService
        .from("submission_payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("id", payment.id)
        .select()
        .single();

      if (paymentUpdateError) {
        throw new Error("Failed to update payment status");
      }
      updatedPayment = paymentUpdate;

      // Update submission status to pending approval
      const { data: submissionUpdate, error: submissionUpdateError } = await supabaseService
        .from("inventory_submissions")
        .update({
          status: "pending_approval",
          payment_status: "paid",
          payment_id: payment.id,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", payment.submission_id)
        .select()
        .single();

      if (submissionUpdateError) {
        throw new Error("Failed to update submission status");
      }
      updatedSubmission = submissionUpdate;

      // Create invoice record
      await supabaseService
        .from("submission_invoices")
        .insert({
          submission_id: payment.submission_id,
          payment_id: payment.id,
          invoice_number: `INV-${Date.now()}`,
          amount_cents: payment.amount_cents,
          subtotal_cents: payment.amount_cents,
          status: "paid",
        });

    } else if (session.payment_status === "unpaid") {
      // Update payment as failed
      const { data: paymentUpdate, error: paymentUpdateError } = await supabaseService
        .from("submission_payments")
        .update({
          status: "failed",
          failed_at: new Date().toISOString(),
          failure_reason: "Payment not completed",
        })
        .eq("id", payment.id)
        .select()
        .single();

      if (paymentUpdateError) {
        throw new Error("Failed to update payment status");
      }
      updatedPayment = paymentUpdate;

      // Update submission status to draft
      const { data: submissionUpdate, error: submissionUpdateError } = await supabaseService
        .from("inventory_submissions")
        .update({
          status: "draft",
          payment_status: "failed",
        })
        .eq("id", payment.submission_id)
        .select()
        .single();

      if (submissionUpdateError) {
        throw new Error("Failed to update submission status");
      }
      updatedSubmission = submissionUpdate;
    }

    return new Response(
      JSON.stringify({
        payment: updatedPayment,
        submission: updatedSubmission,
        sessionStatus: session.payment_status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});