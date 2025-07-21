import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Log every single request to this function
  console.log('=== eBay OAuth Callback Function Invoked ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Full request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request (CORS preflight)');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Processing eBay OAuth Callback ===');
    
    const url = new URL(req.url);
    console.log('Parsed URL pathname:', url.pathname);
    console.log('All URL search params:', Array.from(url.searchParams.entries()));
    
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');
    
    console.log('OAuth parameters:');
    console.log('- code exists:', !!code, 'length:', code?.length || 0);
    console.log('- state exists:', !!state, 'value:', state);
    console.log('- error:', error);
    console.log('- errorDescription:', errorDescription);

    // Handle OAuth errors
    if (error) {
      console.error('eBay OAuth error:', { error, errorDescription });
      
      // Create error page with script to communicate with parent window
      const errorPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>eBay Connection Failed</title>
          <style>
            body { font-family: system-ui; padding: 2rem; text-align: center; }
            .error { color: #dc2626; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <h1>Connection Failed</h1>
          <div class="error">
            ${errorDescription || 'Failed to connect to eBay. Please try again.'}
          </div>
          <p>This window will close automatically...</p>
          <script>
            // Store error in session storage for parent window to read
            if (window.opener) {
              window.opener.sessionStorage.setItem('ebay_auth_error', JSON.stringify({
                error: '${error}',
                message: '${errorDescription || 'Failed to connect to eBay'}'
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

    if (!code || !state) {
      throw new Error('Missing authorization code or state parameter');
    }

    // Get eBay credentials from Supabase secrets
    const ebayClientId = Deno.env.get('EBAY_CLIENT_ID');
    const ebayClientSecret = Deno.env.get('EBAY_CLIENT_SECRET');
    const ebayRuName = Deno.env.get('EBAY_RU_NAME'); // Redirect URI name registered with eBay

    if (!ebayClientId || !ebayClientSecret || !ebayRuName) {
      throw new Error('eBay credentials not configured');
    }

    // Determine the correct token endpoint based on environment
    const isProduction = ebayClientId.includes('PRD');
    const tokenEndpoint = isProduction 
      ? 'https://api.ebay.com/identity/v1/oauth2/token'
      : 'https://api.sandbox.ebay.com/identity/v1/oauth2/token';

    console.log('=== Token Exchange Debug ===');
    console.log('Token endpoint:', tokenEndpoint);
    console.log('Client ID starts with:', ebayClientId.substring(0, 15) + '...');
    console.log('Client ID full length:', ebayClientId.length);
    console.log('Client secret exists:', !!ebayClientSecret);
    console.log('Client secret length:', ebayClientSecret?.length || 0);
    console.log('RU Name (redirect_uri):', ebayRuName);
    console.log('Authorization code length:', code.length);
    console.log('Authorization code starts with:', code.substring(0, 20) + '...');
    
    // Debug the Basic Auth header
    const authString = `${ebayClientId}:${ebayClientSecret}`;
    const base64Auth = btoa(authString);
    console.log('Auth string length:', authString.length);
    console.log('Base64 auth starts with:', base64Auth.substring(0, 20) + '...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${ebayClientId}:${ebayClientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: ebayRuName
      })
    });

    console.log('Token response status:', tokenResponse.status);
    console.log('Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('eBay token exchange failed:', tokenResponse.status, errorText);
      
      let errorDetails;
      try {
        errorDetails = JSON.parse(errorText);
        console.error('Parsed error details:', JSON.stringify(errorDetails, null, 2));
      } catch (e) {
        console.error('Could not parse error response as JSON');
        console.error('Raw error text:', errorText);
      }
      
      // Return a more detailed error page
      const detailedErrorPage = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>eBay Connection Debug</title>
          <style>
            body { font-family: system-ui; padding: 2rem; }
            .error { color: #dc2626; margin: 1rem 0; }
            .debug { background: #f3f4f6; padding: 1rem; margin: 1rem 0; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>eBay Connection Debug Info</h1>
          <div class="error">Token exchange failed with status: ${tokenResponse.status}</div>
          <div class="debug">
            <strong>Error Details:</strong><br>
            ${errorDetails ? JSON.stringify(errorDetails, null, 2) : errorText}
          </div>
          <div class="debug">
            <strong>Debug Info:</strong><br>
            Code length: ${code.length}<br>
            State: ${state}<br>
            Token endpoint: ${tokenEndpoint}
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

    // Get user info from eBay using OAuth User API
    const userApiEndpoint = isProduction 
      ? 'https://api.ebay.com/commerce/identity/v1/user/'
      : 'https://api.sandbox.ebay.com/commerce/identity/v1/user/';
      
    const userResponse = await fetch(userApiEndpoint, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
      }
    });

    let ebayUserId = 'unknown';
    let ebayUsername = 'eBay User';
    if (userResponse.ok) {
      const userData = await userResponse.json();
      ebayUserId = userData.userId || userData.username || 'unknown';
      ebayUsername = userData.username || userData.userId || 'eBay User';
    } else {
      console.log('Failed to get user info, using token info');
      // Fallback to basic token info
      ebayUserId = 'token_user';
      ebayUsername = 'eBay Store';
    }

    // Extract user ID from state parameter
    const [userId] = state.split('_');
    
    // Get store name from session or use eBay username
    const sessionStoreName = 'eBay Store'; // This should be retrieved from the state or passed differently
    const storeName = ebayUsername || sessionStoreName;

    // Store the credentials in Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + tokenData.expires_in);

    // Create marketplace configuration for eBay sync compatibility
    const marketplaceData = {
      user_id: userId,
      platform: 'ebay',
      external_user_id: ebayUserId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: tokenExpiresAt.toISOString(),
      store_name: storeName,
      store_url: `https://www.ebay.com/usr/${ebayUsername}`,
      is_active: true,
      metadata: {
        ebay_user_id: ebayUserId,
        ebay_username: ebayUsername,
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
      store_name: storeName,
      platform: 'ebay',
      domain: `ebay-${ebayUserId}`,
      access_token: JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        ebay_user_id: ebayUserId,
        ebay_username: ebayUsername,
        connected_at: new Date().toISOString()
      }),
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
        <title>eBay Connected Successfully</title>
      </head>
      <body>
        <script>
          console.log('eBay OAuth callback script executing...');
          
          try {
            if (window.opener && !window.opener.closed) {
              console.log('Found opener window, storing success data...');
              window.opener.sessionStorage.setItem('ebay_auth_success', JSON.stringify({
                store: ${JSON.stringify(storeConfig)},
                marketplace: ${JSON.stringify(marketplaceConfig)},
                credentials: { ebay_user_id: '${ebayUserId}' }
              }));
              
              // Signal the parent window
              window.opener.postMessage({ type: 'EBAY_AUTH_SUCCESS' }, '*');
              
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
    console.error('eBay OAuth callback error:', error);
    
    const errorPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>eBay Connection Error</title>
        <style>
          body { font-family: system-ui; padding: 2rem; text-align: center; }
          .error { color: #dc2626; margin: 1rem 0; }
        </style>
      </head>
      <body>
        <h1>Connection Error</h1>
        <div class="error">
          There was a problem connecting your eBay store. Please try again or contact support.
        </div>
        <p>This window will close automatically...</p>
        <script>
          if (window.opener) {
            window.opener.sessionStorage.setItem('ebay_auth_error', JSON.stringify({
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
})