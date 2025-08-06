import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScrapingConfig {
  supplier: string;
  baseUrl: string;
  collections: string[];
  userAgent: string;
  productSelector: string;
  nameSelector: string;
  priceSelector: string;
  imageSelector: string;
  urlSelector: string;
  maxProducts: number;
  delayMs: number;
}

interface ScrapedProduct {
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  imageUrl: string;
  productUrl: string;
  supplierProductId: string;
  specifications: Record<string, any>;
  category: string;
  tags: string[];
}

const SCRAPING_CONFIGS: Record<string, ScrapingConfig> = {
  staples: {
    supplier: 'staples',
    baseUrl: 'https://www.staples.ca',
    collections: [
      '/collections/warehouse-facilities-34',
      '/collections/cardboard-boxes-9410',
      '/collections/mailing-envelopes-8405',
      '/collections/shipping-tape-8407',
      '/collections/protective-packaging-8408',
      '/collections/labels-stickers-4180'
    ],
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    productSelector: 'div[class*="product"]',
    nameSelector: 'h[1-6], [title], [alt]',
    priceSelector: '\\$\\d+\\.?\\d*',
    imageSelector: 'img[src*=".jpg"], img[src*=".png"], img[src*=".webp"]',
    urlSelector: 'a[href*="/products/"]',
    maxProducts: 100,
    delayMs: 1000
  },
  uline: {
    supplier: 'uline',
    baseUrl: 'https://www.uline.ca',
    collections: [
      '/c/shipping-boxes',
      '/c/packaging-supplies',
      '/c/warehouse-supplies'
    ],
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    productSelector: 'div[class*="product"], div[class*="item"]',
    nameSelector: 'h[1-6], [data-product-name], .product-name',
    priceSelector: '\\$\\d+\\.?\\d*',
    imageSelector: 'img[src*=".jpg"], img[src*=".png"], img[src*=".webp"]',
    urlSelector: 'a[href*="/Product/"]',
    maxProducts: 100,
    delayMs: 1500
  }
};

async function scrapeWithAntiDetection(url: string, config: ScrapingConfig): Promise<string> {
  const headers = {
    'User-Agent': config.userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none'
  };

  console.log(`🌐 Fetching: ${url}`);
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.text();
}

function extractProducts(html: string, config: ScrapingConfig, collectionUrl: string): ScrapedProduct[] {
  const products: ScrapedProduct[] = [];
  
  // Enhanced regex patterns for different layouts
  const productPatterns = [
    /<div[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/div>/gs,
    /<article[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/article>/gs,
    /<li[^>]*class="[^"]*product[^"]*"[^>]*>(.*?)<\/li>/gs
  ];

  let productMatches: string[] = [];
  
  for (const pattern of productPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      productMatches = matches;
      break;
    }
  }

  console.log(`🔍 Found ${productMatches.length} product containers`);

  for (const productHtml of productMatches.slice(0, config.maxProducts)) {
    try {
      // Extract name with multiple fallbacks
      const namePatterns = [
        /<h[123456][^>]*[^>]*>(.*?)<\/h[123456]>/s,
        /title="([^"]+)"/,
        /alt="([^"]+)"/,
        /data-product-name="([^"]+)"/,
        /<span[^>]*class="[^"]*name[^"]*"[^>]*>(.*?)<\/span>/s
      ];
      
      let name = '';
      for (const pattern of namePatterns) {
        const match = productHtml.match(pattern);
        if (match) {
          name = match[1].replace(/<[^>]*>/g, '').trim();
          if (name && name !== 'Unknown Product') break;
        }
      }

      // Extract price with enhanced patterns
      const pricePatterns = [
        /\$(\d+\.?\d*)/,
        /price[^>]*>.*?\$(\d+\.?\d*)/i,
        /(\d+\.?\d*)\s*\$/
      ];
      
      let price = 0;
      for (const pattern of pricePatterns) {
        const match = productHtml.match(pattern);
        if (match) {
          price = parseFloat(match[1]);
          if (price > 0) break;
        }
      }

      // Extract image URL
      const imageMatch = productHtml.match(/src="([^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
      let imageUrl = imageMatch ? imageMatch[1] : '';
      if (imageUrl.startsWith('//')) imageUrl = `https:${imageUrl}`;
      if (imageUrl.startsWith('/')) imageUrl = `${config.baseUrl}${imageUrl}`;

      // Extract product URL
      const urlMatch = productHtml.match(/href="([^"]+)"/);
      let productUrl = urlMatch ? urlMatch[1] : '';
      if (productUrl.startsWith('/')) productUrl = `${config.baseUrl}${productUrl}`;
      
      const supplierProductId = productUrl.split('/').pop() || `${config.supplier}-${Date.now()}-${Math.random()}`;

      // Skip if essential data is missing
      if (!name || name === 'Unknown Product' || price === 0) {
        continue;
      }

      // Determine category and tags based on collection URL
      const category = determineCategory(collectionUrl);
      const tags = generateTags(name, category, config.supplier);

      products.push({
        name: name.substring(0, 255),
        price,
        description: `Professional ${name.toLowerCase()} from ${config.supplier.toUpperCase()}. Perfect for shipping, storage, and packaging needs.`,
        imageUrl,
        productUrl,
        supplierProductId,
        specifications: {
          source: config.supplier,
          category,
          collectionUrl,
          scrapedAt: new Date().toISOString(),
          extractionMethod: 'enhanced-regex'
        },
        category,
        tags
      });

    } catch (error) {
      console.error('Error parsing product:', error);
      continue;
    }
  }

  return products;
}

