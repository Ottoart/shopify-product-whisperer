import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { QuoteConfirmationEmail } from './_templates/quote-confirmation.tsx'
import { AdminNotificationEmail } from './_templates/admin-notification.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QuoteNotificationRequest {
  quoteRequestId: string
  customerName: string
  customerEmail: string
  company: string
  serviceType: string
  estimatedSavings: string
  contactInfo: {
    firstName: string
    lastName: string
    email: string
    company: string
    phone?: string
  }
  businessDetails: {
    monthlyVolume?: string
    currentProvider?: string
    timeline?: string
  }
  painPoints?: string
  additionalServices: string[]
  message?: string
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
    console.log('Quote notification function called')
    
    const {
      quoteRequestId,
      customerName,
      customerEmail,
      company,
      serviceType,
      estimatedSavings,
      contactInfo,
      businessDetails,
      painPoints,
      additionalServices,
      message
    }: QuoteNotificationRequest = await req.json()

    console.log('Processing quote notification for:', customerEmail)

    // Send customer confirmation email
    const customerHtml = await renderAsync(
      React.createElement(QuoteConfirmationEmail, {
        customerName,
        customerEmail,
        serviceType,
        estimatedSavings,
        company,
        monthlyVolume: businessDetails.monthlyVolume,
        timeline: businessDetails.timeline,
        quoteRequestId,
      })
    )

    const { error: customerEmailError } = await resend.emails.send({
      from: 'PrepFox Quotes <quotes@resend.dev>',
      to: [customerEmail],
      subject: `Quote Request Received - ${serviceType} Services`,
      html: customerHtml,
    })

    if (customerEmailError) {
      console.error('Customer email error:', customerEmailError)
      throw new Error(`Customer email failed: ${JSON.stringify(customerEmailError)}`)
    }

    console.log('Customer confirmation email sent successfully')

    // Send admin notification email
    const adminHtml = await renderAsync(
      React.createElement(AdminNotificationEmail, {
        customerName,
        customerEmail,
        company,
        serviceType,
        monthlyVolume: businessDetails.monthlyVolume,
        timeline: businessDetails.timeline,
        painPoints,
        additionalServices,
        message,
        quoteRequestId,
      })
    )

    // Send to multiple admin emails
    const adminEmails = [
      'admin@prepfox.com',
      'quotes@prepfox.com',
      'sales@prepfox.com'
    ]

    const { error: adminEmailError } = await resend.emails.send({
      from: 'PrepFox System <system@resend.dev>',
      to: adminEmails,
      subject: `🚨 New Quote Request: ${company} - ${serviceType}`,
      html: adminHtml,
    })

    if (adminEmailError) {
      console.error('Admin email error:', adminEmailError)
      // Don't throw here - customer email already sent successfully
      console.log('Admin notification failed but customer email succeeded')
    } else {
      console.log('Admin notification email sent successfully')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        customerEmailSent: !customerEmailError,
        adminEmailSent: !adminEmailError
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
    console.error('Error in send-quote-notifications function:', error)
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