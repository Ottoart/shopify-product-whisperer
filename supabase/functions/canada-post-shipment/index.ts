import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShipmentRequest {
  orderId: string;
  serviceCode: string;
  shipFrom: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  shipTo: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
    value?: number;
  };
  additionalServices?: {
    signatureRequired?: boolean;
    insuranceValue?: number;
    deliveryConfirmation?: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📦 Canada Post Shipment API called');
    
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

    const requestData: ShipmentRequest = await req.json();
    console.log('📦 Received shipment request:', JSON.stringify(requestData, null, 2));

    // Create service role client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Canada Post carrier configuration
    const { data: carrierConfig, error: carrierError } = await serviceSupabase
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', userId)
      .eq('carrier_name', 'Canada Post')
      .eq('is_active', true)
      .single();

    if (carrierError || !carrierConfig) {
      console.error('❌ Failed to find Canada Post carrier configuration:', carrierError);
      return new Response(
        JSON.stringify({ error: 'Canada Post carrier not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔐 Checking Canada Post authentication...');

    // Get Canada Post credentials from environment (using PrepFox managed account)
    const apiKey = Deno.env.get('CANADA_POST_DEV_API_KEY');
    const apiSecret = Deno.env.get('CANADA_POST_DEV_API_SECRET');
    const customerNumber = '2004381'; // PrepFox managed customer number

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

    console.log('🔑 Using PrepFox managed Canada Post credentials');
    console.log('🔍 Service code mapping:', `${requestData.serviceCode} -> ${mapServiceCode(requestData.serviceCode)}`);

    // Convert package details
    const weightKg = Math.max(0.1, requestData.package.weight * 0.453592); // Convert lbs to kg, minimum 0.1kg
    const lengthCm = Math.round(requestData.package.length * 2.54);
    const widthCm = Math.round(requestData.package.width * 2.54);
    const heightCm = Math.round(requestData.package.height * 2.54);

    console.log('📏 Package details:', {
      weight: `${weightKg.toFixed(3)} kg`,
      dimensions: `${lengthCm}x${widthCm}x${heightCm} cm`,
      value: requestData.package.value || 0
    });

    // Build shipment XML request
    const shipmentXml = buildShipmentXml({
      customerNumber,
      requestData,
      weightKg,
      lengthCm,
      widthCm,
      heightCm
    });

    console.log('📝 XML Request:', shipmentXml);

    // Make Canada Post shipment API call
    const shipmentUrl = 'https://ct.soa-gw.canadapost.ca/rs/ship/price';
    
    const shipmentResponse = await fetch(shipmentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.cpc.shipment-v8+xml',
        'Accept': 'application/vnd.cpc.shipment-v8+xml',
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Accept-Language': 'en-CA'
      },
      body: shipmentXml
    });

    console.log('📊 Canada Post Shipment API Response Status:', shipmentResponse.status);

    const shipmentResponseText = await shipmentResponse.text();
    console.log('📋 Canada Post Shipment API Response:', shipmentResponseText);

    if (shipmentResponse.ok) {
      // Parse the XML response to extract shipment details
      const shipmentResult = parseShipmentResponse(shipmentResponseText);
      
      if (shipmentResult.success) {
        // Store shipment record in database
        const { data: shipmentRecord, error: shipmentError } = await serviceSupabase
          .from('shipment_labels')
          .insert({
            user_id: userId,
            order_id: requestData.orderId,
            carrier: 'Canada Post',
            service_code: requestData.serviceCode,
            service_name: getServiceName(requestData.serviceCode),
            tracking_number: shipmentResult.trackingNumber,
            label_url: shipmentResult.labelUrl,
            cost: shipmentResult.cost,
            currency: 'CAD',
            shipment_id: shipmentResult.shipmentId,
            label_format: 'PDF',
            status: 'created'
          })
          .select()
          .single();

        if (shipmentError) {
          console.error('❌ Failed to store shipment record:', shipmentError);
        }

        console.log('✅ Canada Post shipment created successfully');

        return new Response(
          JSON.stringify({
            success: true,
            shipment: {
              id: shipmentResult.shipmentId,
              tracking_number: shipmentResult.trackingNumber,
              label_url: shipmentResult.labelUrl,
              cost: shipmentResult.cost,
              currency: 'CAD',
              carrier: 'Canada Post',
              service_name: getServiceName(requestData.serviceCode),
              estimated_delivery: shipmentResult.estimatedDelivery
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        console.error('❌ Failed to parse Canada Post shipment response');
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create shipment', 
            details: shipmentResult.error 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    } else {
      console.error('❌ Canada Post Shipment API Error:', shipmentResponse.status, shipmentResponseText);
      
      // Try to parse error response
      let errorMessage = 'Failed to create Canada Post shipment';
      try {
        if (shipmentResponseText.includes('<description>')) {
          const descMatch = shipmentResponseText.match(/<description>(.*?)<\/description>/);
          if (descMatch) {
            errorMessage = descMatch[1];
          }
        }
      } catch (e) {
        console.error('❌ Could not parse Canada Post error response');
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: `Status: ${shipmentResponse.status}`,
          raw_response: shipmentResponseText
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

function mapServiceCode(serviceCode: string): string {
  // Map our service codes to Canada Post service codes
  const mapping: { [key: string]: string } = {
    'USA.SP.AIR': 'USA.SP.AIR',
    'USA.TP': 'USA.TP', 
    'USA.EP': 'USA.EP',
    'USA.XP': 'USA.XP'
  };
  return mapping[serviceCode] || serviceCode;
}

function getServiceName(serviceCode: string): string {
  const names: { [key: string]: string } = {
    'USA.SP.AIR': 'Small Packet - USA Air',
    'USA.TP': 'Tracked Packet - USA',
    'USA.EP': 'Expedited Parcel - USA', 
    'USA.XP': 'Xpresspost - USA'
  };
  return names[serviceCode] || serviceCode;
}

function buildShipmentXml({
  customerNumber,
  requestData,
  weightKg,
  lengthCm,
  widthCm,
  heightCm
}: {
  customerNumber: string;
  requestData: ShipmentRequest;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}): string {
  const mappedServiceCode = mapServiceCode(requestData.serviceCode);
  
  return `<?xml version="1.0" encoding="utf-8"?>
<shipment xmlns="http://www.canadapost.ca/ws/shipment-v8">
  <group-id>PrepFox-${Date.now()}</group-id>
  <requested-shipping-point>${requestData.shipFrom.zip}</requested-shipping-point>
  <delivery-spec>
    <service-code>${mappedServiceCode}</service-code>
    <sender>
      <name>${escapeXml(requestData.shipFrom.name)}</name>
      <company>${escapeXml(requestData.shipFrom.company || '')}</company>
      <contact-phone>${escapeXml(requestData.shipFrom.phone || '514-555-0123')}</contact-phone>
      <address-details>
        <address-line-1>${escapeXml(requestData.shipFrom.address)}</address-line-1>
        <city>${escapeXml(requestData.shipFrom.city)}</city>
        <prov-state>${escapeXml(requestData.shipFrom.state)}</prov-state>
        <country-code>${requestData.shipFrom.country}</country-code>
        <postal-zip-code>${requestData.shipFrom.zip}</postal-zip-code>
      </address-details>
    </sender>
    <destination>
      <name>${escapeXml(requestData.shipTo.name)}</name>
      <company>${escapeXml(requestData.shipTo.company || '')}</company>
      <address-details>
        <address-line-1>${escapeXml(requestData.shipTo.address)}</address-line-1>
        <city>${escapeXml(requestData.shipTo.city)}</city>
        <prov-state>${escapeXml(requestData.shipTo.state)}</prov-state>
        <country-code>${requestData.shipTo.country}</country-code>
        <postal-zip-code>${requestData.shipTo.zip}</postal-zip-code>
      </address-details>
    </destination>
    <options>
      <option>
        <option-code>COV</option-code>
        <option-amount>${(requestData.package.value || 100).toFixed(2)}</option-amount>
      </option>
    </options>
    <parcel-characteristics>
      <weight>${weightKg.toFixed(3)}</weight>
      <dimensions>
        <length>${lengthCm.toFixed(1)}</length>
        <width>${widthCm.toFixed(1)}</width>
        <height>${heightCm.toFixed(1)}</height>
      </dimensions>
    </parcel-characteristics>
    <notification>
      <email>noreply@prepfox.com</email>
      <on-shipment>true</on-shipment>
      <on-exception>true</on-exception>
      <on-delivery>true</on-delivery>
    </notification>
    <print-preferences>
      <output-format>8.5x11</output-format>
      <encoding>PDF</encoding>
    </print-preferences>
    <preferences>
      <show-packing-instructions>true</show-packing-instructions>
      <show-postage-rate>false</show-postage-rate>
      <show-insured-value>true</show-insured-value>
    </preferences>
    <settlement-info>
      <contract-id>2004381</contract-id>
      <intended-method-of-payment>Account</intended-method-of-payment>
    </settlement-info>
  </delivery-spec>
</shipment>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseShipmentResponse(xmlResponse: string): {
  success: boolean;
  shipmentId?: string;
  trackingNumber?: string;
  labelUrl?: string;
  cost?: number;
  estimatedDelivery?: string;
  error?: string;
} {
  try {
    // Extract key information from XML response
    const shipmentIdMatch = xmlResponse.match(/<shipment-id>(.*?)<\/shipment-id>/);
    const trackingNumberMatch = xmlResponse.match(/<tracking-pin>(.*?)<\/tracking-pin>/);
    const labelUrlMatch = xmlResponse.match(/<artifact-id>(.*?)<\/artifact-id>/);
    const costMatch = xmlResponse.match(/<due>(.*?)<\/due>/);
    
    if (shipmentIdMatch && trackingNumberMatch) {
      return {
        success: true,
        shipmentId: shipmentIdMatch[1],
        trackingNumber: trackingNumberMatch[1],
        labelUrl: labelUrlMatch ? `https://ct.soa-gw.canadapost.ca/rs/artifact/${labelUrlMatch[1]}/0` : undefined,
        cost: costMatch ? parseFloat(costMatch[1]) : undefined,
        estimatedDelivery: undefined // Canada Post doesn't provide this in shipment response
      };
    } else {
      // Check for error messages
      const errorMatch = xmlResponse.match(/<description>(.*?)<\/description>/);
      return {
        success: false,
        error: errorMatch ? errorMatch[1] : 'Unknown error in shipment creation'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse response: ${error.message}`
    };
  }
}