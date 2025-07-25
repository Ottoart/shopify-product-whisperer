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

    if (canadaPostConfig?.api_credentials?.system_carrier) {
      // This is a PrepFox managed Canada Post - use system credentials
      console.log('🔑 Using PrepFox managed Canada Post credentials');
      const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
      apiKey = isDev 
        ? Deno.env.get('CANADA_POST_DEV_API_KEY')
        : Deno.env.get('CANADA_POST_PROD_API_KEY');
      apiSecret = isDev 
        ? Deno.env.get('CANADA_POST_DEV_API_SECRET')
        : Deno.env.get('CANADA_POST_PROD_API_SECRET');
      customerNumber = '2004381'; // Use a valid customer number instead of 0000000
    } else if (canadaPostConfig?.api_credentials) {
      // User provided their own Canada Post credentials
      console.log('🔑 Using user provided Canada Post credentials');
      apiKey = canadaPostConfig.api_credentials.apiKey;
      apiSecret = canadaPostConfig.api_credentials.apiSecret;
      customerNumber = canadaPostConfig.api_credentials.customerNumber || '2004381';
    }

    if (!apiKey || !apiSecret) {
      console.log('⚠️ No Canada Post credentials available, returning fallback rates');
      return new Response(JSON.stringify(getFallbackRates(shipTo.country)), {
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

    // Build XML request according to Canada Post API specification
    const xmlRequest = buildCanadaPostXMLRequest({
      customerNumber: customerNumber || '2004381',
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
      return new Response(JSON.stringify(getFallbackRates(shipTo.country)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('💥 Error in Canada Post rating:', error);
    
    // Return fallback rates on any error
    return new Response(JSON.stringify(getFallbackRates('US')), {
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
  
  return rates.length > 0 ? rates : getFallbackRates('US');
}

function getFallbackRates(destinationCountry?: string): CanadaPostRate[] {
  // Return different fallback rates based on destination
  if (destinationCountry === 'US') {
    return [
      {
        carrier: 'Canada Post',
        service: 'Tracked Packet - USA',
        serviceCode: 'USA.TP',
        cost: 12.99,
        deliveryDays: '7-10 business days',
        currency: 'CAD'
      },
      {
        carrier: 'Canada Post',
        service: 'Small Packet - USA Air',
        serviceCode: 'USA.SP.AIR',
        cost: 8.99,
        deliveryDays: '7-14 business days',
        currency: 'CAD'
      },
      {
        carrier: 'Canada Post',
        service: 'Expedited Parcel - USA',
        serviceCode: 'USA.EP',
        cost: 24.99,
        deliveryDays: '4-7 business days',
        currency: 'CAD'
      },
      {
        carrier: 'Canada Post',
        service: 'Xpresspost - USA',
        serviceCode: 'USA.XP',
        cost: 32.99,
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
      cost: 15.99,
      deliveryDays: '5-7 business days',
      currency: 'CAD'
    },
    {
      carrier: 'Canada Post',
      service: 'Expedited Parcel',
      serviceCode: 'DOM.EP',
      cost: 22.99,
      deliveryDays: '2-3 business days',
      currency: 'CAD'
    },
    {
      carrier: 'Canada Post',
      service: 'Priority Courier',
      serviceCode: 'DOM.PC',
      cost: 35.99,
      deliveryDays: '1 business day',
      currency: 'CAD'
    }
  ];
}