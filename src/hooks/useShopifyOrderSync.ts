import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { useShopifyCredentials } from '@/hooks/useShopifyCredentials';

interface OrderSyncOptions {
  limit?: number;
  sinceId?: string;
  status?: string;
  silent?: boolean;
}

export const useShopifyOrderSync = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const { storeUrl, accessToken } = useShopifyCredentials();

  // Clean token helper
  const cleanAccessToken = (token?: string | null) => {
    if (!token) return null;
    try {
      const parsed = JSON.parse(token);
      token = parsed.access_token || parsed.accessToken || token;
    } catch {}
    return token.toString().trim().split(' ')[0];
  };

  // Get local orders count
  const { data: localOrdersCount } = useQuery({
    queryKey: ['shopify-orders-count'],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      const { count, error } = await supabase
        .from('shopify_orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: Boolean(session?.user?.id),
  });

  // Get local orders
  const { data: localOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['shopify-orders'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('shopify_orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('order_date', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(session?.user?.id),
  });

  // Sync orders mutation
  const syncOrdersMutation = useMutation({
    mutationFn: async (options: OrderSyncOptions = {}) => {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('sync-shopify-orders', {
        body: { 
          storeUrl, 
          accessToken: token,
          ...options
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync orders');

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-orders-count'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-orders'] });
      
      if (!variables.silent) {
        toast({
          title: "Orders Synced",
          description: data.message,
        });
      }
    },
    onError: (error: any, variables) => {
      if (!variables.silent) {
        toast({
          title: "Orders Sync Failed",
          description: error.message || "Failed to sync orders.",
          variant: "destructive",
        });
      }
    },
  });

  // Sync all orders
  const syncAllOrders = async () => {
    setIsSyncing(true);
    try {
      let hasMorePages = true;
      let sinceId: string | undefined;
      let totalSynced = 0;

      while (hasMorePages) {
        const result = await syncOrdersMutation.mutateAsync({ 
          limit: 250,
          sinceId,
          silent: true
        });
        
        totalSynced += result.ordersProcessed;
        hasMorePages = result.hasMorePages;
        sinceId = result.nextSinceId;
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Orders Sync Completed",
        description: `Successfully synced ${totalSynced} orders from Shopify.`,
      });

    } catch (error: any) {
      toast({
        title: "Orders Sync Failed",
        description: error.message || "Failed to complete orders sync.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    // Data
    localOrders,
    localOrdersCount,
    
    // Loading states
    ordersLoading,
    isSyncing: isSyncing || syncOrdersMutation.isPending,
    
    // Actions
    syncOrders: syncOrdersMutation.mutateAsync,
    syncAllOrders,
    
    // Helpers
    hasCredentials: Boolean(storeUrl && accessToken),
  };
};