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

    const { storeUrl, accessToken, inventoryItemIds, locationIds } = await req.json();
    
    if (!storeUrl || !accessToken) {
      throw new Error('Store URL and access token are required');
    }

    // Clean and prepare access token
    let cleanAccessToken = accessToken.toString().trim();
    try {
      const parsed = JSON.parse(cleanAccessToken);
      if (parsed.access_token) {
        cleanAccessToken = parsed.access_token;
      }
    } catch (e) {
      // Not JSON, continue with string cleaning
    }
    
    cleanAccessToken = cleanAccessToken
      .replace(/[\s\n\r\t\u2028\u2029]/g, '')
      .split(/\s+/)[0]
      .replace(/[^\w-]/g, '');
    
    const shpatMatch = cleanAccessToken.match(/shpat_[a-zA-Z0-9]+/);
    if (shpatMatch) {
      cleanAccessToken = shpatMatch[0];
    }
    
    if (!cleanAccessToken.startsWith('shpat_')) {
      throw new Error('Invalid Shopify access token format');
    }

    // Clean domain
    let shopifyDomain = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (shopifyDomain.includes('_')) {
      shopifyDomain = shopifyDomain.split('_')[0];
    }
    const baseUrl = `https://${shopifyDomain}/admin/api/2023-10`;

    console.log(`Starting inventory sync for user ${user.id}`);

    // First, get all locations if not provided
    let locations = [];
    if (!locationIds || locationIds.length === 0) {
      console.log('Fetching all locations...');
      const locationsResponse = await fetch(`${baseUrl}/locations.json`, {
        headers: {
          'X-Shopify-Access-Token': cleanAccessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
      });

      if (!locationsResponse.ok) {
        throw new Error(`Failed to fetch locations: ${locationsResponse.status}`);
      }

      const locationsData = await locationsResponse.json();
      locations = locationsData.locations || [];
    } else {
      // Use provided location IDs
      locations = locationIds.map(id => ({ id }));
    }

    // Get inventory items if not provided (from products)
    let inventoryItems = [];
    if (!inventoryItemIds || inventoryItemIds.length === 0) {
      console.log('Fetching inventory items from products...');
      
      // Get products with variants to extract inventory item IDs
      const productsResponse = await fetch(`${baseUrl}/products.json?limit=250&fields=id,variants`, {
        headers: {
          'X-Shopify-Access-Token': cleanAccessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const products = productsData.products || [];
        
        for (const product of products) {
          if (product.variants) {
            for (const variant of product.variants) {
              if (variant.inventory_item_id) {
                inventoryItems.push({ id: variant.inventory_item_id });
              }
            }
          }
        }
      }
    } else {
      inventoryItems = inventoryItemIds.map(id => ({ id }));
    }

    console.log(`Found ${locations.length} locations and ${inventoryItems.length} inventory items`);

    const allInventoryRecords = [];

    // Process inventory levels for each location
    for (const location of locations) {
      if (!location.id) continue;

      const locationName = location.name || `Location ${location.id}`;
      console.log(`Processing inventory for location: ${locationName}`);

      // Fetch inventory levels for this location
      const inventoryUrl = `${baseUrl}/inventory_levels.json?location_ids=${location.id}&limit=250`;
      
      const inventoryResponse = await fetch(inventoryUrl, {
        headers: {
          'X-Shopify-Access-Token': cleanAccessToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0'
        },
      });

      if (!inventoryResponse.ok) {
        console.warn(`Failed to fetch inventory for location ${location.id}: ${inventoryResponse.status}`);
        continue;
      }

      const inventoryData = await inventoryResponse.json();
      const inventoryLevels = inventoryData.inventory_levels || [];

      for (const level of inventoryLevels) {
        const inventoryRecord = {
          user_id: user.id,
          shopify_inventory_item_id: level.inventory_item_id?.toString(),
          shopify_location_id: level.location_id?.toString(),
          location_name: locationName,
          available: level.available || 0,
          committed: level.committed || 0,
          incoming: level.incoming || 0,
          on_hand: level.on_hand || 0,
          reserved: level.reserved || 0,
          damaged: level.damaged || 0,
          quality_control: level.quality_control || 0,
          safety_stock: level.safety_stock || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        allInventoryRecords.push(inventoryRecord);
      }

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Upsert inventory records
    if (allInventoryRecords.length > 0) {
      console.log(`Upserting ${allInventoryRecords.length} inventory records...`);
      
      const { error: inventoryError } = await supabase
        .from('shopify_inventory')
        .upsert(allInventoryRecords, { 
          onConflict: 'user_id,shopify_inventory_item_id,shopify_location_id',
          ignoreDuplicates: false 
        });

      if (inventoryError) {
        console.error('Inventory upsert error:', inventoryError);
        throw new Error(`Failed to save inventory: ${inventoryError.message}`);
      }
    }

    console.log(`Inventory sync completed. Processed ${allInventoryRecords.length} inventory records`);

    return new Response(JSON.stringify({
      success: true,
      inventoryRecordsProcessed: allInventoryRecords.length,
      locationsProcessed: locations.length,
      message: `Synced ${allInventoryRecords.length} inventory records across ${locations.length} locations`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-shopify-inventory:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});