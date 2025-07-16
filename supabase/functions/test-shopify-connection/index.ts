import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { storeId } = await req.json();
    
    // Get store configuration
    const { data: storeConfig, error: configError } = await supabaseClient
      .from('store_configurations')
      .select('*')
      .eq('id', storeId)
      .eq('user_id', user.id)
      .single();

    if (configError || !storeConfig) {
      throw new Error('Store configuration not found');
    }

    if (storeConfig.platform !== 'shopify') {
      throw new Error('This test is only for Shopify stores');
    }

    // Test Shopify API connection
    const apiUrl = `https://${storeConfig.domain}/admin/api/2024-01/shop.json`;
    console.log(`Testing connection to: ${apiUrl}`);
    
    const shopifyResponse = await fetch(apiUrl, {
      headers: {
        'X-Shopify-Access-Token': storeConfig.access_token,
        'Content-Type': 'application/json',
      },
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error(`Shopify API error: ${shopifyResponse.status} ${shopifyResponse.statusText}`, errorText);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Shopify API error: ${shopifyResponse.status} ${shopifyResponse.statusText}`,
          details: errorText,
          suggestion: shopifyResponse.status === 401 ? 'Access token may be invalid or expired' : 'Check store domain and access token'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const shopData = await shopifyResponse.json();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Shopify connection successful',
        shopName: shopData.shop?.name,
        domain: shopData.shop?.domain,
        planName: shopData.shop?.plan_name
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error testing Shopify connection:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});