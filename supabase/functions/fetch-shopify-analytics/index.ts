import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { storeUrl, accessToken } = await req.json();
    
    if (!storeUrl || !accessToken) {
      throw new Error('Store URL and access token are required');
    }

    const shopifyDomain = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const baseUrl = `https://${shopifyDomain}/admin/api/2023-10`;

    console.log('Fetching comprehensive Shopify data for:', shopifyDomain);

    // Minimal product fetch to avoid timeout
    console.log('Fetching products with minimal data');
    
    const url = `${baseUrl}/products.json?limit=250&fields=id,title,handle,vendor,product_type,published_at,created_at,updated_at,status,variants`;
    
    const productsResponse = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    if (!productsResponse.ok) {
      throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
    }

    const productsData = await productsResponse.json();
    const products = productsData.products || [];
    
    console.log(`Fetched ${products.length} products`);

    // Ultra-minimal analytics
    const analytics = {
      products: products,
      totalProducts: products.length,
      unpublished: products.filter(p => !p.published_at).length,
      lastUpdated: new Date().toISOString(),
      
      // Empty arrays for dashboard compatibility
      orders: [],
      lowStock: [],
      outOfStock: [],
      wellStocked: [],
      duplicates: [],
      missingImages: [],
      missingDescriptions: [],
      missingMetaTitles: [],
      missingMetaDescriptions: [],
      shortDescriptions: [],
      longDescriptions: [],
      topSellers: [],
      zeroSales: [],
      totalRevenue: 0,
      totalOrders: 0,
      tagAnalysis: { popularTags: [], untagged: [] },
      categoryAnalysis: { productTypes: [], uncategorized: [] },
      vendorAnalysis: { vendors: [], noVendor: [] }
    };

    // Store analytics in database with user_id
    const { error: insertError } = await supabase
      .from('shopify_analytics')
      .upsert({
        user_id: user.id,
        analytics_data: analytics,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (insertError) {
      console.error('Error storing analytics:', insertError);
      // Continue anyway, return the data
    }

    console.log('Successfully processed Shopify analytics data');

    return new Response(JSON.stringify({ 
      success: true, 
      analytics,
      message: `Processed ${products.length} products (simplified version)`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-shopify-analytics:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});