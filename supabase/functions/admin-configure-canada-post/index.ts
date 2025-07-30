import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT - handle both standard Supabase JWT and admin JWT
    const jwt = authHeader.replace('Bearer ', '')
    let user = null;
    
    try {
      // Try standard Supabase auth first
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(jwt);
      if (authUser) {
        user = authUser;
      } else {
        // Handle admin session JWT (base64 encoded for demo)
        try {
          const payload = JSON.parse(atob(jwt));
          if (payload.sub && payload.email) {
            user = {
              id: payload.sub,
              email: payload.email,
              user_metadata: payload.user_metadata || {}
            };
            console.log('Using admin session JWT for user:', user.email);
          }
        } catch (decodeError) {
          console.error('Failed to decode admin JWT:', decodeError);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (adminError || !adminUser || !['master_admin', 'admin'].includes(adminUser.role)) {
      console.error('Admin authorization error:', adminError)
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { api_key, api_secret, customer_number, contract_number, account_type, is_production } = await req.json()

    // Validate required fields
    if (!api_key || !api_secret || !customer_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: api_key, api_secret, customer_number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Testing Canada Post credentials...')

    // Test credentials with Canada Post API
    const testResult = await testCanadaPostCredentials({
      api_key,
      api_secret,
      customer_number,
      contract_number,
      account_type: account_type || 'commercial',
      is_production: is_production || false
    })

    if (!testResult.success) {
      console.error('Canada Post test failed:', testResult.error)
      return new Response(
        JSON.stringify({ error: `Credential validation failed: ${testResult.error}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Credentials validated successfully, storing configuration...')

    // Store configuration in database as system carrier
    const carrierConfig = {
      api_key,
      api_secret,
      customer_number,
      contract_number,
      account_type: account_type || 'commercial',
      is_production: is_production || false
    }

    const defaultSettings = {
      system_carrier: true,
      user_configured: false,
      enabled_services: ['DOM.RP', 'DOM.EP', 'DOM.XP', 'DOM.PC'],
      default_service: 'DOM.RP'
    }

    // Upsert carrier configuration
    const { data, error } = await supabase
      .from('carrier_configurations')
      .upsert({
        user_id: user.id, // Admin user configuring it
        carrier_name: 'canada_post',
        api_credentials: carrierConfig,
        settings: defaultSettings,
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,carrier_name'
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save configuration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Canada Post configuration saved successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Canada Post configured successfully as system carrier',
        data
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function testCanadaPostCredentials(credentials: any) {
  try {
    const baseUrl = credentials.is_production 
      ? 'https://soa-gw.canadapost.ca'
      : 'https://ct.soa-gw.canadapost.ca'

    // Build SOAP request for DiscoverServices operation
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:rat="http://www.canadapost.ca/ws/soap/ship/rate/v4">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${credentials.api_key}</wsse:Username>
        <wsse:Password>${credentials.api_secret}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <rat:discover-services-request>
      <rat:locale>EN</rat:locale>
      <rat:destination-country-code>CA</rat:destination-country-code>
    </rat:discover-services-request>
  </soapenv:Body>
</soapenv:Envelope>`

    console.log('Testing Canada Post SOAP credentials with DiscoverServices...')
    
    const response = await fetch(`${baseUrl}/rs/soap/rating/v4`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Accept': 'text/xml'
      },
      body: soapBody
    })

    const responseText = await response.text()
    console.log('Canada Post SOAP response status:', response.status)
    console.log('Canada Post SOAP response preview:', responseText.substring(0, 500))
    
    if (response.ok) {
      // Check for SOAP fault
      if (responseText.includes('soap:Fault') || responseText.includes('soapenv:Fault')) {
        return { 
          success: false, 
          error: `SOAP Fault in response: ${responseText}` 
        }
      }
      
      // Check for successful DiscoverServices response
      if (responseText.includes('discover-services-response') && responseText.includes('service')) {
        return { success: true }
      } else {
        return { 
          success: false, 
          error: `Unexpected SOAP response: ${responseText}` 
        }
      }
    } else {
      console.error('Canada Post SOAP test failed:', response.status, responseText)
      return { 
        success: false, 
        error: `SOAP API test failed: ${response.status} ${response.statusText} - ${responseText}` 
      }
    }
  } catch (error) {
    console.error('Canada Post SOAP connection test error:', error)
    return { 
      success: false, 
      error: `SOAP connection test failed: ${error.message}` 
    }
  }
}