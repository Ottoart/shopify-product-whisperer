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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData: ShipmentRequest = await req.json();
    console.log('📦 Received shipment request:', JSON.stringify(requestData, null, 2));

    // Ensure we have a valid UPS token
    console.log('🔐 Checking UPS authentication...');
    const authResult = await ensureValidUPSToken(supabase, user.id);
    if (!authResult.success) {
      console.error('❌ UPS authentication failed:', authResult.error);
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { 
          status: 400, 
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

    // Prepare UPS Shipment API request
    const shipmentRequest = {
      ShipmentRequest: {
        Request: {
          RequestOption: "nonvalidate",
          TransactionReference: {
            CustomerContext: "Shipment Creation"
          }
        },
        Shipment: {
          Description: `Order ${requestData.orderId}`,
          Shipper: {
            Name: requestData.shipFrom.name,
            AttentionName: requestData.shipFrom.name,
            CompanyDisplayableName: requestData.shipFrom.company || requestData.shipFrom.name,
            ShipperNumber: upsAccountNumber,
            Address: {
              AddressLine: requestData.shipFrom.address2 
                ? [requestData.shipFrom.address, requestData.shipFrom.address2]
                : [requestData.shipFrom.address],
              City: requestData.shipFrom.city,
              StateProvinceCode: requestData.shipFrom.state,
              PostalCode: requestData.shipFrom.zip,
              CountryCode: requestData.shipFrom.country
            },
            Phone: requestData.shipFrom.phone ? {
              Number: requestData.shipFrom.phone
            } : undefined
          },
          ShipTo: {
            Name: requestData.shipTo.name,
            AttentionName: requestData.shipTo.name,
            CompanyDisplayableName: requestData.shipTo.company || requestData.shipTo.name,
            Address: {
              AddressLine: requestData.shipTo.address2 
                ? [requestData.shipTo.address, requestData.shipTo.address2]
                : [requestData.shipTo.address],
              City: requestData.shipTo.city,
              StateProvinceCode: requestData.shipTo.state,
              PostalCode: requestData.shipTo.zip,
              CountryCode: requestData.shipTo.country,
              ResidentialAddressIndicator: "1"
            },
            Phone: requestData.shipTo.phone ? {
              Number: requestData.shipTo.phone
            } : undefined
          },
          ShipFrom: {
            Name: requestData.shipFrom.name,
            AttentionName: requestData.shipFrom.name,
            CompanyDisplayableName: requestData.shipFrom.company || requestData.shipFrom.name,
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
          PaymentInformation: {
            ShipmentCharge: {
              Type: requestData.paymentInfo.paymentType === "prepaid" ? "01" : "02",
              BillShipper: {
                AccountNumber: upsAccountNumber
              }
            }
          },
          Service: {
            Code: mappedServiceCode,
            Description: getUPSServiceName(mappedServiceCode)
          },
          Package: [
            {
              Description: "Package",
              Packaging: {
                Code: requestData.package.packageType,
                Description: getUPSPackageTypeName(requestData.package.packageType)
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
              },
              ReferenceNumber: [
                {
                  Code: "02",
                  Value: requestData.orderId
                }
              ]
            }
          ]
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: "GIF"
          },
          HTTPUserAgent: "Mozilla/4.5"
        }
      }
    };

    // Add additional services if specified
    if (requestData.additionalServices) {
      const services = [];
      
      if (requestData.additionalServices.signatureRequired) {
        services.push({
          Code: "01", // Delivery Confirmation Signature Required
          Description: "Delivery Confirmation Signature Required"
        });
      }
      
      if (requestData.additionalServices.insuranceValue && requestData.additionalServices.insuranceValue > 0) {
        services.push({
          Code: "09", // Declared Value
          Description: "Declared Value",
          MonetaryValue: requestData.additionalServices.insuranceValue.toString()
        });
      }
      
      if (requestData.additionalServices.saturdayDelivery) {
        services.push({
          Code: "16", // Saturday Delivery
          Description: "Saturday Delivery"
        });
      }
      
      if (services.length > 0) {
        shipmentRequest.ShipmentRequest.Shipment.ShipmentServiceOptions = services;
      }
    }

    console.log('🔍 Sending UPS shipment request with account:', upsAccountNumber);
    console.log('🔍 Service code being used:', mappedServiceCode);
    console.log('🔍 Full shipment request:', JSON.stringify(shipmentRequest, null, 2));

    // Call UPS Shipment API
    const upsResponse = await fetch('https://onlinetools.ups.com/api/shipments/v1/ship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.access_token}`,
        'transId': crypto.randomUUID(),
        'transactionSrc': 'shipment'
      },
      body: JSON.stringify(shipmentRequest)
    });

    const responseText = await upsResponse.text();
    console.log('🔍 UPS Shipment API response status:', upsResponse.status);
    console.log('🔍 UPS Shipment API response headers:', Object.fromEntries(upsResponse.headers.entries()));
    console.log('🔍 UPS Shipment API response body:', responseText);

    if (!upsResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'UPS Shipment API error', 
          details: responseText,
          status: upsResponse.status 
        }),
        { 
          status: upsResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let upsData;
    try {
      upsData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse UPS response:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid response from UPS API' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract shipment details from response
    const shipmentResponse = upsData.ShipmentResponse;
    if (!shipmentResponse) {
      return new Response(
        JSON.stringify({ error: 'Invalid shipment response format' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const trackingNumber = shipmentResponse.ShipmentResults?.PackageResults?.[0]?.TrackingNumber;
    const labelImageData = shipmentResponse.ShipmentResults?.PackageResults?.[0]?.ShippingLabel?.GraphicImage;
    const shipmentCost = shipmentResponse.ShipmentResults?.ShipmentCharges?.TotalCharges?.MonetaryValue;
    const shipmentIdentificationNumber = shipmentResponse.ShipmentResults?.ShipmentIdentificationNumber;

    // Store the label and shipment info in database
    const { error: insertError } = await supabase
      .from('shipping_labels')
      .insert({
        user_id: user.id,
        order_id: requestData.orderId,
        tracking_number: trackingNumber,
        carrier: 'UPS',
        service_code: requestData.serviceCode,
        service_name: getUPSServiceName(requestData.serviceCode),
        shipment_identification_number: shipmentIdentificationNumber,
        label_image_data: labelImageData,
        shipping_cost: parseFloat(shipmentCost || '0'),
        currency: 'USD',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Failed to store shipping label:', insertError);
    }

    // Update order with tracking information
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        carrier: 'UPS',
        service_type: getUPSServiceName(requestData.serviceCode),
        shipping_cost: parseFloat(shipmentCost || '0'),
        status: 'shipped',
        shipped_date: new Date().toISOString()
      })
      .eq('id', requestData.orderId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        trackingNumber,
        shipmentIdentificationNumber,
        labelImageData,
        shippingCost: parseFloat(shipmentCost || '0'),
        currency: 'USD',
        estimatedDeliveryDate: calculateEstimatedDelivery(requestData.serviceCode)
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('UPS shipment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function mapServiceCodeToUPS(code: string): string {
  const serviceCodeMap: { [key: string]: string } = {
    'UPS_NEXT_DAY_AIR': '01',
    'UPS_2ND_DAY_AIR': '02', 
    'UPS_GROUND': '03',
    'UPS_3_DAY_SELECT': '12',
    'UPS_NEXT_DAY_AIR_SAVER': '13',
    'UPS_NEXT_DAY_AIR_EARLY': '14',
    'UPS_WORLDWIDE_EXPRESS': '07',
    'UPS_WORLDWIDE_EXPEDITED': '08',
    'UPS_2ND_DAY_AIR_AM': '59',
    'UPS_SAVER': '65',
    // Handle numeric codes as-is
    '01': '01', '02': '02', '03': '03', '07': '07', '08': '08',
    '11': '11', '12': '12', '13': '13', '14': '14', '54': '54',
    '59': '59', '65': '65'
  };
  return serviceCodeMap[code] || code;
}

function getUPSServiceName(code: string): string {
  const serviceNames: { [key: string]: string } = {
    '01': 'UPS Next Day Air',
    '02': 'UPS 2nd Day Air',
    '03': 'UPS Ground',
    '07': 'UPS Worldwide Express',
    '08': 'UPS Worldwide Expedited',
    '11': 'UPS Standard',
    '12': 'UPS 3 Day Select',
    '13': 'UPS Next Day Air Saver',
    '14': 'UPS Next Day Air Early',
    '54': 'UPS Worldwide Express Plus',
    '59': 'UPS 2nd Day Air A.M.',
    '65': 'UPS Saver'
  };
  return serviceNames[code] || `UPS Service ${code}`;
}

function getUPSPackageTypeName(code: string): string {
  const packageTypes: { [key: string]: string } = {
    '01': 'UPS Letter',
    '02': 'Customer Supplied Package',
    '03': 'Tube',
    '04': 'PAK',
    '21': 'UPS Express Box',
    '24': 'UPS 25KG Box',
    '25': 'UPS 10KG Box',
    '30': 'Pallet',
    '2a': 'Small Express Box',
    '2b': 'Medium Express Box',
    '2c': 'Large Express Box'
  };
  return packageTypes[code] || 'Customer Supplied Package';
}

function calculateEstimatedDelivery(serviceCode: string): string {
  const estimatedDays: { [key: string]: number } = {
    '01': 1, // Next Day Air
    '02': 2, // 2nd Day Air
    '03': 5, // Ground
    '07': 2, // Worldwide Express
    '08': 3, // Worldwide Expedited
    '11': 5, // Standard
    '12': 3, // 3 Day Select
    '13': 1, // Next Day Air Saver
    '14': 1, // Next Day Air Early
    '54': 1, // Worldwide Express Plus
    '59': 2, // 2nd Day Air A.M.
    '65': 5  // Saver
  };
  
  const days = estimatedDays[serviceCode] || 5;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  return deliveryDate.toISOString().split('T')[0];
}