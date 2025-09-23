import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get UPS carrier configuration
    const { data: carrierConfig, error: configError } = await supabase
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('carrier_name', 'UPS')
      .eq('is_active', true)
      .single();

    if (configError || !carrierConfig) {
      return new Response(
        JSON.stringify({ error: 'UPS not configured', details: configError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const credentials = carrierConfig.api_credentials as any;
    
    console.log('🔄 Refreshing UPS token...');
    console.log('🔄 Current token expires at:', credentials.token_expires_at);
    console.log('🔄 Current time:', new Date().toISOString());

    // Check if token needs refresh (if it expires within the next 5 minutes)
    const expiresAt = new Date(credentials.token_expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiresAt > fiveMinutesFromNow) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Token is still valid',
          expiresAt: credentials.token_expires_at
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Refresh the token using the refresh token
    const refreshBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: credentials.refresh_token
    });

    console.log('🔄 Calling UPS token refresh API...');

    const refreshResponse = await fetch('https://onlinetools.ups.com/security/v1/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${credentials.client_id}:${credentials.client_secret}`)}`,
        'x-merchant-id': credentials.client_id
      },
      body: refreshBody
    });

    const refreshData = await refreshResponse.text();
    console.log('🔄 UPS Refresh Response Status:', refreshResponse.status);
    console.log('🔄 UPS Refresh Response:', refreshData);

    if (!refreshResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to refresh UPS token', 
          status: refreshResponse.status,
          response: refreshData
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const tokenData = JSON.parse(refreshData);
    
    // Calculate new expiration time
    const newExpiresAt = new Date(now.getTime() + (tokenData.expires_in * 1000));

    // Update the credentials with new token
    const updatedCredentials = {
      ...credentials,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || credentials.refresh_token, // Keep old refresh token if new one not provided
      token_expires_at: newExpiresAt.toISOString()
    };

    // Save updated credentials to database
    const { error: updateError } = await supabase
      .from('carrier_configurations')
      .update({ 
        api_credentials: updatedCredentials,
        updated_at: new Date().toISOString()
      })
      .eq('id', carrierConfig.id);

    if (updateError) {
      console.error('🔄 Failed to update credentials:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save new token', details: updateError }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔄 Successfully refreshed UPS token');
    console.log('🔄 New token expires at:', newExpiresAt.toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token refreshed successfully',
        expiresAt: newExpiresAt.toISOString(),
        tokenData: {
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('🔄 Refresh error:', error);
    return new Response(
      JSON.stringify({ error: 'Refresh failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});