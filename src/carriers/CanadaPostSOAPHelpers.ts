export interface SOAPCredentials {
  apiKey: string;
  apiSecret: string;
  isProduction?: boolean;
}

export interface SOAPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class CanadaPostSOAPHelpers {
  
  /**
   * Builds a complete SOAP envelope with WS-Security header
   */
  static buildSOAPEnvelope(operation: string, body: string, credentials: SOAPCredentials): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:rat="http://www.canadapost.ca/ws/soap/ship/rate/v4">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${credentials.apiKey}</wsse:Username>
        <wsse:Password>${credentials.apiSecret}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <rat:${operation}>
      ${body}
    </rat:${operation}>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  /**
   * Builds DiscoverServices request body for credential testing and service discovery
   */
  static buildDiscoverServicesRequest(
    locale: string = 'EN',
    destinationCountryCode?: string,
    customerNumber?: string,
    contractId?: string
  ): string {
    let body = `<rat:locale>${locale}</rat:locale>`;
    
    if (destinationCountryCode) {
      body += `<rat:destination-country-code>${destinationCountryCode}</rat:destination-country-code>`;
    }
    
    if (customerNumber) {
      body += `<rat:customer-number>${customerNumber}</rat:customer-number>`;
    }
    
    if (contractId) {
      body += `<rat:contract-id>${contractId}</rat:contract-id>`;
    }
    
    return body;
  }

  /**
   * Builds GetRates request body for rate calculations
   */
  static buildGetRatesRequest(mailingScenario: {
    customerNumber?: string;
    contractId?: string;
    originPostalCode: string;
    destinationCountryCode: string;
    destinationPostalCode?: string;
    weight: number; // in kg
    dimensions?: {
      length: number; // in cm
      width: number;
      height: number;
    };
    serviceCode?: string;
    parcelValue?: number;
    options?: string[];
  }): string {
    let body = `<rat:locale>EN</rat:locale>
<rat:scenario>`;

    if (mailingScenario.customerNumber) {
      body += `<rat:customer-number>${mailingScenario.customerNumber}</rat:customer-number>`;
    }

    if (mailingScenario.contractId) {
      body += `<rat:contract-id>${mailingScenario.contractId}</rat:contract-id>`;
    }

    body += `<rat:parcel-characteristics>
  <rat:weight>${mailingScenario.weight}</rat:weight>`;

    if (mailingScenario.dimensions) {
      body += `<rat:dimensions>
    <rat:length>${mailingScenario.dimensions.length}</rat:length>
    <rat:width>${mailingScenario.dimensions.width}</rat:width>
    <rat:height>${mailingScenario.dimensions.height}</rat:height>
  </rat:dimensions>`;
    }

    if (mailingScenario.parcelValue) {
      body += `<rat:declared-value>${mailingScenario.parcelValue}</rat:declared-value>`;
    }

    body += `</rat:parcel-characteristics>
<rat:origin-postal-code>${mailingScenario.originPostalCode}</rat:origin-postal-code>
<rat:destination>`;

    if (mailingScenario.destinationCountryCode === 'CA') {
      body += `<rat:domestic>
    <rat:postal-code>${mailingScenario.destinationPostalCode}</rat:postal-code>
  </rat:domestic>`;
    } else if (mailingScenario.destinationCountryCode === 'US') {
      body += `<rat:united-states>
    <rat:zip-code>${mailingScenario.destinationPostalCode}</rat:zip-code>
  </rat:united-states>`;
    } else {
      body += `<rat:international>
    <rat:country-code>${mailingScenario.destinationCountryCode}</rat:country-code>
  </rat:international>`;
    }

    body += `</rat:destination>`;

    if (mailingScenario.serviceCode) {
      body += `<rat:services>
    <rat:service-code>${mailingScenario.serviceCode}</rat:service-code>
  </rat:services>`;
    }

    if (mailingScenario.options && mailingScenario.options.length > 0) {
      body += `<rat:options>`;
      mailingScenario.options.forEach(option => {
        body += `<rat:option>
      <rat:option-code>${option}</rat:option-code>
    </rat:option>`;
      });
      body += `</rat:options>`;
    }

    body += `</rat:scenario>`;
    
    return body;
  }

  /**
   * Builds GetService request body
   */
  static buildGetServiceRequest(
    serviceCode: string,
    locale: string = 'EN',
    destinationCountryCode?: string
  ): string {
    let body = `<rat:locale>${locale}</rat:locale>
<rat:service-code>${serviceCode}</rat:service-code>`;
    
    if (destinationCountryCode) {
      body += `<rat:destination-country-code>${destinationCountryCode}</rat:destination-country-code>`;
    }
    
    return body;
  }

  /**
   * Builds GetOption request body
   */
  static buildGetOptionRequest(
    optionCode: string,
    locale: string = 'EN'
  ): string {
    return `<rat:locale>${locale}</rat:locale>
<rat:option-code>${optionCode}</rat:option-code>`;
  }

