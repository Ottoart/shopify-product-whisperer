import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, productData, productId, productHandle } = await req.json();
    
    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { auth: { persistSession: false } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result;

    switch (action) {
      case 'update':
        // Update product in our database - use handle if provided, otherwise use id
        const updateQuery = supabase
          .from('products')
          .update({
            title: productData.title,
            body_html: productData.body_html,
            vendor: productData.vendor,
            type: productData.type,
            tags: productData.tags,
            published: productData.published,
            variant_price: productData.variant_price,
            variant_inventory_qty: productData.variant_inventory_qty,
            seo_title: productData.seo_title,
            seo_description: productData.seo_description,
            updated_at: new Date().toISOString(),
          });

        if (productHandle) {
          updateQuery.eq('handle', productHandle);
        } else {
          updateQuery.eq('id', productId);
        }
        
        const { data: updateData, error: updateError } = await updateQuery
          .eq('user_id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Also sync to Shopify if credentials are available
        const storeUrl = Deno.env.get('SHOPIFY_DOMAIN');
        const accessToken = Deno.env.get('SHOPIFY_ACCESS_TOKEN');
        
        if (storeUrl && accessToken && productData.handle) {
          try {
            const shopifyUrl = `https://${storeUrl}/admin/api/2023-10/products.json?handle=${productData.handle}`;
            
            // First, get the product from Shopify to get its ID
            const getResponse = await fetch(shopifyUrl, {
              method: 'GET',
              headers: {
                'X-Shopify-Access-Token': accessToken,
                'Content-Type': 'application/json',
              },
            });

            if (!getResponse.ok) {
              console.error('Failed to get product from Shopify:', await getResponse.text());
            } else {
              const getResult = await getResponse.json();
              if (getResult.products && getResult.products.length > 0) {
                const shopifyProduct = getResult.products[0];
                
                // Update the product in Shopify
                const updateUrl = `https://${storeUrl}/admin/api/2023-10/products/${shopifyProduct.id}.json`;
                const updateResponse = await fetch(updateUrl, {
                  method: 'PUT',
                  headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    product: {
                      id: shopifyProduct.id,
                      title: productData.title,
                      body_html: productData.body_html,
                      vendor: productData.vendor,
                      product_type: productData.type,
                      tags: productData.tags,
                      published: productData.published,
                    }
                  }),
                });

                if (!updateResponse.ok) {
                  console.error('Failed to update product in Shopify:', await updateResponse.text());
                } else {
                  console.log('Product successfully synced to Shopify');
                  
                  // Update sync status in database
                  const syncUpdateQuery = supabase
                    .from('products')
                    .update({
                      shopify_sync_status: 'synced',
                      shopify_synced_at: new Date().toISOString(),
                    });
                  
                  if (productHandle) {
                    syncUpdateQuery.eq('handle', productHandle);
                  } else {
                    syncUpdateQuery.eq('id', productId);
                  }
                  
                  await syncUpdateQuery.eq('user_id', user.id);
                }
              }
            }
          } catch (shopifyError) {
            console.error('Shopify sync error:', shopifyError);
            // Don't fail the entire operation if Shopify sync fails
          }
        }

        result = { success: true, product: updateData, message: 'Product updated successfully' };
        break;

      case 'delete':
        // Delete product from our database
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', productId)
          .eq('user_id', user.id);

        if (deleteError) {
          throw deleteError;
        }

        result = { success: true, message: 'Product deleted successfully' };
        break;

      case 'get':
        // Get single product
        const { data: productData, error: getError } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('user_id', user.id)
          .single();

        if (getError) {
          throw getError;
        }

        result = { success: true, product: productData };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in manage-products function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        message: 'Failed to process product operation'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});