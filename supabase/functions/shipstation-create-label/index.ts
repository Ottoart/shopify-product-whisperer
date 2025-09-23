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
    const { shipmentDetails, serviceCode } = await req.json()
    
    // Get credentials from Supabase secrets
    const apiKey = Deno.env.get('SHIPSTATION_API_KEY')
    const apiSecret = Deno.env.get('SHIPSTATION_API_SECRET')
    
    if (!apiKey || !apiSecret) {
      throw new Error('ShipStation API credentials not configured')
    }

    // Create basic auth header
    const credentials = btoa(`${apiKey}:${apiSecret}`)
    
    // Prepare ShipStation shipment payload
    const shipmentPayload = {
      shipment: {
        carrierCode: "stamps_com", // Default to USPS via Stamps.com
        serviceCode: serviceCode,
        packageCode: "package",
        confirmation: "none",
        shipDate: new Date().toISOString().split('T')[0],
        weight: {
          value: shipmentDetails.package.weight,
          units: "pounds"
        },
        dimensions: {
          units: "inches",
          length: shipmentDetails.package.length,
          width: shipmentDetails.package.width,
          height: shipmentDetails.package.height
        },
        shipFrom: {
          name: shipmentDetails.from.name,
          company: shipmentDetails.from.company || "",
          street1: shipmentDetails.from.address,
          city: shipmentDetails.from.city,
          state: shipmentDetails.from.state,
          postalCode: shipmentDetails.from.postal_code,
          country: shipmentDetails.from.country,
          phone: shipmentDetails.from.phone || ""
        },
        shipTo: {
          name: shipmentDetails.to.name,
          company: shipmentDetails.to.company || "",
          street1: shipmentDetails.to.address,
          city: shipmentDetails.to.city,
          state: shipmentDetails.to.state,
          postalCode: shipmentDetails.to.postal_code,
          country: shipmentDetails.to.country,
          phone: shipmentDetails.to.phone || ""
        },
        insuranceOptions: shipmentDetails.package.value ? {
          provider: "carrier",
          insureShipment: true,
          insuredValue: shipmentDetails.package.value
        } : null
      }
    }

    // Add additional services if requested
    if (shipmentDetails.options?.signature_required) {
      shipmentPayload.shipment.confirmation = "signature"
    }

    console.log('Creating ShipStation label with payload:', JSON.stringify(shipmentPayload, null, 2))

    const response = await fetch('https://ssapi.shipstation.com/shipments/createlabel', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(shipmentPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ShipStation create label error:', response.status, errorText)
      throw new Error(`ShipStation API error: ${response.status} - ${errorText}`)
    }

    const labelData = await response.json()
    console.log('ShipStation label response:', labelData)

    // Transform response to our standard format
    const shipmentResponse = {
      id: labelData.shipmentId || `ss_${Date.now()}`,
      tracking_number: labelData.trackingNumber,
      label_url: labelData.labelData, // Base64 PDF data
      label_pdf: labelData.labelData,
      cost: parseFloat(labelData.shipmentCost),
      currency: 'USD',
      service_code: serviceCode,
      service_name: labelData.serviceName || serviceCode,
      carrier: 'ShipStation',
      estimated_delivery: labelData.estimatedDeliveryDate || null
    }

    return new Response(
      JSON.stringify(shipmentResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in shipstation-create-label:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create ShipStation label',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})