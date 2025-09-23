import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShipmentDetails {
  from: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  to: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
    value?: number;
  };
  options?: {
    signature_required?: boolean;
    insurance?: boolean;
    saturday_delivery?: boolean;
  };
}

interface ShipmentResponse {
  id: string;
  tracking_number: string;
  label_url?: string;
  label_pdf?: string;
  cost: number;
  currency: string;
  service_code: string;
  service_name: string;
  carrier: string;
  estimated_delivery?: string;
}

// UPS Carrier Implementation (simplified for shipment creation)
class UPSCarrier {
  private credentials: any;
  private accessToken: string | null = null;
  private baseUrl = 'https://wwwcie.ups.com';

  constructor(credentials: any) {
    this.credentials = credentials;
  }

  private async authenticate(): Promise<void> {
    const tokenBody = new URLSearchParams();
    
    if (this.credentials.refresh_token) {
      tokenBody.append('grant_type', 'refresh_token');
      tokenBody.append('refresh_token', this.credentials.refresh_token);
    } else {
      tokenBody.append('grant_type', 'client_credentials');
    }

    const response = await fetch(`${this.baseUrl}/security/v1/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.credentials.client_id}:${this.credentials.client_secret}`)}`
      },
      body: tokenBody
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`UPS authentication failed: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  async createShipment(shipmentDetails: ShipmentDetails, serviceCode: string): Promise<ShipmentResponse> {
    await this.authenticate();

    const shipmentRequest = {
      ShipmentRequest: {
        Request: {
          RequestOption: 'nonvalidate',
          TransactionReference: {
            CustomerContext: `Shipment_${Date.now()}`
          }
        },
        Shipment: {
          Description: 'PrepFox Shipment',
          Shipper: {
            Name: shipmentDetails.from.name,
            ShipperNumber: this.credentials.account_number,
            Address: {
              AddressLine: [shipmentDetails.from.address],
              City: shipmentDetails.from.city,
              StateProvinceCode: shipmentDetails.from.state,
              PostalCode: shipmentDetails.from.postal_code,
              CountryCode: shipmentDetails.from.country
            }
          },
          ShipTo: {
            Name: shipmentDetails.to.name,
            Address: {
              AddressLine: [shipmentDetails.to.address],
              City: shipmentDetails.to.city,
              StateProvinceCode: shipmentDetails.to.state,
              PostalCode: shipmentDetails.to.postal_code,
              CountryCode: shipmentDetails.to.country
            }
          },
          ShipFrom: {
            Name: shipmentDetails.from.name,
            Address: {
              AddressLine: [shipmentDetails.from.address],
              City: shipmentDetails.from.city,
              StateProvinceCode: shipmentDetails.from.state,
              PostalCode: shipmentDetails.from.postal_code,
              CountryCode: shipmentDetails.from.country
            }
          },
          Service: {
            Code: serviceCode,
            Description: this.getServiceName(serviceCode)
          },
          Package: [{
            Description: 'Package',
            PackagingType: {
              Code: '02'
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'IN'
              },
              Length: shipmentDetails.package.length.toString(),
              Width: shipmentDetails.package.width.toString(),
              Height: shipmentDetails.package.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'LBS'
              },
              Weight: shipmentDetails.package.weight.toString()
            }
          }],
          PaymentInformation: {
            ShipmentCharge: {
              Type: '01',
              BillShipper: {
                AccountNumber: this.credentials.account_number
              }
            }
          }
        },
        LabelSpecification: {
          LabelImageFormat: {
            Code: 'PDF'
          },
          HTTPUserAgent: 'Mozilla/4.5'
        }
      }
    };

    const response = await fetch(`${this.baseUrl}/api/shipments/v1/ship`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'transId': `Shipment_${Date.now()}`,
        'transactionSrc': 'PrepFox'
      },
      body: JSON.stringify(shipmentRequest)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`UPS shipment creation failed: ${error}`);
    }

    const data = await response.json();
    const shipmentResults = data.ShipmentResponse.ShipmentResults;

    return {
      id: shipmentResults.ShipmentIdentificationNumber,
      tracking_number: shipmentResults.PackageResults[0].TrackingNumber,
      label_pdf: shipmentResults.PackageResults[0].ShippingLabel.GraphicImage,
      cost: parseFloat(shipmentResults.ShipmentCharges.TotalCharges.MonetaryValue),
      currency: shipmentResults.ShipmentCharges.TotalCharges.CurrencyCode,
      service_code: serviceCode,
      service_name: this.getServiceName(serviceCode),
      carrier: 'UPS'
    };
  }

  private getServiceName(serviceCode: string): string {
    const services: Record<string, string> = {
      '01': 'UPS Next Day Air',
      '02': 'UPS 2nd Day Air',
      '03': 'UPS Ground',
      '12': 'UPS 3 Day Select',
      '13': 'UPS Next Day Air Saver',
      '14': 'UPS Next Day Air Early',
      '59': 'UPS 2nd Day Air A.M.'
    };
    return services[serviceCode] || `UPS Service ${serviceCode}`;
  }
}

