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
    const { action, products } = await req.json();
    
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
      case 'fetch': {
        console.log('Fetching products from Shopify...');
        
        // Fetch products from Shopify
        const response = await fetch(`${shopifyUrl}products.json?limit=250`, {
          headers: {
            'X-Shopify-Access-Token': shopifyToken,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }

        const shopifyData = await response.json();
        console.log(`Fetched ${shopifyData.products.length} products from Shopify`);

        // Transform Shopify products to our format and save to database
        const transformedProducts = shopifyData.products.map((product: any) => {
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

        // Clear existing products and insert new ones
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) {
          console.error('Error deleting existing products:', deleteError);
        }

        const { error: insertError } = await supabase
          .from('products')
          .insert(transformedProducts);

        if (insertError) {
          throw new Error(`Database error: ${insertError.message}`);
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