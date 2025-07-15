import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    console.log('=== eBay OAuth URL Generator ===');
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
    
    console.log('eBay Client ID exists:', !!ebayClientId);
    console.log('eBay Client ID length:', ebayClientId?.length || 0);
    
    if (!ebayClientId) {
      throw new Error('eBay Client ID not configured in secrets');
    }

    // Parse request body
    const { state } = await req.json();
    
    if (!state) {
      throw new Error('State parameter is required for OAuth security');
    }

    console.log('Generating OAuth URL with state:', state);

    // Construct eBay OAuth URL with real credentials
    const ebayAuthUrl = new URL('https://auth.ebay.com/oauth2/authorize');
    ebayAuthUrl.searchParams.set('client_id', ebayClientId);
    ebayAuthUrl.searchParams.set('response_type', 'code');
    ebayAuthUrl.searchParams.set('redirect_uri', `https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/ebay-oauth-callback`);
    ebayAuthUrl.searchParams.set('scope', [
      'https://api.ebay.com/oauth/api_scope',
      'https://api.ebay.com/oauth/api_scope/sell.inventory',
      'https://api.ebay.com/oauth/api_scope/sell.account',
      'https://api.ebay.com/oauth/api_scope/sell.fulfillment',
      'https://api.ebay.com/oauth/api_scope/sell.marketing',
      'https://api.ebay.com/oauth/api_scope/sell.analytics.readonly'
    ].join(' '));
    ebayAuthUrl.searchParams.set('state', state);

    console.log('Generated OAuth URL successfully');

    return new Response(JSON.stringify({ 
      oauth_url: ebayAuthUrl.toString(),
      client_id: ebayClientId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating eBay OAuth URL:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate eBay OAuth URL'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});