function determineCategory(url: string): string {
  const categoryMap: Record<string, string> = {
    'warehouse-facilities': 'warehouse-supplies',
    'cardboard-boxes': 'boxes',
    'mailing-envelopes': 'envelopes',
    'shipping-tape': 'tape',
    'protective-packaging': 'protective-packaging',
    'labels-stickers': 'labels',
    'shipping-boxes': 'boxes',
    'packaging-supplies': 'packaging'
  };

  for (const [key, value] of Object.entries(categoryMap)) {
    if (url.includes(key)) return value;
  }
  
  return 'general-supplies';
}

function generateTags(name: string, category: string, supplier: string): string[] {
  const baseTags = [supplier, category, 'shipping', 'packaging'];
  const nameLower = name.toLowerCase();
  
  const conditionalTags = [
    { condition: nameLower.includes('box'), tag: 'boxes' },
    { condition: nameLower.includes('envelope'), tag: 'envelopes' },
    { condition: nameLower.includes('tape'), tag: 'tape' },
    { condition: nameLower.includes('bubble'), tag: 'bubble-wrap' },
    { condition: nameLower.includes('label'), tag: 'labels' },
    { condition: nameLower.includes('poly'), tag: 'poly-mailers' },
    { condition: nameLower.includes('kraft'), tag: 'kraft-paper' },
    { condition: nameLower.includes('corrugated'), tag: 'corrugated' }
  ];

  conditionalTags.forEach(({ condition, tag }) => {
    if (condition) baseTags.push(tag);
  });

  return [...new Set(baseTags)]; // Remove duplicates
}

async function saveProducts(products: ScrapedProduct[], supabase: any): Promise<{ inserted: number; updated: number }> {
  let insertedCount = 0;
  let updatedCount = 0;

  for (const product of products) {
    try {
      // Check if product exists
      const { data: existing } = await supabase
        .from('store_products')
        .select('id, price')
        .eq('supplier_product_id', product.supplierProductId)
        .eq('supplier', product.specifications.source)
        .single();

      if (existing) {
        // Update if price changed or other significant updates
        const priceChanged = Math.abs(existing.price - product.price) > 0.01;
        
        if (priceChanged) {
          // Log price change
          await supabase.from('price_history').insert({
            product_id: existing.id,
            old_price: existing.price,
            new_price: product.price,
            change_type: product.price > existing.price ? 'increase' : 'decrease',
            source: 'automated_scraping'
          });
        }

        await supabase.from('store_products').update({
          name: product.name,
          price: product.price,
          description: product.description,
          image_url: product.imageUrl,
          supplier_url: product.productUrl,
          specifications: product.specifications,
          tags: product.tags,
          updated_at: new Date().toISOString()
        }).eq('id', existing.id);

        updatedCount++;
      } else {
        // Insert new product
        await supabase.from('store_products').insert({
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          subcategory: 'automated-import',
          supplier: product.specifications.source,
          supplier_product_id: product.supplierProductId,
          supplier_url: product.productUrl,
          image_url: product.imageUrl,
          currency: 'CAD',
          status: 'active',
          visibility: 'public',
          in_stock: true,
          featured: false,
          requires_shipping: true,
          taxable: true,
          specifications: product.specifications,
          tags: product.tags
        });

        insertedCount++;
      }
    } catch (error) {
      console.error(`Error saving product ${product.name}:`, error);
    }
  }

  return { inserted: insertedCount, updated: updatedCount };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Starting Enhanced Scraping Engine...');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { suppliers = ['staples'], collections = [], maxProducts = 50 } = await req.json();

    let totalProducts: ScrapedProduct[] = [];
    let totalInserted = 0;
    let totalUpdated = 0;

    for (const supplierName of suppliers) {
      const config = SCRAPING_CONFIGS[supplierName];
      if (!config) {
        console.warn(`⚠️  No configuration found for supplier: ${supplierName}`);
        continue;
      }

      console.log(`📦 Processing supplier: ${supplierName.toUpperCase()}`);

      const collectionsToScrape = collections.length > 0 ? collections : config.collections;

      for (const collection of collectionsToScrape) {
        try {
          const url = collection.startsWith('http') ? collection : `${config.baseUrl}${collection}`;
          
          console.log(`🌐 Scraping collection: ${url}`);

          const html = await scrapeWithAntiDetection(url, config);
          const products = extractProducts(html, config, url);
          
          console.log(`✅ Extracted ${products.length} products from ${collection}`);
          
          totalProducts.push(...products);

          // Add delay between requests to avoid rate limiting
          if (config.delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, config.delayMs));
          }

        } catch (error) {
          console.error(`❌ Error scraping collection ${collection}:`, error);
          continue;
        }
      }
    }

    // Save all products to database
    console.log(`💾 Saving ${totalProducts.length} products to database...`);
    const { inserted, updated } = await saveProducts(totalProducts, supabase);
    totalInserted += inserted;
    totalUpdated += updated;

    // Log scraping session
    await supabase.from('scraping_sessions').insert({
      suppliers: suppliers,
      total_products_found: totalProducts.length,
      products_inserted: totalInserted,
      products_updated: totalUpdated,
      status: 'completed',
      metadata: {
        collections: collections,
        maxProducts,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`🎉 Scraping complete: ${totalInserted} inserted, ${totalUpdated} updated`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Enhanced scraping completed successfully`,
        details: {
          suppliers: suppliers,
          totalProductsFound: totalProducts.length,
          inserted: totalInserted,
          updated: totalUpdated,
          collections: collectionsToScrape
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Enhanced scraping failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Enhanced scraping engine encountered an error'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});