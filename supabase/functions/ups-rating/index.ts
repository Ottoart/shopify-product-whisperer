import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { ensureValidUPSTokenForRating } from '../_shared/ups-auth.ts'

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
    console.log('🎯 UPS Rating Function Called');
    console.log('📋 Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Extract JWT token and get user ID directly
    const authHeader = req.headers.get('Authorization');
    console.log('🔑 Auth header received:', authHeader ? 'YES' : 'NO');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract user ID from JWT token directly
    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      console.log('🔍 JWT token first 50 chars:', token.substring(0, 50));
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔍 JWT payload keys:', Object.keys(payload));
      console.log('🔍 JWT payload sub:', payload.sub);
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
      console.log('✅ Extracted user ID from JWT:', userId);
    } catch (jwtError) {
      console.error('❌ Failed to extract user from JWT:', jwtError);
      console.error('❌ JWT Error details:', JSON.stringify(jwtError, null, 2));
      return new Response(
        JSON.stringify({ error: 'invalid claim: missing sub claim' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData: RatingRequest = await req.json();
    console.log('📦 UPS Rating request received:', JSON.stringify(requestData, null, 2));

    // Create service role client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ensure we have a valid UPS token
    console.log('🔧 Getting UPS credentials for user:', userId);
    const authResult = await ensureValidUPSTokenForRating(serviceSupabase, userId);
    
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

    return await processUPSRating(requestData, credentials, accountNumber);

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

async function processUPSRating(requestData: RatingRequest, credentials: any, accountNumber: string) {
    // Validate required fields
    if (!requestData.shipFrom?.zip || !requestData.shipFrom?.country ||
        !requestData.shipTo?.zip || !requestData.shipTo?.country ||
        !requestData.package?.weight) {
      console.error('❌ Missing required fields:', requestData);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required shipping information', 
          details: 'Please ensure you have provided complete shipping addresses and package weight'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate account configuration
    if (!accountNumber) {
      console.error('❌ Missing UPS account number');
      return new Response(
        JSON.stringify({ 
          error: 'UPS account not configured properly', 
          details: 'Please contact support to configure your UPS account settings'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for required account details from carrier configuration
    const accountPostalCode = credentials.postal_code;
    const accountCountryCode = credentials.country_code;
    
    if (!accountPostalCode || !accountCountryCode) {
      console.error('❌ Missing UPS account address details:', {
        hasPostalCode: Boolean(accountPostalCode),
        hasCountryCode: Boolean(accountCountryCode)
      });
      return new Response(
        JSON.stringify({ 
          error: 'UPS account address not configured', 
          details: 'Please configure your UPS account postal code and country in carrier settings'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log shipping details for debugging
    console.log('🌍 Shipping details:');
    console.log('Ship From Country:', requestData.shipFrom.country);
    console.log('Ship To Country:', requestData.shipTo.country);
    console.log('Account Number:', accountNumber);
    console.log('Account Postal Code:', accountPostalCode);
    console.log('Account Country:', accountCountryCode);
    console.log('Negotiated Rates Enabled:', credentials.enable_negotiated_rates);

    // Force sandbox environment for consistency with token endpoint
    const ratingApiUrl = 'https://wwwcie.ups.com/api/rating/v1/rate';
    console.log('📍 Using Rating API URL (SANDBOX):', ratingApiUrl);

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

    // Add negotiated rates if enabled in carrier configuration
    if (credentials.enable_negotiated_rates) {
      console.log('✅ Adding negotiated rates indicator');
      upsRequest.RateRequest.Shipment['RateInformation'] = {
        NegotiatedRatesIndicator: ''
      };
    }

    console.log('📦 Final UPS API Request:', JSON.stringify(upsRequest, null, 2));

    // Prepare headers for UPS API call - CRITICAL: Proper format per UPS documentation
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.access_token}`,
      'transId': 'PrepFox-Rating-' + Date.now(),
      'transactionSrc': 'PrepFox',
      'Accept': 'application/json'
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
        
        // Use negotiated rates if available and enabled, otherwise use published rates
        const totalCharges = (credentials.enable_negotiated_rates && shipment.NegotiatedRateCharges) 
          ? shipment.NegotiatedRateCharges.TotalCharge.MonetaryValue 
          : shipment.TotalCharges?.MonetaryValue || '0';
        
        const currency = shipment.TotalCharges?.CurrencyCode || 'USD';

        console.log(`📊 Rate for ${serviceName}: ${totalCharges} ${currency} ${credentials.enable_negotiated_rates && shipment.NegotiatedRateCharges ? '(Negotiated)' : '(Published)'}`);

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
}

// Helper functions for UPS service mapping
function getUPSServiceName(code: string): string {
  const serviceNames: { [key: string]: string } = {
    // International services for Canada to US
    '07': 'UPS Worldwide Express',
    '08': 'UPS Worldwide Expedited', 
    '11': 'UPS Standard',
    '54': 'UPS Worldwide Express Plus',
    '65': 'UPS Worldwide Saver',
    // Domestic US services (may work for some shipments)
    '01': 'UPS Next Day Air',
    '02': 'UPS 2nd Day Air',
    '03': 'UPS Ground',
    '12': 'UPS 3 Day Select',
    '13': 'UPS Next Day Air Saver',
    '14': 'UPS Next Day Air Early A.M.',
    '59': 'UPS 2nd Day Air A.M.'
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