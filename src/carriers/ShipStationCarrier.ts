import { CarrierInterface, ShipmentDetails, RateResponse, ShipmentResponse } from './CarrierInterface';
import { supabase } from '@/integrations/supabase/client';

export class ShipStationCarrier implements CarrierInterface {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://ssapi.shipstation.com';

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  async getRates(shipmentDetails: ShipmentDetails): Promise<RateResponse[]> {
    try {
      const { data, error } = await supabase.functions.invoke('shipstation-get-rates', {
        body: {
          shipmentDetails,
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      });

      if (error) throw error;
      return data.rates || [];
    } catch (error) {
      console.error('ShipStation getRates error:', error);
      throw new Error(`Failed to get ShipStation rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createShipment(shipmentDetails: ShipmentDetails, serviceCode: string): Promise<ShipmentResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('shipstation-create-label', {
        body: {
          shipmentDetails,
          serviceCode,
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ShipStation createShipment error:', error);
      throw new Error(`Failed to create ShipStation shipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async purchaseLabel(shipmentId: string): Promise<{ labelUrl?: string; labelPdf?: string }> {
    // ShipStation creates labels immediately when creating shipments
    // This method is kept for interface compliance but is essentially a no-op
    return {};
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('shipstation-track-shipment', {
        body: {
          trackingNumber,
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ShipStation trackShipment error:', error);
      throw new Error(`Failed to track ShipStation shipment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('shipstation-validate-credentials', {
        body: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      });

      if (error) return { valid: false, error: error.message };
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getServices(): Promise<{ code: string; name: string; description?: string }[]> {
    try {
      const { data, error } = await supabase.functions.invoke('shipstation-get-services', {
        body: {
          apiKey: this.apiKey,
          apiSecret: this.apiSecret
        }
      });

      if (error) throw error;
      return data.services || [];
    } catch (error) {
      console.error('ShipStation getServices error:', error);
      return [];
    }
  }
}