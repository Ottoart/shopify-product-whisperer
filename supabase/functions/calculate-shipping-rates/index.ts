import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateRequest {
  order_id: string;
  ship_from?: {
    name?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  service_preferences?: string[]; // ['ground', 'expedited', 'overnight']
  additional_services?: {
    signature_required?: boolean;
    insurance_value?: number;
    saturday_delivery?: boolean;
  };
}

interface ShippingRate {
  carrier: string;
  service_code: string;
  service_name: string;
  service_type: string;
  cost: number;
  currency: string;
  estimated_days: string;
  delivery_date?: string;
  additional_fees?: {
    fuel_surcharge?: number;
    residential_fee?: number;
    signature_fee?: number;
  };
  supports_tracking: boolean;
  supports_insurance: boolean;
  supports_signature: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Calculate Shipping Rates Function Called');
    console.log('📋 All request headers:', Object.fromEntries(req.headers.entries()));
    
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    console.log('🔑 Auth header found:', authHeader ? 'YES' : 'NO');
    console.log('🔑 Auth header value (first 50 chars):', authHeader ? authHeader.substring(0, 50) : 'NONE');

    if (!authHeader) {
      console.error('❌ No authorization header provided to calculate-shipping-rates');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract user ID from JWT token directly instead of using Supabase auth
    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '').replace('bearer ', '');
      console.log('🔍 Extracting user ID from token (first 50 chars):', token.substring(0, 50));
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      console.log('✅ Extracted user ID:', userId);
      
      if (!userId) {
        throw new Error('No user ID in token');
      }
    } catch (error) {
      console.error('❌ Failed to extract user ID from JWT:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create service role client for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const rateRequest: RateRequest = await req.json();
    console.log('Rate calculation request:', rateRequest);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', rateRequest.order_id)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get active carriers with credentials
    const { data: carriers, error: carriersError } = await supabase
      .from('carrier_configurations')
      .select(`
        *,
        shipping_services(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (carriersError) {
      console.error('Failed to fetch carriers:', carriersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch carrier configurations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${carriers?.length || 0} active carriers`);

    // Determine ship from address
    const shipFrom = rateRequest.ship_from || {
      name: "Your Store",
      address: "123 Store Street", // Default - should be configurable
      city: "Your City",
      state: "Your State",
      zip: "12345",
      country: "US"
    };

    const shipTo = {
      name: order.customer_name,
      address: order.shipping_address_line1,
      address2: order.shipping_address_line2,
      city: order.shipping_city,
      state: order.shipping_state,
      zip: order.shipping_zip,
      country: order.shipping_country || 'US'
    };

    // Package details from order
    const packageDetails = {
      weight: order.weight_lbs || 1,
      length: order.length_inches || 12,
      width: order.width_inches || 12,
      height: order.height_inches || 6,
      value: order.total_amount || 100
    };

    console.log('Package details:', packageDetails);
    console.log('Ship from:', shipFrom);
    console.log('Ship to:', shipTo);

    const allRates: ShippingRate[] = [];

    // Get rates from each carrier
    for (const carrier of carriers || []) {
      console.log(`Getting rates from ${carrier.carrier_name} (ID: ${carrier.id})`);
      console.log(`Carrier active: ${carrier.is_active}, Has credentials: ${Boolean(carrier.api_credentials)}`);
      
      try {
        let carrierRates: ShippingRate[] = [];

        switch (carrier.carrier_name.toUpperCase()) {
          case 'UPS':
            console.log('🔄 About to call getUPSRates with auth header:', authHeader ? 'PRESENT' : 'MISSING');
            
            // Filter services to only valid ones based on shipping route
            const validServices = getValidUPSServices(carrier, shipFrom, shipTo);
            console.log(`📦 Valid UPS services for this route: ${validServices.map(s => s.service_code).join(', ')}`);
            
            carrierRates = await getUPSRates(carrier, shipFrom, shipTo, packageDetails, rateRequest.additional_services, authHeader, validServices);
            console.log(`📦 UPS returned ${carrierRates.length} rates`);
            break;
          case 'FEDEX':
            carrierRates = await getFedExRates(carrier, shipFrom, shipTo, packageDetails, rateRequest.additional_services);
            break;
          case 'USPS':
            carrierRates = await getUSPSRates(carrier, shipFrom, shipTo, packageDetails, rateRequest.additional_services);
            break;
          case 'CANADA POST':
            carrierRates = await getCanadaPostRates(carrier, shipFrom, shipTo, packageDetails, rateRequest.additional_services);
            break;
          default:
            console.log(`Carrier ${carrier.carrier_name} not supported yet`);
            // Return hardcoded rates for unsupported carriers
            carrierRates = getHardcodedRates(carrier);
        }

        // Filter by service preferences if specified
        if (rateRequest.service_preferences && rateRequest.service_preferences.length > 0) {
          carrierRates = carrierRates.filter(rate => 
            rateRequest.service_preferences!.includes(rate.service_type)
          );
        }

        console.log(`✅ Got ${carrierRates.length} rates from ${carrier.carrier_name}:`, carrierRates.map(r => `${r.service_name}: $${r.cost}`));
        allRates.push(...carrierRates);
      } catch (error) {
        console.error(`❌ Error getting rates from ${carrier.carrier_name}:`, error);
        console.error(`❌ Full error details:`, JSON.stringify(error, null, 2));
        // Continue with other carriers
      }
    }

    // Sort rates by cost (lowest first)
    allRates.sort((a, b) => a.cost - b.cost);

    console.log(`Found ${allRates.length} total rates`);
    if (allRates.length === 0) {
      console.log('❌ No rates found from any carrier - this means all carriers failed or returned empty arrays');
      console.log('🔍 Active carriers checked:', carriers?.map(c => c.carrier_name) || []);
    } else {
      console.log('✅ Rates found:', allRates.map(r => `${r.carrier} ${r.service_name}: $${r.cost}`));
    }

    return new Response(
      JSON.stringify({ 
        rates: allRates,
        order_details: {
          order_number: order.order_number,
          ship_from: shipFrom,
          ship_to: shipTo,
          package: packageDetails
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Rate calculation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getValidUPSServices(carrier: any, shipFrom: any, shipTo: any): any[] {
  const countryCode = carrier.api_credentials?.country_code || 'US';
  const fromCountry = shipFrom?.country || 'US';
  const toCountry = shipTo?.country || 'US';
  
  console.log(`🌍 UPS service validation - Account: ${countryCode}, From: ${fromCountry}, To: ${toCountry}`);
  
  // Get all services for this carrier
  const allServices = carrier.shipping_services || [];
  
  // If shipping from Canada, only allow international services
  if (fromCountry === 'CA' || countryCode === 'CA') {
    const validServices = allServices.filter((service: any) => 
      ['07', '08', '11', '54', '65'].includes(service.service_code)
    );
    console.log(`🇨🇦 Canadian route - filtered to ${validServices.length} international services`);
    return validServices;
  }
  
  // For US routes, allow all services
  console.log(`🇺🇸 US route - allowing all ${allServices.length} services`);
  return allServices;
}

async function getUPSRates(carrier: any, shipFrom: any, shipTo: any, packageDetails: any, additionalServices?: any, authHeader?: string, validServices?: any[]): Promise<ShippingRate[]> {
  // Use existing UPS rating function
  try {
    console.log('🔄 Calling UPS rating function with:', {
      shipFrom,
      shipTo,
      packageDetails,
      hasAuthHeader: Boolean(authHeader)
    });
    
    const upsClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    
    // Create the request object for UPS rating
    const upsRequest = {
      shipFrom: {
        address: shipFrom.address,
        city: shipFrom.city,
        state: shipFrom.state,
        zip: shipFrom.zip,
        country: shipFrom.country
      },
      shipTo: {
        address: shipTo.address,
        city: shipTo.city,
        state: shipTo.state,
        zip: shipTo.zip,
        country: shipTo.country
      },
      package: {
        weight: packageDetails.weight,
        length: packageDetails.length,
        width: packageDetails.width,
        height: packageDetails.height
      }
    };

    console.log('📦 UPS Request payload:', JSON.stringify(upsRequest, null, 2));
    console.log('🔑 Auth header present:', authHeader ? 'YES' : 'NO');

    // Call UPS rating function with auth header
    const requestOptions: any = {
      body: upsRequest
    };

    if (authHeader) {
      requestOptions.headers = {
        Authorization: authHeader
      };
    }

    console.log('📡 Making UPS function call with options:', JSON.stringify(requestOptions, null, 2));

    const { data, error } = await upsClient.functions.invoke('ups-rating', requestOptions);

    console.log('📦 UPS API response data:', JSON.stringify(data, null, 2));
    console.log('❌ UPS API response error:', JSON.stringify(error, null, 2));

    if (error) {
      console.error('❌ UPS API error:', error);
      console.error('❌ UPS Error message:', error.message || 'Unknown error');
      console.error('❌ UPS Error details:', error.details || 'No details');
      return [];
    }

    // Enhanced UPS response handling
    if (data?.error) {
      console.error('❌ UPS API returned error:', data.error);
      console.error('❌ UPS Error context:', data.details || 'No additional details');
      return [];
    }

    const rates = data?.rates || [];
    console.log(`✅ UPS rates received: ${rates.length} rates`);
    
    if (rates.length === 0) {
      console.log('⚠️ No UPS rates returned - checking debug info');
      if (data?.debug) {
        console.log('🔍 UPS Debug Info:', JSON.stringify(data.debug, null, 2));
      }
    } else {
      console.log('✅ UPS Rate details:', rates.map((r: any) => `${r.service_name}: $${r.cost} ${r.currency}`));
    }
    
    return rates;
  } catch (error) {
    console.error('❌ UPS rating error:', error);
    // Don't return fake rates for authenticated UPS - return empty array instead
    return [];
  }
}

async function getFedExRates(carrier: any, shipFrom: any, shipTo: any, packageDetails: any, additionalServices?: any): Promise<ShippingRate[]> {
  // TODO: Implement FedEx API integration
  console.log('FedEx integration not implemented yet, returning hardcoded rates');
  return getHardcodedRates(carrier).filter(r => r.carrier === 'FedEx');
}

async function getUSPSRates(carrier: any, shipFrom: any, shipTo: any, packageDetails: any, additionalServices?: any): Promise<ShippingRate[]> {
  // TODO: Implement USPS API integration
  console.log('USPS integration not implemented yet, returning hardcoded rates');
  return getHardcodedRates(carrier).filter(r => r.carrier === 'USPS');
}

async function getCanadaPostRates(carrier: any, shipFrom: any, shipTo: any, packageDetails: any, additionalServices?: any): Promise<ShippingRate[]> {
  try {
    console.log('🔄 Calling Canada Post rating function');
    
    // Convert package details to metric (Canada Post uses metric)
    const weightKg = packageDetails.weight * 0.453592; // lbs to kg
    const lengthCm = packageDetails.length * 2.54; // inches to cm
    const widthCm = packageDetails.width * 2.54;
    const heightCm = packageDetails.height * 2.54;
    
    // Extract postal codes (Canada Post requires them)
    const fromPostalCode = shipFrom.zip || shipFrom.postalCode || 'K1A0A6'; // Default to Ottawa if not provided
    const toPostalCode = shipTo.zip || shipTo.postalCode || 'M5V3A8'; // Default to Toronto if not provided
    
    const canadaPostClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    
    const { data, error } = await canadaPostClient.functions.invoke('canada-post-rating', {
      body: {
        shipFrom: {
          postalCode: fromPostalCode
        },
        shipTo: {
          address: {
            postalCode: toPostalCode,
            countryCode: shipTo.country || 'US'
          }
        },
        package: {
          weight: {
            value: weightKg,
            units: 'KG'
          },
          dimensions: {
            length: lengthCm,
            width: widthCm,
            height: heightCm,
            units: 'CM'
          }
        }
      }
    });

    console.log('📦 Canada Post API response:', { data, error });

    if (error) {
      console.error('❌ Canada Post API error:', error);
      return getFallbackCanadaPostRates();
    }

    const canadaPostRates = data || [];
    
    // Convert Canada Post rates to our standard format
    const rates: ShippingRate[] = canadaPostRates.map((rate: any) => {
      // Map service code to service type
      let serviceType = 'standard';
      if (rate.serviceCode?.includes('PC')) {
        serviceType = 'overnight';
      } else if (rate.serviceCode?.includes('EP') || rate.serviceCode?.includes('XP')) {
        serviceType = 'expedited';
      }
      
      return {
        carrier: 'Canada Post',
        service_code: rate.serviceCode,
        service_name: rate.service,
        service_type: serviceType,
        cost: rate.cost,
        currency: rate.currency,
        estimated_days: rate.deliveryDays,
        supports_tracking: true,
        supports_insurance: true,
        supports_signature: rate.serviceCode === 'DOM.PC' // Only Priority Courier supports signature
      };
    });

    console.log('✅ Canada Post rates received:', rates);
    return rates;
    
  } catch (error) {
    console.error('❌ Canada Post rating error:', error);
    return getFallbackCanadaPostRates();
  }
}

function getFallbackCanadaPostRates(): ShippingRate[] {
  console.log('🔄 Using fallback Canada Post rates');
  const baseRate = 12.50;
  
  return [
    {
      carrier: 'Canada Post',
      service_code: 'REG',
      service_name: 'Regular Parcel',
      service_type: 'standard',
      cost: baseRate,
      currency: 'CAD',
      estimated_days: '5-7 business days',
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: false
    },
    {
      carrier: 'Canada Post',
      service_code: 'EXP',
      service_name: 'Expedited Parcel',
      service_type: 'expedited',
      cost: Math.round((baseRate * 1.6) * 100) / 100,
      currency: 'CAD',
      estimated_days: '2-3 business days',
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: false
    },
    {
      carrier: 'Canada Post',
      service_code: 'PC',
      service_name: 'Priority Courier',
      service_type: 'overnight',
      cost: Math.round((baseRate * 2.5) * 100) / 100,
      currency: 'CAD',
      estimated_days: '1 business day',
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    }
  ];
}

function getHardcodedRates(carrier: any): ShippingRate[] {
  const baseRate = Math.random() * 10 + 5; // Random base rate between $5-15
  
  const rates: ShippingRate[] = [];
  
  // Add rates based on available services for this carrier
  for (const service of carrier.shipping_services || []) {
    let multiplier = 1;
    
    // Adjust cost based on service type
    switch (service.service_type.toLowerCase()) {
      case 'overnight':
        multiplier = 3;
        break;
      case 'expedited':
        multiplier = 1.8;
        break;
      case 'standard':
        multiplier = 1;
        break;
      default:
        multiplier = 1.2;
    }
    
    rates.push({
      carrier: carrier.carrier_name,
      service_code: service.service_code,
      service_name: service.service_name,
      service_type: service.service_type,
      cost: Math.round((baseRate * multiplier) * 100) / 100,
      currency: 'USD',
      estimated_days: service.estimated_days || '3-5',
      supports_tracking: service.supports_tracking || true,
      supports_insurance: service.supports_insurance || false,
      supports_signature: service.supports_signature || false
    });
  }
  
  return rates;
}