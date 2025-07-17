import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get UPS carrier configuration
    const { data: carrierConfig, error: configError } = await supabase
      .from('carrier_configurations')
      .select('api_credentials, account_number')
      .eq('user_id', user.id)
      .eq('carrier_name', 'UPS')
      .eq('is_active', true)
      .single();

    if (configError || !carrierConfig) {
      return new Response(
        JSON.stringify({ error: 'UPS not configured', details: configError }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const credentials = carrierConfig.api_credentials as any;
    const accountNumber = carrierConfig.account_number;

    console.log('🔍 Testing UPS authentication...');
    console.log('🔍 Account number:', accountNumber);
    console.log('🔍 Client ID:', credentials.client_id);
    console.log('🔍 Token expires at:', credentials.token_expires_at);
    console.log('🔍 Current time:', new Date().toISOString());

    // Test UPS API with a simple rating request
    const testRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "Auth Test"
          }
        },
        Shipment: {
          Shipper: {
            ShipperNumber: accountNumber,
            Address: {
              PostalCode: "12345",
              CountryCode: "US"
            }
          },
          ShipTo: {
            Address: {
              PostalCode: "90210",
              CountryCode: "US"
            }
          },
          ShipFrom: {
            Address: {
              PostalCode: "12345",
              CountryCode: "US"
            }
          },
          Package: [{
            PackagingType: {
              Code: "02"
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS"
              },
              Weight: "1"
            }
          }]
        }
      }
    };

    console.log('🔍 Testing with simple rating request...');
    
    const upsResponse = await fetch('https://onlinetools.ups.com/api/rating/v1/rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.access_token}`,
        'transId': crypto.randomUUID(),
        'transactionSrc': 'test'
      },
      body: JSON.stringify(testRequest)
    });

    const responseText = await upsResponse.text();
    console.log('🔍 UPS Response Status:', upsResponse.status);
    console.log('🔍 UPS Response Headers:', Object.fromEntries(upsResponse.headers.entries()));
    console.log('🔍 UPS Response Body:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    return new Response(
      JSON.stringify({
        success: upsResponse.ok,
        status: upsResponse.status,
        accountNumber,
        clientId: credentials.client_id,
        tokenExpiresAt: credentials.token_expires_at,
        response: responseData
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('🔍 Test error:', error);
    return new Response(
      JSON.stringify({ error: 'Test failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});