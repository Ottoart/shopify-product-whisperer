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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rateRequest: RateRequest = await req.json();
    console.log('Rate calculation request:', rateRequest);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', rateRequest.order_id)
      .eq('user_id', user.id)
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
      .eq('user_id', user.id)
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
      console.log(`Getting rates from ${carrier.carrier_name}`);
      
      try {
        let carrierRates: ShippingRate[] = [];

        switch (carrier.carrier_name.toUpperCase()) {
          case 'UPS':
            carrierRates = await getUPSRates(carrier, shipFrom, shipTo, packageDetails, rateRequest.additional_services);
            break;
          case 'FEDEX':
            carrierRates = await getFedExRates(carrier, shipFrom, shipTo, packageDetails, rateRequest.additional_services);
            break;
          case 'USPS':
            carrierRates = await getUSPSRates(carrier, shipFrom, shipTo, packageDetails, rateRequest.additional_services);
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

        allRates.push(...carrierRates);
      } catch (error) {
        console.error(`Error getting rates from ${carrier.carrier_name}:`, error);
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

async function getUPSRates(carrier: any, shipFrom: any, shipTo: any, packageDetails: any, additionalServices?: any): Promise<ShippingRate[]> {
  // Use existing UPS rating function
  try {
    const upsClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    
    const { data, error } = await upsClient.functions.invoke('ups-rating', {
      body: {
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
      }
    });

    if (error) {
      console.error('UPS API error:', error);
      // Don't return fake rates for authenticated UPS - return empty array instead
      return [];
    }

    return data?.rates || [];
  } catch (error) {
    console.error('UPS rating error:', error);
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