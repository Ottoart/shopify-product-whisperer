import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { ensureValidUPSToken } from '../_shared/ups-auth.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Request interface
interface RatingRequest {
  shipFrom: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shipTo: {
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  package: {
    weight: number;
    length?: number;
    width?: number;
    height?: number;
  };
  serviceCode?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with anon key for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });

    // Get user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError?.message || 'No user found');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const userId = user.id;
    console.log('✅ Authenticated user ID:', userId);

    // Create service role client for database operations
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData: RatingRequest = await req.json();
    console.log('📦 UPS Rating request received:', JSON.stringify(requestData, null, 2));

    // Ensure we have a valid UPS token
    console.log('🔧 Getting UPS credentials for user:', userId);
    const authResult = await ensureValidUPSToken(serviceSupabase, userId);
    if (!authResult.success) {
      console.error('❌ UPS authentication failed:', authResult.error);
      return new Response(
        JSON.stringify({ error: 'UPS authentication failed: ' + authResult.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ UPS authentication successful');
    const credentials = authResult.credentials;
    const accountNumber = credentials.account_number;

    // Validate required fields
    if (!requestData.shipFrom?.zip || !requestData.shipFrom?.country ||
        !requestData.shipTo?.zip || !requestData.shipTo?.country ||
        !requestData.package?.weight) {
      console.error('❌ Missing required fields:', requestData);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          details: {
            shipFrom: requestData.shipFrom,
            shipTo: requestData.shipTo,
            package: requestData.package
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log shipping countries for debugging
    console.log('🌍 Shipping details:');
    console.log('Ship From Country:', requestData.shipFrom.country);
    console.log('Ship To Country:', requestData.shipTo.country);
    console.log('Account Number:', accountNumber);

    if (!accountNumber) {
      console.error('❌ Missing UPS account number');
      return new Response(
        JSON.stringify({ error: 'UPS account number not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Determine environment and API endpoint
    const isProduction = credentials.environment === 'production';
    console.log('🌍 UPS Environment:', isProduction ? 'PRODUCTION' : 'SANDBOX');
    
    const ratingApiUrl = isProduction 
      ? 'https://onlinetools.ups.com/api/rating/v1/rate'
      : 'https://wwwcie.ups.com/api/rating/v1/rate';
      
    console.log('📍 Using Rating API URL:', ratingApiUrl);

    // Construct proper UPS Rating API request according to documentation
    const upsRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Shop",  // "Shop" returns all available services, "Rate" returns specific service
          TransactionReference: {
            CustomerContext: "Rating and Service Selection"
          }
        },
        Shipment: {
          Shipper: {
            Name: "Shipper",
            ShipperNumber: accountNumber,
            Address: {
              AddressLine: [requestData.shipFrom.address || ""],
              City: requestData.shipFrom.city || "",
              StateProvinceCode: requestData.shipFrom.state || "",
              PostalCode: requestData.shipFrom.zip || "",
              CountryCode: requestData.shipFrom.country || "US"
            }
          },
          ShipTo: {
            Name: "Consignee", 
            Address: {
              AddressLine: [requestData.shipTo.address || ""],
              City: requestData.shipTo.city || "",
              StateProvinceCode: requestData.shipTo.state || "",
              PostalCode: requestData.shipTo.zip || "",
              CountryCode: requestData.shipTo.country || "US"
            }
          },
          ShipFrom: {
            Name: "Ship From Location",
            Address: {
              AddressLine: [requestData.shipFrom.address || ""],
              City: requestData.shipFrom.city || "",
              StateProvinceCode: requestData.shipFrom.state || "",
              PostalCode: requestData.shipFrom.zip || "",
              CountryCode: requestData.shipFrom.country || "US"
            }
          },
          Package: [{
            PackagingType: {
              Code: "02",  // Customer Supplied Package
              Description: "Package"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches"
              },
              Length: (requestData.package.length || 12).toString(),
              Width: (requestData.package.width || 12).toString(), 
              Height: (requestData.package.height || 6).toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds"
              },
              Weight: (requestData.package.weight || 1).toString()
            }
          }]
        }
      }
    };

    console.log('📦 Final UPS API Request:', JSON.stringify(upsRequest, null, 2));

    // Prepare headers for UPS API call - CRITICAL: Proper format
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.access_token}`,
      'transId': 'PrepFox-Rating-' + Date.now(),
      'transactionSrc': 'PrepFox'
    };

    console.log('📡 Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': 'Bearer ' + credentials.access_token?.substring(0, 20) + '...',
      'transId': headers.transId,
      'transactionSrc': headers.transactionSrc
    });

    // Make the UPS API call
    console.log('🚀 Calling UPS Rating API...');
    const response = await fetch(ratingApiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(upsRequest)
    });

    console.log('📥 UPS API Response Status:', response.status);
    console.log('📥 UPS API Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📥 UPS API Response Body:', responseText);

    if (!response.ok) {
      console.error('❌ UPS API Error - Status:', response.status);
      console.error('❌ UPS API Error - Response:', responseText);
      
      let errorMessage = 'UPS API request failed';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.response?.errors?.[0]?.message) {
          errorMessage = errorData.response.errors[0].message;
        } else if (errorData.Fault?.detail?.Errors?.ErrorDetail?.PrimaryErrorCode?.Description) {
          errorMessage = errorData.Fault.detail.Errors.ErrorDetail.PrimaryErrorCode.Description;
        }
      } catch (e) {
        console.log('Could not parse error response as JSON');
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          status: response.status,
          details: responseText
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse successful response
    let rateResponse;
    try {
      rateResponse = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse UPS response as JSON:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid response format from UPS' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ UPS API Success - Parsed Response:', JSON.stringify(rateResponse, null, 2));

    // Transform UPS response to our format
    const rates = [];
    
    if (rateResponse.RateResponse?.RatedShipment) {
      const ratedShipments = Array.isArray(rateResponse.RateResponse.RatedShipment) 
        ? rateResponse.RateResponse.RatedShipment 
        : [rateResponse.RateResponse.RatedShipment];

      for (const shipment of ratedShipments) {
        const serviceCode = shipment.Service?.Code || 'UNKNOWN';
        const serviceName = getUPSServiceName(serviceCode);
        const serviceType = getUPSServiceType(serviceCode);
        const estimatedDays = getUPSEstimatedDays(serviceCode);
        
        const totalCharges = shipment.TotalCharges?.MonetaryValue || '0';
        const currency = shipment.TotalCharges?.CurrencyCode || 'USD';

        rates.push({
          carrier: 'UPS',
          service_code: serviceCode,
          service_name: serviceName,
          service_type: serviceType,
          cost: parseFloat(totalCharges),
          currency: currency,
          estimated_days: estimatedDays,
          supports_tracking: true,
          supports_insurance: true,
          supports_signature: true
        });
      }
    }

    console.log('✅ Transformed rates:', rates);

    return new Response(
      JSON.stringify({ rates }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in UPS rating:', error);
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

// Helper functions for UPS service mapping
function getUPSServiceName(code: string): string {
  const serviceNames: { [key: string]: string } = {
    '01': 'UPS Next Day Air',
    '02': 'UPS 2nd Day Air',
    '03': 'UPS Ground',
    '07': 'UPS Worldwide Express',
    '08': 'UPS Worldwide Expedited',
    '11': 'UPS Standard',
    '12': 'UPS 3 Day Select',
    '13': 'UPS Next Day Air Saver',
    '14': 'UPS Next Day Air Early A.M.',
    '54': 'UPS Worldwide Express Plus',
    '59': 'UPS 2nd Day Air A.M.',
    '65': 'UPS Saver'
  };
  return serviceNames[code] || `UPS Service ${code}`;
}

function getUPSServiceType(code: string): string {
  const expeditedCodes = ['01', '13', '14', '59'];
  const expressOvernightCodes = ['01', '13', '14'];
  const expedited2DayCodes = ['02', '59'];
  const expedited3DayCodes = ['12'];
  
  if (expressOvernightCodes.includes(code)) return 'overnight';
  if (expedited2DayCodes.includes(code)) return 'expedited';
  if (expedited3DayCodes.includes(code)) return 'expedited';
  if (expeditedCodes.includes(code)) return 'expedited';
  return 'standard';
}

function getUPSEstimatedDays(code: string): string {
  const estimatedDays: { [key: string]: string } = {
    '01': '1 business day',
    '02': '2 business days', 
    '03': '1-5 business days',
    '07': '1-3 business days',
    '08': '3-5 business days',
    '11': '1-5 business days',
    '12': '3 business days',
    '13': '1 business day',
    '14': '1 business day',
    '54': '1-2 business days',
    '59': '2 business days',
    '65': '1-3 business days'
  };
  return estimatedDays[code] || '3-5 business days';
}