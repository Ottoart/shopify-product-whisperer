import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { errorHandler, EnhancedError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

export const useSyncStatusRefresh = () => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSyncStatus = async (marketplace: string = 'shopify') => {
    if (!session?.user?.id || isRefreshing) return;
    
    const correlationId = crypto.randomUUID();
    const context = {
      correlationId,
      operation: 'refresh_sync_status',
      component: 'useSyncStatusRefresh',
      userId: session.user.id,
      metadata: { marketplace },
      timestamp: new Date().toISOString()
    };

    logger.info('sync_refresh_start', `Starting sync status refresh for ${marketplace}`, {
      correlationId,
      marketplace,
      userId: session.user.id
    });
    
    setIsRefreshing(true);
    
    try {
      const result = await errorHandler.withRetry(
        async () => {
          const { data, error } = await supabase.functions.invoke('reconcile-sync-status', {
            body: { marketplace, correlationId }
          });

          if (error) {
            throw new EnhancedError(
              `Edge function error: ${error.message}`,
              context,
              error,
              true
            );
          }

          if (!data?.success) {
            throw new EnhancedError(
              data?.error || 'Failed to refresh sync status',
              context,
              undefined,
              true
            );
          }

          return data;
        },
        {
          maxAttempts: 3,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2,
          retryableErrors: ['fetch failed', 'network error', 'timeout']
        },
        context
      );

      logger.success('sync_refresh_success', 'Sync status refreshed successfully', {
        correlationId,
        marketplace,
        conflictsResolved: result.conflictsResolved || 0,
        recommendations: result.recommendations?.length || 0
      });

      toast({
        title: "Sync Status Updated",
        description: result.message || "Sync status has been refreshed with current data.",
      });

    } catch (error: any) {
      await errorHandler.handleError(error, context);
      
      const userMessage = error instanceof EnhancedError 
        ? error.message 
        : "Failed to refresh sync status. Please try again.";

      toast({
        title: "Refresh Failed",
        description: userMessage,
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