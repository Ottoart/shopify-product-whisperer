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

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
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

    // Format authentication as specified in Canada Post docs
    const auth = btoa(`${credentials.api_key}:${credentials.api_secret}`)
    
    // Test with a simple service discovery call
    const response = await fetch(`${baseUrl}/rs/ship/service`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/vnd.cpc.ship.service-v3+xml',
        'Accept-language': 'en-CA'
      }
    })

    console.log('Canada Post API test response status:', response.status)
    
    if (response.ok) {
      const responseText = await response.text()
      console.log('Canada Post API test successful, response preview:', responseText.substring(0, 200))
      return { success: true }
    } else {
      const errorText = await response.text()
      console.error('Canada Post API test failed:', response.status, errorText)
      return { 
        success: false, 
        error: `API test failed: ${response.status} ${response.statusText} - ${errorText}` 
      }
    }
  } catch (error) {
    console.error('Canada Post connection test error:', error)
    return { 
      success: false, 
      error: `Connection test failed: ${error.message}` 
    }
  }
}