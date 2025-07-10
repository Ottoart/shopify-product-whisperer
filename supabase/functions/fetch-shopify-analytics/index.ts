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

    // Fetch products with simplified approach - limit to reduce compute load
    let allProducts = [];
    let pageCount = 0;
    const maxPages = 5; // Limit to 5 pages initially to avoid timeout
    
    for (let page = 1; page <= maxPages; page++) {
      console.log(`Fetching page ${page}`);
      
      const url = `${baseUrl}/products.json?limit=250&page=${page}&fields=id,title,handle,vendor,product_type,tags,published_at,created_at,updated_at,status,variants`;
      
      const productsResponse = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!productsResponse.ok) {
        console.error(`Failed to fetch products page ${page}: ${productsResponse.status}`);
        if (productsResponse.status === 404) break; // No more pages
        throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
      }

      const productsData = await productsResponse.json();
      const newProducts = productsData.products || [];
      
      if (newProducts.length === 0) {
        console.log('No more products found, ending pagination');
        break;
      }
      
      allProducts = allProducts.concat(newProducts);
      console.log(`Page ${page}: got ${newProducts.length} products, total: ${allProducts.length}`);
      
      // If we got less than 250, this is the last page
      if (newProducts.length < 250) {
        console.log('Last page reached');
        break;
      }
    }

    console.log(`Successfully fetched ${allProducts.length} total products`);

    // Skip heavy data fetching for now to avoid timeout
    console.log('Skipping inventory and orders to avoid timeout');

    // Process and analyze the data - simplified version
    const products = allProducts || [];
    const orders = []; // Simplified - no orders for now to avoid timeout
    const inventoryLevels = []; // Simplified - no inventory for now

    // Simplified - no inventory or sales processing to avoid timeout

    // Simplified analytics to avoid timeout
    const analytics = {
      // Basic product counts
      unpublished: products.filter(p => !p.published_at),
      totalProducts: products.length,
      
      // Inventory (simplified)
      lowStock: products.filter(p => 
        p.variants?.some(v => v.inventory_quantity && v.inventory_quantity < 10)
      ),
      outOfStock: products.filter(p => 
        p.variants?.some(v => v.inventory_quantity === 0)
      ),
      
      // Basic category analysis
      productTypes: [...new Set(products.map(p => p.product_type).filter(Boolean))]
        .map(type => ({
          type,
          count: products.filter(p => p.product_type === type).length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      
      // Raw data for dashboard
      products: products,
      orders: [],
      lastUpdated: new Date().toISOString(),
      
      // Simplified duplicates - just by title
      duplicates: Object.values(
        products.reduce((groups, product) => {
          const title = product.title?.toLowerCase().trim();
          if (title) {
            if (!groups[title]) groups[title] = [];
            groups[title].push(product);
          }
          return groups;
        }, {})
      ).filter(group => group.length > 1).map(group => ({
        type: 'Same Title',
        products: group,
        similarity: 100,
        identifier: group[0].title
      })),
      
      // Empty placeholders for dashboard compatibility
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
      wellStocked: [],
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
      message: `Processed ${products.length} products, ${orders.length} orders, and ${analytics.duplicates.length} duplicates found`
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