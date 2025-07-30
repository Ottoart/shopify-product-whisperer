import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { validateAdminAuth } from '../_shared/admin-auth.ts'

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
    // Validate admin authentication
    const authHeader = req.headers.get('Authorization');
    const authResult = await validateAdminAuth(authHeader);
    
    if (authResult.error) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { user } = authResult;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Updating UPS credentials for user:', user.id);

    const clientId = Deno.env.get('UPS_CLIENT_ID');
    const clientSecret = Deno.env.get('UPS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('UPS credentials not configured in secrets');
      return new Response(
        JSON.stringify({ error: 'UPS credentials not configured. Please contact support.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update UPS carrier configuration with real credentials
    const { data: existingConfig, error: fetchError } = await supabase
      .from('carrier_configurations')
      .select('api_credentials')
      .eq('user_id', user.id)
      .eq('carrier_name', 'UPS')
      .single();

    if (fetchError) {
      console.error('Failed to fetch UPS configuration:', fetchError);
      return new Response(
        JSON.stringify({ error: 'UPS configuration not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Merge with existing credentials to preserve account info
    const updatedCredentials = {
      ...existingConfig.api_credentials,
      client_id: clientId,
      client_secret: clientSecret,
      access_token: existingConfig.api_credentials?.access_token || null,
      refresh_token: existingConfig.api_credentials?.refresh_token || null,
      token_expires_at: existingConfig.api_credentials?.token_expires_at || null
    };

    const { error: updateError } = await supabase
      .from('carrier_configurations')
      .update({
        api_credentials: updatedCredentials,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('carrier_name', 'UPS');

    if (updateError) {
      console.error('Failed to update UPS configuration:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update UPS configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('UPS credentials updated successfully');

    return new Response(
      JSON.stringify({ 
        message: 'UPS credentials updated successfully',
        next_step: 'Complete OAuth authorization to start getting rates'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Setup UPS credentials error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});