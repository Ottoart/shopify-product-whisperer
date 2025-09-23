import React from 'npm:react@18.3.1'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { FollowUpEmail } from './_templates/follow-up-email.tsx'
import { WelcomeSequenceEmail } from './_templates/welcome-sequence.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FollowUpRequest {
  type: 'follow-up' | 'welcome-sequence'
  quoteRequestId?: string
  customerEmail?: string
  welcomeEmailNumber?: number // For welcome sequence
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
    console.log('Follow-up email function called')
    
    const { type, quoteRequestId, customerEmail, welcomeEmailNumber }: FollowUpRequest = await req.json()

    if (type === 'follow-up' && quoteRequestId) {
      // Handle quote follow-up email
      console.log('Processing follow-up email for quote:', quoteRequestId)

      // Get quote request details
      const { data: quoteData, error: quoteError } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteRequestId)
        .single()

      if (quoteError || !quoteData) {
        throw new Error('Quote request not found')
      }

      // Calculate days since request
      const createdAt = new Date(quoteData.created_at)
      const now = new Date()
      const daysWaiting = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

      const customerName = `${quoteData.contact_info.firstName} ${quoteData.contact_info.lastName}`
      const specialistName = "Sarah Mitchell" // Could be dynamic based on assignment
      const specialistEmail = "sarah.mitchell@prepfox.com"

      const html = await renderAsync(
        React.createElement(FollowUpEmail, {
          customerName,
          customerEmail: quoteData.contact_info.email,
          company: quoteData.contact_info.company,
          serviceType: quoteData.service_type,
          quoteRequestId,
          daysWaiting,
          specialistName,
          specialistEmail,
        })
      )

      const { error: emailError } = await resend.emails.send({
        from: `${specialistName} <${specialistEmail.replace('@prepfox.com', '@resend.dev')}>`,
        to: [quoteData.contact_info.email],
        subject: `Following up on your ${quoteData.service_type} quote request`,
        html,
      })

      if (emailError) {
        console.error('Follow-up email error:', emailError)
        throw new Error(`Follow-up email failed: ${JSON.stringify(emailError)}`)
      }

      console.log('Follow-up email sent successfully')

    } else if (type === 'welcome-sequence' && customerEmail && welcomeEmailNumber) {
      // Handle welcome sequence email
      console.log('Processing welcome sequence email:', welcomeEmailNumber, 'for:', customerEmail)

      // Get user profile for personalization
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      const customerName = userData?.display_name || 'there'
      const company = 'Your Company' // Could be fetched from user profile

      const html = await renderAsync(
        React.createElement(WelcomeSequenceEmail, {
          customerName,
          customerEmail,
          company,
          emailNumber: welcomeEmailNumber,
        })
      )

      const emailContent = {
        1: { subject: "Welcome to PrepFox! Here's what happens next" },
        2: { subject: "Your PrepFox Getting Started Guide" },
        3: { subject: "Maximizing Your PrepFox Experience" }
      }[welcomeEmailNumber] || { subject: "Welcome to PrepFox" }

      const { error: emailError } = await resend.emails.send({
        from: 'PrepFox Team <welcome@resend.dev>',
        to: [customerEmail],
        subject: emailContent.subject,
        html,
      })

      if (emailError) {
        console.error('Welcome sequence email error:', emailError)
        throw new Error(`Welcome email failed: ${JSON.stringify(emailError)}`)
      }

      console.log('Welcome sequence email sent successfully')

    } else {
      throw new Error('Invalid request parameters')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        type,
        message: 'Email sent successfully'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  } catch (error) {
    console.error('Error in send-follow-up-emails function:', error)
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