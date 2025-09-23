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
    const body = await req.json()
    
    // Get credentials from Supabase secrets or request body (for testing new credentials)
    const apiKey = body.apiKey || Deno.env.get('SHIPSTATION_API_KEY')
    const apiSecret = body.apiSecret || Deno.env.get('SHIPSTATION_API_SECRET')
    
    if (!apiKey || !apiSecret) {
      throw new Error('ShipStation API credentials not provided')
    }

    // Create basic auth header
    const credentials = btoa(`${apiKey}:${apiSecret}`)
    
    console.log('Validating ShipStation credentials')

    // Test credentials by making a simple API call to get account info
    const response = await fetch('https://ssapi.shipstation.com/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ShipStation credential validation failed:', response.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: `Invalid credentials: ${response.status} - ${errorText}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const accountData = await response.json()
    console.log('ShipStation credentials validated successfully')

    return new Response(
      JSON.stringify({ 
        valid: true,
        account: accountData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in shipstation-validate-credentials:', error)
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: error.message || 'Failed to validate ShipStation credentials'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})