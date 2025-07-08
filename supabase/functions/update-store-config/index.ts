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

  try {
    const { shopifyDomain, shopifyAccessToken } = await req.json();
    
    console.log('Updating Shopify store configuration...');
    
    // Note: In a real implementation, you would need to use the Supabase Management API
    // to update secrets. For now, we'll return a helpful message to the user.
    
    if (!shopifyDomain || !shopifyAccessToken) {
      return new Response(
        JSON.stringify({ 
          error: 'Both shopifyDomain and shopifyAccessToken are required',
          message: 'Please provide both store URL and access token'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // For now, we'll provide instructions to the user on how to set these manually
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Store configuration received. Please set these values in your Supabase secrets:',
        instructions: {
          SHOPIFY_DOMAIN: shopifyDomain,
          SHOPIFY_ACCESS_TOKEN: shopifyAccessToken,
          note: 'Go to your Supabase project > Settings > Edge Functions to add these secrets'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error updating store config:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Failed to update store configuration'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});