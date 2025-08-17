import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
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

  useEffect(() => {
    fetchSyncStatus();

    // Set up real-time subscription for sync status updates
    const channel = supabase
      .channel(`sync-status-${platform}`)
      .on('postgres_changes' as any, {
        event: '*',
        schema: 'public',
        table: 'marketplace_sync_status',
        filter: `user_id=eq.${session?.user?.id}&marketplace=eq.${platform.toLowerCase()}`
      }, (payload: any) => {
        console.log('Real-time sync status update:', payload);
        setSyncStatus(payload.new || payload.record);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

  const { products_synced, total_products_found, sync_status, error_message } = syncStatus;
  const percentage = total_products_found ? Math.round((products_synced / total_products_found) * 100) : 0;
  const isComplete = sync_status === 'completed';
  const isError = sync_status === 'error' || sync_status === 'failed';
  const isInProgress = sync_status === 'in_progress' || sync_status === 'syncing';

  const getStatusIcon = () => {
    if (isComplete) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isError) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (isInProgress) return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = () => {
    if (isComplete) return <Badge variant="default" className="bg-green-500">Complete</Badge>;
    if (isError) return <Badge variant="destructive">Error</Badge>;
    if (isInProgress) return <Badge variant="secondary">Syncing...</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            {getStatusIcon()}
            <span>Syncing {storeName} Products</span>
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {products_synced} of {total_products_found || '?'} products synced
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentage}% complete</span>
            {total_products_found && (
              <span>{total_products_found - products_synced} remaining</span>
            )}
          </div>
        </div>

        {error_message && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Sync Error</p>
                <p className="text-xs text-destructive/80 mt-1">{error_message}</p>
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Successfully synced all {products_synced} products from {storeName}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};