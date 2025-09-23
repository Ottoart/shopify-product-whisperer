import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

interface RatingRequest {
  order_id?: string;
  shipFrom?: {
    name: string;
    company?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shipTo?: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  package?: {
    weight: number;
    weight_unit?: string;
    length: number;
    width: number;
    height: number;
    dimension_unit?: string;
    value?: number;
  };
  order?: {
    orderNumber?: string;
    currency?: string;
    items?: Array<{
      id: string;
      sku: string;
      product_title: string;
      price: number;
      quantity: number;
      weight_lbs?: number;
      origin_country?: string;
      commodity_code?: string;
    }>;
  };
}

interface UPSCredentials {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token?: string;
  token_expires_at?: string;
  account_number: string;
  account_country: string;
}

// UPS Service definitions with proper route availability
const UPS_SERVICES = [
  { service_code: '03', service_name: 'UPS Ground', international: false },
  { service_code: '12', service_name: 'UPS 3 Day Select', international: false },
  { service_code: '02', service_name: 'UPS 2nd Day Air', international: false },
  { service_code: '59', service_name: 'UPS 2nd Day Air A.M.', international: false },
  { service_code: '13', service_name: 'UPS Next Day Air Saver', international: false },
  { service_code: '01', service_name: 'UPS Next Day Air', international: false },
  { service_code: '14', service_name: 'UPS Next Day Air Early', international: false },
  { service_code: '07', service_name: 'UPS Worldwide Express', international: true },
  { service_code: '08', service_name: 'UPS Worldwide Expedited', international: true },
  { service_code: '11', service_name: 'UPS Standard', international: true },
  { service_code: '54', service_name: 'UPS Worldwide Express Plus', international: true },
  { service_code: '65', service_name: 'UPS Worldwide Saver', international: true }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('❌ No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ Invalid user token:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json() as RatingRequest;
    console.log('📦 UPS Rating request for user:', user.id);
    console.log('🏠 Ship From:', requestData.shipFrom);
    console.log('📍 Ship To:', requestData.shipTo);
    console.log('📦 Package:', requestData.package);

    // Get UPS carrier configuration
    const { data: upsConfig, error: configError } = await supabase
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', user.id)
      .eq('carrier_name', 'UPS')
      .eq('is_active', true)
      .single();

    if (configError || !upsConfig) {
      console.log('❌ No UPS configuration found for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'UPS configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = upsConfig.api_credentials as UPSCredentials;
    
    // Check if token is expired and refresh if needed
    const tokenExpiry = credentials.token_expires_at ? new Date(credentials.token_expires_at) : new Date(0);
    const now = new Date();
    
    if (tokenExpiry <= now && credentials.refresh_token) {
      console.log('🔄 Token expired, refreshing...');
      const refreshResult = await refreshUPSToken(credentials, supabase, user.id, upsConfig.id);
      if (!refreshResult.success) {
        return new Response(
          JSON.stringify({ error: 'Failed to refresh UPS token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      credentials.access_token = refreshResult.accessToken;
    }

    // Determine which services are valid for this route
    const isInternational = requestData.shipFrom?.country !== requestData.shipTo?.country;
    const validServices = UPS_SERVICES.filter(service => 
      isInternational ? service.international : !service.international
    );

    console.log(`🌍 Route type: ${isInternational ? 'International' : 'Domestic'}`);
    console.log(`📋 Valid services: ${validServices.map(s => s.service_code).join(', ')}`);

    // Call UPS Rating API
    const rates = await getUPSRates(requestData, credentials, validServices);
    
    console.log(`✅ Generated ${rates.length} UPS rates`);
    
    return new Response(
      JSON.stringify({ rates }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ UPS Rating error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function refreshUPSToken(credentials: UPSCredentials, supabase: any, userId: string, configId: string) {
  try {
    const response = await fetch('https://onlinetools.ups.com/security/v1/oauth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${credentials.client_id}:${credentials.client_secret}`)}`
      },
      body: `grant_type=refresh_token&refresh_token=${credentials.refresh_token}`
    });

    if (!response.ok) {
      console.error('❌ UPS token refresh failed:', response.status);
      return { success: false };
    }

    const data = await response.json();
    const expiresAt = new Date(Date.now() + (data.expires_in * 1000));

    // Update credentials in database
    const updatedCredentials = {
      ...credentials,
      access_token: data.access_token,
      token_expires_at: expiresAt.toISOString()
    };

    await supabase
      .from('carrier_configurations')
      .update({ api_credentials: updatedCredentials })
      .eq('id', configId);

    console.log('✅ UPS token refreshed successfully');
    return { success: true, accessToken: data.access_token };
  } catch (error) {
    console.error('❌ Error refreshing UPS token:', error);
    return { success: false };
  }
}

async function getUPSRates(requestData: RatingRequest, credentials: UPSCredentials, validServices: any[]) {
  const rates = [];

  // Build UPS Rating request
  const ratingRequest = {
    RateRequest: {
      Request: {
        RequestOption: "Shop",
        TransactionReference: {
          CustomerContext: "Rating and Service",
          TransactionIdentifier: `Rating_${Date.now()}`
        }
      },
      Pickup: {
        Date: new Date().toISOString().split('T')[0].replace(/-/g, '')
      },
      Shipment: {
        Shipper: {
          Name: requestData.shipFrom?.name || "Shipper",
          ShipperNumber: credentials.account_number,
          Address: {
            AddressLine: [requestData.shipFrom?.address || ""],
            City: requestData.shipFrom?.city || "",
            StateProvinceCode: requestData.shipFrom?.state || "",
            PostalCode: requestData.shipFrom?.zip || "",
            CountryCode: requestData.shipFrom?.country || "US"
          }
        },
        ShipTo: {
          Name: requestData.shipTo?.name || "Recipient",
          Address: {
            AddressLine: [requestData.shipTo?.address || ""],
            City: requestData.shipTo?.city || "",
            StateProvinceCode: requestData.shipTo?.state || "",
            PostalCode: requestData.shipTo?.zip || "",
            CountryCode: requestData.shipTo?.country || "US"
          }
        },
        ShipFrom: {
          Name: requestData.shipFrom?.name || "Ship From",
          Address: {
            AddressLine: [requestData.shipFrom?.address || ""],
            City: requestData.shipFrom?.city || "",
            StateProvinceCode: requestData.shipFrom?.state || "",
            PostalCode: requestData.shipFrom?.zip || "",
            CountryCode: requestData.shipFrom?.country || "US"
          }
        },
        Service: {
          Code: "03", // Will be overridden for each service
          Description: "UPS Ground"
        },
        Package: [{
          PackagingType: {
            Code: "02",
            Description: "Customer Supplied Package"
          },
          PackageWeight: {
            UnitOfMeasurement: {
              Code: "LBS",
              Description: "Pounds"
            },
            Weight: (requestData.package?.weight || 1).toString()
          },
          Dimensions: {
            UnitOfMeasurement: {
              Code: "IN",
              Description: "Inches"
            },
            Length: (requestData.package?.length || 10).toString(),
            Width: (requestData.package?.width || 10).toString(),
            Height: (requestData.package?.height || 10).toString()
          }
        }],
        ShipmentRatingOptions: {
          NegotiatedRatesIndicator: ""
        }
      }
    }
  };

  // Get rates for each valid service
  for (const service of validServices) {
    try {
      const serviceRequest = { ...ratingRequest };
      serviceRequest.RateRequest.Shipment.Service.Code = service.service_code;
      serviceRequest.RateRequest.Shipment.Service.Description = service.service_name;

      console.log(`📡 Calling UPS API for service ${service.service_code} (${service.service_name})`);

      const response = await fetch('https://onlinetools.ups.com/api/rating/v1/Rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.access_token}`,
          'transId': `Rate_${Date.now()}`,
          'transactionSrc': 'testing'
        },
        body: JSON.stringify(serviceRequest)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.RateResponse?.RatedShipment) {
          const ratedShipments = Array.isArray(data.RateResponse.RatedShipment) 
            ? data.RateResponse.RatedShipment 
            : [data.RateResponse.RatedShipment];

          for (const shipment of ratedShipments) {
            let totalCharges = '0';
            let rateType = 'Published';

            // Try to get negotiated rate first, fall back to published rate
            if (shipment.NegotiatedRateCharges?.TotalCharge?.MonetaryValue) {
              totalCharges = shipment.NegotiatedRateCharges.TotalCharge.MonetaryValue;
              rateType = 'Negotiated';
            } else if (shipment.TotalCharges?.MonetaryValue) {
              totalCharges = shipment.TotalCharges.MonetaryValue;
              rateType = 'Published';
            }

            const cost = parseFloat(totalCharges);
            if (cost > 0) {
              rates.push({
                id: `ups_${service.service_code}_${Date.now()}`,
                service_code: service.service_code,
                service_name: service.service_name,
                carrier: 'UPS',
                rate: cost,
                currency: shipment.TotalCharges?.CurrencyCode || 'USD',
                estimated_days: getEstimatedDays(service.service_code),
                service_type: getServiceType(service.service_code),
                zone: shipment.RatedShipmentAlert?.[0]?.Description || undefined,
                rate_type: rateType
              });

              console.log(`✅ UPS ${service.service_name}: $${cost} (${rateType})`);
            }
          }
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ UPS API error for ${service.service_name}:`, response.status, errorText);
      }
    } catch (error) {
      console.error(`❌ Error getting UPS rate for ${service.service_name}:`, error);
    }
  }

  return rates;
}

function getEstimatedDays(serviceCode: string): string {
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
    '54': '1-3 business days',
    '59': '2 business days',
    '65': '1-3 business days'
  };
  return estimatedDays[serviceCode] || '1-7 business days';
}

function getServiceType(serviceCode: string): string {
  const expeditedCodes = ['01', '13', '14', '59'];
  const expressOvernightCodes = ['01', '13', '14'];
  const expedited2DayCodes = ['02', '59'];
  const expedited3DayCodes = ['12'];
  
  if (expressOvernightCodes.includes(serviceCode)) return 'overnight';
  if (expedited2DayCodes.includes(serviceCode)) return 'expedited';
  if (expedited3DayCodes.includes(serviceCode)) return 'expedited';
  if (expeditedCodes.includes(serviceCode)) return 'expedited';
  return 'standard';
}