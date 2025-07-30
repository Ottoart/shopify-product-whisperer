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
  // Legacy format support for backward compatibility
  ship_from?: {
    name: string;
    company?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  ship_to?: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

interface CanadaPostRate {
  carrier: string;
  service: string;
  serviceCode: string;
  cost: number;
  estimatedDeliveryDate?: string;
  deliveryDays?: string;
  currency: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📦 Canada Post Rating API called');
    
    const requestData: RatingRequest = await req.json();
    console.log('📍 Full request data:', JSON.stringify(requestData, null, 2));

    // Handle both new standardized format and legacy data formats
    const shipFrom = requestData.shipFrom || requestData.ship_from;
    const shipTo = requestData.shipTo || requestData.ship_to;
    const pkg = requestData.package;
    const order = requestData.order;

    if (!shipFrom || !shipTo || !pkg) {
      throw new Error('Missing required shipping data: shipFrom, shipTo, or package');
    }

    console.log('📍 Parsed shipping data:', { 
      shipFrom: shipFrom.zip, 
      shipTo: shipTo.zip, 
      weight: pkg.weight,
      weightUnit: pkg.weight_unit || 'LBS',
      dimensions: `${pkg.length}x${pkg.width}x${pkg.height}`,
      dimensionUnit: pkg.dimension_unit || 'IN',
      items: order?.items?.length || 0
    });

    // Get API credentials from environment or database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we have a Canada Post configuration in the database
    const { data: canadaPostConfig } = await supabase
      .from('carrier_configurations')
      .select('*')
      .eq('carrier_name', 'Canada Post')
      .eq('is_active', true)
      .single();

    let apiKey: string | null = null;
    let apiSecret: string | null = null;
    let customerNumber: string | null = null;

    if (canadaPostConfig?.api_credentials) {
      // Check if user has their own Canada Post credentials first
      if (canadaPostConfig.api_credentials.api_key) {
        console.log('🔑 Using user provided Canada Post credentials');
        apiKey = canadaPostConfig.api_credentials.api_key;
        apiSecret = canadaPostConfig.api_credentials.api_secret;
        customerNumber = canadaPostConfig.api_credentials.customer_number;
      } else {
        // Fall back to system credentials only if user hasn't configured their own
        console.log('🔑 Using system Canada Post credentials as fallback');
        const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
        
        if (isDev) {
          apiKey = Deno.env.get('CANADA_POST_DEV_API_KEY');
          apiSecret = Deno.env.get('CANADA_POST_DEV_API_SECRET');
          customerNumber = '2004381'; // Demo customer only for development
          console.log('📋 Using Canada Post Development credentials');
        } else {
          console.log('❌ No Canada Post credentials available for production');
          return new Response(
            JSON.stringify({
              error: 'Canada Post not configured',
              data: []
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    if (!apiKey || !apiSecret) {
      console.log('⚠️ No Canada Post credentials available, returning fallback rates');
      const weightInKg = pkg.weight_unit === 'LBS' ? pkg.weight * 0.453592 : pkg.weight;
      return new Response(JSON.stringify(getFallbackRates(shipTo.country, weightInKg)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log('🔑 Using Canada Post credentials');

    // Convert weight to kilograms if needed
    let weightInKg = pkg.weight;
    const weightUnit = pkg.weight_unit || 'LBS';
    if (weightUnit === 'LBS') {
      weightInKg = pkg.weight * 0.453592;
    }

    // Ensure minimum weight (Canada Post requires at least 0.1 kg)
    if (weightInKg < 0.1) {
      weightInKg = 0.1;
      console.log('⚖️ Adjusted weight to minimum 0.1 kg for Canada Post');
    }

    // Convert dimensions to centimeters if needed
    const dimensionUnit = pkg.dimension_unit || 'IN';
    let dimensions = null;
    if (pkg.length && pkg.width && pkg.height) {
      dimensions = {
        length: dimensionUnit === 'IN' ? pkg.length * 2.54 : pkg.length,
        width: dimensionUnit === 'IN' ? pkg.width * 2.54 : pkg.width,
        height: dimensionUnit === 'IN' ? pkg.height * 2.54 : pkg.height,
        units: 'CM'
      };
    }

    console.log('📏 Package details:', { 
      weight: `${weightInKg} kg`, 
      dimensions: dimensions ? `${dimensions.length}x${dimensions.width}x${dimensions.height} cm` : 'none',
      value: pkg.value || 'unknown'
    });

    // Validate customer number
    if (!customerNumber) {
      console.log('❌ No Canada Post customer number available');
      return new Response(
        JSON.stringify({
          error: 'Canada Post customer number required',
          data: getFallbackRates('US', 1)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build XML request according to Canada Post API specification
    const xmlRequest = buildCanadaPostXMLRequest({
      customerNumber,
      weight: weightInKg,
      originPostalCode: (shipFrom.zip || '').replace(/\s+/g, '').toUpperCase(),
      destinationPostalCode: (shipTo.zip || shipTo.postal_code || '').replace(/\s+/g, '').toUpperCase(),
      destinationCountry: shipTo.country,
      dimensions: dimensions,
      orderItems: order?.items || []
    });

    console.log('📝 XML Request:', xmlRequest);

    // Determine the correct endpoint (dev vs production)
    const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
    const baseUrl = isDev ? 'https://ct.soa-gw.canadapost.ca' : 'https://soa-gw.canadapost.ca';
    const endpoint = `${baseUrl}/rs/ship/price`;

    // Make request to Canada Post API
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Accept': 'application/vnd.cpc.ship.rate-v4+xml',
        'Content-Type': 'application/vnd.cpc.ship.rate-v4+xml',
        'Accept-Language': 'en-CA'
      },
      body: xmlRequest
    });

    console.log('📊 Canada Post API Response Status:', response.status);

    if (response.ok) {
      const xmlResponse = await response.text();
      console.log('📋 Canada Post XML Response:', xmlResponse.substring(0, 500) + '...');
      
      // Parse the XML response
      const rates = parseCanadaPostXMLResponse(xmlResponse);
      console.log('💰 Parsed rates:', rates);
      
      return new Response(JSON.stringify(rates), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      const errorText = await response.text();
      console.error('❌ Canada Post API Error:', response.status, errorText);
      
      // Return fallback rates on API error
      console.log('🔄 Returning fallback rates due to API error');
      const weightInKg = pkg.weight_unit === 'LBS' ? pkg.weight * 0.453592 : pkg.weight;
      return new Response(JSON.stringify(getFallbackRates(shipTo.country, weightInKg)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('💥 Error in Canada Post rating:', error);
    
    // Return fallback rates on any error
    return new Response(JSON.stringify(getFallbackRates('US', 1)), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});

function buildCanadaPostXMLRequest({
  customerNumber,
  weight,
  originPostalCode,
  destinationPostalCode,
  destinationCountry,
  dimensions,
  orderItems = []
}: {
  customerNumber: string;
  weight: number;
  originPostalCode: string;
  destinationPostalCode?: string;
  destinationCountry: string;
  dimensions?: any;
  orderItems?: Array<{
    id: string;
    sku: string;
    product_title: string;
    price: number;
    quantity: number;
    weight_lbs?: number;
    origin_country?: string;
    commodity_code?: string;
  }>;
}) {
  // Use dimensions if provided (already converted to CM)
  const dimensionsXml = dimensions ? `
    <dimensions>
      <length>${dimensions.length.toFixed(2)}</length>
      <width>${dimensions.width.toFixed(2)}</width>
      <height>${dimensions.height.toFixed(2)}</height>
    </dimensions>` : '';

  // Log order items for debugging
  if (orderItems.length > 0) {
    console.log('📋 Canada Post order items:', orderItems.map(item => ({
      sku: item.sku,
      title: item.product_title?.substring(0, 50) + '...',
      price: item.price,
      quantity: item.quantity,
      origin: item.origin_country
    })));
  }

  // Determine destination type based on country
  let destinationXml = '';
  if (destinationCountry === 'CA' && destinationPostalCode) {
    destinationXml = `
      <destination>
        <domestic>
          <postal-code>${destinationPostalCode}</postal-code>
        </domestic>
      </destination>`;
  } else if (destinationCountry === 'US' && destinationPostalCode) {
    destinationXml = `
      <destination>
        <united-states>
          <zip-code>${destinationPostalCode}</zip-code>
        </united-states>
      </destination>`;
  } else {
    destinationXml = `
      <destination>
        <international>
          <country-code>${destinationCountry}</country-code>
        </international>
      </destination>`;
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
  <customer-number>${customerNumber}</customer-number>
  <parcel-characteristics>
    <weight>${weight.toFixed(3)}</weight>${dimensionsXml}
  </parcel-characteristics>
  <origin-postal-code>${originPostalCode}</origin-postal-code>
  ${destinationXml}
</mailing-scenario>`;
}

function parseCanadaPostXMLResponse(xml: string): CanadaPostRate[] {
  const rates: CanadaPostRate[] = [];
  
  // Parse Canada Post XML response format
  // Look for price-quote elements containing service details
  const priceQuoteRegex = /<price-quote>([\s\S]*?)<\/price-quote>/g;
  let quoteMatch;
  
  while ((quoteMatch = priceQuoteRegex.exec(xml)) !== null) {
    const quoteContent = quoteMatch[1];
    
    // Extract service details from each price-quote
    const serviceCodeMatch = quoteContent.match(/<service-code>([^<]+)<\/service-code>/);
    const serviceNameMatch = quoteContent.match(/<service-name>([^<]+)<\/service-name>/);
    const dueMatch = quoteContent.match(/<due>([^<]+)<\/due>/);
    
    if (serviceCodeMatch && serviceNameMatch && dueMatch) {
      const serviceCode = serviceCodeMatch[1];
      const serviceName = serviceNameMatch[1];
      const price = parseFloat(dueMatch[1]);
      
      let serviceType = 'standard';
      let estimatedDays = '5-7';
      
      // Map Canada Post service codes to types and delivery times
      if (serviceCode.includes('DOM.RP') || serviceCode === 'REG') {
        serviceType = 'standard';
        estimatedDays = '5-7';
      } else if (serviceCode.includes('DOM.EP') || serviceCode === 'EXP') {
        serviceType = 'expedited';
        estimatedDays = '2-3';
      } else if (serviceCode.includes('DOM.XP') || serviceCode === 'XP') {
        serviceType = 'expedited';
        estimatedDays = '1-2';
      } else if (serviceCode.includes('DOM.PC') || serviceCode === 'PC') {
        serviceType = 'overnight';
        estimatedDays = '1';
      } else if (serviceCode.includes('USA.EP')) {
        serviceType = 'expedited';
        estimatedDays = '3-5';
      } else if (serviceCode.includes('USA.XP')) {
        serviceType = 'expedited';
        estimatedDays = '2-3';
      } else if (serviceCode.includes('INT')) {
        serviceType = 'international';
        estimatedDays = '7-14';
      }
      
      rates.push({
        carrier: 'Canada Post',
        service: serviceName,
        serviceCode,
        cost: price,
        deliveryDays: `${estimatedDays} business days`,
        currency: 'CAD'
      });
    }
  }
  
  return rates.length > 0 ? rates : getFallbackRates('US', 1);
}

function getFallbackRates(destinationCountry?: string, weight?: number): CanadaPostRate[] {
  // Calculate rate multiplier based on weight (in kg)
  const weightMultiplier = weight ? Math.max(1, weight * 0.5 + 0.5) : 1;
  
  // Return different fallback rates based on destination
  if (destinationCountry === 'US') {
    return [
      {
        carrier: 'Canada Post',
        service: 'Small Packet - USA Air',
        serviceCode: 'USA.SP.AIR',
        cost: Math.round((8.99 * weightMultiplier) * 100) / 100,
        deliveryDays: '7-14 business days',
        currency: 'CAD'
      },
      {
        carrier: 'Canada Post',
        service: 'Tracked Packet - USA',
        serviceCode: 'USA.TP',
        cost: Math.round((12.99 * weightMultiplier) * 100) / 100,
        deliveryDays: '7-10 business days',
        currency: 'CAD'
      },
      {
        carrier: 'Canada Post',
        service: 'Expedited Parcel - USA',
        serviceCode: 'USA.EP',
        cost: Math.round((24.99 * weightMultiplier) * 100) / 100,
        deliveryDays: '4-7 business days',
        currency: 'CAD'
      },
      {
        carrier: 'Canada Post',
        service: 'Xpresspost - USA',
        serviceCode: 'USA.XP',
        cost: Math.round((32.99 * weightMultiplier) * 100) / 100,
        deliveryDays: '2-3 business days',
        currency: 'CAD'
      }
    ];
  }

  // Default domestic rates
  return [
    {
      carrier: 'Canada Post',
      service: 'Regular Parcel',
      serviceCode: 'DOM.RP',
      cost: Math.round((15.99 * weightMultiplier) * 100) / 100,
      deliveryDays: '5-7 business days',
      currency: 'CAD'
    },
    {
      carrier: 'Canada Post',
      service: 'Expedited Parcel',
      serviceCode: 'DOM.EP',
      cost: Math.round((22.99 * weightMultiplier) * 100) / 100,
      deliveryDays: '2-3 business days',
      currency: 'CAD'
    },
    {
      carrier: 'Canada Post',
      service: 'Priority Courier',
      serviceCode: 'DOM.PC',
      cost: Math.round((35.99 * weightMultiplier) * 100) / 100,
      deliveryDays: '1 business day',
      currency: 'CAD'
    }
  ];
}