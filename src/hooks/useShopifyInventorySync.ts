import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { useShopifyCredentials } from '@/hooks/useShopifyCredentials';

interface InventorySyncOptions {
  inventoryItemIds?: string[];
  locationIds?: string[];
  silent?: boolean;
}

export const useShopifyInventorySync = () => {
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

  // Get local inventory count
  const { data: localInventoryCount } = useQuery({
    queryKey: ['shopify-inventory-count'],
    queryFn: async () => {
      if (!session?.user?.id) return 0;
      
      const { count, error } = await supabase
        .from('shopify_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: Boolean(session?.user?.id),
  });

  // Get local inventory
  const { data: localInventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ['shopify-inventory'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('shopify_inventory')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    enabled: Boolean(session?.user?.id),
  });

  // Sync inventory mutation
  const syncInventoryMutation = useMutation({
    mutationFn: async (options: InventorySyncOptions = {}) => {
      const token = cleanAccessToken(accessToken);
      if (!storeUrl || !token) {
        throw new Error('Shopify credentials not found. Please configure your store settings first.');
      }

      const { data, error } = await supabase.functions.invoke('sync-shopify-inventory', {
        body: { 
          storeUrl, 
          accessToken: token,
          ...options
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to sync inventory');

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopify-inventory-count'] });
      queryClient.invalidateQueries({ queryKey: ['shopify-inventory'] });
      
      if (!variables.silent) {
        toast({
          title: "Inventory Synced",
          description: data.message,
        });
      }
    },
    onError: (error: any, variables) => {
      if (!variables.silent) {
        toast({
          title: "Inventory Sync Failed",
          description: error.message || "Failed to sync inventory.",
          variant: "destructive",
        });
      }
    },
  });

  // Sync all inventory
  const syncAllInventory = async () => {
    setIsSyncing(true);
    try {
      const result = await syncInventoryMutation.mutateAsync({ silent: true });

      toast({
        title: "Inventory Sync Completed",
        description: `Successfully synced ${result.inventoryRecordsProcessed} inventory records across ${result.locationsProcessed} locations.`,
      });

    } catch (error: any) {
      toast({
        title: "Inventory Sync Failed",
        description: error.message || "Failed to complete inventory sync.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    // Data
    localInventory,
    localInventoryCount,
    
    // Loading states
    inventoryLoading,
    isSyncing: isSyncing || syncInventoryMutation.isPending,
    
    // Actions
    syncInventory: syncInventoryMutation.mutateAsync,
    syncAllInventory,
    
    // Helpers
    hasCredentials: Boolean(storeUrl && accessToken),
  };
};