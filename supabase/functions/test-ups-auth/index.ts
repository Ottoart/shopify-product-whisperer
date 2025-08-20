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

    console.log("supabase----------------",supabase)
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

    // Import and use the UPS auth helper to ensure we have a valid token
    const { ensureValidUPSToken } = await import('../_shared/ups-auth.ts');
    
    console.log('🔍 Ensuring valid UPS token before testing...');
    const tokenResult = await ensureValidUPSToken(supabase, user.id);
    
    if (!tokenResult.success) {
      console.error('🔍 Failed to get valid UPS token:', tokenResult.error);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to authenticate with UPS',
          details: tokenResult.error 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const credentials = tokenResult.credentials;
    const accountNumber = credentials.account_number;

    console.log('🔍 Testing UPS authentication...');
    console.log('🔍 Account number:', accountNumber);
    console.log('🔍 Client ID:', credentials.client_id);
    console.log('🔍 Token expires at:', credentials.token_expires_at);
    console.log('🔍 Current time:', new Date().toISOString());

    // Test UPS API with a simple rating request using current v2409 format
    const testRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "prepfox-auth-test"
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
          }],
          Service: {
            Code: "03"
          }
        }
      }
    };

    console.log('🔍 Testing with simple rating request...');
    
    // Determine environment based on credentials or default to sandbox
    const environment = credentials.environment || 'sandbox';
    const baseUrl = environment === 'production' 
      ? 'https://onlinetools.ups.com' 
      : 'https://wwwcie.ups.com';
    
    console.log('🔍 Using environment:', environment);
    console.log('🔍 Base URL:', baseUrl);
    
    const upsResponse = await fetch(`${baseUrl}/api/rating/v1/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.access_token}`,
        'transId': crypto.randomUUID(),
        'transactionSrc': 'prepfox-auth-test'
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