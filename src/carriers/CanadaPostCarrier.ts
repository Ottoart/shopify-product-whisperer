import { CarrierInterface, ShipmentDetails, RateResponse, ShipmentResponse } from './CarrierInterface';

export interface CanadaPostCredentials {
  api_key: string;
  api_secret: string;
  customer_number: string;
  contract_id?: string;
  username?: string;
  password?: string;
  is_production?: boolean;
}

export class CanadaPostCarrier implements CarrierInterface {
  private credentials: CanadaPostCredentials;
  private baseUrl: string;
  constructor(credentials: CanadaPostCredentials) {
    this.credentials = credentials;
    // Use production or development endpoint
    this.baseUrl = credentials.is_production 
      ? 'https://soa-gw.canadapost.ca'
      : 'https://ct.soa-gw.canadapost.ca';
  }

  private getAuthHeader(): string {
    const token = btoa(`${this.credentials.api_key}:${this.credentials.api_secret}`);
    return `Basic ${token}`;
  }

  private parseXmlToJson(xmlString: string): any {
    // Simple XML parser - in production, use a proper XML parser library
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    return this.xmlToObject(doc.documentElement);
  }

  private xmlToObject(element: Element): any {
    const result: any = {};
    
    // Handle attributes
    if (element.attributes.length > 0) {
      result['@attributes'] = {};
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        result['@attributes'][attr.name] = attr.value;
      }
    }
    
    // Handle child elements
    if (element.children.length > 0) {
      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i];
        const childName = child.tagName;
        
        if (result[childName]) {
          if (!Array.isArray(result[childName])) {
            result[childName] = [result[childName]];
          }
          result[childName].push(this.xmlToObject(child));
        } else {
          result[childName] = this.xmlToObject(child);
        }
      }
    } else {
      // Text content
      result['#text'] = element.textContent;
    }
    
    return result;
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
    const data = this.parseXmlToJson(xmlResponse);
    
    const rates: RateResponse[] = [];

    // Parse Canada Post response format
    if (data['price-quotes'] && data['price-quotes']['price-quote']) {
      const quotes = Array.isArray(data['price-quotes']['price-quote']) 
        ? data['price-quotes']['price-quote']
        : [data['price-quotes']['price-quote']];

      for (const quote of quotes) {
        const rate = parseFloat(quote['price-details']['due']['#text']);

        rates.push({
          id: `cp_${quote['service-code']['#text']}`,
          service_code: quote['service-code']['#text'],
          service_name: quote['service-name']['#text'],
          carrier: 'Canada Post',
          rate: rate,
          currency: 'CAD',
          estimated_days: quote['service-standard']?.['expected-transit-time']?.['#text']
        });
      }
    }

    return rates;
  }

  async createShipment(shipmentDetails: ShipmentDetails, serviceCode: string): Promise<ShipmentResponse> {
    // Canada Post shipment creation XML
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
    const data = this.parseXmlToJson(xmlResponse);

    // Extract shipment info from Canada Post response
    const shipmentInfo = data['non-contract-shipment-info'];
    
    return {
      id: shipmentInfo['shipment-id']['#text'],
      tracking_number: shipmentInfo['tracking-pin']['#text'],
      label_url: shipmentInfo.links?.link?.find((l: any) => l['@attributes']?.rel === 'label')?.['@attributes']?.href,
      cost: parseFloat(shipmentInfo['shipment-price']['due']['#text']),
      currency: 'CAD',
      service_code: serviceCode,
      service_name: this.getServiceName(serviceCode),
      carrier: 'Canada Post'
    };
  }

  async purchaseLabel(shipmentId: string): Promise<{ labelUrl?: string; labelPdf?: string }> {
    // Download label PDF for existing shipment
    const response = await fetch(`${this.baseUrl}/rs/ncs/${shipmentId}/label`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/pdf'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Canada Post label download failed: ${error}`);
    }

    const pdfBlob = await response.blob();
    const labelPdf = URL.createObjectURL(pdfBlob);

    return { labelPdf };
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/vis/track/pin/${trackingNumber}/summary`, {
      method: 'GET',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Accept': 'application/vnd.cpc.track+xml'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Canada Post tracking failed: ${error}`);
    }

    const xmlResponse = await response.text();
    return this.parseXmlToJson(xmlResponse);
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Test with a simple service discovery call
      const response = await fetch(`${this.baseUrl}/rs/ship/service`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/vnd.cpc.ship.service-v3+xml'
        }
      });

      if (response.ok) {
        return { valid: true };
      } else {
        const error = await response.text();
        return { valid: false, error: `Invalid credentials: ${error}` };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getServices(): Promise<{ code: string; name: string; description?: string }[]> {
    return [
      { code: 'DOM.RP', name: 'Regular Parcel', description: 'Regular ground delivery' },
      { code: 'DOM.EP', name: 'Expedited Parcel', description: 'Expedited ground delivery' },
      { code: 'DOM.XP', name: 'Xpresspost', description: 'Fast delivery with tracking' },
      { code: 'DOM.XP.CERT', name: 'Xpresspost Certified', description: 'Xpresspost with signature' },
      { code: 'DOM.PC', name: 'Priority', description: 'Fastest domestic service' },
      { code: 'DOM.DT', name: 'Delivered Tonight', description: 'Same day evening delivery' }
    ];
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