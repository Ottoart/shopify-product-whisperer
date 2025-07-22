import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Img,
  Button,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email template component
const ConfirmationEmail = ({
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  token,
  user_email,
  user_name,
}: {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
  user_name?: string
}) => {
  const confirmUrl = `${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`

  return React.createElement(Html, {},
    React.createElement(Head, {}),
    React.createElement(Preview, {}, "Welcome to PrepFox - Confirm your email"),
    React.createElement(Body, { style: main },
      React.createElement(Container, { style: container },
        React.createElement(Section, { style: header },
          React.createElement(Img, {
            src: `${supabase_url}/storage/v1/object/public/assets/logo.png`,
            alt: "PrepFox Logo",
            style: logo
          }),
          React.createElement(Heading, { style: h1 }, "Welcome to PrepFox!")
        ),
        React.createElement(Section, { style: content },
          React.createElement(Text, { style: text },
            `Hi ${user_name || 'there'},`
          ),
          React.createElement(Text, { style: text },
            "Thank you for signing up with PrepFox! We're excited to help you streamline your e-commerce operations with our powerful fulfillment and shipping solutions."
          ),
          React.createElement(Text, { style: text },
            "To get started, please confirm your email address by clicking the button below:"
          ),
          React.createElement(Button, { href: confirmUrl, style: button },
            "Confirm Email Address"
          ),
          React.createElement(Text, { style: { ...text, marginTop: "24px" } },
            "Or copy and paste this link into your browser:"
          ),
          React.createElement(Link, { href: confirmUrl, style: link },
            confirmUrl
          ),
          React.createElement(Hr, { style: divider }),
          React.createElement(Text, { style: { ...text, fontSize: "14px", color: "#666" } },
            "What's next? Once you confirm your email, you'll be able to:"
          ),
          React.createElement(Text, { style: bulletPoint },
            "• Connect your Shopify, eBay, and other marketplace accounts"
          ),
          React.createElement(Text, { style: bulletPoint },
            "• Set up automated shipping rules and repricing strategies"
          ),
          React.createElement(Text, { style: bulletPoint },
            "• Manage your inventory across multiple channels"
          ),
          React.createElement(Text, { style: bulletPoint },
            "• Access powerful analytics and insights"
          )
        ),
        React.createElement(Section, { style: footer },
          React.createElement(Text, { style: footerText },
            "If you didn't create an account with PrepFox, you can safely ignore this email."
          ),
          React.createElement(Text, { style: footerText },
            "© 2024 PrepFox. All rights reserved."
          ),
          React.createElement(Text, { style: footerText },
            "Need help? Contact our support team at support@prepfox.com"
          )
        )
      )
    )
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#1a1a1a',
}

const logo = {
  height: '40px',
  margin: '0 auto',
}

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '16px 0 0 0',
  padding: '0',
  textAlign: 'center' as const,
}

const content = {
  padding: '32px 24px',
}

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
}

const link = {
  color: '#007ee6',
  fontSize: '14px',
  textDecoration: 'underline',
}

const divider = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const bulletPoint = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '8px 0',
  paddingLeft: '16px',
}

const footer = {
  padding: '24px',
  backgroundColor: '#f8f9fa',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
}

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