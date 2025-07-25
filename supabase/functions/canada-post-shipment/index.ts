import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Canada Post Shipment Function Called');
    
    // Extract JWT token and get user ID
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      if (!userId) throw new Error('No user ID in token');
      console.log('✅ User authenticated:', userId);
    } catch (jwtError) {
      console.error('❌ Failed to extract user from JWT:', jwtError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData = await req.json();
    console.log('📦 Canada Post Shipment request:', JSON.stringify(requestData, null, 2));

    const { orderId, serviceCode, shipFrom, shipTo, package: packageDetails, additionalServices = {} } = requestData;

    // Validate required fields
    if (!orderId || !serviceCode || !shipFrom || !shipTo || !packageDetails) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Canada Post API credentials
    const apiKey = Deno.env.get('CANADA_POST_DEV_API_KEY');
    const apiSecret = Deno.env.get('CANADA_POST_DEV_API_SECRET');
    const customerId = Deno.env.get('CANADA_POST_CUSTOMER_ID') || '2004381';

    if (!apiKey || !apiSecret) {
      console.error('❌ Canada Post API credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Canada Post API credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create service role client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📡 Calling Canada Post Shipment API with service code:', serviceCode);

    // Call Canada Post Shipment API
    const canadaPostUrl = `https://ct.soa-gw.canadapost.ca/rs/${customerId}/${shipFrom.zip}/shipment`;
    
    const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<shipment xmlns="http://www.canadapost.ca/ws/shipment-v8">
  <requested-shipping-point>${shipFrom.zip}</requested-shipping-point>
  <delivery-spec>
    <service-code>${serviceCode}</service-code>
    <sender>
      <name>${shipFrom.name || 'Shipper'}</name>
      <company>${shipFrom.company || ''}</company>
      <contact-phone>${shipFrom.phone || '514-555-0123'}</contact-phone>
      <address-details>
        <address-line-1>${shipFrom.address}</address-line-1>
        <city>${shipFrom.city}</city>
        <prov-state>${shipFrom.state}</prov-state>
        <country-code>${shipFrom.country}</country-code>
        <postal-zip-code>${shipFrom.zip}</postal-zip-code>
      </address-details>
    </sender>
    <destination>
      <name>${shipTo.name || 'Recipient'}</name>
      <company>${shipTo.company || ''}</company>
      <address-details>
        <address-line-1>${shipTo.address}</address-line-1>
        <city>${shipTo.city}</city>
        <prov-state>${shipTo.state}</prov-state>
        <country-code>${shipTo.country}</country-code>
        <postal-zip-code>${shipTo.zip}</postal-zip-code>
      </address-details>
    </destination>
    <parcel-characteristics>
      <weight>${packageDetails.weight}</weight>
      <dimensions>
        <length>${packageDetails.length}</length>
        <width>${packageDetails.width}</width>
        <height>${packageDetails.height}</height>
      </dimensions>
    </parcel-characteristics>
  </delivery-spec>
</shipment>`;

    console.log('📄 XML Request Body:', xmlBody);
    
    const shipmentResponse = await fetch(canadaPostUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Accept': 'application/vnd.cpc.shipment-v8+xml',
        'Content-Type': 'application/vnd.cpc.shipment-v8+xml',
        'Accept-language': 'en-CA'
      },
      body: xmlBody
    });

    console.log('📊 Canada Post Shipment API Response Status:', shipmentResponse.status);
    
    const responseText = await shipmentResponse.text();
    console.log('📄 Canada Post Shipment Response:', responseText);
    
    if (!shipmentResponse.ok) {
      console.error('❌ Canada Post Shipment API Error:', responseText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Canada Post shipment creation failed',
          details: `Status: ${shipmentResponse.status}`,
          raw_response: responseText
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse XML response to extract tracking number and label URL
    const trackingMatch = responseText.match(/<tracking-pin>([^<]+)<\/tracking-pin>/);
    const labelMatch = responseText.match(/<artifact[^>]*href="([^"]+)"/);
    
    if (!trackingMatch || !labelMatch) {
      console.error('❌ Failed to parse Canada Post response');
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse Canada Post response',
          raw_response: responseText
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const trackingNumber = trackingMatch[1];
    const labelUrl = labelMatch[1];

    console.log('📋 Extracted data:', { trackingNumber, labelUrl });

    // Store label in database
    const { data: labelData, error: labelError } = await serviceSupabase
      .from('shipment_labels')
      .insert({
        user_id: userId,
        order_id: orderId,
        carrier: 'Canada Post',
        service_code: serviceCode,
        tracking_number: trackingNumber,
        label_url: labelUrl,
        shipment_cost: packageDetails.value || 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (labelError) {
      console.error('❌ Database error:', labelError);
      return new Response(
        JSON.stringify({ error: 'Failed to store label data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update order with shipping information
    await serviceSupabase
      .from('orders')
      .update({
        carrier: 'Canada Post',
        service_type: serviceCode,
        tracking_number: trackingNumber,
        label_url: labelUrl,
        status: 'shipped',
        shipped_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    console.log('✅ Canada Post shipment created successfully');

    return new Response(
      JSON.stringify({
        shipment: {
          tracking_number: trackingNumber,
          label_url: labelUrl,
          label_id: labelData.id,
          carrier: 'Canada Post',
          service_code: serviceCode
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in Canada Post shipment:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});