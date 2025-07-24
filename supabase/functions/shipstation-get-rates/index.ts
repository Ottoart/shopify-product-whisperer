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
    const { shipmentDetails, apiKey = '1c4dd42add2a4963842dee2e1971ff35', apiSecret = '770f40d74b5c4bd5a4d87c7884750a6c' } = await req.json()

    // Create basic auth header
    const credentials = btoa(`${apiKey}:${apiSecret}`)
    
    // Build query parameters for ShipStation rates API
    const params = new URLSearchParams({
      carrierCode: 'stamps_com', // Default to USPS via Stamps.com
      fromPostalCode: shipmentDetails.from.postal_code,
      toState: shipmentDetails.to.state,
      toCountry: shipmentDetails.to.country,
      toPostalCode: shipmentDetails.to.postal_code,
      weight: shipmentDetails.package.weight.toString(),
      length: shipmentDetails.package.length.toString(),
      width: shipmentDetails.package.width.toString(),
      height: shipmentDetails.package.height.toString()
    })

    console.log('Fetching ShipStation rates with params:', params.toString())

    const response = await fetch(`https://ssapi.shipstation.com/shipments/getrates?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ShipStation API error:', response.status, errorText)
      throw new Error(`ShipStation API error: ${response.status} - ${errorText}`)
    }

    const ratesData = await response.json()
    console.log('ShipStation rates response:', ratesData)

    // Transform ShipStation response to our standard format
    const rates = ratesData.map((rate: any) => ({
      id: `shipstation_${rate.serviceCode}`,
      service_code: rate.serviceCode,
      service_name: rate.serviceName,
      carrier: 'ShipStation',
      rate: parseFloat(rate.shipmentCost),
      currency: 'USD',
      estimated_days: rate.estimatedTransitTime || 'N/A',
      estimated_delivery: rate.estimatedDeliveryDate || null,
      zone: null,
      markup: 0,
      total_rate: parseFloat(rate.shipmentCost)
    }))

    return new Response(
      JSON.stringify({ rates }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in shipstation-get-rates:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to get ShipStation rates',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})