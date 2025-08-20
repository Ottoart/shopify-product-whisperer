import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface GraphQLResponse {
  data?: any;
  errors?: Array<{ message: string }>;
  extensions?: {
    cost?: {
      throttleStatus?: {
        maximumAvailable?: number;
        currentlyAvailable?: number;
        restoreRate?: number;
      };
    };
  };
}

interface BulkOperation {
  id: string;
  status: string;
  errorCode?: string;
  createdAt: string;
  completedAt?: string;
  objectCount?: number;
  fileSize?: number;
  url?: string;
  partialDataUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting GraphQL bulk sync');
    
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    const requestBody = await req.json();
    const { storeUrl, accessToken, operation = 'sync' } = requestBody;

    if (!storeUrl || !accessToken) {
      throw new Error('Store URL and access token are required');
    }

    // Clean access token
    const cleanToken = accessToken.replace(/^["']|["']$/g, '').trim();

    // Get store configuration
    const { data: storeConfig, error: storeError } = await supabase
      .from('store_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('domain', storeUrl)
      .eq('platform', 'shopify')
      .single();

    if (storeError || !storeConfig) {
      throw new Error('Store configuration not found');
    }

    // Update sync status to started
    const { error: statusError } = await supabase
      .from('marketplace_sync_status')
      .upsert({
        user_id: user.id,
        marketplace: 'shopify',
        sync_status: 'in_progress',
        error_message: null,
        updated_at: new Date().toISOString(),
        sync_settings: {
          method: 'graphql_bulk',
          operation: operation,
          started_at: new Date().toISOString()
        }
      }, {
        onConflict: 'user_id,marketplace'
      });

    if (statusError) {
      console.error('❌ Error updating sync status:', statusError);
      throw new Error('Failed to update sync status');
    }

    console.log('📊 Updated sync status to in_progress');

    if (operation === 'start_bulk') {
      // Start bulk operation for all products
      const bulkQuery = `
        mutation {
          bulkOperationRunQuery(
            query: """
                query {
                  products(sortKey: UPDATED_AT, reverse: true) {
                  edges {
                    node {
                      id
                      title
                      handle
                      vendor
                      productType
                      tags
                      status
                      createdAt
                      updatedAt
                      description
                      seo {
                        title
                        description
                      }
                      variants(first: 250) {
                        edges {
                          node {
                            id
                            title
                            sku
                            barcode
                            weight
                            weightUnit
                            inventoryQuantity
                            inventoryPolicy
                            price
                            compareAtPrice
                            taxable
                            requiresShipping
                            fulfillmentService {
                              serviceName
                            }
                            inventoryItem {
                              tracked
                            }
                          }
                        }
                      }
                      images(first: 10) {
                        edges {
                          node {
                            id
                            src
                            altText
                            width
                            height
                          }
                        }
                      }
                    }
                  }
                }
              }
            """
          ) {
            bulkOperation {
              id
              status
              errorCode
              createdAt
              completedAt
              objectCount
              fileSize
              url
              partialDataUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch(`https://${storeUrl}/admin/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': cleanToken,
        },
        body: JSON.stringify({ query: bulkQuery }),
      });

      const result: GraphQLResponse = await response.json();

      if (result.errors) {
        console.error('❌ GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      const bulkOperation = result.data?.bulkOperationRunQuery?.bulkOperation;
      const userErrors = result.data?.bulkOperationRunQuery?.userErrors;

      if (userErrors && userErrors.length > 0) {
        console.error('❌ User errors:', userErrors);
        throw new Error(`User errors: ${userErrors.map((e: any) => e.message).join(', ')}`);
      }

      console.log('🔄 Bulk operation started:', bulkOperation);

      // Update sync status with bulk operation info
      await supabase
        .from('marketplace_sync_status')
        .update({
          sync_settings: {
            method: 'graphql_bulk',
            operation: 'bulk_started',
            bulk_operation_id: bulkOperation.id,
            started_at: new Date().toISOString(),
            status: bulkOperation.status
          },
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('marketplace', 'shopify');

      return new Response(JSON.stringify({
        success: true,
        operation: 'bulk_started',
        bulkOperation: bulkOperation,
        message: 'Bulk operation started successfully. Use check_bulk operation to monitor progress.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (operation === 'check_bulk') {
      // Check bulk operation status
      const { bulkOperationId } = requestBody;
      
      if (!bulkOperationId) {
        throw new Error('Bulk operation ID is required for check_bulk operation');
      }

      const statusQuery = `
        query {
          currentBulkOperation {
            id
            status
            errorCode
            createdAt
            completedAt
            objectCount
            fileSize
            url
            partialDataUrl
          }
        }
      `;

      const response = await fetch(`https://${storeUrl}/admin/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': cleanToken,
        },
        body: JSON.stringify({ query: statusQuery }),
      });

      const result: GraphQLResponse = await response.json();

      if (result.errors) {
        console.error('❌ GraphQL errors:', result.errors);
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      const bulkOperation = result.data?.currentBulkOperation;
      console.log('📊 Bulk operation status:', bulkOperation);

      if (bulkOperation?.status === 'COMPLETED' && bulkOperation.url) {
        // Download and process the data
        console.log('📥 Downloading bulk operation results...');
        
        const dataResponse = await fetch(bulkOperation.url);
        const jsonlData = await dataResponse.text();
        
        console.log('⚙️ Processing JSONL data...');
        
        const lines = jsonlData.trim().split('\n');
        const products = [];
        
        for (const line of lines) {
          try {
            const item = JSON.parse(line);
            if (item.__typename === 'Product') {
              products.push(item);
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse line:', line);
          }
        }

        console.log(`📦 Processing ${products.length} products from bulk operation`);

        // Transform and upsert products
        let processedCount = 0;
        const batchSize = 50;
        
        for (let i = 0; i < products.length; i += batchSize) {
          const batch = products.slice(i, i + batchSize);
          const transformedProducts = batch.map(product => transformShopifyProduct(product, user.id, storeConfig));
          
          const { error: upsertError } = await supabase
            .from('products')
            .upsert(transformedProducts, {
              onConflict: 'user_id,handle,store_id'
            });

          if (upsertError) {
            console.error(`❌ Error upserting batch ${i}-${i + batchSize}:`, upsertError);
          } else {
            processedCount += transformedProducts.length;
            console.log(`✅ Processed batch ${i}-${i + batchSize} (${processedCount}/${products.length})`);
          }
        }

        // Update final sync status
        await supabase
          .from('marketplace_sync_status')
          .update({
            sync_status: 'success',
            products_synced: processedCount,
            total_products_found: products.length,
            active_products_synced: processedCount,
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_settings: {
              method: 'graphql_bulk',
              operation: 'completed',
              bulk_operation_id: bulkOperation.id,
              completed_at: new Date().toISOString(),
              total_processed: processedCount
            }
          })
          .eq('user_id', user.id)
          .eq('marketplace', 'shopify');

        return new Response(JSON.stringify({
          success: true,
          operation: 'bulk_completed',
          totalProducts: products.length,
          processedProducts: processedCount,
          message: `Successfully synced ${processedCount} products using GraphQL bulk operations`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } else {
        // Operation still in progress or failed
        await supabase
          .from('marketplace_sync_status')
          .update({
            sync_settings: {
              method: 'graphql_bulk',
              operation: 'in_progress',
              bulk_operation_id: bulkOperation?.id,
              status: bulkOperation?.status,
              object_count: bulkOperation?.objectCount,
              last_checked: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('marketplace', 'shopify');

        return new Response(JSON.stringify({
          success: true,
          operation: 'bulk_in_progress',
          bulkOperation: bulkOperation,
          message: `Bulk operation ${bulkOperation?.status || 'UNKNOWN'}. Check again in a few seconds.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

    } else {
      throw new Error(`Unknown operation: ${operation}`);
    }

  } catch (error: any) {
    console.error('❌ GraphQL sync error:', error);
    
    // Update sync status with error
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          await supabase
            .from('marketplace_sync_status')
            .update({
              sync_status: 'error',
              error_message: error.message,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('marketplace', 'shopify');
        }
      }
    } catch (statusError) {
      console.error('❌ Error updating error status:', statusError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function transformShopifyProduct(product: any, userId: string, storeConfig: any) {
  const firstVariant = product.variants?.edges?.[0]?.node;
  const firstImage = product.images?.edges?.[0]?.node;

  return {
    user_id: userId,
    store_id: storeConfig.id,
    store_name: storeConfig.store_name,
    marketplace: 'shopify',
    shopify_product_id: product.id.replace('gid://shopify/Product/', ''),
    handle: product.handle,
    title: product.title,
    vendor: product.vendor || null,
    type: product.productType || null,
    tags: product.tags?.join(', ') || null,
    published: product.status === 'ACTIVE',
    body_html: product.description || '',
    seo_title: product.seo?.title || null,
    seo_description: product.seo?.description || null,
    
    // First variant data
    option1_name: firstVariant?.title === 'Default Title' ? null : 'Title',
    option1_value: firstVariant?.title || 'Default Title',
    variant_sku: firstVariant?.sku || '',
    variant_grams: firstVariant?.weight || null,
    variant_inventory_tracker: firstVariant?.inventoryItem?.tracked ? 'shopify' : null,
    variant_inventory_qty: firstVariant?.inventoryQuantity || 0,
    variant_inventory_policy: firstVariant?.inventoryPolicy?.toLowerCase() || 'deny',
    variant_fulfillment_service: firstVariant?.fulfillmentService?.serviceName || 'manual',
    variant_price: parseFloat(firstVariant?.price || '0'),
    variant_compare_at_price: parseFloat(firstVariant?.compareAtPrice || '0'),
    variant_requires_shipping: firstVariant?.requiresShipping !== false,
    variant_taxable: firstVariant?.taxable !== false,
    variant_barcode: firstVariant?.barcode || null,
    
    // Image data
    image_position: 1,
    image_src: firstImage?.src || '',
    
    // Sync metadata
    shopify_sync_status: 'synced',
    shopify_synced_at: new Date().toISOString(),
    created_at: product.createdAt,
    updated_at: product.updatedAt,
    
    // Default values for marketplace columns
    listing_status: null,
    parent_listing_id: null,
    listing_type: 'single',
    ebay_listing_id: null,
    quantity_available: 0,
    quantity_sold: 0,
    start_time: null,
    end_time: null
  };
}