import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Predefined ShipStation services (these are commonly available)
const SHIPSTATION_SERVICES = [
  // USPS via Stamps.com
  { code: 'usps_priority_mail', name: 'USPS Priority Mail', carrier: 'stamps_com' },
  { code: 'usps_priority_mail_express', name: 'USPS Priority Mail Express', carrier: 'stamps_com' },
  { code: 'usps_first_class_mail', name: 'USPS First Class Mail', carrier: 'stamps_com' },
  { code: 'usps_media_mail', name: 'USPS Media Mail', carrier: 'stamps_com' },
  { code: 'usps_ground_advantage', name: 'USPS Ground Advantage', carrier: 'stamps_com' },
  
  // FedEx
  { code: 'fedex_ground', name: 'FedEx Ground', carrier: 'fedex' },
  { code: 'fedex_home_delivery', name: 'FedEx Home Delivery', carrier: 'fedex' },
  { code: 'fedex_2day', name: 'FedEx 2Day', carrier: 'fedex' },
  { code: 'fedex_standard_overnight', name: 'FedEx Standard Overnight', carrier: 'fedex' },
  { code: 'fedex_priority_overnight', name: 'FedEx Priority Overnight', carrier: 'fedex' },
  
  // UPS
  { code: 'ups_ground', name: 'UPS Ground', carrier: 'ups_walleted' },
  { code: 'ups_3_day_select', name: 'UPS 3 Day Select', carrier: 'ups_walleted' },
  { code: 'ups_2nd_day_air', name: 'UPS 2nd Day Air', carrier: 'ups_walleted' },
  { code: 'ups_next_day_air', name: 'UPS Next Day Air', carrier: 'ups_walleted' },
  { code: 'ups_next_day_air_saver', name: 'UPS Next Day Air Saver', carrier: 'ups_walleted' },
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { apiKey, apiSecret } = await req.json()

    // Create basic auth header
    const credentials = btoa(`${apiKey}:${apiSecret}`)
    
    console.log('Fetching ShipStation services')

    // Try to get carriers first to see what's available
    const carriersResponse = await fetch('https://ssapi.shipstation.com/carriers', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    let availableServices = SHIPSTATION_SERVICES

    if (carriersResponse.ok) {
      const carriersData = await carriersResponse.json()
      console.log('Available carriers:', carriersData)
      
      // Filter services based on available carriers
      const carrierCodes = carriersData.map((carrier: any) => carrier.code)
      availableServices = SHIPSTATION_SERVICES.filter(service => 
        carrierCodes.includes(service.carrier)
      )
    } else {
      console.warn('Could not fetch carriers, using default service list')
    }

    // Transform to our standard format
    const services = availableServices.map(service => ({
      code: service.code,
      name: service.name,
      description: `${service.name} via ShipStation`
    }))

    return new Response(
      JSON.stringify({ services }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in shipstation-get-services:', error)
    
    // Return default services on error
    const defaultServices = SHIPSTATION_SERVICES.map(service => ({
      code: service.code,
      name: service.name,
      description: `${service.name} via ShipStation`
    }))

    return new Response(
      JSON.stringify({ services: defaultServices }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})