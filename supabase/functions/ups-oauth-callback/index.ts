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

    // Update carrier configuration with the access token
    const { error: updateError } = await supabase
      .from('carrier_configurations')
      .update({
        api_credentials: {
          client_id: clientId,
          client_secret: clientSecret,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          token_expires_at: tokenData.expires_in ? 
            new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString() : null
        },
        updated_at: new Date().toISOString()
      })
      .eq('carrier_name', 'UPS');

    if (updateError) {
      console.error('Failed to update carrier configuration:', updateError);
      return new Response(
        '<html><body><h1>Database Error</h1><p>Failed to save UPS credentials</p></body></html>',
        { 
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    console.log('UPS carrier configuration updated successfully');

    return new Response(
      '<html><body><h1>Success!</h1><p>UPS integration has been authorized successfully. You can now close this window and return to the shipping dashboard.</p></body></html>',
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