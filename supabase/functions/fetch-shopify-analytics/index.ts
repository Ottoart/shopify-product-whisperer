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

    // Fetch ALL products but with minimal data to determine capacity
    console.log('Fetching ALL products with minimal essential data');
    
    let allProducts = [];
    let pageCount = 0;
    
    for (let page = 1; page <= 50; page++) { // Max 50 pages = 12,500 products
      console.log(`Fetching page ${page}`);
      
      // Only essential fields to minimize data transfer
      const url = `${baseUrl}/products.json?limit=250&page=${page}&fields=id,title,handle,product_type,vendor,published_at,status,variants`;
      
      const productsResponse = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!productsResponse.ok) {
        console.error(`Failed to fetch products page ${page}: ${productsResponse.status}`);
        if (productsResponse.status === 404) break; // No more pages
        
        // If we have some products already, continue with what we have
        if (allProducts.length > 0) {
          console.log(`Got error on page ${page}, stopping with ${allProducts.length} products`);
          break;
        }
        throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
      }

      const productsData = await productsResponse.json();
      const newProducts = productsData.products || [];
      
      if (newProducts.length === 0) {
        console.log('No more products found, ending pagination');
        break;
      }
      
      allProducts = allProducts.concat(newProducts);
      pageCount++;
      console.log(`Page ${page}: got ${newProducts.length} products, total: ${allProducts.length}`);
      
      // If we got less than 250, this is the last page
      if (newProducts.length < 250) {
        console.log('Last page reached');
        break;
      }
    }

    console.log(`Successfully fetched ${allProducts.length} total products across ${pageCount} pages`);
    const products = allProducts;

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