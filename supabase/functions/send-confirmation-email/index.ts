import { Resend } from 'npm:resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

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

  try {
    console.log('Email function called')
    console.log('Resend API key exists:', !!Deno.env.get('RESEND_API_KEY'))
    
    const payload = await req.text()
    console.log('Payload received, length:', payload.length)
    
    // Parse the webhook payload
    const data = JSON.parse(payload)
    console.log('Parsed data:', JSON.stringify(data, null, 2))
    
    // Extract user and email data
    const user = data.user
    const emailData = data.email_data || {}
    
    if (!user || !user.email) {
      throw new Error('No user email found in payload')
    }
    
    console.log('Processing email for:', user.email)
    
    // Create confirmation URL
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://rtaomiqsnctigleqjojt.supabase.co'
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${emailData.token_hash}&type=${emailData.email_action_type}&redirect_to=${emailData.redirect_to}`
    
    // Simple HTML email
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to PrepFox</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 20px;">
    <div style="max-width: 580px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
        <h1 style="color: #1a202c; text-align: center;">Welcome to PrepFox! 🚀</h1>
        <p>Hi there,</p>
        <p>Thank you for signing up for PrepFox! Please confirm your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #3b82f6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; display: inline-block;">
                Confirm Email Address
            </a>
        </div>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px; text-align: center;">
            PrepFox - Your E-commerce Fulfillment Solution
        </p>
    </div>
</body>
</html>`

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
    
    console.log('Email sent successfully to:', user.email)
    
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
        error: error.message,
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