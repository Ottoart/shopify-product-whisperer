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

    // Get the user's eBay marketplace configuration
    const { data: ebayConfig, error: configError } = await supabase
      .from('marketplace_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'ebay')
      .eq('is_active', true)
      .single();

    if (configError || !ebayConfig) {
      throw new Error('eBay marketplace configuration not found. Please connect your eBay account first.');
    }

    if (!ebayConfig.access_token) {
      throw new Error('eBay access token not found. Please reconnect your eBay account.');
    }

    console.log(`Starting eBay product sync for user ${user.id}`);

    // eBay Trading API endpoint for getting seller's active listings
    const ebayApiUrl = 'https://api.ebay.com/ws/api.dll';
    
    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ebay:apis:eBLBaseComponents">
  <soap:Header>
    <urn:RequesterCredentials>
      <urn:eBayAuthToken>${ebayConfig.access_token}</urn:eBayAuthToken>
    </urn:RequesterCredentials>
  </soap:Header>
  <soap:Body>
    <urn:GetMyeBaySellingRequest>
      <urn:Version>1193</urn:Version>
      <urn:ActiveList>
        <urn:Include>true</urn:Include>
        <urn:ListingType>All</urn:ListingType>
        <urn:Pagination>
          <urn:EntriesPerPage>200</urn:EntriesPerPage>
          <urn:PageNumber>1</urn:PageNumber>
        </urn:Pagination>
      </urn:ActiveList>
    </urn:GetMyeBaySellingRequest>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch(ebayApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'urn:GetMyeBaySellingRequest',
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '1193',
        'X-EBAY-API-CALL-NAME': 'GetMyeBaySelling',
      },
      body: soapRequest,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('eBay API error:', response.status, errorText);
      throw new Error(`eBay API error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log('eBay API Response:', xmlText.substring(0, 1000)); // Log first 1000 chars for debugging
    
    // Parse XML response (basic parsing for active listings)
    const activeListingMatch = xmlText.match(/<ActiveList>[\s\S]*?<\/ActiveList>/);
    if (!activeListingMatch) {
      throw new Error('No active listings found in eBay response');
    }
    
    // Extract individual items from the XML
    const itemMatches = xmlText.match(/<Item>[\s\S]*?<\/Item>/g) || [];
    
    console.log(`Found ${itemMatches.length} eBay active listings`);

    // Transform eBay XML items to our product format
    const productRecords = itemMatches.map((itemXml: string) => {
      // Extract basic fields from XML using regex
      const extractField = (field: string) => {
        const match = itemXml.match(new RegExp(`<${field}>([\\s\\S]*?)<\/${field}>`));
        return match ? match[1].trim() : null;
      };
      
      const extractPrice = (priceXml: string) => {
        const match = priceXml.match(/>([0-9.]+)</);
        return match ? parseFloat(match[1]) : null;
      };
      
      const itemId = extractField('ItemID');
      const title = extractField('Title') || 'Untitled eBay Product';
      const description = extractField('Description');
      const galleryUrl = extractField('GalleryURL');
      const listingType = extractField('ListingType');
      const quantity = extractField('Quantity');
      const startPriceXml = extractField('StartPrice');
      const buyItNowPriceXml = extractField('BuyItNowPrice');
      const categoryName = extractField('CategoryName');
      const sku = extractField('SKU');
      const condition = extractField('ConditionDisplayName');
      
      // Determine price
      const startPrice = startPriceXml ? extractPrice(startPriceXml) : null;
      const buyItNowPrice = buyItNowPriceXml ? extractPrice(buyItNowPriceXml) : null;
      const price = buyItNowPrice || startPrice;
      
      return {
        user_id: user.id,
        handle: (sku || `ebay-${itemId}`).toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title: title,
        vendor: 'eBay',
        type: categoryName || null,
        tags: `eBay, ${listingType || 'Unknown'}, ${condition || 'Used'}`.replace(/,\s*$/, ''),
        published: true,
        body_html: description || null,
        category: categoryName || null,
        
        // Variant data from eBay listing
        variant_sku: sku || itemId || null,
        variant_price: price,
        variant_inventory_qty: quantity ? parseInt(quantity) : 1,
        variant_grams: null, // Not available in this API response
        variant_requires_shipping: true,
        variant_taxable: true,
        
        // Image data
        image_src: galleryUrl || null,
        image_position: 1,
        
        // eBay specific fields
        google_shopping_condition: condition || 'Used',
        google_shopping_gender: null,
        google_shopping_age_group: null,
        
        // Sync status
        shopify_sync_status: null, // This is an eBay product, not Shopify
        shopify_synced_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    // Update marketplace sync status
    await supabase
      .from('marketplace_sync_status')
      .upsert({
        user_id: user.id,
        marketplace: 'ebay',
        last_sync_at: new Date().toISOString(),
        products_synced: productRecords.length,
        sync_status: 'completed',
        error_message: null
      }, {
        onConflict: 'user_id,marketplace'
      });

    console.log(`eBay sync completed. Synced ${productRecords.length} products`);

    return new Response(JSON.stringify({
      success: true,
      productsSynced: productRecords.length,
      message: `Successfully synced ${productRecords.length} products from eBay`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-ebay-products:', error);
    
    // Try to update sync status with error
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
          await supabase
            .from('marketplace_sync_status')
            .upsert({
              user_id: user.id,
              marketplace: 'ebay',
              sync_status: 'failed',
              error_message: error.message,
              last_sync_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,marketplace'
            });
        }
      }
    } catch (updateError) {
      console.error('Failed to update sync status:', updateError);
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