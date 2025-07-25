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
  order_id: string; // Match backend interface
  ship_from?: {
    name?: string;
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
  service_preferences?: string[]; // Match backend interface
  additional_services?: { // Match backend interface
    signature_required?: boolean;
    insurance_value?: number;
    saturday_delivery?: boolean;
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
      console.log('🔄 Calculating shipping rates with request:', JSON.stringify(request, null, 2));
      
      const { data, error: rateError } = await supabase.functions.invoke('calculate-shipping-rates', {
        body: request
      });

      console.log('📦 Rate calculation response:', { data, error: rateError });

      if (rateError) {
        console.error('❌ Supabase function error:', rateError);
        throw new Error(rateError.message);
      }

      if (data?.error) {
        console.error('❌ Backend error:', data.error);
        throw new Error(data.error);
      }

      const calculatedRates = data?.rates || [];
      console.log(`✅ Calculated ${calculatedRates.length} shipping rates:`, calculatedRates);
      
      // Transform rates to match frontend interface
      const transformedRates = calculatedRates.map((rate: any) => ({
        carrier: rate.carrier,
        serviceCode: rate.service_code,
        serviceName: rate.service_name,
        cost: rate.cost,
        estimatedDays: rate.estimated_days,
        estimatedDelivery: rate.estimated_delivery || `Delivery in ${rate.estimated_days}`
      }));
      
      setRates(transformedRates);
      
      if (transformedRates.length === 0) {
        toast({
          title: "No rates found",
          description: "No shipping rates are available for this shipment. Please check your shipping addresses and package details.",
          variant: "destructive",
        });
      }
      
      return transformedRates;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate shipping rates';
      console.error('❌ Rate calculation error:', err);
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