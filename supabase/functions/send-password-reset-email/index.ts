import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { PasswordResetEmail } from "./_templates/password-reset-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    const wh = new Webhook(hookSecret);

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = wh.verify(payload, headers) as {
      user: {
        email: string;
        id: string;
      };
      email_data: {
        token: string;
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
        site_url: string;
      };
    };

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
      throw error;
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
          message: error.message,
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});