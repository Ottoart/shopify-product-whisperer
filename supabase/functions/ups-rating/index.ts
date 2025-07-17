import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { ensureValidUPSToken } from '../_shared/ups-auth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const requestData: RatingRequest = await req.json();

    // Ensure we have a valid UPS token
    const authResult = await ensureValidUPSToken(supabase, user.id);
    if (!authResult.success) {
      console.error('UPS authentication failed:', authResult.error);
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const credentials = authResult.credentials;
    const accountNumber = credentials.account_number;

    // Validate required fields before API call
    if (!requestData.shipFrom?.zip || !requestData.shipFrom?.country ||
        !requestData.shipTo?.zip || !requestData.shipTo?.country ||
        !requestData.package?.weight) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          required: ['shipFrom.zip', 'shipFrom.country', 'shipTo.zip', 'shipTo.country', 'package.weight']
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare UPS Rating API request
    const ratingRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "Rating"
          }
        },
        Shipment: {
          Shipper: {
            ShipperNumber: accountNumber || "",
            Address: {
              AddressLine: [requestData.shipFrom.address],
              City: requestData.shipFrom.city,
              StateProvinceCode: requestData.shipFrom.state,
              PostalCode: requestData.shipFrom.zip,
              CountryCode: requestData.shipFrom.country
            }
          },
          ShipTo: {
            Address: {
              AddressLine: [requestData.shipTo.address],
              City: requestData.shipTo.city,
              StateProvinceCode: requestData.shipTo.state,
              PostalCode: requestData.shipTo.zip,
              CountryCode: requestData.shipTo.country
            }
          },
          ShipFrom: {
            Address: {
              AddressLine: [requestData.shipFrom.address],
              City: requestData.shipFrom.city,
              StateProvinceCode: requestData.shipFrom.state,
              PostalCode: requestData.shipFrom.zip,
              CountryCode: requestData.shipFrom.country
            }
          },
          Package: [
            {
              PackagingType: {
                Code: "02", // Customer Supplied Package
                Description: "Package"
              },
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: "LBS"
                },
                Weight: requestData.package.weight.toString()
              },
              Dimensions: requestData.package.length ? {
                UnitOfMeasurement: {
                  Code: "IN"
                },
                Length: requestData.package.length.toString(),
                Width: requestData.package.width?.toString() || "1",
                Height: requestData.package.height?.toString() || "1"
              } : undefined
            }
          ]
        }
      }
    };

    // Add service code if specified
    if (requestData.serviceCode) {
      ratingRequest.RateRequest.Shipment.Service = {
        Code: requestData.serviceCode
      };
    }

    // Determine if we're using production or sandbox based on the credentials
    const isProduction = credentials.environment === 'production';
    const ratingApiUrl = isProduction 
      ? 'https://onlinetools.ups.com/api/rating/v2409/rate'  // Production
      : 'https://wwwcie.ups.com/api/rating/v2409/rate';      // Sandbox
      
    console.log(`Using ${isProduction ? 'PRODUCTION' : 'SANDBOX'} UPS Rating endpoint: ${ratingApiUrl}`);
    
    // Call UPS Rating API with proper error handling
    const upsResponse = await fetch(ratingApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.access_token}`,
        'transId': crypto.randomUUID(),
        'transactionSrc': 'rating'
      },
      body: JSON.stringify(ratingRequest)
    });

    const responseText = await upsResponse.text();
    console.log('UPS API response status:', upsResponse.status);
    console.log('UPS API response:', responseText);

    if (!upsResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'UPS API error', 
          details: responseText,
          status: upsResponse.status 
        }),
        { 
          status: upsResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let upsData;
    try {
      upsData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse UPS response:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid response from UPS API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform UPS response to our format
    const rates = [];
    
    if (upsData.RateResponse?.RatedShipment) {
      const ratedShipments = Array.isArray(upsData.RateResponse.RatedShipment) 
        ? upsData.RateResponse.RatedShipment 
        : [upsData.RateResponse.RatedShipment];

      for (const shipment of ratedShipments) {
        const serviceCode = shipment.Service?.Code || 'UNK';
        rates.push({
          service_code: serviceCode,
          service_name: getUPSServiceName(serviceCode),
          service_type: getUPSServiceType(serviceCode),
          cost: parseFloat(shipment.TotalCharges?.MonetaryValue || '0'),
          currency: shipment.TotalCharges?.CurrencyCode || 'USD',
          estimated_days: getUPSEstimatedDays(serviceCode),
          delivery_date: shipment.GuaranteedDaysToDelivery ? 
            new Date(Date.now() + parseInt(shipment.GuaranteedDaysToDelivery) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
            undefined,
          carrier: 'UPS',
          supports_tracking: true,
          supports_insurance: true,
          supports_signature: true
        });
      }
    }

    console.log('Transformed rates:', rates);

    return new Response(
      JSON.stringify({ rates }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('UPS rating error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

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
    '14': 'UPS Next Day Air Early',
    '54': 'UPS Worldwide Express Plus',
    '59': 'UPS 2nd Day Air A.M.',
    '65': 'UPS Saver'
  };
  return serviceNames[code] || `UPS Service ${code}`;
}

function getUPSServiceType(code: string): string {
  const serviceTypes: { [key: string]: string } = {
    '01': 'overnight',
    '02': 'expedited',
    '03': 'standard',
    '07': 'overnight',
    '08': 'expedited',
    '11': 'standard',
    '12': 'expedited',
    '13': 'overnight',
    '14': 'overnight',
    '54': 'overnight',
    '59': 'expedited',
    '65': 'standard'
  };
  return serviceTypes[code] || 'standard';
}

function getUPSEstimatedDays(code: string): string {
  const estimatedDays: { [key: string]: string } = {
    '01': '1',
    '02': '2',
    '03': '1-5',
    '07': '1-2',
    '08': '2-3',
    '11': '1-5',
    '12': '3',
    '13': '1',
    '14': '1',
    '54': '1',
    '59': '2',
    '65': '1-5'
  };
  return estimatedDays[code] || '1-5';
}