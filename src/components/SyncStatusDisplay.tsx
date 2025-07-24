import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@supabase/auth-helpers-react';
import { useStores } from '@/contexts/StoreContext';

interface SyncStatus {
  marketplace: string;
  sync_status: string;
  last_sync_at: string | null;
  products_synced: number;
  error_message: string | null;
  total_products_found?: number;
  active_products_synced?: number;
  inactive_products_skipped?: number;
  active_listings?: number;
  ended_listings?: number;
  draft_listings?: number;
  unsold_listings?: number;
  scheduled_listings?: number;
  sync_settings?: {
    active_only?: boolean;
    sync_timestamp?: string;
  };
}

export const SyncStatusDisplay = () => {
  const session = useSession();
  const { stores } = useStores();
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSyncStatuses = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_sync_status')
        .select('*')
        .eq('user_id', session.user.id)
        .order('last_sync_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to properly type sync_settings
      const transformedData = (data || []).map(status => ({
        ...status,
        sync_settings: typeof status.sync_settings === 'object' && status.sync_settings !== null 
          ? status.sync_settings as { active_only?: boolean; sync_timestamp?: string; }
          : undefined
      }));
      
      setSyncStatuses(transformedData);
    } catch (error) {
      console.error('Error fetching sync statuses:', error);
    }
  };

  useEffect(() => {
    fetchSyncStatuses();
    
    // Set up real-time subscription for sync status updates
    const subscription = supabase
      .channel('sync_status_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_sync_status',
          filter: `user_id=eq.${session?.user?.id}`
        },
        () => {
          fetchSyncStatuses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session?.user?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="secondary">Syncing...</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (stores.length === 0 || syncStatuses.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {syncStatuses.map((status) => {
        const store = stores.find(s => s.platform === status.marketplace);
        const storeName = store?.store_name || status.marketplace.charAt(0).toUpperCase() + status.marketplace.slice(1);
        
        return (
          <Card key={`${status.marketplace}`} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.sync_status)}
                  <CardTitle className="text-sm font-medium">{storeName}</CardTitle>
                </div>
                {getStatusBadge(status.sync_status)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Products synced:</span>
                  <span className="font-medium">
                    {status.products_synced}
                    {status.total_products_found && status.total_products_found > (status.products_synced || 0) && (
                      <span className="text-xs text-muted-foreground/70 ml-1">
                        (of {status.total_products_found})
                      </span>
                    )}
                  </span>
                </div>
                
                {status.sync_settings?.active_only && status.inactive_products_skipped && status.inactive_products_skipped > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skipped:</span>
                    <span className="font-medium text-orange-600">{status.inactive_products_skipped} inactive</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Last sync:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{formatLastSync(status.last_sync_at)}</span>
                    {status.sync_settings?.active_only && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        Active only
                      </Badge>
                    )}
                  </div>
                </div>

                {status.sync_status === 'in_progress' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">Syncing...</span>
                    </div>
                    <Progress value={undefined} className="h-2" />
                  </div>
                )}

                {status.sync_status === 'failed' && status.error_message && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-600">{status.error_message}</p>
                  </div>
                )}

                {status.sync_status === 'completed' && status.products_synced > 0 && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-green-600">
                      Successfully synced {status.products_synced} products
                      {status.sync_settings?.active_only ? ' (active only)' : ''}
                      {status.inactive_products_skipped && status.inactive_products_skipped > 0 && (
                        <span className="block text-xs mt-1">
                          {status.inactive_products_skipped} inactive products skipped
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* eBay listing status breakdown */}
                {status.marketplace === 'ebay' && (
                  status.active_listings || status.ended_listings || status.draft_listings || 
                  status.unsold_listings || status.scheduled_listings
                ) && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Listing Status Breakdown:</h4>
                    <div className="space-y-1">
                      {status.active_listings > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Active listings:</span>
                          <span className="text-xs font-medium text-green-600">{status.active_listings}</span>
                        </div>
                      )}
                      {status.unsold_listings > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Unsold listings:</span>
                          <span className="text-xs font-medium text-yellow-600">{status.unsold_listings}</span>
                        </div>
                      )}
                      {status.draft_listings > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Draft listings:</span>
                          <span className="text-xs font-medium text-gray-600">{status.draft_listings}</span>
                        </div>
                      )}
                      {status.ended_listings > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Ended listings:</span>
                          <span className="text-xs font-medium text-red-600">{status.ended_listings}</span>
                        </div>
                      )}
                      {status.scheduled_listings > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Scheduled listings:</span>
                          <span className="text-xs font-medium text-blue-600">{status.scheduled_listings}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};