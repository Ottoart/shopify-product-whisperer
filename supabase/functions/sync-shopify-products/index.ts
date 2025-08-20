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

    const { storeUrl, accessToken, batchSize = 250, startPage = 1, syncActiveOnly = true } = await req.json();
    
    // Load user sync settings from database
    const { data: syncSettings } = await supabase
      .from('sync_settings')
      .select('sync_active_only')
      .eq('user_id', user.id)
      .eq('platform', 'shopify')
      .maybeSingle();
    
    const shouldSyncActiveOnly = syncSettings?.sync_active_only ?? syncActiveOnly;
    console.log('Sync settings - Active only:', shouldSyncActiveOnly);
    
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

    // Fetch store configuration
    const { data: storeConfig, error: storeError } = await supabase
      .from('store_configurations')
      .select('id, store_name, domain')
      .eq('user_id', user.id)
      .eq('domain', shopifyDomain)
      .eq('platform', 'shopify')
      .eq('is_active', true)
      .maybeSingle();

    if (storeError || !storeConfig) {
      console.error('Store configuration error:', storeError);
      throw new Error(`Store configuration not found for domain: ${shopifyDomain}`);
    }

    console.log(`Starting batch sync for user ${user.id}, page ${startPage}, batch size ${batchSize}`);

    // Handle edge cases and state management
    try {
      // Check for stuck sync states (in_progress for more than 30 minutes)
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: stuckSyncs } = await supabase
        .from('marketplace_sync_status')
        .select('id, sync_status, last_sync_at')
        .eq('user_id', user.id)
        .eq('marketplace', 'shopify')
        .eq('sync_status', 'in_progress')
        .lt('last_sync_at', thirtyMinutesAgo);

      if (stuckSyncs && stuckSyncs.length > 0) {
        console.log(`Found ${stuckSyncs.length} stuck sync(s), resetting to 'failed' status`);
        await supabase
          .from('marketplace_sync_status')
          .update({
            sync_status: 'failed',
            error_message: 'Sync was stuck in progress for more than 30 minutes and was automatically reset'
          })
          .eq('user_id', user.id)
          .eq('marketplace', 'shopify')
          .eq('sync_status', 'in_progress');
      }

      // Concurrent sync prevention (only for first page)
      if (startPage === 1) {
        const { data: currentSync } = await supabase
          .from('marketplace_sync_status')
          .select('sync_status, last_sync_at')
          .eq('user_id', user.id)
          .eq('marketplace', 'shopify')
          .maybeSingle();

        if (currentSync?.sync_status === 'in_progress') {
          const lastSyncTime = new Date(currentSync.last_sync_at || 0);
          const timeDiff = Date.now() - lastSyncTime.getTime();
          
          // If sync started less than 5 minutes ago, prevent concurrent sync
          if (timeDiff < 5 * 60 * 1000) {
            throw new Error('A sync is already in progress for this store. Please wait for it to complete.');
          }
        }

        // Reset sync status for new sync
        console.log('Initializing new sync session');
        await supabase
          .from('marketplace_sync_status')
          .upsert({
            user_id: user.id,
            marketplace: 'shopify',
            sync_status: 'syncing',
            last_sync_at: new Date().toISOString(),
            products_synced: 0,
            error_message: null,
            sync_settings: {
              active_only: shouldSyncActiveOnly,
              sync_timestamp: new Date().toISOString(),
              batch_size: batchSize
            }
          }, {
            onConflict: 'user_id,marketplace'
          });
      }

      // Resume scenario handling - check if this is a continuation
      const { data: resumeSync } = await supabase
        .from('marketplace_sync_status')
        .select('sync_status, products_synced, total_products_found')
        .eq('user_id', user.id)
        .eq('marketplace', 'shopify')
        .maybeSingle();

      if (resumeSync?.sync_status === 'in_progress' && startPage > 1) {
        console.log(`Resuming sync at page ${startPage}, previously synced: ${resumeSync.products_synced} products`);
      }

    } catch (stateError) {
      console.error('Error in state management:', stateError);
      if (startPage === 1) {
        // Only throw for first page state errors to prevent sync from starting
        throw stateError;
      }
      // For continuation pages, log but continue
      console.log('Continuing with sync despite state management error');
    }

    // Get total product count from Shopify on first batch only
    let totalProductsInStore = null;
    if (startPage === 1) {
      try {
        console.log('Fetching total product count from Shopify...');
        let countUrl = `${baseUrl}/products/count.json`;
        
        // Apply the same filters to count API as products API
        if (shouldSyncActiveOnly) {
          countUrl += `?status=active`;
        }
        
        const countResponse = await fetch(countUrl, {
          headers: {
            'X-Shopify-Access-Token': cleanAccessToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Supabase-Edge-Function/1.0'
          },
        });

        if (countResponse.ok) {
          const countData = await countResponse.json();
          totalProductsInStore = countData.count || 0;
          console.log(`Total products in Shopify store: ${totalProductsInStore}`);
        } else {
          console.warn(`Failed to fetch product count: ${countResponse.status} ${countResponse.statusText}`);
          // Continue without total count - will fall back to batch-based counting
        }
      } catch (countError) {
        console.warn('Error fetching product count:', countError);
        // Continue without total count - will fall back to batch-based counting
      }
    }

    // Fetch products for this batch with cursor-based pagination
    let url = `${baseUrl}/products.json?limit=${batchSize}&fields=id,title,handle,vendor,product_type,tags,published_at,created_at,updated_at,status,variants,images,body_html,seo_title,seo_description`;
    
    // Add status filter for active-only sync
    if (shouldSyncActiveOnly) {
      url += `&status=active`;
    }
    
    // Use cursor-based pagination instead of page numbers
    if (startPage > 1) {
      const { data: lastSync } = await supabase
        .from('shopify_sync_status')
        .select('last_page_info')
        .eq('user_id', user.id)
        .single();
      
      if (lastSync?.last_page_info) {
        url += `&page_info=${lastSync.last_page_info}`;
      } else {
        // If no cursor available, use since_id based on last sync
        const { data: products, error } = await supabase
          .from('products')
          .select('shopify_product_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!error && products && products.length > 0 && products[0].shopify_product_id) {
          url += `&since_id=${products[0].shopify_product_id}`;
        }
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
    const allProducts = data.products || [];
    
    // Filter products based on user preference (additional filtering if needed)
    let products = allProducts;
    let skippedCount = 0;
    
    if (shouldSyncActiveOnly) {
      // Filter for active products with inventory if not already filtered by API
      const activeProducts = allProducts.filter(product => {
        const hasInventory = product.variants?.some(variant => 
          variant.inventory_quantity > 0 || variant.inventory_policy === 'continue'
        );
        return product.status === 'active' && (hasInventory || product.status === 'active');
      });
      
      products = activeProducts;
      skippedCount = allProducts.length - activeProducts.length;
      
      if (skippedCount > 0) {
        console.log(`Filtered ${skippedCount} inactive products, keeping ${products.length} active products`);
      }
    }

    console.log(`Processing ${products.length} products for batch ${startPage}`);

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
        shopify_product_id: product.id?.toString() || null,
        shopify_sync_status: 'synced',
        shopify_synced_at: new Date().toISOString(),
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        
        // Store identification
        store_name: storeConfig.store_name,
        store_id: storeConfig.id,
        
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

    // Update sync status with detailed information
    await supabase
      .from('shopify_sync_status')
      .upsert({
        user_id: user.id,
        last_sync_at: new Date().toISOString(),
        last_page_info: nextPageInfo,
        total_synced: totalSynced || 0, // Use actual count
        sync_status: nextPageInfo ? 'in_progress' : 'pending'
      }, {
        onConflict: 'user_id'
      });

    // Get current sync status to accumulate products_synced across batches
    const { data: currentSyncStatus } = await supabase
      .from('marketplace_sync_status')
      .select('products_synced, total_products_found')
      .eq('user_id', user.id)
      .eq('marketplace', 'shopify')
      .maybeSingle();

    // Calculate accumulated products_synced with safety checks
    const currentProductsSynced = currentSyncStatus?.products_synced || 0;
    const batchProductCount = products.length;
    
    // Use the actual database count for accuracy
    const actualDbCount = totalSynced || 0;
    
    // Choose the most accurate count (prefer database count over accumulation)
    const totalProductsSynced = Math.max(actualDbCount, currentProductsSynced + batchProductCount);

    console.log(`Batch ${startPage}: Current synced: ${currentProductsSynced}, This batch: ${batchProductCount}, DB total: ${actualDbCount}, Final count: ${totalProductsSynced}`);

    // Prepare marketplace sync status update
    const marketplaceUpdateData: any = {
      user_id: user.id,
      marketplace: 'shopify',
      sync_status: nextPageInfo ? 'in_progress' : 'completed',
      last_sync_at: new Date().toISOString(),
      products_synced: totalProductsSynced, // Accumulate across batches
      active_products_synced: shouldSyncActiveOnly ? totalProductsSynced : undefined,
      inactive_products_skipped: shouldSyncActiveOnly ? skippedCount : undefined,
      sync_settings: {
        active_only: shouldSyncActiveOnly,
        sync_timestamp: new Date().toISOString(),
        batch_number: startPage
      },
      error_message: null
    };

    // Set total_products_found properly
    if (startPage === 1 && totalProductsInStore !== null) {
      // First batch: set the actual count from Shopify API
      marketplaceUpdateData.total_products_found = totalProductsInStore;
      console.log(`Setting total_products_found to ${totalProductsInStore} for first batch`);
    } else if (currentSyncStatus?.total_products_found) {
      // Subsequent batches: preserve the existing total_products_found
      marketplaceUpdateData.total_products_found = currentSyncStatus.total_products_found;
    }

    // Update marketplace sync status with correct status values
    const finalStatus = nextPageInfo ? 'syncing' : 'success';
    marketplaceUpdateData.sync_status = finalStatus;
    
    await supabase
      .from('marketplace_sync_status')
      .upsert(marketplaceUpdateData, {
        onConflict: 'user_id,marketplace'
      });

    // Also update shopify_sync_status to completed when sync is done
    if (!nextPageInfo) {
      await supabase
        .from('shopify_sync_status')
        .upsert({
          user_id: user.id,
          last_sync_at: new Date().toISOString(),
          last_page_info: null,
          total_synced: totalSynced || 0,
          sync_status: 'pending'
        }, {
          onConflict: 'user_id'
        });
    }

    console.log(`Batch ${startPage} completed. Total synced: ${totalSynced}`);

    return new Response(JSON.stringify({
      success: true,
      batchNumber: startPage,
      productsSynced: products.length,
      totalSynced: totalSynced || 0,
      totalProductsInShopify: totalProductsInStore || currentSyncStatus?.total_products_found || 0,
      hasMorePages: Boolean(nextPageInfo),
      nextPageInfo: nextPageInfo,
      message: `Synced batch ${startPage}: ${products.length} products. Total: ${totalSynced || 0}`,
      debug: {
        originalAllProducts: allProducts.length,
        filteredProducts: products.length,
        skippedCount,
        shouldSyncActiveOnly,
        nextPageInfo,
        totalProductsFound: currentSyncStatus?.total_products_found || totalProductsInStore
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-shopify-products:', error);
    
    // Enhanced error handling - update sync status on failure
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Update marketplace sync status to failed
          await supabase
            .from('marketplace_sync_status')
            .upsert({
              user_id: user.id,
              marketplace: 'shopify',
              sync_status: 'failed',
              last_sync_at: new Date().toISOString(),
              error_message: error.message || 'Unknown error occurred during sync',
              sync_settings: {
                error_occurred_at: new Date().toISOString(),
                error_type: error.name || 'SyncError'
              }
            }, {
              onConflict: 'user_id,marketplace'
            });
          
          console.log('Updated sync status to failed due to error');
        }
      }
    } catch (statusUpdateError) {
      console.error('Failed to update sync status on error:', statusUpdateError);
    }
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});