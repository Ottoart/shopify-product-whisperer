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
      console.log('Verifying webhook with secret')
      const wh = new Webhook(hookSecret)
      let webhookData
      
      try {
        webhookData = wh.verify(payload, headers)
        console.log('Webhook verified successfully')
      } catch (verifyError) {
        console.error('Webhook verification failed:', verifyError)
        throw new Error(`Webhook verification failed: ${verifyError.message}`)
      }

      const {
        user,
        email_data: { token, token_hash, redirect_to, email_action_type },
      } = webhookData as {
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

      console.log('Processing email for user:', user.email)

      const userName = user.user_metadata?.first_name 
        ? `${user.user_metadata.first_name}${user.user_metadata.last_name ? ' ' + user.user_metadata.last_name : ''}`
        : undefined

      let html
      try {
        console.log('Rendering email template')
        html = await renderAsync(
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
        console.log('Email template rendered successfully')
      } catch (renderError) {
        console.error('Email template rendering failed:', renderError)
        throw new Error(`Email template rendering failed: ${renderError.message}`)
      }

      try {
        console.log('Sending email via Resend')
        const { error } = await resend.emails.send({
          from: 'PrepFox <noreply@resend.dev>',
          to: [user.email],
          subject: 'Welcome to PrepFox - Confirm your email',
          html,
        })

        if (error) {
          console.error('Resend error:', error)
          throw new Error(`Resend error: ${JSON.stringify(error)}`)
        }
        
        console.log('Email sent successfully')
      } catch (sendError) {
        console.error('Email sending failed:', sendError)
        throw sendError
      }
    } else {
      console.log('No webhook secret found, running in test mode')
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
        console.error('Test email error:', error)
        throw error
      }
    }

    console.log('Function completed successfully')
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
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
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