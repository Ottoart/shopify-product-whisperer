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

    const { storeUrl, accessToken, batchSize = 250, startPage = 1 } = await req.json();
    
    if (!storeUrl || !accessToken) {
      throw new Error('Store URL and access token are required');
    }

    // Handle JSON-formatted access tokens and clean thoroughly
    let cleanAccessToken = accessToken.toString().trim();
    
    console.log('Original token:', cleanAccessToken);
    
    // Try to parse as JSON first (for JSON-formatted tokens)
    try {
      const parsed = JSON.parse(cleanAccessToken);
      if (parsed.access_token) {
        cleanAccessToken = parsed.access_token;
      } else if (parsed.accessToken) {
        cleanAccessToken = parsed.accessToken;
      }
    } catch (e) {
      // Not JSON, continue with string cleaning
    }
    
    // Remove any whitespace, newlines, control characters, and extra text
    cleanAccessToken = cleanAccessToken
      .replace(/[\s\n\r\t\u2028\u2029]/g, '') // Remove all whitespace and line separators
      .split(/\s+/)[0] // Take first part if there are spaces
      .replace(/[^\w-]/g, ''); // Keep only alphanumeric, underscore, and hyphen
    
    // Extract shpat token if it exists in the string
    const shpatMatch = cleanAccessToken.match(/shpat_[a-zA-Z0-9]+/);
    if (shpatMatch) {
      cleanAccessToken = shpatMatch[0];
    }
    
    // Ensure token starts with 'shpat_' for Shopify
    if (!cleanAccessToken.startsWith('shpat_')) {
      console.error('Invalid token format. Token should start with shpat_ but got:', cleanAccessToken.substring(0, 20));
      throw new Error('Invalid Shopify access token format. Please check your store configuration.');
    }
    
    console.log('Cleaned token:', cleanAccessToken);
    console.log('Token length:', cleanAccessToken.length);

    // Clean domain - remove timestamp suffixes and normalize
    let shopifyDomain = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (shopifyDomain.includes('_')) {
      shopifyDomain = shopifyDomain.split('_')[0];
    }
    const baseUrl = `https://${shopifyDomain}/admin/api/2023-10`;

    console.log(`Starting batch sync for user ${user.id}, page ${startPage}, batch size ${batchSize}`);

    // Fetch products for this batch
    let url = `${baseUrl}/products.json?limit=${batchSize}&fields=id,title,handle,vendor,product_type,tags,published_at,created_at,updated_at,status,variants,images,body_html,seo_title,seo_description`;
    
    // If not the first page, get page info from last sync
    if (startPage > 1) {
      const { data: lastSync } = await supabase
        .from('shopify_sync_status')
        .select('last_page_info')
        .eq('user_id', user.id)
        .single();
      
      if (lastSync?.last_page_info) {
        url += `&page_info=${lastSync.last_page_info}`;
      }
    }

    console.log('Fetching from URL:', url.substring(0, 100) + '...');

    const response = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': cleanAccessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0'
      },
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const products = data.products || [];

    console.log(`Fetched ${products.length} products for batch ${startPage}`);

    // Transform and upsert products to database
    const productRecords = products.map(product => {
      const variant = product.variants?.[0] || {};
      const image = product.images?.[0] || {};
      
      return {
        user_id: user.id,
        handle: product.handle,
        title: product.title,
        vendor: product.vendor || null,
        type: product.product_type || null,
        tags: product.tags || null,
        published: Boolean(product.published_at),
        body_html: product.body_html || null,
        seo_title: product.seo_title || null,
        seo_description: product.seo_description || null,
        shopify_sync_status: 'synced',
        shopify_synced_at: new Date().toISOString(),
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        
        // Variant data (first variant only for simplicity)
        variant_sku: variant.sku || null,
        variant_price: variant.price ? parseFloat(variant.price) : null,
        variant_compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
        variant_inventory_qty: variant.inventory_quantity || null,
        variant_inventory_tracker: variant.inventory_management || null,
        variant_inventory_policy: variant.inventory_policy || null,
        variant_fulfillment_service: variant.fulfillment_service || null,
        variant_requires_shipping: variant.requires_shipping ?? null,
        variant_taxable: variant.taxable ?? null,
        variant_barcode: variant.barcode || null,
        variant_grams: variant.grams || null,
        
        // Image data
        image_src: image.src || null,
        image_position: image.position || null,
        
        // Options
        option1_name: product.options?.[0]?.name || null,
        option1_value: variant.option1 || null,
      };
    });

    // Upsert products (update if exists, insert if new)
    if (productRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('products')
        .upsert(productRecords, { 
          onConflict: 'user_id,handle',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw new Error(`Failed to save products: ${upsertError.message}`);
      }
    }

    // Extract next page info from Link header
    const linkHeader = response.headers.get('Link');
    let nextPageInfo = null;
    
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]*[?&]page_info=([^&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        nextPageInfo = nextMatch[1];
      }
    }

    // Get total products synced so far
    const { count: totalSynced } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Update sync status
    await supabase
      .from('shopify_sync_status')
      .upsert({
        user_id: user.id,
        last_sync_at: new Date().toISOString(),
        last_page_info: nextPageInfo,
        total_synced: totalSynced || 0, // Use actual count
        sync_status: nextPageInfo ? 'in_progress' : 'completed'
      }, {
        onConflict: 'user_id'
      });

    console.log(`Batch ${startPage} completed. Total synced: ${totalSynced}`);

    return new Response(JSON.stringify({
      success: true,
      batchNumber: startPage,
      productsSynced: products.length,
      totalSynced: totalSynced || 0,
      hasMorePages: Boolean(nextPageInfo),
      nextPageInfo: nextPageInfo,
      message: `Synced batch ${startPage}: ${products.length} products. Total: ${totalSynced || 0}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-shopify-products:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});