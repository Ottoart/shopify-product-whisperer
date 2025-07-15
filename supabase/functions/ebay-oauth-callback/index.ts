import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

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
        redirect_uri: `https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/ebay-oauth-callback`
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('eBay token exchange failed:', errorText);
      throw new Error('Failed to exchange authorization code for token');
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

    const marketplaceData = {
      user_id: userId,
      platform: 'ebay',
      external_user_id: ebayUserId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: tokenData.expires_in ? 
        new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      store_name: storeName,
      store_url: null,
      is_active: true,
      metadata: {
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        ebay_user_id: ebayUserId,
        ebay_username: ebayUsername,
        connected_at: new Date().toISOString()
      }
    };

    console.log('Inserting marketplace configuration:', {
      ...marketplaceData,
      access_token: '[REDACTED]',
      refresh_token: '[REDACTED]'
    });

    const { data: storeConfig, error: dbError } = await supabase
      .from('marketplace_configurations')
      .insert(marketplaceData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save marketplace configuration: ${dbError.message}`);
    }

    // Success page with script to communicate with parent window
    const successPage = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>eBay Connected Successfully</title>
        <style>
          body { font-family: system-ui; padding: 2rem; text-align: center; }
          .success { color: #059669; margin: 1rem 0; }
          .checkmark { font-size: 4rem; color: #059669; }
        </style>
      </head>
      <body>
        <div class="checkmark">✅</div>
        <h1>eBay Store Connected!</h1>
        <div class="success">
          Your eBay store has been successfully connected to your account.
        </div>
        <p>This window will close automatically...</p>
        <script>
          // Store success data in session storage for parent window to read
          if (window.opener) {
            window.opener.sessionStorage.setItem('ebay_auth_success', JSON.stringify({
              store: ${JSON.stringify(storeConfig)},
              marketplace: { platform: 'ebay', name: 'eBay' },
              credentials: { ebay_user_id: '${ebayUserId}' }
            }));
            window.close();
          } else {
            setTimeout(() => {
              window.location.href = 'https://www.ebay.com/sh/lst/active';
            }, 3000);
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