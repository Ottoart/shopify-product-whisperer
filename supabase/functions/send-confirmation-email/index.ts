import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  
  console.log('Hook secret exists:', !!hookSecret)
  console.log('Resend API key exists:', !!Deno.env.get('RESEND_API_KEY'))
  console.log('Request headers:', headers)
  
  try {
    // If we have a webhook secret, verify the webhook
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      const {
        user,
        email_data: { token, token_hash, redirect_to, email_action_type },
      } = wh.verify(payload, headers) as {
        user: {
          email: string
          user_metadata?: {
            first_name?: string
            last_name?: string
          }
        }
        email_data: {
          token: string
          token_hash: string
          redirect_to: string
          email_action_type: string
        }
      }

      const userName = user.user_metadata?.first_name 
        ? `${user.user_metadata.first_name}${user.user_metadata.last_name ? ' ' + user.user_metadata.last_name : ''}`
        : undefined

      const html = await renderAsync(
        React.createElement(ConfirmationEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
          user_email: user.email,
          user_name: userName,
        })
      )

      const { error } = await resend.emails.send({
        from: 'PrepFox <noreply@resend.dev>',
        to: [user.email],
        subject: 'Welcome to PrepFox - Confirm your email',
        html,
      })

      if (error) {
        throw error
      }
    } else {
      // For testing purposes - send a test email
      const testPayload = JSON.parse(payload)
      
      const html = await renderAsync(
        React.createElement(ConfirmationEmail, {
          supabase_url: 'https://rtaomiqsnctigleqjojt.supabase.co',
          token: 'test-token',
          token_hash: 'test-hash',
          redirect_to: 'https://your-app.com',
          email_action_type: 'signup',
          user_email: testPayload.email || 'test@example.com',
          user_name: testPayload.name || 'Test User',
        })
      )

      const { error } = await resend.emails.send({
        from: 'PrepFox <noreply@resend.dev>',
        to: [testPayload.email || 'ottman1@gmail.com'],
        subject: 'PrepFox Email Template Preview',
        html,
      })

      if (error) {
        throw error
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error in send-confirmation-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
        },
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})