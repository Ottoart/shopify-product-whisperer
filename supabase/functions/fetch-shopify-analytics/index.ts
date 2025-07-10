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

    // Fetch all products with pagination - using cursor-based pagination
    let allProducts = [];
    let pageInfo = '';
    let pageCount = 0;
    
    do {
      const url = pageInfo 
        ? `${baseUrl}/products.json?limit=250&since_id=${pageInfo}&fields=id,title,handle,vendor,product_type,tags,published_at,created_at,updated_at,status,variants,images,options,body_html,seo_title,seo_description`
        : `${baseUrl}/products.json?limit=250&fields=id,title,handle,vendor,product_type,tags,published_at,created_at,updated_at,status,variants,images,options,body_html,seo_title,seo_description`;
      
      console.log(`Fetching page ${pageCount + 1} with URL: ${url.substring(0, 100)}...`);
      
      const productsResponse = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });

      if (!productsResponse.ok) {
        console.error(`Failed to fetch products page ${pageCount + 1}: ${productsResponse.status} ${productsResponse.statusText}`);
        throw new Error(`Failed to fetch products: ${productsResponse.statusText}`);
      }

      const productsData = await productsResponse.json();
      const newProducts = productsData.products || [];
      
      if (newProducts.length === 0) {
        console.log('No more products found, ending pagination');
        break;
      }
      
      allProducts = allProducts.concat(newProducts);
      
      // Use the last product's ID for the next page
      if (newProducts.length === 250) {
        pageInfo = newProducts[newProducts.length - 1].id;
      } else {
        pageInfo = null; // Last page
      }
      
      pageCount++;
      console.log(`Fetched page ${pageCount}, got ${newProducts.length} products, total: ${allProducts.length}`);
      
      // Safety checks
      if (pageCount >= 20) {
        console.log('Reached maximum page limit (20), stopping pagination');
        break;
      }
      
      if (allProducts.length >= 5000) {
        console.log('Reached maximum product limit (5000), stopping pagination');
        break;
      }
      
    } while (pageInfo && pageCount < 20);

    console.log(`Successfully fetched ${allProducts.length} total products across ${pageCount} pages`);

    // Fetch inventory levels
    const inventoryResponse = await fetch(`${baseUrl}/inventory_levels.json?limit=250`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    let inventoryData = { inventory_levels: [] };
    if (inventoryResponse.ok) {
      inventoryData = await inventoryResponse.json();
      console.log(`Fetched ${inventoryData.inventory_levels?.length || 0} inventory levels`);
    }

    // Fetch orders for sales analytics (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const dateFilter = ninetyDaysAgo.toISOString();

    const ordersResponse = await fetch(`${baseUrl}/orders.json?limit=250&status=any&created_at_min=${dateFilter}&fields=id,line_items,total_price,created_at,financial_status,fulfillment_status`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    let ordersData = { orders: [] };
    if (ordersResponse.ok) {
      ordersData = await ordersResponse.json();
      console.log(`Fetched ${ordersData.orders?.length || 0} orders`);
    }

    // Fetch product analytics data
    const analyticsResponse = await fetch(`${baseUrl}/analytics/reports/products.json?limit=250`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    let analyticsData = { reports: [] };
    if (analyticsResponse.ok) {
      try {
        analyticsData = await analyticsResponse.json();
        console.log(`Fetched analytics data`);
      } catch (e) {
        console.log('Analytics data not available, will calculate from orders');
      }
    }

    // Process and analyze the data
    const products = allProducts || [];
    const orders = ordersData.orders || [];
    const inventoryLevels = inventoryData.inventory_levels || [];

    // Create inventory lookup
    const inventoryLookup = new Map();
    inventoryLevels.forEach(level => {
      inventoryLookup.set(level.inventory_item_id, level.available);
    });

    // Calculate sales data from orders
    const productSales = new Map();
    const productRevenue = new Map();
    
    orders.forEach(order => {
      order.line_items?.forEach(item => {
        const productId = item.product_id;
        const variantId = item.variant_id;
        const quantity = item.quantity || 0;
        const price = parseFloat(item.price || '0');
        
        // Track by product
        if (!productSales.has(productId)) {
          productSales.set(productId, 0);
          productRevenue.set(productId, 0);
        }
        
        productSales.set(productId, productSales.get(productId) + quantity);
        productRevenue.set(productId, productRevenue.get(productId) + (price * quantity));
      });
    });

    // Enhanced product analysis
    const analytics = {
      // Product Cleanup
      duplicates: [],
      unpublished: products.filter(p => !p.published_at),
      missingImages: products.filter(p => !p.images || p.images.length === 0),
      missingDescriptions: products.filter(p => !p.body_html || p.body_html.trim() === ''),
      
      // Content Optimization
      missingMetaTitles: products.filter(p => !p.seo_title),
      missingMetaDescriptions: products.filter(p => !p.seo_description),
      shortDescriptions: products.filter(p => p.body_html && p.body_html.length < 100),
      longDescriptions: products.filter(p => p.body_html && p.body_html.length > 500),
      
      // Sales Performance
      topSellers: [],
      zeroSales: [],
      totalRevenue: 0,
      totalOrders: orders.length,
      
      // Inventory
      lowStock: [],
      outOfStock: [],
      wellStocked: [],
      
      // Tags and Categories
      tagAnalysis: {},
      categoryAnalysis: {},
      vendorAnalysis: {},
      
      // Raw data for charts
      products: products,
      orders: orders,
      lastUpdated: new Date().toISOString()
    };

    // Find duplicates
    const titleGroups = new Map();
    const skuGroups = new Map();
    const imageGroups = new Map();

    products.forEach(product => {
      // Group by title
      const title = product.title?.toLowerCase().trim();
      if (title) {
        if (!titleGroups.has(title)) titleGroups.set(title, []);
        titleGroups.get(title).push(product);
      }

      // Group by SKU
      product.variants?.forEach(variant => {
        if (variant.sku) {
          if (!skuGroups.has(variant.sku)) skuGroups.set(variant.sku, []);
          skuGroups.get(variant.sku).push({...product, variant});
        }
      });

      // Group by image
      product.images?.forEach(image => {
        if (image.src) {
          if (!imageGroups.has(image.src)) imageGroups.set(image.src, []);
          imageGroups.get(image.src).push(product);
        }
      });
    });

    // Process duplicates
    titleGroups.forEach((group, title) => {
      if (group.length > 1) {
        analytics.duplicates.push({
          type: 'Same Title',
          products: group,
          similarity: 100,
          identifier: title
        });
      }
    });

    skuGroups.forEach((group, sku) => {
      if (group.length > 1) {
        analytics.duplicates.push({
          type: 'Same SKU',
          products: group,
          similarity: 95,
          identifier: sku
        });
      }
    });

    imageGroups.forEach((group, image) => {
      if (group.length > 1) {
        analytics.duplicates.push({
          type: 'Same Image',
          products: group,
          similarity: 90,
          identifier: image
        });
      }
    });

    // Calculate sales performance
    const productSalesArray = Array.from(productSales.entries()).map(([productId, sales]) => {
      const product = products.find(p => p.id === productId);
      const revenue = productRevenue.get(productId) || 0;
      return {
        productId,
        product,
        sales,
        revenue
      };
    });

    analytics.topSellers = productSalesArray
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    analytics.zeroSales = products.filter(product => 
      !productSales.has(product.id) || productSales.get(product.id) === 0
    );

    analytics.totalRevenue = Array.from(productRevenue.values())
      .reduce((sum, revenue) => sum + revenue, 0);

    // Inventory analysis
    products.forEach(product => {
      product.variants?.forEach(variant => {
        const inventoryQuantity = variant.inventory_quantity || 0;
        const productWithVariant = { ...product, variant, inventoryQuantity };

        if (inventoryQuantity === 0) {
          analytics.outOfStock.push(productWithVariant);
        } else if (inventoryQuantity < 10) {
          analytics.lowStock.push(productWithVariant);
        } else {
          analytics.wellStocked.push(productWithVariant);
        }
      });
    });

    // Tag and category analysis
    const tagMap = new Map();
    const categoryMap = new Map();
    const vendorMap = new Map();

    products.forEach(product => {
      // Analyze tags
      if (product.tags) {
        const tags = product.tags.split(',').map(t => t.trim().toLowerCase());
        tags.forEach(tag => {
          if (!tagMap.has(tag)) tagMap.set(tag, []);
          tagMap.get(tag).push(product);
        });
      }

      // Analyze product types
      if (product.product_type) {
        const type = product.product_type.toLowerCase();
        if (!categoryMap.has(type)) categoryMap.set(type, []);
        categoryMap.get(type).push(product);
      }

      // Analyze vendors
      if (product.vendor) {
        const vendor = product.vendor.toLowerCase();
        if (!vendorMap.has(vendor)) vendorMap.set(vendor, []);
        vendorMap.get(vendor).push(product);
      }
    });

    analytics.tagAnalysis = {
      popularTags: Array.from(tagMap.entries())
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 20)
        .map(([tag, products]) => ({ tag, count: products.length })),
      untagged: products.filter(p => !p.tags || p.tags.trim() === '')
    };

    analytics.categoryAnalysis = {
      productTypes: Array.from(categoryMap.entries())
        .sort(([,a], [,b]) => b.length - a.length)
        .map(([type, products]) => ({ type, count: products.length })),
      uncategorized: products.filter(p => !p.product_type)
    };

    analytics.vendorAnalysis = {
      vendors: Array.from(vendorMap.entries())
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 15)
        .map(([vendor, products]) => ({ vendor, count: products.length })),
      noVendor: products.filter(p => !p.vendor)
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