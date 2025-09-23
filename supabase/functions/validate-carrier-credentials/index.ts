import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { carrier_name, api_credentials } = await req.json()
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ error: 'Missing authorization header' }, { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return Response.json({ error: 'Authentication failed' }, { status: 401, headers: corsHeaders })
    }

    let validationResult = { valid: false, error: 'Unknown carrier' }

    // Validate based on carrier type
    switch (carrier_name.toLowerCase()) {
      case 'ups':
        validationResult = await validateUPSCredentials(api_credentials)
        break
      case 'canada_post':
        validationResult = await validateCanadaPostCredentials(api_credentials)
        break
      case 'shipstation':
        validationResult = await validateShipStationCredentials(api_credentials)
        break
      case 'sendle':
        validationResult = await validateSendleCredentials(api_credentials)
        break
      default:
        validationResult = { valid: false, error: 'Unsupported carrier' }
    }

    return Response.json(validationResult, { headers: corsHeaders })

  } catch (error) {
    console.error('Validation error:', error)
    return Response.json(
      { valid: false, error: 'Validation failed due to server error' },
      { status: 500, headers: corsHeaders }
    )
  }
})

async function validateUPSCredentials(credentials: any) {
  const { client_id, client_secret, account_number } = credentials

  if (!client_id || !client_secret) {
    return { valid: false, error: 'Client ID and Client Secret are required' }
  }

  try {
    // Get OAuth token first
    const tokenResponse = await fetch('https://wwwcie.ups.com/security/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${client_id}:${client_secret}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!tokenResponse.ok) {
      return { valid: false, error: 'Invalid UPS credentials' }
    }

    const tokenData = await tokenResponse.json()
    
    // Test with a simple API call
    const testResponse = await fetch('https://wwwcie.ups.com/api/rating/v1/rate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        RateRequest: {
          Request: {
            RequestOption: "Rate",
            TransactionReference: {
              CustomerContext: "test"
            }
          },
          Shipment: {
            Shipper: {
              Name: "Test",
              Address: {
                AddressLine: "123 Test St",
                City: "Test City",
                StateProvinceCode: "CA",
                PostalCode: "90210",
                CountryCode: "US"
              }
            },
            ShipTo: {
              Name: "Test Recipient",
              Address: {
                AddressLine: "456 Test Ave",
                City: "Test City",
                StateProvinceCode: "NY",
                PostalCode: "10001",
                CountryCode: "US"
              }
            },
            Package: [{
              PackagingType: {
                Code: "02"
              },
              Dimensions: {
                UnitOfMeasurement: {
                  Code: "IN"
                },
                Length: "10",
                Width: "10",
                Height: "10"
              },
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: "LBS"
                },
                Weight: "1"
              }
            }],
            Service: {
              Code: "03"
            }
          }
        }
      })
    })

    if (testResponse.ok) {
      return { valid: true, message: 'UPS credentials validated successfully' }
    } else {
      return { valid: false, error: 'UPS API test failed' }
    }

  } catch (error) {
    console.error('UPS validation error:', error)
    return { valid: false, error: 'Failed to validate UPS credentials' }
  }
}

async function validateCanadaPostCredentials(credentials: any) {
  const { api_username, api_password, customer_number, environment } = credentials

  if (!api_username || !api_password || !customer_number) {
    return { valid: false, error: 'API Username, API Password, and Customer Number are required' }
  }

  try {
    // Test credentials by making a request to Canada Post API
    const baseUrl = environment === 'production' 
      ? 'https://soa-gw.canadapost.ca' 
      : 'https://ct.soa-gw.canadapost.ca';
    
    const response = await fetch(`${baseUrl}/rs/ship/service`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${api_username}:${api_password}`)}`,
        'Accept': 'application/vnd.cpc.ship+xml',
        'Accept-language': 'en-CA'
      }
    });
    
    if (response.ok) {
      return { valid: true, message: 'Canada Post credentials validated successfully' };
    } else {
      return { valid: false, error: `API validation failed: ${response.status} ${response.statusText}` };
    }
  } catch (error) {
    console.error('Canada Post validation error:', error);
    return { valid: false, error: 'Failed to validate credentials against Canada Post API' };
  }
}

async function validateShipStationCredentials(credentials: any) {
  const { api_key, api_secret } = credentials

  if (!api_key || !api_secret) {
    return { valid: false, error: 'API Key and API Secret are required' }
  }

  try {
    const response = await fetch('https://ssapi.shipstation.com/accounts', {
      headers: {
        'Authorization': `Basic ${btoa(`${api_key}:${api_secret}`)}`
      }
    })

    if (response.ok) {
      return { valid: true, message: 'ShipStation credentials validated successfully' }
    } else {
      return { valid: false, error: 'Invalid ShipStation credentials' }
    }
  } catch (error) {
    console.error('ShipStation validation error:', error)
    return { valid: false, error: 'Failed to validate ShipStation credentials' }
  }
}

async function validateSendleCredentials(credentials: any) {
  const { api_key, api_secret } = credentials

  if (!api_key || !api_secret) {
    return { valid: false, error: 'API Key and API Secret are required' }
  }

  // For demo purposes, accept any non-empty credentials
  return { valid: true, message: 'Sendle credentials format validated' }
}