import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Shopify OAuth Callback Function Invoked ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Full request URL:', req.url);
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== Processing Shopify OAuth Callback ===');
    
    const url = new URL(req.url);
    console.log('Parsed URL pathname:', url.pathname);
    console.log('All URL search params:', Array.from(url.searchParams.entries()));
    
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const shop = url.searchParams.get('shop');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    console.log('OAuth parameters:');
    console.log('- code exists:', Boolean(code), 'length:', code?.length || 0);
    console.log('- state exists:', Boolean(state), 'value:', state);
    console.log('- shop:', shop);
    console.log('- error:', error);
    console.log('- errorDescription:', errorDescription);

    // Handle OAuth errors
    if (error) {
      console.error('Shopify OAuth error:', { error, errorDescription });
      
      const errorPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shopify Connection Failed</title>
          <style>
            body { font-family: system-ui; padding: 2rem; text-align: center; }
            .error { color: #dc2626; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <h1>Connection Failed</h1>
          <div class="error">
            ${errorDescription || 'Failed to connect to Shopify. Please try again.'}
          </div>
          <p>This window will close automatically...</p>
          <script>
            if (window.opener) {
              window.opener.sessionStorage.setItem('shopify_auth_error', JSON.stringify({
                error: '${error}',
                message: '${errorDescription || 'Failed to connect to Shopify'}'
              }));
              window.close();
            } else {
              setTimeout(() => window.close(), 3000);
            }
          </script>
        </body>
        </html>
      `;
      
      return new Response(errorPage, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (!code || !state || !shop) {
      throw new Error('Missing authorization code, state parameter, or shop domain');
    }

    // Get Shopify app credentials
    const shopifyClientId = Deno.env.get('SHOPIFY_CLIENT_ID');
    const shopifyClientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!shopifyClientId || !shopifyClientSecret) {
      throw new Error('Shopify app credentials not configured');
    }

    const redirectUri = `${supabaseUrl}/functions/v1/shopify-oauth-callback`;

    console.log('=== Token Exchange Debug ===');
    console.log('Shop domain:', shop);
    console.log('Client ID exists:', Boolean(shopifyClientId));
    console.log('Client secret exists:', Boolean(shopifyClientSecret));
    console.log('Redirect URI:', redirectUri);
    console.log('Authorization code length:', code.length);

    // Exchange authorization code for access token
    const tokenEndpoint = `https://${shop}/admin/oauth/access_token`;
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: shopifyClientId,
        client_secret: shopifyClientSecret,
        code: code
      })
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Shopify token exchange failed:', tokenResponse.status, errorText);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
        console.error('Parsed error details:', JSON.stringify(errorDetails, null, 2));
      } catch (e) {
        console.error('Could not parse error response as JSON');
        console.error('Raw error text:', errorText);
      }
      
      const detailedErrorPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shopify Connection Debug</title>
          <style>
            body { font-family: system-ui; padding: 2rem; }
            .error { color: #dc2626; margin: 1rem 0; }
            .debug { background: #f3f4f6; padding: 1rem; margin: 1rem 0; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>Shopify Connection Debug Info</h1>
          <div class="error">Token exchange failed with status: ${tokenResponse.status}</div>
          <div class="debug">
            <strong>Error Details:</strong><br>
            ${errorDetails ? JSON.stringify(errorDetails, null, 2) : errorText}
          </div>
          <div class="debug">
            <strong>Debug Info:</strong><br>
            Shop: ${shop}<br>
            Code length: ${code.length}<br>
            State: ${state}<br>
          </div>
          <p><button onclick="window.close()">Close Window</button></p>
        </body>
        </html>
      `;
      
      return new Response(detailedErrorPage, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
        status: 400
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('Token data received:', { ...tokenData, access_token: tokenData.access_token ? '[REDACTED]' : null });

    // Get shop info from Shopify using the access token
    const shopInfoResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': tokenData.access_token,
        'Content-Type': 'application/json'
      }
    });

    let shopInfo = { name: shop, domain: shop, id: shop };
    if (shopInfoResponse.ok) {
      const shopData = await shopInfoResponse.json();
      shopInfo = shopData.shop;
    } else {
      console.log('Failed to get shop info, using fallback');
    }

    // Extract user ID from state parameter
    const [userId] = state.split('_');
    
    // Store the credentials in Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create marketplace configuration
    const marketplaceData = {
      user_id: userId,
      platform: 'shopify',
      external_user_id: shopInfo.id.toString(),
      access_token: tokenData.access_token,
      store_name: shopInfo.name || shop,
      store_url: `https://${shop}`,
      is_active: true,
      metadata: {
        shop_domain: shop,
        shop_id: shopInfo.id,
        shop_name: shopInfo.name,
        connected_at: new Date().toISOString(),
        scope: tokenData.scope
      }
    };

    const { data: marketplaceConfig, error: marketplaceError } = await supabase
      .from('marketplace_configurations')
      .insert(marketplaceData)
      .select()
      .single();

    if (marketplaceError) {
      console.error('Marketplace configuration error:', marketplaceError);
      throw new Error('Failed to save marketplace configuration');
    }

    // Also create store configuration for compatibility
    const storeData = {
      user_id: userId,
      store_name: shopInfo.name || shop,
      platform: 'shopify',
      domain: shop,
      access_token: tokenData.access_token,
      is_active: true
    };

    const { data: storeConfig, error: dbError } = await supabase
      .from('store_configurations')
      .insert(storeData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save store configuration');
    }

    // Success page with script to close immediately
    const successPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shopify Connected Successfully</title>
      </head>
      <body>
        <script>
          console.log('Shopify OAuth callback script executing...');
          
          try {
            if (window.opener && !window.opener.closed) {
              console.log('Found opener window, storing success data...');
              window.opener.sessionStorage.setItem('shopify_auth_success', JSON.stringify({
                store: ${JSON.stringify(storeConfig)},
                marketplace: ${JSON.stringify(marketplaceConfig)},
                shop_info: ${JSON.stringify(shopInfo)}
              }));
              
              // Signal the parent window
              window.opener.postMessage({ type: 'SHOPIFY_AUTH_SUCCESS' }, '*');
              
              // Close immediately
              window.close();
            } else {
              console.log('No opener window found, closing...');
              window.close();
            }
          } catch (error) {
            console.error('Error in callback script:', error);
            window.close();
          }
        </script>
      </body>
      </html>
    `;

    return new Response(successPage, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Shopify OAuth callback error:', error);
    
    const errorPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shopify Connection Error</title>
        <style>
          body { font-family: system-ui; padding: 2rem; text-align: center; }
          .error { color: #dc2626; margin: 1rem 0; }
        </style>
      </head>
      <body>
        <h1>Connection Error</h1>
        <div class="error">
          There was a problem connecting your Shopify store. Please try again or contact support.
        </div>
        <p>This window will close automatically...</p>
        <script>
          if (window.opener) {
            window.opener.sessionStorage.setItem('shopify_auth_error', JSON.stringify({
              message: 'Connection failed. Please try again.'
            }));
            window.close();
          } else {
            setTimeout(() => window.close(), 3000);
          }
        </script>
      </body>
      </html>
    `;

    return new Response(errorPage, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      status: 500
    });
  }
});