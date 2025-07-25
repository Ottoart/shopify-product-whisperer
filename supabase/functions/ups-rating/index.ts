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

    // Get valid UPS services for this user
    console.log('📋 Getting valid UPS services for user:', userId);
    
    // First get the UPS carrier configuration ID
    const { data: carrierConfig, error: carrierError } = await serviceSupabase
      .from('carrier_configurations')
      .select('id')
      .eq('user_id', userId)
      .eq('carrier_name', 'UPS')
      .eq('is_active', true)
      .single();

    if (carrierError || !carrierConfig) {
      console.error('❌ Failed to find UPS carrier configuration:', carrierError);
      return new Response(
        JSON.stringify({ error: 'UPS carrier not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Now get the services for this carrier
    const { data: validServices, error: servicesError } = await serviceSupabase
      .from('shipping_services')
      .select('service_code, service_name')
      .eq('user_id', userId)
      .eq('carrier_configuration_id', carrierConfig.id)
      .eq('is_available', true);

    if (servicesError) {
      console.error('❌ Failed to get valid services:', servicesError);
      return new Response(
        JSON.stringify({ error: 'Failed to get valid UPS services' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📦 Valid UPS services found:', validServices?.map(s => `${s.service_code}: ${s.service_name}`));

    if (!validServices || validServices.length === 0) {
      console.log('⚠️ No valid UPS services found for user');
      return new Response(
        JSON.stringify({ 
          error: 'No valid UPS services configured',
          details: 'Please sync your UPS services in carrier management'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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

    return await processUPSRating(requestData, credentials, accountNumber, validServices);

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

async function processUPSRating(requestData: RatingRequest, credentials: any, accountNumber: string, validServices: any[]) {
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

    // Convert package weight from lbs to grams if needed (to match ShipStation format)
    const packageWeightLbs = requestData.package.weight;
    const packageWeightGrams = Math.round(packageWeightLbs * 453.592); // Convert lbs to grams
    
    // Convert dimensions from inches to centimeters if needed
    const lengthCm = Math.round((requestData.package.length || 12) * 2.54);
    const widthCm = Math.round((requestData.package.width || 12) * 2.54);
    const heightCm = Math.round((requestData.package.height || 6) * 2.54);

    // Log shipping details for debugging
    // Enhanced debugging information
    console.log('🌍 Shipping details:');
    console.log('Ship From Country:', requestData.shipFrom.country);
    console.log('Ship To Country:', requestData.shipTo.country);
    console.log('Account Number:', accountNumber);
    console.log('Account Postal Code:', accountPostalCode);
    console.log('Account Country:', accountCountryCode);
    console.log('Negotiated Rates Enabled:', credentials.enable_negotiated_rates);
    console.log('📦 Package Details:');
    console.log('Weight (lbs):', requestData.package.weight);
    console.log('Dimensions (inches):', `${requestData.package.length}x${requestData.package.width}x${requestData.package.height}`);
    console.log('📮 Valid Services to check:', validServices?.map(s => `${s.service_code}: ${s.service_name}`) || []);

    // Use the proper negotiated rates endpoint structure
    const baseUrl = credentials.is_production ? 'https://apis.ups.com' : 'https://wwwcie.ups.com';
    const ratingApiUrl = `${baseUrl}/api/rating/v1/rate?additionalinfo=timeintransit`;
    console.log('📍 Using Rating API URL with negotiated rates support:', ratingApiUrl);

    // Get rates for each valid service separately to avoid "invalid service" errors
    const allRates = [];
    
    for (const service of validServices) {
      console.log(`🔄 Getting rate for service ${service.service_code}: ${service.service_name}`);
      
      // Construct proper UPS Rating API request for this specific service
      const upsRequest = {
        RateRequest: {
          Request: {
            RequestOption: "Rate",
            TransactionReference: {
              CustomerContext: "Rating and Service Selection"
            }
          },
          Shipment: {
            Service: {
              Code: service.service_code,
              Description: service.service_name
            },
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
                Weight: packageWeightLbs.toString()
              }
            }]
          }
        }
      };

      // CRITICAL: Use proper ShipmentRatingOptions structure for negotiated rates
      // This is the correct format according to UPS API documentation
      upsRequest.RateRequest.Shipment['ShipmentRatingOptions'] = {
        NegotiatedRatesIndicator: 'Y',
        TPFCNegotiatedRatesIndicator: 'Y'
      };

      // Debug: Log what ShipStation equivalent would be
      console.log(`🔍 ShipStation Comparison - Service ${service.service_code}:`);
      console.log(`Package Weight: ${packageWeightLbs}lbs (${packageWeightGrams}g)`);
      console.log(`Dimensions: ${requestData.package.length || 12}"x${requestData.package.width || 12}"x${requestData.package.height || 6}" (${lengthCm}x${widthCm}x${heightCm}cm)`);
      console.log(`Account: ${accountNumber} (${accountCountryCode})`);
      console.log(`Negotiated Rates Flag: ${credentials.enable_negotiated_rates ? 'ENABLED' : 'DISABLED'}`);

      console.log(`📦 UPS API Request for ${service.service_code}:`, JSON.stringify(upsRequest, null, 2));

      // Prepare headers for UPS API call - Match ShipStation's approach
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.access_token}`,
        'transId': 'PrepFox-Rating-' + Date.now() + '-' + service.service_code,
        'transactionSrc': 'PrepFox'
      };

      // Make the UPS API call for this service
      console.log(`🚀 Calling UPS Rating API for ${service.service_code}...`);
      try {
        const response = await fetch(ratingApiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(upsRequest)
        });

        console.log(`📥 UPS API Response Status for ${service.service_code}:`, response.status);

        const responseText = await response.text();
        console.log(`📥 UPS API Response Body for ${service.service_code}:`, responseText);

        if (response.ok) {
          // Parse successful response
          let rateResponse;
          try {
            rateResponse = JSON.parse(responseText);
          } catch (e) {
            console.error(`❌ Failed to parse UPS response for ${service.service_code}:`, e);
            continue; // Skip this service and try the next one
          }

              // Transform UPS response to our format
          if (rateResponse.RateResponse?.RatedShipment) {
            const ratedShipments = Array.isArray(rateResponse.RateResponse.RatedShipment) 
              ? rateResponse.RateResponse.RatedShipment 
              : [rateResponse.RateResponse.RatedShipment];

            for (const shipment of ratedShipments) {
              const serviceCode = shipment.Service?.Code || service.service_code;
              const serviceName = service.service_name;
              const serviceType = getUPSServiceType(serviceCode);
              const estimatedDays = getUPSEstimatedDays(serviceCode);
              
              // Enhanced rate extraction logic - CRITICAL: Check negotiated rates properly
              let totalCharges = '0';
              let currency = 'USD';
              let rateType = 'Published';
              
              // Debug: Log the entire shipment structure to understand response format
              console.log(`🔍 Full UPS shipment response for ${serviceName}:`, JSON.stringify(shipment, null, 2));
              
              // Always try negotiated rates first (they should be returned when RateInformation is included)
              if (shipment.NegotiatedRateCharges?.TotalCharge) {
                totalCharges = shipment.NegotiatedRateCharges.TotalCharge.MonetaryValue || '0';
                currency = shipment.NegotiatedRateCharges.TotalCharge.CurrencyCode || 'USD';
                rateType = 'Negotiated';
                console.log(`💰 Negotiated Rate for ${serviceName}: ${totalCharges} ${currency}`);
              } else if (shipment.TotalCharges) {
                totalCharges = shipment.TotalCharges.MonetaryValue || '0';
                currency = shipment.TotalCharges.CurrencyCode || 'USD';
                rateType = 'Published';
                console.log(`📊 Published Rate for ${serviceName}: ${totalCharges} ${currency}`);
                
                // Log why we didn't get negotiated rates
                if (credentials.enable_negotiated_rates) {
                  console.log(`⚠️ Negotiated rates enabled but not returned. Check account setup.`);
                  console.log(`🔍 NegotiatedRateCharges structure:`, shipment.NegotiatedRateCharges || 'NOT PRESENT');
                }
              } else {
                console.error(`❌ No rate data found for ${serviceName}. UPS Response:`, JSON.stringify(shipment, null, 2));
                continue; // Skip this rate if no pricing data
              }

              // Validate rate data before adding
              const costValue = parseFloat(totalCharges);
              if (isNaN(costValue) || costValue <= 0) {
                console.error(`❌ Invalid cost value for ${serviceName}: ${totalCharges}`);
                continue;
              }

              allRates.push({
                carrier: 'UPS',
                service_code: serviceCode,
                service_name: serviceName,
                service_type: serviceType,
                cost: costValue,
                currency: currency,
                estimated_days: estimatedDays,
                supports_tracking: true,
                supports_insurance: true,
                supports_signature: true
              });
            }
          } else {
            console.error(`❌ No RatedShipment data in UPS response for ${service.service_code}:`, JSON.stringify(rateResponse, null, 2));
          }
        } else {
          console.error(`❌ UPS API Error for ${service.service_code} - Status:`, response.status);
          console.error(`❌ UPS API Error for ${service.service_code} - Response:`, responseText);
          
          // Try to parse error response for better debugging
          try {
            const errorResponse = JSON.parse(responseText);
            if (errorResponse.response?.errors) {
              console.error(`❌ UPS Error Details for ${service.service_code}:`, errorResponse.response.errors);
            }
          } catch (e) {
            console.error(`❌ Could not parse UPS error response for ${service.service_code}`);
          }
          // Continue with other services even if one fails
        }
      } catch (error) {
        console.error(`❌ Network error for ${service.service_code}:`, error);
        // Continue with other services even if one fails
      }
    }

    console.log('✅ All UPS rates collected:', allRates);
    
    // Enhanced response with debug information
    const response = {
      rates: allRates,
      debug: {
        services_checked: validServices?.length || 0,
        rates_found: allRates.length,
        account_country: accountCountryCode,
        ship_route: `${requestData.shipFrom.country} -> ${requestData.shipTo.country}`,
        package_weight: requestData.package.weight,
        timestamp: new Date().toISOString()
      }
    };

    return new Response(
      JSON.stringify(response),
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