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

    // Test API call to Canada Post
    const testXmlRequest = `<?xml version="1.0" encoding="utf-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
  <customer-number>2004381</customer-number>
  <parcel-characteristics>
    <weight>0.500</weight>
    <dimensions>
      <length>25.40</length>
      <width>20.32</width>
      <height>10.16</height>
    </dimensions>
  </parcel-characteristics>
  <origin-postal-code>K1A0A6</origin-postal-code>
  <destination>
    <domestic>
      <postal-code>M5V3A8</postal-code>
    </domestic>
  </destination>
</mailing-scenario>`;

    const endpoint = 'https://ct.soa-gw.canadapost.ca/rs/ship/price';
    
    console.log('🚀 Testing Canada Post API call to:', endpoint);
    console.log('📝 Using credentials:', `${devApiKey?.substring(0, 8)}...`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${devApiKey}:${devApiSecret}`)}`,
        'Accept': 'application/vnd.cpc.ship.rate-v4+xml',
        'Content-Type': 'application/vnd.cpc.ship.rate-v4+xml',
        'Accept-Language': 'en-CA'
      },
      body: testXmlRequest
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