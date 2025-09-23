import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { ensureValidUPSTokenForRating } from '../_shared/ups-auth.ts'

// CORS headers
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
    console.log('🧪 UPS Negotiated Rates Test Function Called');
    
    // Extract JWT token and get user ID directly
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
      console.log('✅ User ID:', userId);
    } catch (jwtError) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create service role client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get UPS credentials
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

    const credentials = authResult.credentials;
    const accountNumber = credentials.account_number;

    console.log('🔍 UPS Account Configuration Check:');
    console.log('Account Number:', accountNumber);
    console.log('Country:', credentials.country_code);
    console.log('Postal Code:', credentials.postal_code);
    console.log('Negotiated Rates Enabled:', credentials.enable_negotiated_rates);
    console.log('Production Mode:', credentials.is_production);

    // Test with exact ShipStation parameters
    const testShipmentData = {
      shipFrom: {
        address: "9200 Park ave, suite 301",
        city: "MONTREAL", 
        state: "QC",
        zip: "H2N1Z4",
        country: "CA"
      },
      shipTo: {
        address: "1827 HUDACSEK DR",
        city: "MOGADORE",
        state: "OH", 
        zip: "44260-9621",
        country: "US"
      },
      package: {
        weight: 4.4, // 2000g = 4.4 lbs (matching ShipStation)
        length: 11.8, // 30cm in inches
        width: 5.9,   // 15cm in inches  
        height: 3.9   // 10cm in inches
      }
    };

    console.log('📦 Testing with ShipStation-equivalent parameters:', testShipmentData);

    // Test UPS Standard (service code 11 - matches ShipStation's serviceId 35 for UPS Standard)
    const testResults = await testUPSService(credentials, accountNumber, testShipmentData, '11', 'UPS Standard');
    
    // Also test service code 35 to see if that's the difference
    const testResults35 = await testUPSService(credentials, accountNumber, testShipmentData, '35', 'UPS Standard (Code 35)');

    return new Response(
      JSON.stringify({
        success: true,
        account_info: {
          account_number: accountNumber,
          country: credentials.country_code,
          postal_code: credentials.postal_code,
          negotiated_rates_enabled: credentials.enable_negotiated_rates,
          production_mode: credentials.is_production
        },
        test_shipment: testShipmentData,
        test_results: {
          service_11: testResults,
          service_35: testResults35
        },
        shipstation_comparison: {
          expected_rate: '$12.82 CAD',
          our_rate_service_11: testResults?.rate || 'Failed',
          our_rate_service_35: testResults35?.rate || 'Failed'
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Test function error:', error);
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

async function testUPSService(credentials: any, accountNumber: string, shipmentData: any, serviceCode: string, serviceName: string) {
  try {
    console.log(`🧪 Testing ${serviceName} (Code: ${serviceCode})`);
    
    const ratingApiUrl = 'https://wwwcie.ups.com/api/rating/v1/rate';
    
    const upsRequest = {
      RateRequest: {
        Request: {
          RequestOption: "Rate",
          TransactionReference: {
            CustomerContext: "Negotiated Rate Test"
          }
        },
        Shipment: {
          Service: {
            Code: serviceCode,
            Description: serviceName
          },
          Shipper: {
            Name: "Test Shipper",
            ShipperNumber: accountNumber,
            Address: {
              AddressLine: [shipmentData.shipFrom.address],
              City: shipmentData.shipFrom.city,
              StateProvinceCode: shipmentData.shipFrom.state,
              PostalCode: shipmentData.shipFrom.zip,
              CountryCode: shipmentData.shipFrom.country
            }
          },
          ShipTo: {
            Name: "Test Consignee", 
            Address: {
              AddressLine: [shipmentData.shipTo.address],
              City: shipmentData.shipTo.city,
              StateProvinceCode: shipmentData.shipTo.state,
              PostalCode: shipmentData.shipTo.zip,
              CountryCode: shipmentData.shipTo.country
            }
          },
          ShipFrom: {
            Name: "Test Ship From",
            Address: {
              AddressLine: [shipmentData.shipFrom.address],
              City: shipmentData.shipFrom.city,
              StateProvinceCode: shipmentData.shipFrom.state,
              PostalCode: shipmentData.shipFrom.zip,
              CountryCode: shipmentData.shipFrom.country
            }
          },
          Package: [{
            PackagingType: {
              Code: "02",
              Description: "Package"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches"
              },
              Length: shipmentData.package.length.toString(),
              Width: shipmentData.package.width.toString(), 
              Height: shipmentData.package.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds"
              },
              Weight: shipmentData.package.weight.toString()
            }
          }],
          // CRITICAL: Always include RateInformation for negotiated rates
          RateInformation: {
            NegotiatedRatesIndicator: ''
          }
        }
      }
    };

    console.log(`📦 UPS Request for ${serviceName}:`, JSON.stringify(upsRequest, null, 2));

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.access_token}`,
      'transId': 'NegotiatedRateTest-' + Date.now() + '-' + serviceCode,
      'transactionSrc': 'PrepFox'
    };

    const response = await fetch(ratingApiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(upsRequest)
    });

    console.log(`📥 UPS Response Status for ${serviceName}:`, response.status);
    const responseText = await response.text();
    console.log(`📥 UPS Response Body for ${serviceName}:`, responseText);

    if (response.ok) {
      const rateResponse = JSON.parse(responseText);
      
      if (rateResponse.RateResponse?.RatedShipment) {
        const shipment = rateResponse.RateResponse.RatedShipment;
        
        let rate = 'N/A';
        let currency = 'USD';
        let rateType = 'Unknown';
        
        // Check for negotiated rates first
        if (shipment.NegotiatedRateCharges?.TotalCharge) {
          rate = shipment.NegotiatedRateCharges.TotalCharge.MonetaryValue;
          currency = shipment.NegotiatedRateCharges.TotalCharge.CurrencyCode;
          rateType = 'Negotiated';
        } else if (shipment.TotalCharges) {
          rate = shipment.TotalCharges.MonetaryValue;
          currency = shipment.TotalCharges.CurrencyCode;
          rateType = 'Published';
        }
        
        console.log(`💰 ${serviceName} Result: ${rate} ${currency} (${rateType})`);
        
        return {
          success: true,
          service_code: serviceCode,
          service_name: serviceName,
          rate: `${rate} ${currency}`,
          rate_type: rateType,
          has_negotiated_rates: Boolean(shipment.NegotiatedRateCharges),
          full_response: shipment
        };
      }
    }
    
    return {
      success: false,
      service_code: serviceCode,
      service_name: serviceName,
      error: responseText,
      status: response.status
    };
    
  } catch (error) {
    console.error(`❌ Error testing ${serviceName}:`, error);
    return {
      success: false,
      service_code: serviceCode,
      service_name: serviceName,
      error: error.message
    };
  }
}