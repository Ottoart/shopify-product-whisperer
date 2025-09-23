import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StaplesProduct {
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  imageUrl: string;
  sku?: string;
  supplierProductId: string;
  supplierUrl: string;
  specifications: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting Staples product scraping...');

    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { url = "https://www.staples.ca/collections/cardboard-boxes-9410" } = await req.json();

    console.log(`📦 Scraping products from: ${url}`);

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`📄 Page content fetched, length: ${html.length} characters`);

    // Parse products from HTML using regex patterns
    const products: StaplesProduct[] = [];
    
    // Look for product cards in the HTML
    const productPattern = /<div[^>]*class="[^"]*product-card[^"]*"[^>]*>(.*?)<\/div>/gs;
    const productMatches = html.match(productPattern) || [];

    console.log(`🔍 Found ${productMatches.length} potential product matches`);

    for (const productHtml of productMatches.slice(0, 50)) { // Limit to first 50 products
      try {
        // Extract product name
        const nameMatch = productHtml.match(/<h[234][^>]*[^>]*>(.*?)<\/h[234]>/s) || 
                         productHtml.match(/title="([^"]+)"/);
        const name = nameMatch ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : 'Unknown Product';

        // Extract price
        const priceMatch = productHtml.match(/\$(\d+\.?\d*)/);
        const price = priceMatch ? parseFloat(priceMatch[1]) : 0;

        // Extract image URL
        const imageMatch = productHtml.match(/src="([^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
        const imageUrl = imageMatch ? imageMatch[1] : '';

        // Extract product URL/ID
        const urlMatch = productHtml.match(/href="([^"]+)"/);
        const productUrl = urlMatch ? urlMatch[1] : '';
        const supplierProductId = productUrl.split('/').pop() || '';

        // Skip if essential data is missing
        if (!name || name === 'Unknown Product' || price === 0) {
          continue;
        }

        products.push({
          name: name.substring(0, 255), // Ensure name fits in database
          price,
          description: `High-quality ${name.toLowerCase()} from Staples Canada`,
          imageUrl: imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl,
          supplierProductId,
          supplierUrl: `https://www.staples.ca${productUrl}`,
          specifications: {
            source: 'staples.ca',
            category: 'cardboard-boxes',
            scrapedAt: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Error parsing product:', error);
        continue;
      }
    }

    console.log(`✅ Successfully parsed ${products.length} products`);

    // Insert products into the database
    let insertedCount = 0;
    let updatedCount = 0;

    for (const product of products) {
      try {
        // Check if product already exists
        const { data: existingProduct } = await supabaseAdmin
          .from('store_products')
          .select('id')
          .eq('supplier_product_id', product.supplierProductId)
          .eq('supplier', 'staples')
          .single();

        if (existingProduct) {
          // Update existing product
          const { error } = await supabaseAdmin
            .from('store_products')
            .update({
              name: product.name,
              price: product.price,
              description: product.description,
              image_url: product.imageUrl,
              supplier_url: product.supplierUrl,
              specifications: product.specifications,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id);

          if (!error) {
            updatedCount++;
          }
        } else {
          // Insert new product
          const { error } = await supabaseAdmin
            .from('store_products')
            .insert({
              name: product.name,
              price: product.price,
              description: product.description,
              category: 'cardboard-boxes',
              subcategory: 'shipping-supplies',
              supplier: 'staples',
              supplier_product_id: product.supplierProductId,
              supplier_url: product.supplierUrl,
              image_url: product.imageUrl,
              currency: 'CAD',
              status: 'active',
              visibility: 'public',
              in_stock: true,
              requires_shipping: true,
              taxable: true,
              specifications: product.specifications,
              tags: ['cardboard', 'boxes', 'shipping', 'packaging']
            });

          if (!error) {
            insertedCount++;
          }
        }
      } catch (error) {
        console.error(`Error saving product ${product.name}:`, error);
        continue;
      }
    }

    console.log(`📊 Database operations complete: ${insertedCount} inserted, ${updatedCount} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully scraped ${products.length} products from Staples`,
        details: {
          totalFound: products.length,
          inserted: insertedCount,
          updated: updatedCount,
          url: url
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error scraping Staples products:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to scrape products from Staples website'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});