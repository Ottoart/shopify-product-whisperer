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
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      return new Response(
        `<html><body><h1>Authorization Failed</h1><p>Error: ${error}</p></body></html>`,
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    if (!code) {
      console.error('No authorization code received');
      return new Response(
        '<html><body><h1>Authorization Failed</h1><p>No authorization code received</p></body></html>',
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    const clientId = Deno.env.get('UPS_CLIENT_ID');
    const clientSecret = Deno.env.get('UPS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('UPS credentials not configured');
      return new Response(
        '<html><body><h1>Configuration Error</h1><p>UPS credentials not properly configured</p></body></html>',
        { 
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Exchange authorization code for access token
    const tokenUrl = 'https://onlinetools.ups.com/security/v1/oauth/token';
    const redirectUri = 'https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/ups-oauth-callback';

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return new Response(
        '<html><body><h1>Token Exchange Failed</h1><p>Failed to exchange authorization code for access token</p></body></html>',
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('UPS token exchange successful');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if any UPS carrier configuration exists that needs tokens
    const { data: existingConfigs, error: fetchError } = await supabase
      .from('carrier_configurations')
      .select('id, user_id, api_credentials')
      .eq('carrier_name', 'UPS');

    if (fetchError) {
      console.error('Failed to fetch UPS configurations:', fetchError);
      return new Response(
        '<html><body><h1>Database Error</h1><p>Failed to fetch UPS configurations</p></body></html>',
        { 
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Find configurations that need tokens (either no access_token or expired)
    const configsNeedingTokens = existingConfigs?.filter(config => 
      !config.api_credentials?.access_token || 
      (config.api_credentials?.token_expires_at && 
       new Date(config.api_credentials.token_expires_at) <= new Date())
    ) || [];

    if (configsNeedingTokens.length === 0) {
      console.log('No UPS configurations found that need tokens');
      return new Response(
        '<html><body><h1>No Configuration Found</h1><p>No UPS configuration found that needs authorization. Please set up UPS credentials first.</p></body></html>',
        { 
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    // Update all configurations that need tokens
    const updatePromises = configsNeedingTokens.map(config => {
      const updatedCredentials = {
        ...config.api_credentials,
        client_id: clientId,
        client_secret: clientSecret,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: tokenData.expires_in ? 
          new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString() : null
      };

      return supabase
        .from('carrier_configurations')
        .update({
          api_credentials: updatedCredentials,
          updated_at: new Date().toISOString()
        })
        .eq('id', config.id);
    });

    const results = await Promise.all(updatePromises);
    const hasErrors = results.some(result => result.error);

    if (hasErrors) {
      console.error('Failed to update some UPS configurations:', results.filter(r => r.error));
      return new Response(
        '<html><body><h1>Partial Update Error</h1><p>Some UPS configurations could not be updated</p></body></html>',
        { 
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    console.log('UPS carrier configuration updated successfully');

    // Redirect back to the original location
    const redirectUrl = state ? decodeURIComponent(state) : '/shipping';
    
    return new Response(
      `<html><body><script>
        window.location.href = '${redirectUrl}';
      </script><h1>Success!</h1><p>UPS integration authorized successfully. Redirecting...</p></body></html>`,
      { 
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );

  } catch (error) {
    console.error('Callback error:', error);
    return new Response(
      '<html><body><h1>Server Error</h1><p>An unexpected error occurred during authorization</p></body></html>',
      { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
});