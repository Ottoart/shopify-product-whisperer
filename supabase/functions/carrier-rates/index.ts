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

interface RateResponse {
  id: string;
  service_code: string;
  service_name: string;
  carrier: string;
  rate: number;
  currency: string;
  estimated_days?: string;
  estimated_delivery?: string;
  zone?: string;
  markup?: number;
  total_rate?: number;
}

// UPS Carrier Implementation
class UPSCarrier {
  private credentials: any;
  private accessToken: string | null = null;
  private baseUrl = 'https://wwwcie.ups.com';
  private markup: number = 0;

  constructor(credentials: any, markup: number = 0) {
    this.credentials = credentials;
    this.markup = markup;
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken && this.credentials.token_expires_at) {
      const expiresAt = new Date(this.credentials.token_expires_at);
      if (expiresAt > new Date()) {
        return;
      }
    }

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

  async getRates(shipmentDetails: ShipmentDetails): Promise<RateResponse[]> {
    await this.authenticate();

    const ratingRequest = {
      RateRequest: {
        Request: {
          RequestOption: 'Shop',
          TransactionReference: {
            CustomerContext: `Rating_${Date.now()}`
          }
        },
        Shipment: {
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
          Package: [{
            PackagingType: {
              Code: '02',
              Description: 'Package'
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: 'IN',
                Description: 'Inches'
              },
              Length: shipmentDetails.package.length.toString(),
              Width: shipmentDetails.package.width.toString(),
              Height: shipmentDetails.package.height.toString()
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: 'LBS',
                Description: 'Pounds'
              },
              Weight: shipmentDetails.package.weight.toString()
            }
          }]
        }
      }
    };

    if (this.credentials.enable_negotiated_rates) {
      ratingRequest.RateRequest.Shipment['RateInformation'] = {
        NegotiatedRatesIndicator: ''
      };
    }

    const response = await fetch(`${this.baseUrl}/api/rating/v1/Shop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'transId': `Rating_${Date.now()}`,
        'transactionSrc': 'PrepFox'
      },
      body: JSON.stringify(ratingRequest)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`UPS rating failed: ${error}`);
    }

    const data = await response.json();
    const rates: RateResponse[] = [];

    if (data.RateResponse && data.RateResponse.RatedShipment) {
      const ratedShipments = Array.isArray(data.RateResponse.RatedShipment) 
        ? data.RateResponse.RatedShipment 
        : [data.RateResponse.RatedShipment];

      for (const shipment of ratedShipments) {
        const rate = this.credentials.enable_negotiated_rates && shipment.NegotiatedRateCharges
          ? parseFloat(shipment.NegotiatedRateCharges.TotalCharge.MonetaryValue)
          : parseFloat(shipment.TotalCharges.MonetaryValue);

        const markup = (rate * this.markup) / 100;
        const totalRate = rate + markup;

        rates.push({
          id: `ups_${shipment.Service.Code}`,
          service_code: shipment.Service.Code,
          service_name: this.getServiceName(shipment.Service.Code),
          carrier: 'UPS',
          rate: rate,
          currency: shipment.TotalCharges.CurrencyCode,
          estimated_days: shipment.GuaranteedDelivery?.BusinessDaysInTransit,
          markup: markup,
          total_rate: totalRate
        });
      }
    }

    return rates;
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

// Canada Post Carrier Implementation
class CanadaPostCarrier {
  private credentials: any;
  private baseUrl: string;
  private markup: number = 0;

  constructor(credentials: any, markup: number = 0) {
    this.credentials = credentials;
    this.markup = markup;
    this.baseUrl = credentials.is_production 
      ? 'https://soa-gw.canadapost.ca'
      : 'https://ct.soa-gw.canadapost.ca';
  }

  private getAuthHeader(): string {
    const token = btoa(`${this.credentials.api_key}:${this.credentials.api_secret}`);
    return `Basic ${token}`;
  }

  async getRates(shipmentDetails: ShipmentDetails): Promise<RateResponse[]> {
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<mailing-scenario xmlns="http://www.canadapost.ca/ws/ship/rate-v4">
  <customer-number>${this.credentials.customer_number}</customer-number>
  ${this.credentials.contract_id ? `<contract-id>${this.credentials.contract_id}</contract-id>` : ''}
  <parcel-characteristics>
    <weight>${(shipmentDetails.package.weight * 0.453592).toFixed(2)}</weight>
    <dimensions>
      <length>${(shipmentDetails.package.length * 2.54).toFixed(1)}</length>
      <width>${(shipmentDetails.package.width * 2.54).toFixed(1)}</width>
      <height>${(shipmentDetails.package.height * 2.54).toFixed(1)}</height>
    </dimensions>
  </parcel-characteristics>
  <origin-postal-code>${shipmentDetails.from.postal_code.replace(/\s/g, '')}</origin-postal-code>
  <destination>
    <domestic>
      <postal-code>${shipmentDetails.to.postal_code.replace(/\s/g, '')}</postal-code>
    </domestic>
  </destination>
</mailing-scenario>`;

    const response = await fetch(`${this.baseUrl}/rs/ship/price`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/vnd.cpc.ship.rate-v4+xml',
        'Accept': 'application/vnd.cpc.ship.rate-v4+xml'
      },
      body: xmlRequest
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Canada Post rating failed: ${error}`);
    }

    const xmlResponse = await response.text();
    
    // Simple XML parsing for Canada Post response
    const rates: RateResponse[] = [];
    const serviceRegex = /<service-code>([^<]+)<\/service-code>[\s\S]*?<service-name>([^<]+)<\/service-name>[\s\S]*?<due>([^<]+)<\/due>/g;
    let match;
    
    while ((match = serviceRegex.exec(xmlResponse)) !== null) {
      const rate = parseFloat(match[3]);
      const markup = (rate * this.markup) / 100;
      const totalRate = rate + markup;

      rates.push({
        id: `cp_${match[1]}`,
        service_code: match[1],
        service_name: match[2],
        carrier: 'Canada Post',
        rate: rate,
        currency: 'CAD',
        markup: markup,
        total_rate: totalRate
      });
    }

    return rates;
  }
}

// Carrier Service
class CarrierService {
  private carriers: Map<string, any> = new Map();

  addCarrier(config: any): void {
    if (!config.is_active) return;

    try {
      let carrier: any;

      switch (config.carrier_name.toLowerCase()) {
        case 'ups':
          carrier = new UPSCarrier(config.credentials, config.markup || 0);
          break;
        case 'canada_post':
        case 'canadapost':
          carrier = new CanadaPostCarrier(config.credentials, config.markup || 0);
          break;
        default:
          console.warn(`Unknown carrier: ${config.carrier_name}`);
          return;
      }

      this.carriers.set(config.carrier_name.toLowerCase(), carrier);
      console.log(`✅ Added carrier: ${config.carrier_name}`);
    } catch (error) {
      console.error(`❌ Failed to add carrier ${config.carrier_name}:`, error);
    }
  }

  async getAllRates(shipmentDetails: ShipmentDetails): Promise<RateResponse[]> {
    const allRates: RateResponse[] = [];
    const promises: Promise<RateResponse[]>[] = [];

    for (const [carrierName, carrier] of this.carriers) {
      promises.push(
        carrier.getRates(shipmentDetails).catch((error: any) => {
          console.error(`❌ Failed to get rates from ${carrierName}:`, error);
          return [];
        })
      );
    }

    const results = await Promise.all(promises);
    
    for (const rates of results) {
      allRates.push(...rates);
    }

    return allRates.sort((a, b) => (a.total_rate || a.rate) - (b.total_rate || b.rate));
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shipment_details, user_id } = await req.json();

    if (!shipment_details || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing shipment_details or user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's carrier configurations
    const { data: carrierConfigs, error } = await supabase
      .from('carrier_configurations')
      .select('*')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching carrier configurations:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch carrier configurations' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize carrier service with user's configurations
    const carrierService = new CarrierService();

    // Add PrepFox managed carriers (with our negotiated rates)
    const prepFoxCarriers = [
      {
        carrier_name: 'UPS',
        is_active: true,
        markup: 15, // Our markup for UPS
        credentials: {
          client_id: Deno.env.get('UPS_CLIENT_ID'),
          client_secret: Deno.env.get('UPS_CLIENT_SECRET'),
          account_number: 'PREPFOX_UPS_ACCOUNT', // Our UPS account
          enable_negotiated_rates: true
        }
      },
      {
        carrier_name: 'canada_post',
        is_active: true,
        markup: 15, // Our markup for Canada Post
        credentials: {
          api_key: Deno.env.get('CANADA_POST_PROD_API_KEY'),
          api_secret: Deno.env.get('CANADA_POST_PROD_API_SECRET'),
          customer_number: 'PREPFOX_CP_CUSTOMER', // Our Canada Post customer number
          is_production: true
        }
      }
    ];

    // Add PrepFox managed carriers
    for (const config of prepFoxCarriers) {
      carrierService.addCarrier(config);
    }

    // Add user's personal carrier configurations
    for (const config of carrierConfigs || []) {
      carrierService.addCarrier({
        carrier_name: config.carrier_name,
        credentials: config.api_credentials,
        markup: 0, // No markup on user's own accounts
        is_active: config.is_active
      });
    }

    // Get rates from all carriers
    const rates = await carrierService.getAllRates(shipment_details);

    console.log(`📦 Retrieved ${rates.length} rates for user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        rates,
        carriers_used: rates.map(r => r.carrier).filter((v, i, a) => a.indexOf(v) === i)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in carrier-rates function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});