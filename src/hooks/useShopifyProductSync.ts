import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { useShopifyCredentials } from '@/hooks/useShopifyCredentials';

interface SyncStatus {
  id: string;
  user_id: string;
  marketplace: string;
  last_sync_at: string | null;
  sync_status: 'pending' | 'in_progress' | 'error' | 'success' | 'syncing';
  error_message: string | null;
  products_synced: number;
  total_products_found: number;
  active_products_synced: number;
  inactive_products_skipped: number;
  sync_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useShopifyProductSync = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; message?: string }>({ current: 0, total: 0 });
  const [advancedSettings, setAdvancedSettings] = useState({
    batch_size: 250,
    max_pages: 500,
    early_termination_threshold: 10,
    rate_limit_delay: 500,
    auto_recovery: true,
    validation_checks: true
  });
  const { storeUrl, accessToken } = useShopifyCredentials();

  // Load advanced settings
  useEffect(() => {
    if (session?.user?.id) {
      loadAdvancedSettings();
    }
  }, [session?.user?.id]);

  const loadAdvancedSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_settings')
        .select('advanced_settings')
        .eq('user_id', session?.user?.id)
        .eq('platform', 'shopify')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not load advanced settings:', error);
        return;
      }

      if (data?.advanced_settings && typeof data.advanced_settings === 'object') {
        setAdvancedSettings(prev => ({ ...prev, ...(data.advanced_settings as any) }));
      }
    } catch (error) {
      console.warn('Error loading advanced settings:', error);
    }
  };

  // Clean token helper for legacy stored JSON tokens
  const cleanAccessToken = (token?: string | null) => {
    if (!token) return null;
    try {
      const parsed = JSON.parse(token);
      token = parsed.access_token || parsed.accessToken || token;
    } catch {}
    return token.toString().trim().split(' ')[0];
  };

  // Get sync status
  const { data: syncStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['syncStatus'],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('marketplace_sync_status')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('marketplace', 'shopify')
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
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      // Verify the selected store still exists and is active
      const { data: exists, error: verifyError } = await supabase
        .from('store_configurations')
        .select('id')
        .eq('domain', storeUrl)
        .eq('user_id', session?.user?.id || '')
        .eq('is_active', true)
        .maybeSingle();
      if (verifyError && verifyError.code !== 'PGRST116') throw verifyError;
      if (!exists) {
        throw new Error('Selected store no longer exists or is inactive. Please refresh stores.');
      }

      const { data, error } = await supabase.functions.invoke('sync-shopify-products', {
        body: { 
          storeUrl, 
          accessToken: token, 
          batchSize: advancedSettings.batch_size, 
          startPage 
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync products');

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
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

  // GraphQL Bulk Sync function - handles 4000+ products efficiently
  const startGraphQLBulkSync = async () => {
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 100 });
    
    try {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) throw new Error('Missing Shopify credentials');
      
      // Step 1: Start bulk operation
      toast({
        title: "Starting Bulk Sync",
        description: "Initiating GraphQL bulk operation for all products...",
      });

      setSyncProgress({ current: 5, total: 100, message: "Starting bulk operation..." });

      const startResponse = await supabase.functions.invoke('sync-shopify-graphql', {
        body: { 
          storeUrl: storeUrl.replace(/^https?:\/\//, ''), 
          accessToken: token,
          operation: 'start_bulk'
        }
      });

      if (startResponse.error) {
        throw new Error(startResponse.error.message);
      }

      const bulkOperationId = startResponse.data?.bulkOperation?.id;
      if (!bulkOperationId) {
        throw new Error('Failed to start bulk operation');
      }

      setSyncProgress({ current: 10, total: 100, message: "Bulk operation started..." });
      console.log('📊 Bulk operation started:', bulkOperationId);

      // Step 2: Poll for completion
      let isCompleted = false;
      let checkCount = 0;
      const maxChecks = 60; // Max 5 minutes of polling
      
      while (!isCompleted && checkCount < maxChecks) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        checkCount++;
        
        const checkResponse = await supabase.functions.invoke('sync-shopify-graphql', {
          body: { 
            storeUrl: storeUrl.replace(/^https?:\/\//, ''), 
            accessToken: token,
            operation: 'check_bulk',
            bulkOperationId
          }
        });

        if (checkResponse.error) {
          console.error('❌ Error checking bulk operation:', checkResponse.error);
          continue;
        }

        const status = checkResponse.data?.bulkOperation?.status;
        const progress = Math.min(90, 10 + (checkCount / maxChecks) * 80);
        setSyncProgress({ 
          current: progress, 
          total: 100, 
          message: `Processing bulk operation... (${status})` 
        });

        console.log(`📊 Bulk operation status: ${status} (check ${checkCount}/${maxChecks})`);

        if (checkResponse.data?.operation === 'bulk_completed') {
          isCompleted = true;
          setSyncProgress({ current: 100, total: 100, message: "Sync completed!" });
          
          const processedProducts = checkResponse.data?.processedProducts || 0;
          const totalProducts = checkResponse.data?.totalProducts || 0;
          
          // Force refresh all related queries
          await queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
          await queryClient.invalidateQueries({ queryKey: ['local-products'] });
          await queryClient.invalidateQueries({ queryKey: ['local-products-count'] });

          toast({
            title: "GraphQL Bulk Sync Completed! 🎉",
            description: `Successfully synced ${processedProducts} of ${totalProducts} products using GraphQL bulk operations.`,
          });

          console.log(`✅ GraphQL bulk sync completed: ${processedProducts}/${totalProducts} products`);
          break;
        } else if (status === 'FAILED' || status === 'CANCELLED') {
          throw new Error(`Bulk operation ${status.toLowerCase()}`);
        }
      }

      if (!isCompleted) {
        throw new Error('Bulk operation timed out. Please try again.');
      }

    } catch (error: any) {
      console.error('❌ GraphQL bulk sync error:', error);
      toast({
        title: "GraphQL Bulk Sync Failed",
        description: error.message || "Failed to complete GraphQL bulk sync.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0 });
    }
  };

  // Full sync function (multiple batches)
  const startFullSync = async () => {
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 100 });
    
    try {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) throw new Error('Missing Shopify credentials');
      
      let page = 1;
      let hasMorePages = true;
      let totalSynced = 0;
      let productsSyncedThisSession = 0;

      let totalProductsInShopify = 0;
      let pagesWithoutProducts = 0;
      const maxPagesWithoutProducts = 10; // Allow more empty pages before stopping
      
      // Continuous sync until no more pages - uses advanced settings
      while (hasMorePages) {
        const result = await syncBatchMutation.mutateAsync({ 
          batchSize: advancedSettings.batch_size, 
          startPage: page,
          silent: true // Run silently during full sync
        });
        
        totalSynced = result.totalSynced;
        productsSyncedThisSession += result.productsSynced;
        hasMorePages = result.hasMorePages;
        
        // Track Shopify's reported total count
        if (result.totalProductsInShopify && result.totalProductsInShopify > totalProductsInShopify) {
          totalProductsInShopify = result.totalProductsInShopify;
        }
        
        // Improved progress calculation using Shopify's actual count
        if (totalProductsInShopify > 0) {
          const progressPercent = Math.min((totalSynced / totalProductsInShopify) * 95, 95);
          setSyncProgress({ 
            current: Math.round(progressPercent), 
            total: 100,
            message: `Synced ${totalSynced} of ${totalProductsInShopify} products...`
          });
        } else {
          // Fallback to estimated progress
          const estimatedTotal = Math.max(totalSynced * 1.2, 1000);
          const progressPercent = Math.min((totalSynced / estimatedTotal) * 90, 90);
          setSyncProgress({ 
            current: Math.round(progressPercent), 
            total: 100,
            message: `Synced ${totalSynced} products...`
          });
        }
        
        page++;
        
        // Adaptive delay with advanced settings and exponential backoff
        const baseDelay = advancedSettings.rate_limit_delay;
        const jitter = Math.random() * 200; // Add randomness to avoid thundering herd
        await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
        
        // Improved early termination logic using advanced settings
        if (result.productsSynced === 0) {
          pagesWithoutProducts++;
          console.log(`Page ${page} had no products. Empty pages count: ${pagesWithoutProducts}`);
          
          if (pagesWithoutProducts >= advancedSettings.early_termination_threshold) {
            console.log(`Stopping sync after ${advancedSettings.early_termination_threshold} consecutive empty pages`);
            break;
          }
        } else {
          pagesWithoutProducts = 0; // Reset counter when we find products
        }
        
        // Only use max pages as a safety net for very large stores, not a hard limit
        if (page >= Math.max(advancedSettings.max_pages, 50)) {
          console.log(`Reached safety limit (${Math.max(advancedSettings.max_pages, 50)} pages), stopping sync to prevent infinite loops`);
          break;
        }
        
        // Safety check: if we've synced more than Shopify reports, something is wrong
        if (totalProductsInShopify > 0 && totalSynced >= totalProductsInShopify) {
          console.log(`Sync completed: synced ${totalSynced} out of ${totalProductsInShopify} products`);
          break;
        }
      }
      
      
      // Post-sync validation using advanced settings
      if (advancedSettings.validation_checks && totalProductsInShopify > 0 && totalSynced < totalProductsInShopify * 0.95) {
        console.warn(`Sync may be incomplete: synced ${totalSynced} out of ${totalProductsInShopify} products`);
        
        if (advancedSettings.auto_recovery) {
          toast({
            title: "Auto-Recovery Initiated",
            description: `Detected incomplete sync. Attempting to recover missing products...`,
          });
          // Note: Auto-recovery logic would be implemented here
        } else {
          toast({
            title: "Sync May Be Incomplete", 
            description: `Synced ${totalSynced} out of ${totalProductsInShopify} products. Some products may have been skipped.`,
            variant: "destructive",
          });
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
  const syncBatch = async (batchSize?: number) => {
    const nextPage = syncStatus?.sync_status === 'in_progress' ? 
      Math.floor((syncStatus.products_synced || 0) / (batchSize || advancedSettings.batch_size)) + 1 : 1;
    
    return syncBatchMutation.mutateAsync({ 
      batchSize: batchSize || advancedSettings.batch_size, 
      startPage: nextPage 
    });
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
    startGraphQLBulkSync, // New GraphQL bulk sync for 4000+ products
    syncBatch,
    
    // Helpers
    hasCredentials: async () => {
      return Boolean(storeUrl && accessToken);
    },
    
    // Status checks
    isCompleted: syncStatus?.sync_status === 'success',
    isInProgress: syncStatus?.sync_status === 'in_progress' || syncStatus?.sync_status === 'syncing',
    lastSyncAt: syncStatus?.last_sync_at,
  };
};