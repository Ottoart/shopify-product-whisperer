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
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; message?: string }>({ current: 0, total: 0 });

  // Get Shopify credentials from stores table instead of localStorage
  const getShopifyCredentials = async () => {
    if (!session?.user?.id) return { storeUrl: null, accessToken: null };
    
    const { data: stores } = await supabase
      .from('store_configurations')
      .select('domain, access_token')
      .eq('user_id', session.user.id)
      .eq('platform', 'shopify')
      .eq('is_active', true)
      .limit(1);
    
    if (!stores || stores.length === 0) {
      return { storeUrl: null, accessToken: null };
    }
    
    const store = stores[0];
    let accessToken = store.access_token;
    
    // Parse access token if it's JSON and clean it
    try {
      const parsed = JSON.parse(accessToken);
      accessToken = (parsed.access_token || parsed.accessToken || accessToken).trim().split(' ')[0];
    } catch {
      // If parsing fails, clean the token anyway
      accessToken = accessToken.trim().split(' ')[0];
    }
    
    return { storeUrl: store.domain, accessToken };
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
    enabled: Boolean(session?.user?.id),
  });

  // Get local products count
  const { data: localProductsCount } = useQuery({
    queryKey: ['local-products-count'],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      console.log('Sync hook fetching count for user:', session.user.id);
      
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Count query error:', error);
        throw error;
      }
      
      console.log('Sync hook count result:', count);
      return count || 0;
    },
    enabled: Boolean(session?.user?.id),
  });

  // Get products from local database
  const { data: localProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['local-products'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      let allProducts: any[] = [];
      let hasMore = true;
      let page = 0;
      const pageSize = 1000;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          allProducts = [...allProducts, ...data];
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      return allProducts;
    },
    enabled: Boolean(session?.user?.id),
  });

  // Sync batch mutation
  const syncBatchMutation = useMutation({
    mutationFn: async ({ batchSize = 250, startPage = 1, silent = false }: { batchSize?: number; startPage?: number; silent?: boolean }) => {
      const { storeUrl, accessToken } = await getShopifyCredentials();
      
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
      const { storeUrl, accessToken } = await getShopifyCredentials();
      
      let page = 1;
      let hasMorePages = true;
      let totalSynced = 0;
      let productsSyncedThisSession = 0;

      // Continuous sync until no more pages
      while (hasMorePages && page <= 200) { // Increased limit to handle larger stores
        const result = await syncBatchMutation.mutateAsync({ 
          batchSize: 250, 
          startPage: page,
          silent: true // Run silently during full sync
        });
        
        totalSynced = result.totalSynced;
        productsSyncedThisSession += result.productsSynced;
        hasMorePages = result.hasMorePages;
        
        // Dynamic progress calculation based on products synced
        const estimatedTotal = Math.max(totalSynced * 1.2, 1000); // Estimate total
        const progressPercent = Math.min((totalSynced / estimatedTotal) * 90, 90);
        setSyncProgress({ 
          current: Math.round(progressPercent), 
          total: 100,
          message: `Synced ${totalSynced} products...`
        });
        
        page++;
        
        // Adaptive delay based on page number to avoid rate limiting
        const delay = Math.min(page * 100, 2000); // Increase delay as we sync more
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Break if we're not getting any new products for several pages
        if (result.productsSynced === 0 && page > 5) {
          console.log('No new products found, ending sync');
          break;
        }
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
    hasCredentials: async () => {
      const { storeUrl, accessToken } = await getShopifyCredentials();
      return Boolean(storeUrl && accessToken);
    },
    
    // Status checks
    isCompleted: syncStatus?.sync_status === 'completed',
    isInProgress: syncStatus?.sync_status === 'in_progress',
    lastSyncAt: syncStatus?.last_sync_at,
  };
};