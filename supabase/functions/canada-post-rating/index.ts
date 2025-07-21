import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

interface RatingRequest {
  shipFrom: {
    postalCode: string;
    country: string;
  };
  shipTo: {
    postalCode: string;
    country: string;
  };
  package: {
    weight: number; // in kg
    length: number; // in cm
    width: number;  // in cm
    height: number; // in cm
  };
}

interface CanadaPostRate {
  serviceCode: string;
  serviceName: string;
  serviceType: string;
  price: number;
  currency: string;
  estimatedDays: string;
  deliveryDate?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: RatingRequest = await req.json();
    console.log('Canada Post rating request:', request);

    // Get API credentials from environment
    const isDev = Deno.env.get('ENVIRONMENT') !== 'production';
    const apiKey = isDev 
      ? Deno.env.get('CANADA_POST_DEV_API_KEY')
      : Deno.env.get('CANADA_POST_PROD_API_KEY');
    const apiSecret = isDev 
      ? Deno.env.get('CANADA_POST_DEV_API_SECRET')
      : Deno.env.get('CANADA_POST_PROD_API_SECRET');

    if (!apiKey || !apiSecret) {
      console.error('Canada Post API credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Canada Post API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Canada Post API endpoint
    const baseUrl = isDev 
      ? 'https://ct.soa-gw.canadapost.ca' 
      : 'https://soa-gw.canadapost.ca';
    
    // Create rating request XML
    const ratingXml = `<?xml version="1.0" encoding="UTF-8"?>
<rating-request xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
  <customer-number>${apiKey}</customer-number>
  <parcel-characteristics>
    <weight>${request.package.weight}</weight>
    <dimensions>
      <length>${request.package.length}</length>
      <width>${request.package.width}</width>
      <height>${request.package.height}</height>
    </dimensions>
  </parcel-characteristics>
  <origin-postal-code>${request.shipFrom.postalCode.replace(/\s/g, '')}</origin-postal-code>
  <destination>
    <domestic>
      <postal-code>${request.shipTo.postalCode.replace(/\s/g, '')}</postal-code>
    </domestic>
  </destination>
</rating-request>`;

    console.log('Canada Post XML request:', ratingXml);

    // Make API call to Canada Post
    const response = await fetch(`${baseUrl}/rs/ship/price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.cpc.ship.rate-v4+xml',
        'Accept': 'application/vnd.cpc.ship.rate-v4+xml',
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Accept-language': 'en-CA'
      },
      body: ratingXml
    });

    console.log('Canada Post API response status:', response.status);
    const responseText = await response.text();
    console.log('Canada Post API response:', responseText);

    if (!response.ok) {
      console.error('Canada Post API error:', response.status, responseText);
      
      // Return fallback rates if API fails
      return new Response(
        JSON.stringify({ 
          rates: getFallbackRates(),
          source: 'fallback',
          error: `Canada Post API error: ${response.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse XML response (simplified - in production you'd want a proper XML parser)
    const rates = parseCanadaPostXMLResponse(responseText);

    return new Response(
      JSON.stringify({ 
        rates,
        source: 'canada_post_api'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Canada Post rating error:', error);
    
    // Return fallback rates on error
    return new Response(
      JSON.stringify({ 
        rates: getFallbackRates(),
        source: 'fallback_error',
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseCanadaPostXMLResponse(xml: string): CanadaPostRate[] {
  const rates: CanadaPostRate[] = [];
  
  // This is a simplified XML parser - in production use a proper XML library
  const serviceRegex = /<service-name>([^<]+)<\/service-name>[\s\S]*?<service-code>([^<]+)<\/service-code>[\s\S]*?<price>([^<]+)<\/price>/g;
  let match;
  
  while ((match = serviceRegex.exec(xml)) !== null) {
    const [, serviceName, serviceCode, price] = match;
    
    let serviceType = 'standard';
    let estimatedDays = '5-7';
    
    // Map service codes to types and delivery times
    switch (serviceCode) {
      case 'REG':
        serviceType = 'standard';
        estimatedDays = '5-7';
        break;
      case 'EXP':
        serviceType = 'expedited';
        estimatedDays = '2-3';
        break;
      case 'XP':
        serviceType = 'expedited';
        estimatedDays = '1-2';
        break;
      case 'PC':
        serviceType = 'overnight';
        estimatedDays = '1';
        break;
      default:
        serviceType = 'standard';
        estimatedDays = '3-5';
    }
    
    rates.push({
      serviceCode,
      serviceName,
      serviceType,
      price: parseFloat(price),
      currency: 'CAD',
      estimatedDays: `${estimatedDays} business days`
    });
  }
  
  return rates.length > 0 ? rates : getFallbackRates();
}

function getFallbackRates(): CanadaPostRate[] {
  const baseRate = 12.50; // Base rate in CAD
  
  return [
    {
      serviceCode: 'REG',
      serviceName: 'Regular Parcel',
      serviceType: 'standard',
      price: baseRate,
      currency: 'CAD',
      estimatedDays: '5-7 business days'
    },
    {
      serviceCode: 'EXP',
      serviceName: 'Expedited Parcel',
      serviceType: 'expedited',
      price: baseRate * 1.6,
      currency: 'CAD',
      estimatedDays: '2-3 business days'
    },
    {
      serviceCode: 'PC',
      serviceName: 'Priority Courier',
      serviceType: 'overnight',
      price: baseRate * 2.5,
      currency: 'CAD',
      estimatedDays: '1 business day'
    }
  ];
}