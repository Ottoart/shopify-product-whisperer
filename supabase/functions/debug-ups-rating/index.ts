import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Testing UPS integration with debug mode...');
    
    // Test simple UPS call with current address
    const testRequest = {
      shipFrom: {
        name: "Ottman Oufir",
        company: "",
        address: "9200 Park ave, 301", // Use exact address from database
        city: "MONTREAL",
        state: "QC",
        zip: "H2N1Z4",
        country: "CA",
        phone: "5146194443"
      },
      shipTo: {
        name: "Test Customer",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
        phone: "5551234567"
      },
      package: {
        weight: 2.5,
        length: 12,
        width: 8,
        height: 4,
        value: 39.99
      },
      order: {
        orderNumber: "DEBUG-TEST-001",
        currency: "USD",
        items: [{
          id: "test-item",
          product_title: "Test Product",
          quantity: 1,
          price: 39.99,
          weight_lbs: 2.5,
          origin_country: "US",
          commodity_code: "999999"
        }]
      }
    };

    console.log('📦 Test Request:', JSON.stringify(testRequest, null, 2));

    // Call UPS rating function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey');

    console.log('🔑 Auth header present:', !!authHeader);
    console.log('🔑 API key present:', !!apiKey);

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const startTime = Date.now();
    const response = await fetch(`${supabaseUrl}/functions/v1/ups-rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'apikey': apiKey || ''
      },
      body: JSON.stringify(testRequest)
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const responseText = await response.text();
    
    console.log(`⏱️ UPS Rating Response Time: ${responseTime}ms`);
    console.log('📥 UPS Rating Response Status:', response.status);
    console.log('📥 UPS Rating Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('📥 UPS Rating Response Body:', responseText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse response as JSON:', e);
      parsedResponse = { 
        error: 'Invalid response format', 
        raw: responseText,
        parseError: e.message 
      };
    }

    return new Response(
      JSON.stringify({
        debug_test: true,
        request_sent: testRequest,
        response_status: response.status,
        response_time_ms: responseTime,
        response_headers: Object.fromEntries(response.headers.entries()),
        response_body: parsedResponse,
        success: response.ok,
        timestamp: new Date().toISOString(),
        notes: [
          "This is a debug test for UPS rating",
          "Using standardized Canadian address format",
          "Check response for any UPS API errors"
        ]
      }, null, 2),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Debug test error:', error);
    return new Response(
      JSON.stringify({ 
        debug_test: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});