import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 UPS Diagnostic Test Started');
    
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test the exact same call that calculate-shipping-rates makes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const testRequest = {
      shipFrom: {
        name: "Ottman Oufir",
        company: "",
        address: "9200 Park ave, 301",
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
        orderNumber: "DIAG-TEST-001",
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

    console.log('📦 Making UPS rating call...');
    const startTime = Date.now();

    const { data, error } = await supabase.functions.invoke('ups-rating', {
      body: testRequest,
      headers: {
        'Authorization': authHeader
      }
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`⏱️ UPS function completed in ${responseTime}ms`);
    console.log('📥 UPS Data:', JSON.stringify(data, null, 2));
    console.log('❌ UPS Error:', JSON.stringify(error, null, 2));

    // Also test the calculate-shipping-rates function
    console.log('📦 Testing calculate-shipping-rates function...');
    const calcStartTime = Date.now();
    
    const rateRequest = {
      order_id: "test-order",
      ship_from: testRequest.shipFrom,
      package: testRequest.package,
      service_preferences: ["ground", "expedited", "overnight"],
      additional_services: {
        signature_required: false,
        insurance_value: 0
      }
    };

    const { data: calcData, error: calcError } = await supabase.functions.invoke('calculate-shipping-rates', {
      body: rateRequest,
      headers: {
        'Authorization': authHeader
      }
    });

    const calcEndTime = Date.now();
    const calcResponseTime = calcEndTime - calcStartTime;

    console.log(`⏱️ Calculate rates completed in ${calcResponseTime}ms`);
    console.log('📥 Calc Data:', JSON.stringify(calcData, null, 2));
    console.log('❌ Calc Error:', JSON.stringify(calcError, null, 2));

    return new Response(
      JSON.stringify({
        diagnostic_test: true,
        timestamp: new Date().toISOString(),
        ups_direct_test: {
          response_time_ms: responseTime,
          data: data,
          error: error,
          request: testRequest
        },
        calculate_rates_test: {
          response_time_ms: calcResponseTime,
          data: calcData,
          error: calcError,
          request: rateRequest
        },
        summary: {
          ups_direct_success: !error && !!data,
          ups_direct_has_rates: !error && !!data && Array.isArray(data.rates) && data.rates.length > 0,
          calc_rates_success: !calcError && !!calcData,
          calc_rates_has_rates: !calcError && !!calcData && Array.isArray(calcData.rates) && calcData.rates.length > 0
        }
      }, null, 2),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Diagnostic test error:', error);
    return new Response(
      JSON.stringify({ 
        diagnostic_test: false,
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