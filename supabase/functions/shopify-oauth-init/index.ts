import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== Shopify OAuth URL Generator Request ===');
  try {
    // Get environment variables
    const shopifyClientId = Deno.env.get('SHOPIFY_CLIENT_ID');
    const shopifyClientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET');
    
    console.log('Shopify Client ID exists:', Boolean(shopifyClientId));
    console.log('Shopify Client Secret exists:', Boolean(shopifyClientSecret));
    
    if (!shopifyClientId || !shopifyClientSecret) {
      throw new Error('Shopify app credentials not configured in secrets');
    }

    // Parse request body
    const { state, shopDomain } = await req.json();
    
    if (!state) {
      throw new Error('State parameter is required for OAuth security');
    }

    if (!shopDomain) {
      throw new Error('Shop domain is required');
    }

    // Validate and normalize shop domain
    let normalizedDomain = shopDomain.toLowerCase().trim();
    if (!normalizedDomain.endsWith('.myshopify.com')) {
      normalizedDomain = `${normalizedDomain}.myshopify.com`;
    }

    console.log('Generating OAuth URL with state:', state);
    console.log('Shop domain:', normalizedDomain);

    // Shopify OAuth scopes for maximum data access
    const scopes = [
      'read_products',
      'write_products', 
      'read_orders',
      'read_customers',
      'read_inventory',
      'read_analytics',
      'read_reports',
      'read_fulfillments',
      'read_shipping',
      'read_marketing_events',
      'read_price_rules',
      'read_discounts'
    ];

    // Create redirect URI pointing to our callback function
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const redirectUri = `${supabaseUrl}/functions/v1/shopify-oauth-callback`;

    // Construct Shopify OAuth URL
    const shopifyAuthUrl = new URL(`https://${normalizedDomain}/admin/oauth/authorize`);
    shopifyAuthUrl.searchParams.set('client_id', shopifyClientId);
    shopifyAuthUrl.searchParams.set('scope', scopes.join(','));
    shopifyAuthUrl.searchParams.set('redirect_uri', redirectUri);
    shopifyAuthUrl.searchParams.set('state', state);

    console.log('Final OAuth parameters:');
    console.log('- client_id:', shopifyClientId.substring(0, 15) + '...');
    console.log('- redirect_uri:', redirectUri);
    console.log('- scope:', scopes.join(','));
    console.log('- state:', state);
    console.log('Generated OAuth URL successfully');

    return new Response(JSON.stringify({ 
      oauth_url: shopifyAuthUrl.toString(),
      shop_domain: normalizedDomain,
      redirect_uri: redirectUri,
      scopes: scopes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating Shopify OAuth URL:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate Shopify OAuth URL'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});