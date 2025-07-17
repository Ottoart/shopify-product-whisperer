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

    let body;
    try {
      body = await req.json();
    } catch (e) {
      body = {};
    }

    // Direct credentials validation if provided
    const directCredentials = body.credentials;

    let credentials;
    let accountNumber;
    
    if (directCredentials) {
      // Use provided credentials for direct validation
      console.log('🔍 Using directly provided credentials for validation');
      credentials = directCredentials;
      accountNumber = body.accountNumber || 'TEST';
    } else {
      // Get UPS credentials from database
      console.log('🔍 Fetching UPS credentials from database');
      const { data: carrierConfig, error: configError } = await supabase
        .from('carrier_configurations')
        .select('api_credentials, account_number')
        .eq('user_id', user.id)
        .eq('carrier_name', 'UPS')
        .eq('is_active', true)
        .maybeSingle();

      if (configError || !carrierConfig) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'UPS not configured', 
            details: configError 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      credentials = carrierConfig.api_credentials;
      accountNumber = carrierConfig.account_number;
    }

    // Check for required credentials
    if (!credentials.client_id || !credentials.client_secret) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid UPS credentials', 
          details: 'Missing client_id or client_secret' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 Testing credentials with OAuth token acquisition');
    console.log('🔍 Client ID:', credentials.client_id);
    console.log('🔍 Has client secret:', !!credentials.client_secret);
    console.log('🔍 Environment:', credentials.environment || 'sandbox');

    // Determine environment based on credentials
    const isProduction = credentials.environment === 'production';
    const tokenUrl = isProduction 
      ? 'https://onlinetools.ups.com/security/v1/oauth/token'
      : 'https://wwwcie.ups.com/security/v1/oauth/token';

    console.log('🔍 Using token URL:', tokenUrl);
    
    // Prepare token request
    const tokenBody = new URLSearchParams({
      grant_type: 'client_credentials'
    });
    
    const authString = btoa(`${credentials.client_id}:${credentials.client_secret}`);
    
    // First test: Get OAuth token
    console.log('🔍 Step 1: Testing OAuth token acquisition');
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
        'Accept': 'application/json'
      },
      body: tokenBody.toString()
    });

    const tokenResponseText = await tokenResponse.text();
    console.log('🔍 Token response status:', tokenResponse.status);
    console.log('🔍 Token response:', tokenResponseText);
    
    if (!tokenResponse.ok) {
      let errorDetails;
      try {
        errorDetails = JSON.parse(tokenResponseText);
      } catch (e) {
        errorDetails = { raw: tokenResponseText };
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to authenticate with UPS', 
          step: 'oauth',
          status: tokenResponse.status,
          details: errorDetails
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    let tokenData;
    try {
      tokenData = JSON.parse(tokenResponseText);
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid response from UPS OAuth service', 
          details: tokenResponseText
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No access token returned from UPS', 
          details: tokenData
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('✅ Successfully obtained OAuth token');
    
    // Second test: Simple rating API call
    console.log('🔍 Step 2: Testing UPS Rating API with token');
    
    // Use a simpler test shipment that works with UPS sandbox
    const testRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "test-validation"
          }
        },
        Shipment: {
          Shipper: {
            Name: "Test Shipper",
            ShipperNumber: accountNumber || "",
            Address: {
              AddressLine: ["123 Main St"],
              City: "New York",
              StateProvinceCode: "NY",
              PostalCode: "10001",
              CountryCode: "US"
            }
          },
          ShipTo: {
            Name: "Test Recipient", 
            Address: {
              AddressLine: ["456 Test Ave"],
              City: "Los Angeles",
              StateProvinceCode: "CA",
              PostalCode: "90210",
              CountryCode: "US"
            }
          },
          ShipFrom: {
            Name: "Test Sender",
            Address: {
              AddressLine: ["123 Main St"],
              City: "New York", 
              StateProvinceCode: "NY",
              PostalCode: "10001",
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
              Weight: "1.0"
            }
          }]
        }
      }
    };

    // Define correct base URL
    const baseUrl = isProduction 
      ? 'https://onlinetools.ups.com' 
      : 'https://wwwcie.ups.com';
    
    // Important: Testing with API version v1 which is common across both environments
    const apiUrl = `${baseUrl}/api/rating/v1/rate`;
    console.log('🔍 Using API URL:', apiUrl);
    
    // Make the test request
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'transactionSrc': 'validate-ups-credentials-test',
        'transId': crypto.randomUUID()
      },
      body: JSON.stringify(testRequest)
    });
    
    const apiResponseText = await apiResponse.text();
    console.log('🔍 API response status:', apiResponse.status);
    console.log('🔍 API response:', apiResponseText);
    
    let apiResponseData;
    try {
      apiResponseData = JSON.parse(apiResponseText);
    } catch (e) {
      apiResponseData = { raw: apiResponseText };
    }

    // Update credentials if using saved ones
    if (!directCredentials) {
      try {
        // Calculate new expiration time
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (tokenData.expires_in * 1000));
        
        // Update credentials with new token
        const updatedCredentials = {
          ...credentials,
          access_token: accessToken,
          token_expires_at: expiresAt.toISOString(),
          refresh_token: tokenData.refresh_token || credentials.refresh_token || null
        };
        
        // Save to database
        const { error: updateError } = await supabase
          .from('carrier_configurations')
          .update({ 
            api_credentials: updatedCredentials,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('carrier_name', 'UPS')
          .eq('is_active', true);
          
        if (updateError) {
          console.error('Failed to update credentials:', updateError);
        } else {
          console.log('✅ Successfully updated credentials with new token');
        }
      } catch (error) {
        console.error('Error updating credentials:', error);
      }
    }
    
    // Return comprehensive validation results - OAuth success is enough for validation
    const isValidCredentials = apiResponse.ok || (apiResponse.status === 401 && apiResponseData?.response?.errors?.[0]?.code === '250002');
    
    return new Response(
      JSON.stringify({
        success: true, // OAuth worked, so credentials are valid
        accountNumber: accountNumber,
        environment: credentials.environment || 'sandbox',
        oauth: {
          success: true,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type
        },
        api: {
          success: apiResponse.ok,
          status: apiResponse.status,
          response: apiResponseData,
          note: apiResponse.ok ? 'Rating API test successful' : 'OAuth successful - Rating API may need valid account setup'
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('🔍 Validation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Validation failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});