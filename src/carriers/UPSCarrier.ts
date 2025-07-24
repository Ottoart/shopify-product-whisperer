import { CarrierInterface, ShipmentDetails, RateResponse, ShipmentResponse } from './CarrierInterface';

export interface UPSCredentials {
  client_id: string;
  client_secret: string;
  account_number: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  enable_negotiated_rates?: boolean;
  country_code?: string;
  postal_code?: string;
}

export class UPSCarrier implements CarrierInterface {
  private credentials: UPSCredentials;
  private accessToken: string | null = null;
  private baseUrl = 'https://wwwcie.ups.com'; // Sandbox URL - change to onlinetools.ups.com for production
  private markup: number = 0; // Markup percentage (0-100)

  constructor(credentials: UPSCredentials, markup: number = 0) {
    this.credentials = credentials;
    this.markup = markup;
  }

  private async authenticate(): Promise<void> {
    if (this.accessToken && this.credentials.token_expires_at) {
      const expiresAt = new Date(this.credentials.token_expires_at);
      if (expiresAt > new Date()) {
        return; // Token still valid
      }
    }

    const tokenBody = new URLSearchParams();
    
    // Use refresh token if available, otherwise use client credentials
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
    
    // Update credentials with new token info
    this.credentials.access_token = data.access_token;
    if (data.refresh_token) {
      this.credentials.refresh_token = data.refresh_token;
    }
    if (data.expires_in) {
      this.credentials.token_expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString();
    }
  }

  async getRates(shipmentDetails: ShipmentDetails): Promise<RateResponse[]> {
    await this.authenticate();

    // Validate we have required account details
    if (!this.credentials.account_number) {
      throw new Error('UPS account number is required for rating');
    }
    
    if (!this.credentials.postal_code || !this.credentials.country_code) {
      throw new Error('UPS account postal code and country code are required for rating');
    }

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
              Code: '02', // Customer Supplied Package
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

    // Add negotiated rates if enabled
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
              Type: '01', // Transportation
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

  async purchaseLabel(shipmentId: string): Promise<{ labelUrl?: string; labelPdf?: string }> {
    // UPS provides label on shipment creation, so this might just retrieve existing label
    // Implementation depends on UPS API capabilities for label retrieval
    throw new Error('UPS label retrieval not implemented - labels are provided during shipment creation');
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    await this.authenticate();

    const response = await fetch(`${this.baseUrl}/api/track/v1/details/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'transId': `Track_${Date.now()}`,
        'transactionSrc': 'PrepFox'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`UPS tracking failed: ${error}`);
    }

    return await response.json();
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      await this.authenticate();
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getServices(): Promise<{ code: string; name: string; description?: string }[]> {
    return [
      { code: '03', name: 'UPS Ground', description: 'Ground delivery' },
      { code: '12', name: 'UPS 3 Day Select', description: '3 business days' },
      { code: '02', name: 'UPS 2nd Day Air', description: '2 business days' },
      { code: '59', name: 'UPS 2nd Day Air A.M.', description: '2 business days AM' },
      { code: '01', name: 'UPS Next Day Air', description: 'Next business day' },
      { code: '13', name: 'UPS Next Day Air Saver', description: 'Next business day afternoon' },
      { code: '14', name: 'UPS Next Day Air Early', description: 'Next business day morning' }
    ];
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