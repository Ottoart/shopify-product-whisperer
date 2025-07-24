import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { trackingNumber, apiKey, apiSecret, carrierCode = 'stamps_com' } = await req.json()

    // Create basic auth header
    const credentials = btoa(`${apiKey}:${apiSecret}`)
    
    // Build query parameters for tracking
    const params = new URLSearchParams({
      carrierCode,
      trackingNumber
    })

    console.log('Tracking ShipStation shipment:', trackingNumber)

    const response = await fetch(`https://ssapi.shipstation.com/shipments/track?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ShipStation tracking error:', response.status, errorText)
      throw new Error(`ShipStation API error: ${response.status} - ${errorText}`)
    }

    const trackingData = await response.json()
    console.log('ShipStation tracking response:', trackingData)

    // Transform response to standardized format
    const trackingInfo = {
      tracking_number: trackingNumber,
      carrier: 'ShipStation',
      status: trackingData.statusCode || 'unknown',
      status_description: trackingData.statusDescription || 'No status available',
      location: trackingData.location || null,
      estimated_delivery: trackingData.estimatedDeliveryDate || null,
      delivered_date: trackingData.actualDeliveryDate || null,
      events: trackingData.events || [],
      last_updated: trackingData.lastUpdated || new Date().toISOString()
    }

    return new Response(
      JSON.stringify(trackingInfo),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in shipstation-track-shipment:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to track ShipStation shipment',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})