// Canada Post Carrier Implementation (simplified for shipment creation)
class CanadaPostCarrier {
  private credentials: any;
  private baseUrl: string;

  constructor(credentials: any) {
    this.credentials = credentials;
    this.baseUrl = credentials.is_production 
      ? 'https://soa-gw.canadapost.ca'
      : 'https://ct.soa-gw.canadapost.ca';
  }

  private getAuthHeader(): string {
    const token = btoa(`${this.credentials.api_key}:${this.credentials.api_secret}`);
    return `Basic ${token}`;
  }

  async createShipment(shipmentDetails: ShipmentDetails, serviceCode: string): Promise<ShipmentResponse> {
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<non-contract-shipment xmlns="http://www.canadapost.ca/ws/ship/ncs-v2">
  <delivery-spec>
    <service-code>${serviceCode}</service-code>
    <sender>
      <name>${shipmentDetails.from.name}</name>
      <company>${shipmentDetails.from.company || ''}</company>
      <contact-phone>${shipmentDetails.from.phone || ''}</contact-phone>
      <address-details>
        <address-line-1>${shipmentDetails.from.address}</address-line-1>
        <city>${shipmentDetails.from.city}</city>
        <prov-state>${shipmentDetails.from.state}</prov-state>
        <country-code>${shipmentDetails.from.country}</country-code>
        <postal-zip-code>${shipmentDetails.from.postal_code.replace(/\s/g, '')}</postal-zip-code>
      </address-details>
    </sender>
    <destination>
      <name>${shipmentDetails.to.name}</name>
      <company>${shipmentDetails.to.company || ''}</company>
      <address-details>
        <address-line-1>${shipmentDetails.to.address}</address-line-1>
        <city>${shipmentDetails.to.city}</city>
        <prov-state>${shipmentDetails.to.state}</prov-state>
        <country-code>${shipmentDetails.to.country}</country-code>
        <postal-zip-code>${shipmentDetails.to.postal_code.replace(/\s/g, '')}</postal-zip-code>
      </address-details>
    </destination>
    <parcel-characteristics>
      <weight>${(shipmentDetails.package.weight * 0.453592).toFixed(2)}</weight>
      <dimensions>
        <length>${(shipmentDetails.package.length * 2.54).toFixed(1)}</length>
        <width>${(shipmentDetails.package.width * 2.54).toFixed(1)}</width>
        <height>${(shipmentDetails.package.height * 2.54).toFixed(1)}</height>
      </dimensions>
    </parcel-characteristics>
    <print-preferences>
      <output-format>8.5x11</output-format>
    </print-preferences>
  </delivery-spec>
</non-contract-shipment>`;

    const response = await fetch(`${this.baseUrl}/rs/ncs/ncs`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/vnd.cpc.ship.ncs-v2+xml',
        'Accept': 'application/vnd.cpc.ship.ncs-v2+xml'
      },
      body: xmlRequest
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Canada Post shipment creation failed: ${error}`);
    }

    const xmlResponse = await response.text();
    
    // Simple XML parsing for key fields
    const shipmentIdMatch = xmlResponse.match(/<shipment-id>([^<]+)<\/shipment-id>/);
    const trackingMatch = xmlResponse.match(/<tracking-pin>([^<]+)<\/tracking-pin>/);
    const costMatch = xmlResponse.match(/<due>([^<]+)<\/due>/);
    const labelMatch = xmlResponse.match(/rel="label"[^>]*href="([^"]+)"/);

    if (!shipmentIdMatch || !trackingMatch || !costMatch) {
      throw new Error('Failed to parse Canada Post shipment response');
    }

    return {
      id: shipmentIdMatch[1],
      tracking_number: trackingMatch[1],
      label_url: labelMatch ? labelMatch[1] : undefined,
      cost: parseFloat(costMatch[1]),
      currency: 'CAD',
      service_code: serviceCode,
      service_name: this.getServiceName(serviceCode),
      carrier: 'Canada Post'
    };
  }

  private getServiceName(serviceCode: string): string {
    const services: Record<string, string> = {
      'DOM.RP': 'Regular Parcel',
      'DOM.EP': 'Expedited Parcel', 
      'DOM.XP': 'Xpresspost',
      'DOM.XP.CERT': 'Xpresspost Certified',
      'DOM.PC': 'Priority',
      'DOM.DT': 'Delivered Tonight'
    };
    return services[serviceCode] || `Canada Post Service ${serviceCode}`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shipment_details, service_code, carrier, user_id } = await req.json();

    if (!shipment_details || !service_code || !carrier || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: shipment_details, service_code, carrier, user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let shipmentResponse: ShipmentResponse;

    // Determine if this is a PrepFox managed carrier or user's personal carrier
    if (carrier.toLowerCase() === 'ups' && service_code.startsWith('prepfox_')) {
      // Use PrepFox UPS account
      const upsCarrier = new UPSCarrier({
        client_id: Deno.env.get('UPS_CLIENT_ID'),
        client_secret: Deno.env.get('UPS_CLIENT_SECRET'),
        account_number: 'PREPFOX_UPS_ACCOUNT',
        enable_negotiated_rates: true
      });
      
      const actualServiceCode = service_code.replace('prepfox_', '');
      shipmentResponse = await upsCarrier.createShipment(shipment_details, actualServiceCode);
      
    } else if (carrier.toLowerCase() === 'canada_post' && service_code.startsWith('prepfox_')) {
      // Use PrepFox Canada Post account
      const cpCarrier = new CanadaPostCarrier({
        api_key: Deno.env.get('CANADA_POST_PROD_API_KEY'),
        api_secret: Deno.env.get('CANADA_POST_PROD_API_SECRET'),
        customer_number: 'PREPFOX_CP_CUSTOMER',
        is_production: true
      });
      
      const actualServiceCode = service_code.replace('prepfox_', '');
      shipmentResponse = await cpCarrier.createShipment(shipment_details, actualServiceCode);
      
    } else {
      // Use user's personal carrier account
      const { data: carrierConfig, error } = await supabase
        .from('carrier_configurations')
        .select('*')
        .eq('user_id', user_id)
        .eq('carrier_name', carrier)
        .eq('is_active', true)
        .single();

      if (error || !carrierConfig) {
        return new Response(
          JSON.stringify({ error: `No active ${carrier} configuration found for user` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (carrier.toLowerCase() === 'ups') {
        const upsCarrier = new UPSCarrier(carrierConfig.api_credentials);
        shipmentResponse = await upsCarrier.createShipment(shipment_details, service_code);
      } else if (carrier.toLowerCase() === 'canada_post') {
        const cpCarrier = new CanadaPostCarrier(carrierConfig.api_credentials);
        shipmentResponse = await cpCarrier.createShipment(shipment_details, service_code);
      } else {
        return new Response(
          JSON.stringify({ error: `Unsupported carrier: ${carrier}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Save shipment to database
    const { error: insertError } = await supabase
      .from('shipments')
      .insert({
        user_id,
        shipment_id: shipmentResponse.id,
        tracking_number: shipmentResponse.tracking_number,
        carrier: shipmentResponse.carrier,
        service_code: shipmentResponse.service_code,
        service_name: shipmentResponse.service_name,
        cost: shipmentResponse.cost,
        currency: shipmentResponse.currency,
        label_url: shipmentResponse.label_url,
        label_pdf: shipmentResponse.label_pdf,
        from_address: shipment_details.from,
        to_address: shipment_details.to,
        package_details: shipment_details.package,
        status: 'created'
      });

    if (insertError) {
      console.error('Error saving shipment to database:', insertError);
      // Don't fail the request, just log the error
    }

    console.log(`📦 Created shipment ${shipmentResponse.id} for user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        shipment: shipmentResponse
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in carrier-shipment function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create shipment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});