import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { useShopifyCredentials } from '@/hooks/useShopifyCredentials';

interface CustomerSyncOptions {
  limit?: number;
  sinceId?: string;
  silent?: boolean;
}

export const useShopifyCustomerSync = () => {
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

  // Get local customers count
  const { data: localCustomersCount } = useQuery({
    queryKey: ['shopify-customers-count'],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      const { count, error } = await supabase
        .from('shopify_customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: Boolean(session?.user?.id),
  });

  // Get local customers
  const { data: localCustomers, isLoading: customersLoading } = useQuery({
    queryKey: ['shopify-customers'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('shopify_customers')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(session?.user?.id),
  });

  // Sync customers mutation
  const syncCustomersMutation = useMutation({
    mutationFn: async (options: CustomerSyncOptions = {}) => {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('sync-shopify-customers', {
        body: { 
          storeUrl, 
          accessToken: token,
          ...options
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync customers');

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-customers-count'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-customers'] });
      
      if (!variables.silent) {
        toast({
          title: "Customers Synced",
          description: data.message,
        });
      }
    },
    onError: (error: any, variables) => {
      if (!variables.silent) {
        toast({
          title: "Customers Sync Failed",
          description: error.message || "Failed to sync customers.",
          variant: "destructive",
        });
      }
    },
  });

  // Sync all customers
  const syncAllCustomers = async () => {
    setIsSyncing(true);
    try {
      let hasMorePages = true;
      let sinceId: string | undefined;
      let totalSynced = 0;

      while (hasMorePages) {
        const result = await syncCustomersMutation.mutateAsync({ 
          limit: 250,
          sinceId,
          silent: true
        });
        
        totalSynced += result.customersProcessed;
        hasMorePages = result.hasMorePages;
        sinceId = result.nextSinceId;
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Customers Sync Completed",
        description: `Successfully synced ${totalSynced} customers from Shopify.`,
      });

    } catch (error: any) {
      toast({
        title: "Customers Sync Failed",
        description: error.message || "Failed to complete customers sync.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    // Data
    localCustomers,
    localCustomersCount,
    
    // Loading states
    customersLoading,
    isSyncing: isSyncing || syncCustomersMutation.isPending,
    
    // Actions
    syncCustomers: syncCustomersMutation.mutateAsync,
    syncAllCustomers,
    
    // Helpers
    hasCredentials: Boolean(storeUrl && accessToken),
  };
};