import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Testing Canada Post Authentication');
    
    // Check environment variables
    const devApiKey = Deno.env.get('CANADA_POST_DEV_API_KEY');
    const devApiSecret = Deno.env.get('CANADA_POST_DEV_API_SECRET');
    const prodApiKey = Deno.env.get('CANADA_POST_PROD_API_KEY');
    const prodApiSecret = Deno.env.get('CANADA_POST_PROD_API_SECRET');
    
    console.log('🔍 Environment Variables Status:');
    console.log(`DEV API Key: ${devApiKey ? 'SET' : 'NOT SET'}`);
    console.log(`DEV API Secret: ${devApiSecret ? 'SET' : 'NOT SET'}`);
    console.log(`PROD API Key: ${prodApiKey ? 'SET' : 'NOT SET'}`);
    console.log(`PROD API Secret: ${prodApiSecret ? 'SET' : 'NOT SET'}`);
    
    if (!devApiKey || !devApiSecret) {
      return new Response(JSON.stringify({
        error: 'Canada Post development credentials not configured',
        status: {
          dev_key: devApiKey ? 'set' : 'missing',
          dev_secret: devApiSecret ? 'set' : 'missing',
          prod_key: prodApiKey ? 'set' : 'missing',
          prod_secret: prodApiSecret ? 'set' : 'missing'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Test with SOAP DiscoverServices call
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:rat="http://www.canadapost.ca/ws/soap/ship/rate/v4">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${devApiKey}</wsse:Username>
        <wsse:Password>${devApiSecret}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <rat:discover-services-request>
      <rat:locale>EN</rat:locale>
      <rat:destination-country-code>CA</rat:destination-country-code>
    </rat:discover-services-request>
  </soapenv:Body>
</soapenv:Envelope>`;

    const endpoint = 'https://ct.soa-gw.canadapost.ca/rs/soap/rating/v4';
    
    console.log('🚀 Testing Canada Post SOAP API call to:', endpoint);
    console.log('📝 Using credentials:', `${devApiKey?.substring(0, 8)}...`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': '',
        'Accept': 'text/xml'
      },
      body: soapBody
    });

    console.log('📊 Canada Post API Response Status:', response.status);
    const responseText = await response.text();
    console.log('📋 Canada Post Response (first 500 chars):', responseText.substring(0, 500));

    return new Response(JSON.stringify({
      status: 'test_complete',
      api_status: response.status,
      api_ok: response.ok,
      response_preview: responseText.substring(0, 500),
      credentials_status: {
        dev_key: devApiKey ? 'set' : 'missing',
        dev_secret: devApiSecret ? 'set' : 'missing'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Error in Canada Post test:', error);
    return new Response(JSON.stringify({
      error: error.message,
      status: 'error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});