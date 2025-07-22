import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from '../send-confirmation-email/_templates/confirmation-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Send a test email directly using the email template
    const html = await renderAsync(
      React.createElement(ConfirmationEmail, {
        supabase_url: 'https://rtaomiqsnctigleqjojt.supabase.co',
        token: 'test-token',
        token_hash: 'test-hash',
        redirect_to: 'https://your-app.com',
        email_action_type: 'signup',
        user_email: 'ottman1@gmail.com',
        user_name: 'Test User',
      })
    )

    const { error } = await resend.emails.send({
      from: 'PrepFox <noreply@resend.dev>',
      to: ['ottman1@gmail.com'],
      subject: 'PrepFox Email Template Preview',
      html,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Test email sent successfully!' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-test-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});