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

    console.log('🔄 Forcibly refreshing UPS token for user:', user.id);

    // Get UPS carrier configuration
    const { data: carrierConfig, error: configError } = await supabase
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('carrier_name', 'UPS')
      .eq('is_active', true)
      .maybeSingle();

    if (configError || !carrierConfig) {
      return new Response(
        JSON.stringify({ error: 'UPS not configured', details: configError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = carrierConfig.api_credentials as any;
    
    // Force token to be expired so it gets refreshed
    const expiredCredentials = {
      ...credentials,
      access_token: null,
      token_expires_at: '2024-01-01T00:00:00.000Z'
    };

    console.log('🔄 Clearing old token to force refresh...');
    
    // Update with expired token to force refresh
    const { error: updateError } = await supabase
      .from('carrier_configurations')
      .update({
        api_credentials: expiredCredentials,
        updated_at: new Date().toISOString()
      })
      .eq('id', carrierConfig.id);

    if (updateError) {
      console.error('Failed to clear token:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to clear token', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Token cleared successfully. UPS auth will refresh on next request.');

    return new Response(
      JSON.stringify({ 
        message: 'UPS token cleared successfully',
        environment: credentials.environment || 'sandbox',
        next_step: 'Test credentials again - fresh token will be generated'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Clear token error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to clear token', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});