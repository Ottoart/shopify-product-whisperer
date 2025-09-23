import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  success: boolean;
  message: string;
  orders_processed?: number;
  orders_inserted?: number;
}

export function useShopifySync() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const syncOrders = async (): Promise<SyncResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-shopify-orders');
      
      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Sync Complete",
          description: data.message,
        });
        return data;
      } else {
        throw new Error(data?.error || 'Sync failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to sync Shopify orders';
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncOrders,
    isLoading
  };
}