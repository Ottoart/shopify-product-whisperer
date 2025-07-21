export interface ShipmentDetails {
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
    weight: number; // in lbs
    length: number; // in inches
    width: number;
    height: number;
    value?: number; // for insurance
  };
  options?: {
    signature_required?: boolean;
    insurance?: boolean;
    saturday_delivery?: boolean;
  };
}

export interface RateResponse {
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
  total_rate?: number; // rate + markup
}

export interface ShipmentResponse {
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

export interface CarrierInterface {
  /**
   * Get shipping rates for a shipment
   */
  getRates(shipmentDetails: ShipmentDetails): Promise<RateResponse[]>;
  
  /**
   * Create a shipment and purchase label
   */
  createShipment(shipmentDetails: ShipmentDetails, serviceCode: string): Promise<ShipmentResponse>;
  
  /**
   * Purchase/download label for existing shipment
   */
  purchaseLabel(shipmentId: string): Promise<{ labelUrl?: string; labelPdf?: string }>;
  
  /**
   * Track a shipment
   */
  trackShipment(trackingNumber: string): Promise<any>;
  
  /**
   * Validate carrier credentials
   */
  validateCredentials(): Promise<{ valid: boolean; error?: string }>;
  
  /**
   * Get available services for this carrier
   */
  getServices(): Promise<{ code: string; name: string; description?: string }[]>;
}