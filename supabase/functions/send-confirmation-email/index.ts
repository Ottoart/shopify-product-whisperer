import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'

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
        console.log('Creating HTML email template')
        const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
        
        html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PrepFox</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="580" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 32px 40px; text-align: center; background-color: #ffffff; border-radius: 8px 8px 0 0;">
                            <h1 style="color: #1a202c; font-size: 28px; font-weight: 700; margin: 0;">Welcome to PrepFox! 🚀</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 32px; background-color: #ffffff; border-radius: 0 0 8px 8px;">
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                                Hi ${userName || 'there'},
                            </p>
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                                Thank you for signing up for PrepFox! We're excited to help you streamline your e-commerce operations.
                            </p>
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                                To get started, please confirm your email address by clicking the button below:
                            </p>
                            <div style="text-align: center; margin: 32px 0;">
                                <a href="${confirmationUrl}" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
                                    Confirm Email Address
                                </a>
                            </div>
                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 16px 0;">
                                If you didn't create an account with PrepFox, you can safely ignore this email.
                            </p>
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
                            <p style="color: #718096; font-size: 14px; text-align: center; margin: 8px 0;">
                                PrepFox - Your Complete E-commerce Fulfillment Solution
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
        console.log('HTML template created successfully')
      } catch (renderError) {
        console.error('Email template creation failed:', renderError)
        throw new Error(`Email template creation failed: ${renderError.message}`)
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
      
      const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PrepFox Test Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
    <div style="max-width: 580px; margin: 20px auto; background: white; padding: 40px; border-radius: 8px;">
        <h1 style="color: #1a202c;">PrepFox Test Email</h1>
        <p>This is a test email from PrepFox.</p>
        <p>User: ${testPayload.email || 'test@example.com'}</p>
    </div>
</body>
</html>`

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