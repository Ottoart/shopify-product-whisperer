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
    const ebayRuName = Deno.env.get('EBAY_RU_NAME');
    
    console.log('eBay Client ID exists:', !!ebayClientId);
    console.log('eBay Client ID length:', ebayClientId?.length || 0);
    console.log('eBay Client ID preview:', ebayClientId?.substring(0, 15) + '...');
    console.log('eBay RU Name exists:', !!ebayRuName);
    
    if (!ebayClientId) {
      throw new Error('eBay Client ID not configured in secrets');
    }
    
    if (!ebayRuName) {
      throw new Error('eBay RU Name (redirect URI) not configured in secrets');
    }

    // Parse request body
    const { state, environment = 'production' } = await req.json();
    
    if (!state) {
      throw new Error('State parameter is required for OAuth security');
    }

    console.log('Generating OAuth URL with state:', state);
    console.log('Using environment:', environment);

    // Determine the correct eBay authorization URL based on environment
    const isProduction = environment === 'production' || ebayClientId.includes('PRD');
    const authBaseUrl = isProduction 
      ? 'https://auth.ebay.com/oauth2/authorize'
      : 'https://auth.sandbox.ebay.com/oauth2/authorize';
    
    console.log('Using auth URL:', authBaseUrl);
    console.log('Is production environment:', isProduction);

    // Construct eBay OAuth URL with real credentials
    const ebayAuthUrl = new URL(authBaseUrl);
    ebayAuthUrl.searchParams.set('client_id', ebayClientId);
    ebayAuthUrl.searchParams.set('response_type', 'code');
    ebayAuthUrl.searchParams.set('redirect_uri', ebayRuName);
    
    // Use correct eBay OAuth scopes for new OAuth security
    const scopes = isProduction ? [
      'https://api.ebay.com/oauth/api_scope'
    ] : [
      'https://api.sandbox.ebay.com/oauth/api_scope'
    ];
    
    ebayAuthUrl.searchParams.set('scope', scopes.join(' '));
    ebayAuthUrl.searchParams.set('state', state);
    
    // Add required OAuth parameters for new security
    ebayAuthUrl.searchParams.set('prompt', 'login');

    console.log('Final OAuth parameters:');
    console.log('- client_id:', ebayClientId.substring(0, 15) + '...');
    console.log('- redirect_uri:', ebayRuName);
    console.log('- scope:', scopes.join(' '));
    console.log('- state:', state);
    console.log('Generated OAuth URL successfully');
    console.log('Final OAuth URL:', ebayAuthUrl.toString());

    return new Response(JSON.stringify({ 
      oauth_url: ebayAuthUrl.toString(),
      client_id: ebayClientId.substring(0, 15) + '...',
      environment: isProduction ? 'production' : 'sandbox',
      redirect_uri: ebayRuName
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