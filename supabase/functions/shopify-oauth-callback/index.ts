import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const shop = url.searchParams.get('shop')
    const state = url.searchParams.get('state')
    const error = url.searchParams.get('error')

    if (error) {
      const errorMessage = `OAuth error: ${error}`
      return new Response(
        `<html><body><script>
          window.opener.postMessage({ 
            type: 'SHOPIFY_OAUTH_ERROR', 
            error: '${errorMessage}' 
          }, '*'); 
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    if (!code || !shop || !state) {
      const errorMessage = 'Missing required parameters'
      return new Response(
        `<html><body><script>
          window.opener.postMessage({ 
            type: 'SHOPIFY_OAUTH_ERROR', 
            error: '${errorMessage}' 
          }, '*'); 
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Exchange code for access token
    const clientId = Deno.env.get('SHOPIFY_CLIENT_ID')
    const clientSecret = Deno.env.get('SHOPIFY_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      const errorMessage = 'Shopify credentials not configured'
      return new Response(
        `<html><body><script>
          window.opener.postMessage({ 
            type: 'SHOPIFY_OAUTH_ERROR', 
            error: '${errorMessage}' 
          }, '*'); 
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    })

    if (!tokenResponse.ok) {
      const errorMessage = 'Failed to exchange code for token'
      return new Response(
        `<html><body><script>
          window.opener.postMessage({ 
            type: 'SHOPIFY_OAUTH_ERROR', 
            error: '${errorMessage}' 
          }, '*'); 
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      const errorMessage = 'No access token received'
      return new Response(
        `<html><body><script>
          window.opener.postMessage({ 
            type: 'SHOPIFY_OAUTH_ERROR', 
            error: '${errorMessage}' 
          }, '*'); 
          window.close();
        </script></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      )
    }

    // Get shop info to verify connection
    const shopInfoResponse = await fetch(`https://${shop}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    })

    let shopInfo = null
    if (shopInfoResponse.ok) {
      const shopData = await shopInfoResponse.json()
      shopInfo = shopData.shop
    }

    console.log('Shopify OAuth successful for shop:', shop)

    return new Response(
      `<html><body><script>
        window.opener.postMessage({ 
          type: 'SHOPIFY_OAUTH_SUCCESS',
          data: {
            access_token: '${accessToken}',
            shop_domain: '${shop}',
            state: '${state}',
            shop_info: ${JSON.stringify(shopInfo)}
          }
        }, '*'); 
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )

  } catch (error) {
    console.error('Error in shopify-oauth-callback:', error)
    const errorMessage = 'Internal server error during OAuth callback'
    return new Response(
      `<html><body><script>
        window.opener.postMessage({ 
          type: 'SHOPIFY_OAUTH_ERROR', 
          error: '${errorMessage}' 
        }, '*'); 
        window.close();
      </script></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    )
  }
})