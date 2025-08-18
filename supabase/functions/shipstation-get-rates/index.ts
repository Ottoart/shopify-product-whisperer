import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Available carriers in ShipStation
const AVAILABLE_CARRIERS = [
  { code: 'stamps_com', name: 'USPS' },
  { code: 'ups', name: 'UPS' },
  { code: 'fedex', name: 'FedEx' },
  { code: 'dhl_express', name: 'DHL Express' },
  { code: 'canada_post', name: 'Canada Post' }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { shipmentDetails, carrierCode } = await req.json()

    // Get API credentials from Supabase secrets
    const apiKey = Deno.env.get('SHIPSTATION_API_KEY')
    const apiSecret = Deno.env.get('SHIPSTATION_API_SECRET')

    if (!apiKey || !apiSecret) {
      throw new Error('ShipStation API credentials not configured')
    }

    // Validate shipment details structure
    if (!shipmentDetails?.from?.postal_code || !shipmentDetails?.to?.postal_code) {
      throw new Error('Invalid shipment details: missing required address information')
    }

    if (!shipmentDetails?.package?.weight) {
      throw new Error('Invalid shipment details: missing package weight')
    }

    // Create basic auth header
    const credentials = btoa(`${apiKey}:${apiSecret}`)
    
    // Determine carriers to query (specific carrier or all available)
    const carriersToQuery = carrierCode 
      ? AVAILABLE_CARRIERS.filter(c => c.code === carrierCode)
      : AVAILABLE_CARRIERS

    console.log(`Fetching ShipStation rates for ${carriersToQuery.length} carriers:`, carriersToQuery.map(c => c.name))

    // Get rates from all requested carriers
    const allRates = []
    
    for (const carrier of carriersToQuery) {
      try {
        // Build query parameters for ShipStation rates API
        const params = new URLSearchParams({
          carrierCode: carrier.code,
          fromPostalCode: shipmentDetails.from.postal_code,
          toState: shipmentDetails.to.state || shipmentDetails.to.province || '',
          toCountry: shipmentDetails.to.country || 'US',
          toPostalCode: shipmentDetails.to.postal_code,
          weight: shipmentDetails.package.weight.toString(),
          length: (shipmentDetails.package.length || 12).toString(),
          width: (shipmentDetails.package.width || 12).toString(),
          height: (shipmentDetails.package.height || 6).toString()
        })

        console.log(`Fetching ${carrier.name} rates with params:`, params.toString())

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
          console.error(`${carrier.name} API error:`, response.status, errorText)
          
          // Continue with other carriers instead of failing completely
          if (response.status === 401 || response.status === 403) {
            console.error(`Authentication failed for ${carrier.name}`)
          }
          continue
        }

        const ratesData = await response.json()
        console.log(`${carrier.name} rates response:`, ratesData)

        // Handle both array and object responses
        const rates = Array.isArray(ratesData) ? ratesData : (ratesData.rates || [])
        
        // Transform rates to our standard format
        const transformedRates = rates.map((rate: any) => ({
          id: `shipstation_${carrier.code}_${rate.serviceCode}`,
          service_code: rate.serviceCode,
          service_name: rate.serviceName,
          carrier: carrier.name,
          carrier_code: carrier.code,
          rate: parseFloat(rate.shipmentCost || rate.rate || 0),
          currency: rate.currency || 'USD',
          estimated_days: rate.estimatedTransitTime || rate.transitTime || 'N/A',
          estimated_delivery: rate.estimatedDeliveryDate || rate.deliveryDate || null,
          zone: rate.zone || null,
          markup: 0,
          total_rate: parseFloat(rate.shipmentCost || rate.rate || 0)
        }))

        allRates.push(...transformedRates)

      } catch (carrierError) {
        console.error(`Error fetching rates for ${carrier.name}:`, carrierError)
        // Continue with other carriers
      }
    }

    // Sort rates by price
    allRates.sort((a, b) => a.total_rate - b.total_rate)

    // Return rates or fallback response
    if (allRates.length === 0) {
      console.warn('No rates found from any carrier')
      return new Response(
        JSON.stringify({ 
          rates: [],
          warning: 'No shipping rates available from ShipStation carriers',
          message: 'Please check your shipment details and carrier configurations'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        rates: allRates,
        carriers_queried: carriersToQuery.map(c => c.name),
        total_rates_found: allRates.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in shipstation-get-rates:', error)
    
    // Provide more specific error responses
    let errorMessage = 'Failed to get ShipStation rates'
    let statusCode = 400
    
    if (error.message.includes('credentials')) {
      errorMessage = 'ShipStation API credentials not configured'
      statusCode = 500
    } else if (error.message.includes('Invalid shipment details')) {
      errorMessage = error.message
      statusCode = 400
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error connecting to ShipStation API'
      statusCode = 503
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.message,
        fallback_rates: [
          {
            id: 'fallback_standard',
            service_code: 'STANDARD',
            service_name: 'Standard Shipping',
            carrier: 'Estimated',
            rate: 9.99,
            currency: 'USD',
            estimated_days: '5-7',
            estimated_delivery: null,
            zone: null,
            markup: 0,
            total_rate: 9.99
          }
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode 
      }
    )
  }
})