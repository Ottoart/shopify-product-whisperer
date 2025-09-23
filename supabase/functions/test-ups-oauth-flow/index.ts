import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get UPS credentials from database
    const { data: carrierConfig, error: configError } = await supabase
      .from('carrier_configurations')
      .select('api_credentials, account_number')
      .eq('user_id', user.id)
      .eq('carrier_name', 'UPS')
      .eq('is_active', true)
      .maybeSingle();

    if (configError || !carrierConfig) {
      return new Response(
        JSON.stringify({ error: 'UPS not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = carrierConfig.api_credentials as any;
    console.log('🔍 Testing OAuth flow with credentials:', {
      client_id: credentials.client_id,
      has_client_secret: Boolean(credentials.client_secret),
      current_token_expires: credentials.token_expires_at,
      account_number: carrierConfig.account_number
    });

    // Test both sandbox and production endpoints
    const environments = [
      { name: 'sandbox', url: 'https://wwwcie.ups.com/security/v1/oauth/token' },
      { name: 'production', url: 'https://onlinetools.ups.com/security/v1/oauth/token' }
    ];

    const results = [];

    for (const env of environments) {
      console.log(`🔍 Testing ${env.name} environment...`);
      
      const tokenBody = new URLSearchParams({
        grant_type: 'client_credentials'
      });

      const authString = btoa(`${credentials.client_id}:${credentials.client_secret}`);
      
      try {
        const response = await fetch(env.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${authString}`,
            'Accept': 'application/json'
          },
          body: tokenBody.toString()
        });

        const responseText = await response.text();
        console.log(`🔍 ${env.name} response status:`, response.status);
        console.log(`🔍 ${env.name} response:`, responseText);

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = { raw: responseText };
        }

        results.push({
          environment: env.name,
          url: env.url,
          status: response.status,
          success: response.ok,
          response: responseData
        });

      } catch (error) {
        console.error(`🔍 ${env.name} error:`, error);
        results.push({
          environment: env.name,
          url: env.url,
          status: 'error',
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'OAuth flow test completed',
        client_id: credentials.client_id,
        account_number: carrierConfig.account_number,
        current_token_expires: credentials.token_expires_at,
        results
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Test error:', error);
    return new Response(
      JSON.stringify({ error: 'Test failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});