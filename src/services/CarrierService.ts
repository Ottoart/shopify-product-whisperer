import { UPSCarrier, UPSCredentials } from '../carriers/UPSCarrier';
import { CanadaPostCarrier, CanadaPostCredentials } from '../carriers/CanadaPostCarrier';
import { CarrierInterface, ShipmentDetails, RateResponse, ShipmentResponse } from '../carriers/CarrierInterface';

export interface CarrierConfig {
  carrier_name: string;
  credentials: UPSCredentials | CanadaPostCredentials;
  markup?: number;
  is_active?: boolean;
}

export class CarrierService {
  private carriers: Map<string, CarrierInterface> = new Map();

  constructor(configs: CarrierConfig[] = []) {
    // Initialize carriers from configurations
    for (const config of configs) {
      this.addCarrier(config);
    }
  }

  /**
   * Add a carrier to the service
   */
  addCarrier(config: CarrierConfig): void {
    if (!config.is_active) return;

    try {
      let carrier: CarrierInterface;

      switch (config.carrier_name.toLowerCase()) {
        case 'ups':
          carrier = new UPSCarrier(
            config.credentials as UPSCredentials, 
            config.markup || 0
          );
          break;
        case 'canada_post':
        case 'canadapost':
          carrier = new CanadaPostCarrier(
            config.credentials as CanadaPostCredentials,
            config.markup || 0
          );
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

  /**
   * Remove a carrier from the service
   */
  removeCarrier(carrierName: string): void {
    this.carriers.delete(carrierName.toLowerCase());
  }

  /**
   * Get a specific carrier
   */
  getCarrier(carrierName: string): CarrierInterface | undefined {
    return this.carriers.get(carrierName.toLowerCase());
  }

  /**
   * Get all available carriers
   */
  getAvailableCarriers(): string[] {
    return Array.from(this.carriers.keys());
  }

  /**
   * Get rates from all carriers
   */
  async getAllRates(shipmentDetails: ShipmentDetails): Promise<RateResponse[]> {
    const allRates: RateResponse[] = [];
    const promises: Promise<RateResponse[]>[] = [];

    // Get rates from all carriers concurrently
    for (const [carrierName, carrier] of this.carriers) {
      promises.push(
        carrier.getRates(shipmentDetails).catch(error => {
          console.error(`❌ Failed to get rates from ${carrierName}:`, error);
          return []; // Return empty array on error
        })
      );
    }

    const results = await Promise.all(promises);
    
    // Flatten all results
    for (const rates of results) {
      allRates.push(...rates);
    }

    // Sort by total rate (including markup)
    return allRates.sort((a, b) => (a.total_rate || a.rate) - (b.total_rate || b.rate));
  }

  /**
   * Get rates from a specific carrier
   */
  async getRatesFromCarrier(carrierName: string, shipmentDetails: ShipmentDetails): Promise<RateResponse[]> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier not found: ${carrierName}`);
    }

    return await carrier.getRates(shipmentDetails);
  }

  /**
   * Create shipment with specific carrier
   */
  async createShipment(
    carrierName: string, 
    shipmentDetails: ShipmentDetails, 
    serviceCode: string
  ): Promise<ShipmentResponse> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier not found: ${carrierName}`);
    }

    return await carrier.createShipment(shipmentDetails, serviceCode);
  }

  /**
   * Track shipment with specific carrier
   */
  async trackShipment(carrierName: string, trackingNumber: string): Promise<any> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier not found: ${carrierName}`);
    }

    return await carrier.trackShipment(trackingNumber);
  }

  /**
   * Validate credentials for a specific carrier
   */
  async validateCarrierCredentials(carrierName: string): Promise<{ valid: boolean; error?: string }> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      return { valid: false, error: `Carrier not found: ${carrierName}` };
    }

    return await carrier.validateCredentials();
  }

  /**
   * Get available services for a specific carrier
   */
  async getCarrierServices(carrierName: string): Promise<{ code: string; name: string; description?: string }[]> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier not found: ${carrierName}`);
    }

    return await carrier.getServices();
  }

  /**
   * Get all services from all carriers
   */
  async getAllServices(): Promise<{ carrier: string; services: { code: string; name: string; description?: string }[] }[]> {
    const allServices: { carrier: string; services: { code: string; name: string; description?: string }[] }[] = [];

    for (const [carrierName, carrier] of this.carriers) {
      try {
        const services = await carrier.getServices();
        allServices.push({
          carrier: carrierName,
          services
        });
      } catch (error) {
        console.error(`❌ Failed to get services from ${carrierName}:`, error);
      }
    }

    return allServices;
  }

  /**
   * Find the best rate across all carriers
   */
  async findBestRate(shipmentDetails: ShipmentDetails): Promise<RateResponse | null> {
    const rates = await this.getAllRates(shipmentDetails);
    return rates.length > 0 ? rates[0] : null; // Already sorted by price
  }

  /**
   * Purchase label for existing shipment
   */
  async purchaseLabel(carrierName: string, shipmentId: string): Promise<{ labelUrl?: string; labelPdf?: string }> {
    const carrier = this.getCarrier(carrierName);
    if (!carrier) {
      throw new Error(`Carrier not found: ${carrierName}`);
    }

    return await carrier.purchaseLabel(shipmentId);
  }
}