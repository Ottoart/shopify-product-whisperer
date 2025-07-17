import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { ensureValidUPSToken } from '../_shared/ups-auth.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShipmentRequest {
  orderId: string;
  serviceCode: string;
  shipFrom: {
    name: string;
    company?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  shipTo: {
    name: string;
    company?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
  };
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
    packageType: string; // UPS package type code
  };
  paymentInfo: {
    shipperAccountNumber: string;
    paymentType: string; // "prepaid" or "bill_to_account"
  };
  additionalServices?: {
    signatureRequired?: boolean;
    insuranceValue?: number;
    saturdayDelivery?: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase configuration' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return new Response(
        JSON.stringify({ 
          error: 'Authentication required',
          code: 'MISSING_AUTH'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid authentication',
          code: 'INVALID_AUTH',
          details: authError?.message 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ User authenticated:', user.id);

    const requestData: ShipmentRequest = await req.json();
    console.log('📦 Received shipment request:', JSON.stringify(requestData, null, 2));

    // Ensure we have a valid UPS token
    console.log('🔐 Checking UPS authentication...');
    const authResult = await ensureValidUPSToken(supabase, user.id);
    if (!authResult.success) {
      console.error('❌ UPS authentication failed:', authResult.error);
      
      // Return specific error messages for better debugging
      let errorMessage = authResult.error;
      let statusCode = 400;
      
      if (authResult.error?.includes('Invalid Authentication Information')) {
        errorMessage = 'UPS authentication expired. Please re-connect your UPS account.';
        statusCode = 401;
      } else if (authResult.error?.includes('refresh')) {
        errorMessage = 'UPS token refresh failed. Please re-connect your UPS account.';
        statusCode = 401;
      } else if (authResult.error?.includes('not configured')) {
        errorMessage = 'UPS is not configured for your account. Please connect UPS first.';
        statusCode = 400;
      }
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: 'UPS_AUTH_FAILED',
          details: authResult.error 
        }),
        { 
          status: statusCode, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ UPS authentication successful');
    const credentials = authResult.credentials;
    const upsAccountNumber = credentials.account_number;
    console.log('🔑 Using UPS account number:', upsAccountNumber);

    if (!upsAccountNumber) {
      return new Response(
        JSON.stringify({ error: 'UPS account number not configured. Please contact support.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    const requiredFields = [
      'serviceCode',
      'shipFrom.name', 'shipFrom.address', 'shipFrom.city', 'shipFrom.state', 'shipFrom.zip', 'shipFrom.country',
      'shipTo.name', 'shipTo.address', 'shipTo.city', 'shipTo.state', 'shipTo.zip', 'shipTo.country',
      'package.weight', 'package.length', 'package.width', 'package.height', 'package.packageType',
      'paymentInfo.shipperAccountNumber', 'paymentInfo.paymentType'
    ];

    const missingFields = requiredFields.filter(field => {
      const keys = field.split('.');
      let value = requestData as any;
      for (const key of keys) {
        value = value?.[key];
      }
      return !value;
    });

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields', 
          missing: missingFields 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Map service code if needed
    const mappedServiceCode = mapServiceCodeToUPS(requestData.serviceCode);
    console.log('🔍 Service code mapping:', requestData.serviceCode, '->', mappedServiceCode);

    // Construct UPS Shipment API request according to UPS API specification
    const upsShipmentRequest = {
      ShipmentRequest: {
        Shipment: {
          Shipper: {
            Name: requestData.shipFrom.name,
            ShipperNumber: upsAccountNumber,
            Address: {
              AddressLine: requestData.shipFrom.address2 
                ? [requestData.shipFrom.address, requestData.shipFrom.address2]
                : [requestData.shipFrom.address],
              City: requestData.shipFrom.city,
              StateProvinceCode: requestData.shipFrom.state,
              PostalCode: requestData.shipFrom.zip,
              CountryCode: requestData.shipFrom.country
            }
          },
          ShipTo: {
            Name: requestData.shipTo.name,
            Address: {
              AddressLine: requestData.shipTo.address2 
                ? [requestData.shipTo.address, requestData.shipTo.address2]
                : [requestData.shipTo.address],
              City: requestData.shipTo.city,
              StateProvinceCode: requestData.shipTo.state,
              PostalCode: requestData.shipTo.zip,
              CountryCode: requestData.shipTo.country
            }
          },
          Package: [{
            PackagingType: {
              Code: requestData.package.packageType || "02"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN"
              },
              Length: requestData.package.length.toString(),
              Width: requestData.package.width.toString(),
              Height: requestData.package.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS"
              },
              Weight: requestData.package.weight.toString()
            }
          }],
          Service: {
            Code: mappedServiceCode
          },
          PaymentInformation: {
            ShipmentCharge: {
              Type: "01",
              BillShipper: {
                AccountNumber: upsAccountNumber
              }
            }
          }
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: "GIF"
          }
        }
      }
    };

    console.log('📡 Sending UPS request:', JSON.stringify(upsShipmentRequest, null, 2));

    // Call UPS Shipment API
    const upsResponse = await fetch('https://wwwcie.ups.com/api/shipments/v2409/ship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.access_token}`,
        'transId': crypto.randomUUID(),
        'transactionSrc': 'shipment'
      },
      body: JSON.stringify(upsShipmentRequest)
    });

    const responseText = await upsResponse.text();
    console.log('📋 UPS Raw Response:', responseText);
    console.log('📊 UPS Response Status:', upsResponse.status);

    if (!upsResponse.ok) {
      console.error('❌ UPS API Error:', upsResponse.status, responseText);
      
      // Parse UPS error response for better error handling
      let upsError = 'UPS API Error';
      let errorCode = 'UPS_API_ERROR';
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.response?.errors?.[0]) {
          const error = errorData.response.errors[0];
          upsError = error.message || upsError;
          errorCode = error.code || errorCode;
          
          // Handle specific UPS errors
          if (error.code === '250002') {
            upsError = 'UPS authentication token expired. Please try again or re-connect UPS.';
            errorCode = 'UPS_TOKEN_EXPIRED';
          }
        }
      } catch (parseError) {
        console.error('Failed to parse UPS error response:', parseError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: upsError,
          code: errorCode,
          status: upsResponse.status,
          details: responseText
        }),
        { 
          status: 400, // Always return 400 so the client gets the response data
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let upsData;
    try {
      upsData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse UPS response:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid UPS response format' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ UPS Response parsed:', JSON.stringify(upsData, null, 2));

    // Extract shipping label data
    const shipmentResults = upsData.ShipmentResponse?.ShipmentResults;
    if (!shipmentResults) {
      console.error('❌ No shipment results in UPS response');
      return new Response(
        JSON.stringify({ error: 'Invalid UPS response: no shipment results' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const trackingNumber = shipmentResults.ShipmentIdentificationNumber;
    const labelImage = shipmentResults.PackageResults?.[0]?.ShippingLabel?.GraphicImage;
    const totalCost = shipmentResults.ShipmentCharges?.TotalCharges?.MonetaryValue;

    if (!trackingNumber || !labelImage) {
      console.error('❌ Missing tracking number or label image');
      return new Response(
        JSON.stringify({ error: 'Incomplete UPS response: missing tracking or label' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Store shipping label in database
    const { data: labelData, error: labelError } = await supabase
      .from('shipping_labels')
      .insert({
        user_id: user.id,
        order_id: requestData.orderId,
        carrier: 'UPS',
        service_code: mappedServiceCode,
        service_name: getUPSServiceName(mappedServiceCode),
        tracking_number: trackingNumber,
        label_image_data: labelImage,
        shipping_cost: totalCost ? parseFloat(totalCost) : null,
        label_format: 'GIF'
      })
      .select()
      .single();

    if (labelError) {
      console.error('❌ Error storing label:', labelError);
      return new Response(
        JSON.stringify({ error: 'Failed to store label in database' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update order with tracking information
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        carrier: 'UPS',
        service_type: getUPSServiceName(mappedServiceCode),
        shipping_cost: totalCost ? parseFloat(totalCost) : null,
        status: 'shipped',
        shipped_date: new Date().toISOString()
      })
      .eq('id', requestData.orderId)
      .eq('user_id', user.id);

    if (orderError) {
      console.error('⚠️ Error updating order:', orderError);
      // Don't fail the request since label was created successfully
    }

    console.log('✅ Label created successfully:', trackingNumber);

    return new Response(
      JSON.stringify({
        success: true,
        trackingNumber,
        labelUrl: `data:image/gif;base64,${labelImage}`,
        cost: totalCost ? parseFloat(totalCost) : null,
        estimatedDelivery: calculateEstimatedDelivery(mappedServiceCode)
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to map service codes to UPS codes
function mapServiceCodeToUPS(code: string): string {
  const mapping: { [key: string]: string } = {
    "UPS_GROUND": "03",
    "UPS_3_DAY_SELECT": "12",
    "UPS_2ND_DAY_AIR": "02",
    "UPS_NEXT_DAY_AIR": "01",
    "01": "01", // UPS Next Day Air
    "02": "02", // UPS 2nd Day Air
    "03": "03", // UPS Ground
    "12": "12"  // UPS 3 Day Select
  };
  
  return mapping[code] || code;
}

// Helper function to get UPS service name
function getUPSServiceName(code: string): string {
  const names: { [key: string]: string } = {
    "01": "UPS Next Day Air",
    "02": "UPS 2nd Day Air",
    "03": "UPS Ground",
    "12": "UPS 3 Day Select"
  };
  
  return names[code] || `UPS Service ${code}`;
}

// Helper function to get UPS package type name
function getUPSPackageTypeName(code: string): string {
  const types: { [key: string]: string } = {
    "01": "UPS Letter",
    "02": "Customer Supplied Package",
    "03": "Tube",
    "04": "PAK",
    "21": "UPS Express Box",
    "24": "UPS 25KG Box",
    "25": "UPS 10KG Box"
  };
  
  return types[code] || "Package";
}

// Helper function to calculate estimated delivery
function calculateEstimatedDelivery(serviceCode: string): string {
  const today = new Date();
  let deliveryDate = new Date(today);
  
  switch (serviceCode) {
    case "01": // Next Day Air
      deliveryDate.setDate(today.getDate() + 1);
      break;
    case "02": // 2nd Day Air
      deliveryDate.setDate(today.getDate() + 2);
      break;
    case "12": // 3 Day Select
      deliveryDate.setDate(today.getDate() + 3);
      break;
    case "03": // Ground
    default:
      deliveryDate.setDate(today.getDate() + 5);
      break;
  }
  
  return deliveryDate.toISOString().split('T')[0];
}