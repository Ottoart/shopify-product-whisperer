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
    console.log('🧪 Testing UPS API with exact registered address format...');
    
    // Test the UPS rating endpoint with the exact address format
    const testRequest = {
      shipFrom: {
        name: "Ottman Oufir",
        company: "",
        address: "9200 Park ave, 301", // Exact format from UPS registration
        city: "MONTREAL", // Exact case from UPS registration
        state: "QC", // Province code
        zip: "H2N1Z4", // No space in Canadian postal code
        country: "CA",
        phone: "5551234567"
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
        orderNumber: "TEST-UPS-001",
        currency: "USD",
        items: [{
          id: "test-item-1",
          product_title: "Test Product",
          quantity: 1,
          price: 39.99,
          weight_lbs: 2.5,
          origin_country: "US",
          commodity_code: "999999"
        }]
      }
    };

    console.log('📦 Test Request Data:', JSON.stringify(testRequest, null, 2));

    // Call the UPS rating function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const response = await fetch(`${supabaseUrl}/functions/v1/ups-rating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
        'apikey': req.headers.get('apikey') || ''
      },
      body: JSON.stringify(testRequest)
    });

    const responseText = await response.text();
    console.log('📥 UPS Rating Response Status:', response.status);
    console.log('📥 UPS Rating Response:', responseText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse response:', e);
      parsedResponse = { error: 'Invalid response format', raw: responseText };
    }

    return new Response(
      JSON.stringify({
        test_successful: response.ok,
        status_code: response.status,
        response: parsedResponse,
        exact_address_used: testRequest.shipFrom,
        notes: [
          "This test uses the exact UPS registered address format",
          "Address: 9200 Park ave, 301 (not 'suite 301')",
          "Postal Code: H2N1Z4 (no space)",
          "City: MONTREAL (exact case)",
          "State: QC (province code)"
        ]
      }, null, 2),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Test error:', error);
    return new Response(
      JSON.stringify({ 
        test_successful: false,
        error: error.message,
        details: 'Test function failed to execute'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});