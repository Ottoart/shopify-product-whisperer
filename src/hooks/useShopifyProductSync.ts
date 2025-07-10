import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  id: string;
  user_id: string;
  last_sync_at: string | null;
  last_page_info: string | null;
  total_synced: number;
  sync_status: 'pending' | 'in_progress' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export const useShopifyProductSync = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });

  // Get Shopify credentials
  const getShopifyCredentials = () => {
    const storeUrl = localStorage.getItem('shopify_domain');
    const accessToken = localStorage.getItem('shopify_access_token');
    return { storeUrl, accessToken };
  };

  // Get sync status
  const { data: syncStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['shopify-sync-status'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('shopify_sync_status')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as SyncStatus | null;
    },
    enabled: !!session?.user?.id,
  });

  // Get local products count
  const { data: localProductsCount } = useQuery({
    queryKey: ['local-products-count'],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!session?.user?.id,
  });

  // Get products from local database
  const { data: localProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['local-products'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  // Sync batch mutation
  const syncBatchMutation = useMutation({
    mutationFn: async ({ batchSize = 250, startPage = 1, silent = false }: { batchSize?: number; startPage?: number; silent?: boolean }) => {
      const { storeUrl, accessToken } = getShopifyCredentials();
      
      if (!storeUrl || !accessToken) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('sync-shopify-products', {
        body: { storeUrl, accessToken, batchSize, startPage }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync products');

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['local-products-count'] });
      queryClient.invalidateQueries({ queryKey: ['local-products'] });
      
      // Only show toast if not silent
      if (!variables.silent) {
        toast({
          title: "Batch Synced",
          description: data.message,
        });
      }
    },
    onError: (error: any, variables) => {
      // Only show error toast if not silent
      if (!variables.silent) {
        toast({
          title: "Sync Failed",
          description: error.message || "Failed to sync products batch.",
          variant: "destructive",
        });
      }
    },
  });

  // Full sync function (multiple batches)
  const startFullSync = async () => {
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 100 });
    
    try {
      // Get initial count from Shopify to estimate progress
      const { storeUrl, accessToken } = getShopifyCredentials();
      
      let page = 1;
      let hasMorePages = true;
      let totalSynced = 0;
      let productsSyncedThisSession = 0;

      while (hasMorePages && page <= 20) { // Max 20 batches (5000 products)
        const result = await syncBatchMutation.mutateAsync({ 
          batchSize: 250, 
          startPage: page,
          silent: true // Run silently during full sync
        });
        
        totalSynced = result.totalSynced;
        productsSyncedThisSession += result.productsSynced;
        hasMorePages = result.hasMorePages;
        
        // Update progress - show percentage based on batch progress
        const progressPercent = hasMorePages ? (page / 20) * 90 : 100; // Reserve 10% for completion
        setSyncProgress({ current: Math.round(progressPercent), total: 100 });
        
        page++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Final progress update
      setSyncProgress({ current: 100, total: 100 });

      toast({
        title: "Sync Completed",
        description: `Successfully synced ${totalSynced} products from Shopify.`,
      });

    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to complete full sync.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0 });
    }
  };

  // Single batch sync
  const syncBatch = async (batchSize = 250) => {
    const nextPage = syncStatus?.sync_status === 'in_progress' ? 
      Math.floor((syncStatus.total_synced || 0) / batchSize) + 1 : 1;
    
    return syncBatchMutation.mutateAsync({ batchSize, startPage: nextPage });
  };

  return {
    // Data
    syncStatus,
    localProducts,
    localProductsCount,
    
    // Loading states
    statusLoading,
    productsLoading,
    isSyncing: isSyncing || syncBatchMutation.isPending,
    syncProgress,
    
    // Actions
    startFullSync,
    syncBatch,
    
    // Helpers
    hasCredentials: () => {
      const { storeUrl, accessToken } = getShopifyCredentials();
      return !!(storeUrl && accessToken);
    },
    
    // Status checks
    isCompleted: syncStatus?.sync_status === 'completed',
    isInProgress: syncStatus?.sync_status === 'in_progress',
    lastSyncAt: syncStatus?.last_sync_at,
  };
};