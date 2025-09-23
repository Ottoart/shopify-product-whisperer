import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-ss-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-ss-signature')
    const body = await req.text()
    
    console.log('ShipStation webhook received:', body)
    console.log('Signature:', signature)

    // Parse the webhook payload
    const webhookData = JSON.parse(body)
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different webhook events
    switch (webhookData.resource_type) {
      case 'ORDER_NOTIFY':
        await handleOrderNotification(supabase, webhookData)
        break
      case 'SHIP_NOTIFY':
        await handleShipNotification(supabase, webhookData)
        break
      case 'ITEM_ORDER_NOTIFY':
        await handleItemOrderNotification(supabase, webhookData)
        break
      case 'ITEM_SHIP_NOTIFY':
        await handleItemShipNotification(supabase, webhookData)
        break
      default:
        console.log('Unhandled webhook type:', webhookData.resource_type)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing ShipStation webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process webhook',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function handleOrderNotification(supabase: any, webhookData: any) {
  console.log('Processing order notification:', webhookData)
  
  // Update order status based on ShipStation data
  const { resource_url } = webhookData
  
  // You can make additional API calls to ShipStation to get full order details
  // For now, just log the notification
  console.log('Order notification processed for:', resource_url)
}

async function handleShipNotification(supabase: any, webhookData: any) {
  console.log('Processing ship notification:', webhookData)
  
  const { resource_url } = webhookData
  
  try {
    // Extract tracking information from ShipStation API if needed
    // Update shipping labels and order status
    
    console.log('Ship notification processed for:', resource_url)
    
    // You could update shipping_labels table here with tracking updates
    // const { error } = await supabase
    //   .from('shipping_labels')
    //   .update({ 
    //     status: 'shipped',
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('shipment_identification_number', shipment_id)

  } catch (error) {
    console.error('Error handling ship notification:', error)
  }
}

async function handleItemOrderNotification(supabase: any, webhookData: any) {
  console.log('Processing item order notification:', webhookData)
}

async function handleItemShipNotification(supabase: any, webhookData: any) {
  console.log('Processing item ship notification:', webhookData)
}