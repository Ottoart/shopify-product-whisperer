import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { 
      api_key, 
      api_secret, 
      customer_number, 
      contract_number, 
      account_type = 'commercial',
      is_production = false 
    } = body;

    if (!api_key || !api_secret || !customer_number) {
      return new Response(
        JSON.stringify({ error: 'Missing required credentials: api_key, api_secret, and customer_number are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test the credentials by making a request to Canada Post API
    const testResponse = await testCanadaPostCredentials(api_key, api_secret, customer_number, is_production);
    
    if (!testResponse.success) {
      return new Response(
        JSON.stringify({ error: testResponse.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the configuration
    const credentialsConfig = {
      api_key,
      api_secret,
      customer_number,
      contract_number: contract_number || '',
      account_type,
      is_production,
      environment: is_production ? 'production' : 'development',
      authorized_at: new Date().toISOString()
    };

    // Check if user already has a Canada Post configuration
    const { data: existingConfig } = await supabase
      .from('carrier_configurations')
      .select('id')
      .eq('user_id', user.id)
      .eq('carrier_name', 'Canada Post')
      .single();

    if (existingConfig) {
      // Update existing configuration
      const { error: updateError } = await supabase
        .from('carrier_configurations')
        .update({
          api_credentials: credentialsConfig,
          settings: {
            enabled_services: ['REG', 'EXP', 'PC'],
            user_configured: true
          },
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);

      if (updateError) {
        console.error('Error updating Canada Post configuration:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update carrier configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new configuration
      const { error: insertError } = await supabase
        .from('carrier_configurations')
        .insert({
          user_id: user.id,
          carrier_name: 'Canada Post',
          api_credentials: credentialsConfig,
          settings: {
            enabled_services: ['REG', 'EXP', 'PC'],
            user_configured: true
          },
          is_active: true,
          pickup_type_code: '01',
          default_package_type: '02'
        });

      if (insertError) {
        console.error('Error creating Canada Post configuration:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create carrier configuration' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Canada Post API configuration saved for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Canada Post configuration saved successfully',
        environment: is_production ? 'production' : 'development'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Canada Post setup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function testCanadaPostCredentials(apiKey: string, apiSecret: string, customerNumber: string, isProduction: boolean) {
  try {
    const baseUrl = isProduction 
      ? 'https://soa-gw.canadapost.ca'
      : 'https://ct.soa-gw.canadapost.ca';
    
    // Test by getting services
    const testUrl = `${baseUrl}/rs/ship/service?country=CA`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Accept': 'application/vnd.cpc.ship+xml',
        'Content-Type': 'application/vnd.cpc.ship+xml',
        'Accept-language': 'en-CA'
      }
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('Canada Post API test failed:', response.status, errorText);
      return { 
        success: false, 
        error: `API credentials test failed (${response.status}). Please verify your API key, secret, and customer number.` 
      };
    }
  } catch (error) {
    console.error('Canada Post credentials test error:', error);
    return { 
      success: false, 
      error: 'Failed to test credentials. Please check your API details and try again.' 
    };
  }
}