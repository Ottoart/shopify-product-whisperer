import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

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
    const body = await req.json();
    const { action, products, brand, filterType, filterValue } = body;
    
    const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
    const shopifyToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    
    if (!shopifyDomain || !shopifyToken) {
      throw new Error('Shopify credentials not configured');
    }

    const shopifyUrl = `https://${shopifyDomain}/admin/api/2023-10/`;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    switch (action) {
      case 'fetch-filters': {
        console.log(`Fetching available ${filterType} from Shopify...`);
        
        let fieldName = '';
        let collectionsData = new Set<string>();
        
        switch (filterType) {
          case 'brands':
            fieldName = 'vendor';
            break;
          case 'product_types':
            fieldName = 'product_type';
            break;
          case 'collections':
            // For collections, we need a separate API call
            let collectionPageInfo = null;
            let collectionPageCount = 0;
            const maxCollectionPages = 3;
            
            while (collectionPageCount < maxCollectionPages) {
              collectionPageCount++;
              let collectionUrl = `${shopifyUrl}custom_collections.json?limit=250&fields=title`;
              if (collectionPageInfo) {
                collectionUrl += `&page_info=${collectionPageInfo}`;
              }
              
              const collectionResponse = await fetch(collectionUrl, {
                headers: {
                  'X-Shopify-Access-Token': shopifyToken,
                  'Content-Type': 'application/json',
                },
              });

              if (!collectionResponse.ok) {
                throw new Error(`Shopify API error: ${collectionResponse.status}`);
              }

              const collectionDataResponse = await collectionResponse.json();
              
              collectionDataResponse.custom_collections?.forEach((collection: any) => {
                if (collection.title && collection.title.trim()) {
                  collectionsData.add(collection.title.trim());
                }
              });
              
              const linkHeader = collectionResponse.headers.get('Link');
              if (linkHeader && linkHeader.includes('rel="next"')) {
                const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
                if (nextLink) {
                  const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
                  collectionPageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
                }
              } else {
                break;
              }
            }
            
            // Also fetch smart collections
            let smartCollectionPageInfo = null;
            let smartCollectionPageCount = 0;
            
            while (smartCollectionPageCount < maxCollectionPages) {
              smartCollectionPageCount++;
              let smartCollectionUrl = `${shopifyUrl}smart_collections.json?limit=250&fields=title`;
              if (smartCollectionPageInfo) {
                smartCollectionUrl += `&page_info=${smartCollectionPageInfo}`;
              }
              
              const smartCollectionResponse = await fetch(smartCollectionUrl, {
                headers: {
                  'X-Shopify-Access-Token': shopifyToken,
                  'Content-Type': 'application/json',
                },
              });

              if (!smartCollectionResponse.ok) {
                throw new Error(`Shopify API error: ${smartCollectionResponse.status}`);
              }

              const smartCollectionDataResponse = await smartCollectionResponse.json();
              
              smartCollectionDataResponse.smart_collections?.forEach((collection: any) => {
                if (collection.title && collection.title.trim()) {
                  collectionsData.add(collection.title.trim());
                }
              });
              
              const linkHeader = smartCollectionResponse.headers.get('Link');
              if (linkHeader && linkHeader.includes('rel="next"')) {
                const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
                if (nextLink) {
                  const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
                  smartCollectionPageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
                }
              } else {
                break;
              }
            }
            
            const collections = Array.from(collectionsData).sort();
            return new Response(
              JSON.stringify({ 
                success: true, 
                items: collections,
                message: `Found ${collections.length} collections`
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
        
        // For brands and product types, fetch from products
        let allItems = new Set<string>();
        let hasNextPage = true;
        let pageInfo = null;
        let pageCount = 0;
        const maxPages = 5;
        
        while (hasNextPage && pageCount < maxPages) {
          pageCount++;
          let url = `${shopifyUrl}products.json?limit=250&fields=${fieldName}`;
          if (pageInfo) {
            url += `&page_info=${pageInfo}`;
          }
          
          const response = await fetch(url, {
            headers: {
              'X-Shopify-Access-Token': shopifyToken,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status}`);
          }

          const shopifyData = await response.json();
          
          shopifyData.products.forEach((product: any) => {
            const value = product[fieldName];
            if (value && value.trim()) {
              allItems.add(value.trim());
            }
          });
          
          const linkHeader = response.headers.get('Link');
          if (linkHeader && linkHeader.includes('rel="next"')) {
            const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
            if (nextLink) {
              const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
              pageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
            }
          } else {
            hasNextPage = false;
          }
        }

        const items = Array.from(allItems).sort();
        console.log(`Found ${items.length} unique ${filterType} from ${pageCount} pages`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            items,
            message: `Found ${items.length} ${filterType}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch': {
        console.log('Fetching products from Shopify...');
        
        let allProducts = [];
        let hasNextPage = true;
        let pageInfo = null;
        let currentPage = 0;
        
        // Build filter based on filter type and value
        let filter = '';
        if (brand) {
          filter = `&vendor=${encodeURIComponent(brand)}`;
        } else if (filterType && filterValue) {
          switch (filterType) {
            case 'brands':
              filter = `&vendor=${encodeURIComponent(filterValue)}`;
              break;
            case 'product_types':
              filter = `&product_type=${encodeURIComponent(filterValue)}`;
              break;
            // Collections require different handling - we'd need to fetch products for specific collections
          }
        }
        
        // Fetch all products with pagination
        while (hasNextPage) {
          currentPage++;
          let url = `${shopifyUrl}products.json?limit=250`;
          
          // Add filters only if we don't have pageInfo (Shopify doesn't allow both)
          if (pageInfo) {
            url += `&page_info=${pageInfo}`;
          } else if (filter) {
            url += filter;
          }
          
          console.log(`Fetching page ${currentPage} for ${brand || filterValue || 'all products'}...`);
          
          const response = await fetch(url, {
            headers: {
              'X-Shopify-Access-Token': shopifyToken,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Shopify API error ${response.status}:`, errorText);
            throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
          }

          const shopifyData = await response.json();
          allProducts.push(...shopifyData.products);
          
          console.log(`Page ${currentPage}: Got ${shopifyData.products.length} products (total: ${allProducts.length})`);
          
          // Check for pagination
          const linkHeader = response.headers.get('Link');
          if (linkHeader && linkHeader.includes('rel="next"')) {
            const nextLink = linkHeader.split(',').find(link => link.includes('rel="next"'));
            if (nextLink) {
              const pageInfoMatch = nextLink.match(/page_info=([^&>]+)/);
              pageInfo = pageInfoMatch ? pageInfoMatch[1] : null;
            }
          } else {
            hasNextPage = false;
          }
        }

        // If we're filtering by product type and used pagination, filter client-side
        if (filterType === 'product_types' && filterValue && pageInfo) {
          allProducts = allProducts.filter(product => 
            product.product_type === filterValue
          );
          console.log(`Client-side filtered to ${allProducts.length} products with product_type: ${filterValue}`);
        }

        console.log(`Fetched ${allProducts.length} products from Shopify for ${brand || filterValue || 'all products'}`);

        // Get unique brands for the response
        const allBrands = [...new Set(allProducts.map((p: any) => p.vendor).filter(Boolean))].sort();
        console.log(`Found ${allBrands.length} unique brands:`, allBrands);

        // Transform Shopify products to our format and save to database
        const transformedProducts = allProducts.map((product: any) => {
          const variant = product.variants[0] || {};
          
          return {
            user_id: user.id,
            handle: product.handle,
            title: product.title,
            vendor: product.vendor || '',
            type: product.product_type || '',
            tags: product.tags || '',
            published: product.status === 'active',
            option1_name: product.options[0]?.name || '',
            option1_value: variant.option1 || '',
            variant_sku: variant.sku || '',
            variant_grams: variant.grams || 0,
            variant_inventory_tracker: variant.inventory_management || '',
            variant_inventory_qty: variant.inventory_quantity || 0,
            variant_inventory_policy: variant.inventory_policy || '',
            variant_fulfillment_service: variant.fulfillment_service || '',
            variant_price: parseFloat(variant.price || '0'),
            variant_compare_at_price: parseFloat(variant.compare_at_price || '0'),
            variant_requires_shipping: variant.requires_shipping || true,
            variant_taxable: variant.taxable || true,
            variant_barcode: variant.barcode || '',
            image_position: product.images[0]?.position || 0,
            image_src: product.images[0]?.src || '',
            body_html: product.body_html || '',
            seo_title: product.title,
            seo_description: product.body_html?.replace(/<[^>]*>/g, '').substring(0, 160) || '',
            google_shopping_condition: '',
            google_shopping_gender: '',
            google_shopping_age_group: '',
          };
        });

        // Clear existing products for this brand or all if no brand specified
        let deleteQuery = supabase.from('products').delete().eq('user_id', user.id);
        
        if (brand) {
          deleteQuery = deleteQuery.eq('vendor', brand);
        }
        
        const { error: deleteError } = await deleteQuery;

        if (deleteError) {
          console.error('Error deleting existing products:', deleteError);
        }

        const { error: insertError } = await supabase
          .from('products')
          .insert(transformedProducts);

        if (insertError) {
          throw new Error(`Database error: ${insertError.message}`);
        }

        // Mark products as imported/synced from Shopify
        await supabase
          .from('products')
          .update({ 
            shopify_sync_status: 'imported',
            shopify_synced_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .in('handle', transformedProducts.map(p => p.handle));

        const message = brand 
          ? `Successfully imported ${transformedProducts.length} products for ${brand} brand`
          : `Successfully imported ${transformedProducts.length} products from ${allBrands.length} brands`;

        return new Response(
          JSON.stringify({ 
            success: true, 
            message,
            count: transformedProducts.length,
            brands: allBrands,
            brand: brand || 'all'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update': {
        console.log('Updating products in Shopify...');
        
        if (!products || products.length === 0) {
          throw new Error('No products provided for update');
        }

        const results = [];

        for (const product of products) {
          try {
            // Find the Shopify product by handle
            const findResponse = await fetch(`${shopifyUrl}products.json?handle=${product.handle}`, {
              headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json',
              },
            });

            if (!findResponse.ok) {
              throw new Error(`Failed to find product: ${findResponse.status}`);
            }

            const findData = await findResponse.json();
            
            if (!findData.products || findData.products.length === 0) {
              results.push({ handle: product.handle, success: false, error: 'Product not found in Shopify' });
              continue;
            }

            const shopifyProduct = findData.products[0];

            // Update the product
            const updatePayload = {
              product: {
                id: shopifyProduct.id,
                title: product.title,
                body_html: product.description,
                product_type: product.type,
                tags: product.tags,
              }
            };

            const updateResponse = await fetch(`${shopifyUrl}products/${shopifyProduct.id}.json`, {
              method: 'PUT',
              headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatePayload),
            });

            if (!updateResponse.ok) {
              const errorData = await updateResponse.text();
              throw new Error(`Shopify update failed: ${errorData}`);
            }

            results.push({ handle: product.handle, success: true });
            console.log(`Updated product: ${product.handle}`);

          } catch (error) {
            console.error(`Error updating product ${product.handle}:`, error);
            results.push({ handle: product.handle, success: false, error: error.message });
          }
        }

        const successCount = results.filter(r => r.success).length;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Updated ${successCount}/${products.length} products in Shopify`,
            results
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action. Use "fetch" or "update"');
    }

  } catch (error) {
    console.error('Error in shopify-products function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});