  /**
   * Parses SOAP response and extracts data or errors
   */
  static parseSOAPResponse(xmlResponse: string): SOAPResponse {
    try {
      // Check for SOAP fault first
      if (xmlResponse.includes('soap:Fault') || xmlResponse.includes('soapenv:Fault')) {
        const faultMatch = xmlResponse.match(/<faultstring[^>]*>(.*?)<\/faultstring>/);
        const faultCode = xmlResponse.match(/<faultcode[^>]*>(.*?)<\/faultcode>/);
        return {
          success: false,
          error: `SOAP Fault: ${faultCode ? faultCode[1] : 'Unknown'} - ${faultMatch ? faultMatch[1] : 'Unknown error'}`
        };
      }

      // Parse different response types
      if (xmlResponse.includes('discover-services-response')) {
        return this.parseDiscoverServicesResponse(xmlResponse);
      } else if (xmlResponse.includes('get-rates-response')) {
        return this.parseGetRatesResponse(xmlResponse);
      } else if (xmlResponse.includes('get-service-response')) {
        return this.parseGetServiceResponse(xmlResponse);
      } else if (xmlResponse.includes('get-option-response')) {
        return this.parseGetOptionResponse(xmlResponse);
      }

      return {
        success: false,
        error: 'Unknown response format'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse SOAP response: ${error.message}`
      };
    }
  }

  private static parseDiscoverServicesResponse(xmlResponse: string): SOAPResponse {
    const services: any[] = [];
    const serviceMatches = xmlResponse.match(/<service>(.*?)<\/service>/gs);
    
    if (serviceMatches) {
      serviceMatches.forEach(serviceXml => {
        const codeMatch = serviceXml.match(/<service-code>(.*?)<\/service-code>/);
        const nameMatch = serviceXml.match(/<service-name>(.*?)<\/service-name>/);
        
        if (codeMatch && nameMatch) {
          services.push({
            code: codeMatch[1],
            name: nameMatch[1]
          });
        }
      });
    }

    return {
      success: true,
      data: { services }
    };
  }

  private static parseGetRatesResponse(xmlResponse: string): SOAPResponse {
    const rates: any[] = [];
    const priceQuoteMatches = xmlResponse.match(/<price-quote>(.*?)<\/price-quote>/gs);
    
    if (priceQuoteMatches) {
      priceQuoteMatches.forEach(quoteXml => {
        const serviceCodeMatch = quoteXml.match(/<service-code>(.*?)<\/service-code>/);
        const serviceNameMatch = quoteXml.match(/<service-name>(.*?)<\/service-name>/);
        const duePriceMatch = quoteXml.match(/<due>(.*?)<\/due>/);
        const transitTimeMatch = quoteXml.match(/<expected-transit-time>(.*?)<\/expected-transit-time>/);
        
        if (serviceCodeMatch && duePriceMatch) {
          rates.push({
            serviceCode: serviceCodeMatch[1],
            serviceName: serviceNameMatch ? serviceNameMatch[1] : serviceCodeMatch[1],
            price: parseFloat(duePriceMatch[1]),
            transitTime: transitTimeMatch ? parseInt(transitTimeMatch[1]) : undefined
          });
        }
      });
    }

    return {
      success: true,
      data: { rates }
    };
  }

  private static parseGetServiceResponse(xmlResponse: string): SOAPResponse {
    const serviceCodeMatch = xmlResponse.match(/<service-code>(.*?)<\/service-code>/);
    const serviceNameMatch = xmlResponse.match(/<service-name>(.*?)<\/service-name>/);
    
    const service = {
      code: serviceCodeMatch ? serviceCodeMatch[1] : '',
      name: serviceNameMatch ? serviceNameMatch[1] : '',
      options: [] as any[],
      restrictions: {} as any
    };

    // Parse options
    const optionMatches = xmlResponse.match(/<option>(.*?)<\/option>/gs);
    if (optionMatches) {
      optionMatches.forEach(optionXml => {
        const optionCodeMatch = optionXml.match(/<option-code>(.*?)<\/option-code>/);
        const optionNameMatch = optionXml.match(/<option-name>(.*?)<\/option-name>/);
        const mandatoryMatch = optionXml.match(/<mandatory>(.*?)<\/mandatory>/);
        
        if (optionCodeMatch) {
          service.options.push({
            code: optionCodeMatch[1],
            name: optionNameMatch ? optionNameMatch[1] : optionCodeMatch[1],
            mandatory: mandatoryMatch ? mandatoryMatch[1] === 'true' : false
          });
        }
      });
    }

    return {
      success: true,
      data: { service }
    };
  }

  private static parseGetOptionResponse(xmlResponse: string): SOAPResponse {
    const optionCodeMatch = xmlResponse.match(/<option-code>(.*?)<\/option-code>/);
    const optionNameMatch = xmlResponse.match(/<option-name>(.*?)<\/option-name>/);
    const optionClassMatch = xmlResponse.match(/<option-class>(.*?)<\/option-class>/);
    
    const option = {
      code: optionCodeMatch ? optionCodeMatch[1] : '',
      name: optionNameMatch ? optionNameMatch[1] : '',
      class: optionClassMatch ? optionClassMatch[1] : ''
    };

    return {
      success: true,
      data: { option }
    };
  }

  /**
   * Makes a SOAP API call to Canada Post
   */
  static async makeSOAPCall(
    operation: string,
    requestBody: string,
    credentials: SOAPCredentials
  ): Promise<SOAPResponse> {
    const baseUrl = credentials.isProduction 
      ? 'https://soa-gw.canadapost.ca'
      : 'https://ct.soa-gw.canadapost.ca';

    const soapEnvelope = this.buildSOAPEnvelope(operation, requestBody, credentials);

    try {
      const response = await fetch(`${baseUrl}/rs/soap/rating/v4`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '',
          'Accept': 'text/xml'
        },
        body: soapEnvelope
      });

      const responseText = await response.text();

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${responseText}`
        };
      }

      return this.parseSOAPResponse(responseText);
    } catch (error) {
      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }
}