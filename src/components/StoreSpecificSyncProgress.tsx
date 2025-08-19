import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@supabase/auth-helpers-react';

interface StoreSpecificSyncProgressProps {
  storeName: string;
  platform: string;
}

interface SyncStatus {
  marketplace: string;
  sync_status: string;
  last_sync_at: string | null;
  products_synced: number;
  total_products_found?: number;
  error_message: string | null;
  sync_settings?: any;
  active_products_synced?: number;
  inactive_products_skipped?: number;
}

export const StoreSpecificSyncProgress = ({ storeName, platform }: StoreSpecificSyncProgressProps) => {
  const session = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSyncStatus = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_sync_status')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('marketplace', platform.toLowerCase())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching sync status:', error);
        return;
      }

      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSyncStatus = async () => {
    if (!session?.user?.id) return;
    
    try {
      // Call reconcile function to ensure accuracy
      await supabase.functions.invoke('reconcile-sync-status', {
        body: { marketplace: platform.toLowerCase() }
      });
      
      // Refresh the displayed data
      await fetchSyncStatus();
    } catch (error) {
      console.error('Error refreshing sync status:', error);
    }
  };

  useEffect(() => {
    fetchSyncStatus();

    // Set up real-time subscription for sync status updates with enhanced handling
    const channel = supabase
      .channel(`sync-status-${platform}-${session?.user?.id}`)
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'marketplace_sync_status',
        filter: `user_id=eq.${session?.user?.id}&marketplace=eq.${platform.toLowerCase()}`
      }, (payload: any) => {
        console.log('Real-time sync status update:', payload);
        const newData = payload.new || payload.record;
        if (newData) {
          setSyncStatus(newData);
        }
      })
      .subscribe();

    // Also listen to shopify_sync_status for more comprehensive updates
    const shopifyChannel = supabase
      .channel(`shopify-sync-${session?.user?.id}`)
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'shopify_sync_status',
        filter: `user_id=eq.${session?.user?.id}`
      }, (payload: any) => {
        console.log('Shopify sync status update:', payload);
        // Refresh sync status when shopify status changes
        fetchSyncStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(shopifyChannel);
    };
  }, [session?.user?.id, platform]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading sync status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!syncStatus) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No sync data available for {storeName}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { products_synced, total_products_found, sync_status, error_message, sync_settings, active_products_synced, inactive_products_skipped } = syncStatus;
  
  // Fallback logic for missing total count
  const fallbackTotal = !total_products_found || total_products_found === 0 ? 
    Math.max(products_synced * 1.2, products_synced + 100) : total_products_found;
  const effectiveTotal = total_products_found && total_products_found > 0 ? total_products_found : fallbackTotal;
  
  const percentage = effectiveTotal > 0 ? Math.round((products_synced / effectiveTotal) * 100) : 0;
  const remaining = effectiveTotal - products_synced;
  const isComplete = sync_status === 'completed';
  const isError = sync_status === 'error' || sync_status === 'failed';
  const isInProgress = sync_status === 'in_progress' || sync_status === 'syncing';
  const isActiveOnly = sync_settings?.active_only;

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isError) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (isInProgress) return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    if (isComplete) return <Badge variant="default" className="bg-green-500">Complete</Badge>;
    if (isError) return <Badge variant="destructive">Failed</Badge>;
    if (isInProgress) return <Badge variant="secondary">In Progress</Badge>;
    return <Badge variant="outline">Waiting</Badge>;
  };

  const getStatusMessage = () => {
    if (isComplete) {
      return `All ${products_synced} products have been successfully synced from ${storeName}`;
    }
    if (isError) {
      return `Sync failed for ${storeName}. Please try again.`;
    }
    if (isInProgress) {
      if (total_products_found && total_products_found > 0) {
        return `Syncing products from ${storeName}... ${remaining} remaining`;
      }
      return `Discovering and syncing products from ${storeName}...`;
    }
    return `Ready to sync products from ${storeName}`;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {getStatusIcon()}
            <span>Syncing {storeName} Products</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSyncStatus}
              disabled={loading}
              className="h-8 px-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className="text-sm text-muted-foreground">
          {getStatusMessage()}
        </div>

        {/* Progress Bar and Stats */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sync Progress</span>
            <span className="font-medium">
              {products_synced.toLocaleString()} of {total_products_found?.toLocaleString() || `~${effectiveTotal.toLocaleString()}`} products
            </span>
          </div>
          
          <Progress 
            value={percentage} 
            className="h-3"
          />
          
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="text-center">
              <div className="font-medium text-foreground">{percentage}%</div>
              <div className="text-muted-foreground">Complete</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">{products_synced.toLocaleString()}</div>
              <div className="text-muted-foreground">Synced</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-foreground">{remaining.toLocaleString()}</div>
              <div className="text-muted-foreground">Remaining</div>
            </div>
          </div>
        </div>

        {/* Additional Sync Details */}
        {(isActiveOnly || inactive_products_skipped) && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="text-xs space-y-1">
              {isActiveOnly && (
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Sync Mode:</span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Active products only</span>
                </div>
              )}
              {inactive_products_skipped && inactive_products_skipped > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Skipped:</span>
                  <span className="font-medium text-blue-800 dark:text-blue-200">{inactive_products_skipped} inactive products</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error_message && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Sync Failed</p>
                <p className="text-xs text-destructive/80 mt-1">{error_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Display */}
        {isComplete && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Sync Complete!
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  Successfully synced {products_synced.toLocaleString()} products from {storeName}
                  {isActiveOnly && ' (active products only)'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* In Progress Display */}
        {isInProgress && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-primary animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">
                  Sync in progress...
                </p>
                <p className="text-xs text-primary/80 mt-1">
                  {total_products_found ? 
                    `Processing ${remaining.toLocaleString()} remaining products` : 
                    'Discovering products and syncing data'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};