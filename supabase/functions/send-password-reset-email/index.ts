import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { PasswordResetEmail } from "./_templates/password-reset-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== PASSWORD RESET WEBHOOK CALLED ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    console.log("Raw payload received:", payload);
    console.log("Payload length:", payload.length);
    
    if (!payload) {
      console.error("Empty payload received");
      return new Response(JSON.stringify({ error: "Empty payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Parse payload directly without webhook verification
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(payload);
      console.log("Successfully parsed payload");
      console.log("Payload keys:", Object.keys(parsedPayload));
    } catch (parseError) {
      console.error("Failed to parse payload as JSON:", parseError);
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Extract data with safer access
    const user = parsedPayload.user;
    const emailData = parsedPayload.email_data;
    
    if (!user || !emailData) {
      console.error("Missing user or email_data in payload");
      console.error("User:", user);
      console.error("Email data:", emailData);
      return new Response(JSON.stringify({ error: "Missing required data" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { token, token_hash, redirect_to, email_action_type, site_url } = emailData;

    console.log("Processing password reset email for:", user.email);
    console.log("Email action type:", email_action_type);

    // Only process recovery emails (password reset)
    if (email_action_type !== "recovery") {
      console.log("Not a recovery email, skipping custom template");
      return new Response(JSON.stringify({ message: "Not a recovery email" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Render the custom password reset email template
    const html = await renderAsync(
      React.createElement(PasswordResetEmail, {
        user_email: user.email,
        reset_url: `${site_url}/auth?mode=reset#access_token=${token}&type=recovery`,
        site_url: site_url,
      })
    );

    // Send the email using Resend
    const { error } = await resend.emails.send({
      from: "PrepFox <noreply@prepfox.ca>",
      to: [user.email],
      subject: "Reset your PrepFox password",
      html,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return new Response(JSON.stringify({ error: "Email sending failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Password reset email sent successfully to:", user.email);

    return new Response(JSON.stringify({ message: "Password reset email sent" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset-email function:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || "Unknown error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});