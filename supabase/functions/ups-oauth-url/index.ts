import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3"

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
    // Check authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
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
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    const clientId = Deno.env.get('UPS_CLIENT_ID');
    
    if (!clientId) {
      console.error('UPS_CLIENT_ID not configured');
      return new Response(
        JSON.stringify({ error: 'UPS credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // UPS OAuth URL for production
    const baseUrl = 'https://onlinetools.ups.com/security/v1/oauth/authorize';
    const redirectUri = 'https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/ups-oauth-callback';
    
    const authUrl = new URL(baseUrl);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', 'rating');
    authUrl.searchParams.append('state', crypto.randomUUID());

    console.log('Generated UPS OAuth URL:', authUrl.toString());

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        redirectUri 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating UPS OAuth URL:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate OAuth URL' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});