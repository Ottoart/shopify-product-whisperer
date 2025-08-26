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

    const { storeUrl, accessToken, limit = 250, sinceId } = await req.json();
    
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

    console.log(`Starting customer sync for user ${user.id}`);

    // Build customers URL with comprehensive fields
    let url = `${baseUrl}/customers.json?limit=${limit}&fields=id,email,first_name,last_name,phone,accepts_marketing,accepts_marketing_updated_at,marketing_opt_in_level,orders_count,state,total_spent,last_order_id,last_order_name,note,verified_email,multipass_identifier,tax_exempt,tags,currency,created_at,updated_at,default_address`;
    
    if (sinceId) {
      url += `&since_id=${sinceId}`;
    }

    console.log('Fetching customers from:', url.substring(0, 100) + '...');

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
    const customers = data.customers || [];
    
    console.log(`Processing ${customers.length} customers for batch`);

    // Transform customers for database
    const customerRecords = customers.map(customer => {
      const defaultAddress = customer.default_address || {};
      
      return {
        user_id: user.id,
        shopify_customer_id: customer.id?.toString(),
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        accepts_marketing: customer.accepts_marketing || false,
        accepts_marketing_updated_at: customer.accepts_marketing_updated_at,
        marketing_opt_in_level: customer.marketing_opt_in_level,
        orders_count: customer.orders_count || 0,
        state: customer.state,
        total_spent: customer.total_spent ? parseFloat(customer.total_spent) : 0,
        last_order_id: customer.last_order_id?.toString(),
        last_order_name: customer.last_order_name,
        note: customer.note,
        verified_email: customer.verified_email || false,
        multipass_identifier: customer.multipass_identifier,
        tax_exempt: customer.tax_exempt || false,
        tags: customer.tags,
        currency: customer.currency || 'USD',
        created_at: customer.created_at || new Date().toISOString(),
        updated_at: customer.updated_at || new Date().toISOString(),
        
        // Default address
        default_address_first_name: defaultAddress.first_name,
        default_address_last_name: defaultAddress.last_name,
        default_address_company: defaultAddress.company,
        default_address_address1: defaultAddress.address1,
        default_address_address2: defaultAddress.address2,
        default_address_city: defaultAddress.city,
        default_address_province: defaultAddress.province,
        default_address_country: defaultAddress.country,
        default_address_zip: defaultAddress.zip,
        default_address_phone: defaultAddress.phone,
      };
    });

    // Upsert customers
    if (customerRecords.length > 0) {
      const { error: customerError } = await supabase
        .from('shopify_customers')
        .upsert(customerRecords, { 
          onConflict: 'user_id,shopify_customer_id',
          ignoreDuplicates: false 
        });

      if (customerError) {
        console.error('Customer upsert error:', customerError);
        throw new Error(`Failed to save customers: ${customerError.message}`);
      }
    }

    // Check for next page using Link header
    const linkHeader = response.headers.get('Link');
    let hasMorePages = false;
    let nextSinceId = null;
    
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]*[?&]since_id=([^&>]+)[^>]*>;\s*rel="next"/);
      if (nextMatch) {
        hasMorePages = true;
        nextSinceId = nextMatch[1];
      }
    }

    console.log(`Customer sync completed. Processed ${customers.length} customers`);

    return new Response(JSON.stringify({
      success: true,
      customersProcessed: customers.length,
      hasMorePages: hasMorePages,
      nextSinceId: nextSinceId,
      message: `Synced ${customers.length} customers`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync-shopify-customers:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});