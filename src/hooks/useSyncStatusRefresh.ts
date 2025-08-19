import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';

export const useSyncStatusRefresh = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSyncStatus = async (marketplace: string = 'shopify') => {
    if (!session?.user?.id || isRefreshing) return;
    
    setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-sync-status', {
        body: { marketplace }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Sync Status Updated",
          description: data.message || "Sync status has been refreshed with current data.",
        });
      } else {
        throw new Error(data?.error || 'Failed to refresh sync status');
      }
    } catch (error: any) {
      console.error('Error refreshing sync status:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh sync status.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    refreshSyncStatus,
    isRefreshing
  };
};