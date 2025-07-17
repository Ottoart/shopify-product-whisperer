import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ShippingRate {
  carrier: string;
  serviceCode: string;
  serviceName: string;
  cost: number;
  estimatedDays: string;
  estimatedDelivery: string;
}

export interface RateRequest {
  orderId: string;
  shipFrom?: {
    name: string;
    company?: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shipTo: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
    weightUnit?: string;
    dimensionUnit?: string;
  };
  servicePreferences?: string[];
  additionalServices?: {
    signatureRequired?: boolean;
    insuranceValue?: number;
    saturdayDelivery?: boolean;
  };
}

export function useShippingRates() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const calculateRates = async (request: RateRequest): Promise<ShippingRate[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: rateError } = await supabase.functions.invoke('calculate-shipping-rates', {
        body: request
      });

      if (rateError) {
        throw new Error(rateError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const calculatedRates = data?.rates || [];
      setRates(calculatedRates);
      
      return calculatedRates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate shipping rates';
      setError(errorMessage);
      toast({
        title: "Rate calculation failed",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const purchaseLabel = async (
    orderId: string,
    serviceCode: string,
    shipFrom: any,
    shipTo: any,
    packageDetails: any,
    additionalServices?: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Get the account number from carrier configurations
      const { data: carrierData, error: carrierError } = await supabase
        .from('carrier_configurations')
        .select('account_number')
        .eq('carrier_name', 'UPS')
        .eq('is_active', true)
        .single();

      if (carrierError || !carrierData?.account_number) {
        throw new Error('UPS account not configured. Please configure UPS carrier first.');
      }

      const labelRequest = {
        orderId,
        serviceCode,
        shipFrom,
        shipTo,
        package: {
          weight: packageDetails.weight,
          length: packageDetails.length,
          width: packageDetails.width,
          height: packageDetails.height,
          packageType: packageDetails.packageType || "02"
        },
        paymentInfo: {
          shipperAccountNumber: carrierData.account_number,
          paymentType: "prepaid"
        },
        additionalServices: additionalServices || {}
      };

      const { data, error: labelError } = await supabase.functions.invoke('ups-shipment', {
        body: labelRequest
      });

      if (labelError) {
        throw new Error(labelError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Label purchased successfully",
        description: `Tracking number: ${data.trackingNumber}`,
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase label';
      setError(errorMessage);
      toast({
        title: "Label purchase failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    rates,
    loading,
    error,
    calculateRates,
    purchaseLabel
  };
}