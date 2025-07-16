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
    const { error: updateError } = await supabase
      .from('carrier_configurations')
      .update({
        api_credentials: {
          client_id: clientId,
          client_secret: clientSecret,
          access_token: null, // Will be set after OAuth
          refresh_token: null,
          token_expires_at: null
        },
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