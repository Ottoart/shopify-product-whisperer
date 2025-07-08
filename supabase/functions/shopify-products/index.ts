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
    const { action, products, vendor } = await req.json();
    
    const shopifyDomain = Deno.env.get('SHOPIFY_DOMAIN');
    const shopifyToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
    
    if (!shopifyDomain || !shopifyToken) {
      console.error('Missing Shopify credentials');
      return new Response(
        JSON.stringify({ error: 'Shopify credentials not configured' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const shopifyUrl = `https://${shopifyDomain}/admin/api/2023-10/`;
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Invalid user token:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    switch (action) {
      case 'fetch-vendors': {
        console.log('Fetching vendors from Shopify...');
        
        const response = await fetch(`${shopifyUrl}products.json?limit=250&fields=vendor`, {
          headers: {
            'X-Shopify-Access-Token': shopifyToken,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Shopify API error:', response.status, await response.text());
          return new Response(
            JSON.stringify({ error: `Shopify API error: ${response.status}` }),
            { 
              status: response.status,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        const data = await response.json();
        const vendors = [...new Set(data.products.map((p: any) => p.vendor).filter(Boolean))];
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            vendors: vendors.sort()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fetch': {
        console.log('Fetching products from Shopify...');
        
        let vendorFilter = '';
        if (vendor) {
          vendorFilter = `&vendor=${encodeURIComponent(vendor)}`;
        }
        
        let allProducts = [];
        let hasNextPage = true;
        let pageInfo = null;
        
        // Fetch all products with pagination
        while (hasNextPage) {
          let url = `${shopifyUrl}products.json?limit=250${vendorFilter}`;
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
            console.error('Shopify API error:', response.status, await response.text());
            return new Response(
              JSON.stringify({ error: `Shopify API error: ${response.status}` }),
              { 
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          const shopifyData = await response.json();
          allProducts.push(...shopifyData.products);
          
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

        
        console.log(`Fetched ${allProducts.length} products from Shopify`);

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

        // If importing specific vendor, only delete products for that vendor
        if (vendor) {
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('user_id', user.id)
            .eq('vendor', vendor);

          if (deleteError) {
            console.error('Error deleting existing vendor products:', deleteError);
          }
        } else {
          // Clear all existing products
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('user_id', user.id);

          if (deleteError) {
            console.error('Error deleting existing products:', deleteError);
          }
        }

        const { error: insertError } = await supabase
          .from('products')
          .insert(transformedProducts);

        if (insertError) {
          console.error('Database error:', insertError);
          return new Response(
            JSON.stringify({ error: `Database error: ${insertError.message}` }),
            { 
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully imported ${transformedProducts.length} products from Shopify`,
            count: transformedProducts.length
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