import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ShippingService {
  service_code: string;
  service_name: string;
  service_type: string;
  estimated_days?: string;
  max_weight_lbs?: number;
  supports_tracking: boolean;
  supports_insurance: boolean;
  supports_signature: boolean;
}

// Sample services for different carriers
const carrierServices: Record<string, ShippingService[]> = {
  ups: [
    {
      service_code: 'UPS_GROUND',
      service_name: 'UPS Ground',
      service_type: 'standard',
      estimated_days: '1-5 business days',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    },
    {
      service_code: 'UPS_3_DAY_SELECT',
      service_name: 'UPS 3 Day Select',
      service_type: 'expedited',
      estimated_days: '3 business days',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    },
    {
      service_code: 'UPS_2ND_DAY_AIR',
      service_name: 'UPS 2nd Day Air',
      service_type: 'expedited',
      estimated_days: '2 business days',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    },
    {
      service_code: 'UPS_NEXT_DAY_AIR',
      service_name: 'UPS Next Day Air',
      service_type: 'overnight',
      estimated_days: '1 business day',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    }
  ],
  fedex: [
    {
      service_code: 'FEDEX_GROUND',
      service_name: 'FedEx Ground',
      service_type: 'standard',
      estimated_days: '1-5 business days',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    },
    {
      service_code: 'FEDEX_EXPRESS_SAVER',
      service_name: 'FedEx Express Saver',
      service_type: 'expedited',
      estimated_days: '3 business days',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    },
    {
      service_code: 'FEDEX_2_DAY',
      service_name: 'FedEx 2Day',
      service_type: 'expedited',
      estimated_days: '2 business days',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    },
    {
      service_code: 'FEDEX_OVERNIGHT',
      service_name: 'FedEx Standard Overnight',
      service_type: 'overnight',
      estimated_days: '1 business day',
      max_weight_lbs: 150,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    }
  ],
  usps: [
    {
      service_code: 'USPS_GROUND_ADVANTAGE',
      service_name: 'USPS Ground Advantage',
      service_type: 'standard',
      estimated_days: '3-5 business days',
      max_weight_lbs: 70,
      supports_tracking: true,
      supports_insurance: false,
      supports_signature: false
    },
    {
      service_code: 'USPS_PRIORITY_MAIL',
      service_name: 'USPS Priority Mail',
      service_type: 'expedited',
      estimated_days: '1-3 business days',
      max_weight_lbs: 70,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    },
    {
      service_code: 'USPS_PRIORITY_EXPRESS',
      service_name: 'USPS Priority Mail Express',
      service_type: 'overnight',
      estimated_days: '1-2 business days',
      max_weight_lbs: 70,
      supports_tracking: true,
      supports_insurance: true,
      supports_signature: true
    }
  ],
  sendle: [
    {
      service_code: 'SENDLE_STANDARD',
      service_name: 'Sendle Standard',
      service_type: 'standard',
      estimated_days: '2-7 business days',
      max_weight_lbs: 44,
      supports_tracking: true,
      supports_insurance: false,
      supports_signature: false
    },
    {
      service_code: 'SENDLE_EXPRESS',
      service_name: 'Sendle Express',
      service_type: 'expedited',
      estimated_days: '1-2 business days',
      max_weight_lbs: 44,
      supports_tracking: true,
      supports_insurance: false,
      supports_signature: false
    },
    {
      service_code: 'SENDLE_PREFERRED_PICKUP',
      service_name: 'Sendle Preferred - Pickup (Carbon Neutral)',
      service_type: 'standard',
      estimated_days: '2-7 business days',
      max_weight_lbs: 44,
      supports_tracking: true,
      supports_insurance: false,
      supports_signature: false
    }
  ]
};

async function fetchCarrierServices(carrierName: string, credentials: any): Promise<ShippingService[]> {
  console.log(`Fetching services for carrier: ${carrierName}`);
  
  // For now, return predefined services
  // In the future, this would make actual API calls to carrier services
  const services = carrierServices[carrierName.toLowerCase()] || [];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return services;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, force_refresh } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching shipping services for user: ${user_id}`);

    // Get carrier configurations (including inactive ones)
    const { data: carriers, error: carriersError } = await supabase
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', user_id);

    if (carriersError) {
      console.error('Error fetching carriers:', carriersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch carrier configurations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!carriers || carriers.length === 0) {
      console.log('No active carriers found for user');
      return new Response(
        JSON.stringify({ carriers: [], services: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch services for each active carrier
    const allServices = [];
    const updatedCarriers = [];

    for (const carrier of carriers) {
      try {
        console.log(`Processing carrier: ${carrier.carrier_name}`);
        
        const services = await fetchCarrierServices(carrier.carrier_name, carrier.api_credentials);
        
        // Update or insert services in the database
        for (const service of services) {
          const { error: upsertError } = await supabase
            .from('shipping_services')
            .upsert({
              user_id: user_id,
              carrier_configuration_id: carrier.id,
              service_code: service.service_code,
              service_name: service.service_name,
              service_type: service.service_type,
              estimated_days: service.estimated_days,
              max_weight_lbs: service.max_weight_lbs,
              supports_tracking: service.supports_tracking,
              supports_insurance: service.supports_insurance,
              supports_signature: service.supports_signature,
              is_available: true,
              last_updated: new Date().toISOString()
            }, {
              onConflict: 'user_id,carrier_configuration_id,service_code'
            });

          if (upsertError) {
            console.error(`Error upserting service ${service.service_code}:`, upsertError);
          }
        }

        allServices.push(...services.map(service => ({
          ...service,
          carrier_name: carrier.carrier_name,
          carrier_id: carrier.id
        })));

        updatedCarriers.push(carrier);
        
      } catch (error) {
        console.error(`Error processing carrier ${carrier.carrier_name}:`, error);
        // Continue with other carriers even if one fails
      }
    }

    console.log(`Successfully fetched ${allServices.length} services from ${updatedCarriers.length} carriers`);

    return new Response(
      JSON.stringify({ 
        carriers: updatedCarriers,
        services: allServices,
        total_services: allServices.length,
        active_carriers: updatedCarriers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-shipping-services:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});