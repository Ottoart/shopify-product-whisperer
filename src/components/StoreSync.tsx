import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStores } from '@/contexts/StoreContext';
import { useSession } from '@supabase/auth-helpers-react';
import { RotateCcw, ChevronDown, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface StoreSyncProps {
  onSyncComplete?: () => void;
}

interface SyncStatus {
  storeId: string;
  storeName: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  progress: number;
  error?: string;
  productsCount?: number;
}

export const StoreSync = ({ onSyncComplete }: StoreSyncProps) => {
  const { stores } = useStores();
  const session = useSession();
  const { toast } = useToast();
  const [syncStatuses, setSyncStatuses] = useState<Record<string, SyncStatus>>({});
  const [isAllSyncing, setIsAllSyncing] = useState(false);
  const [syncSettings, setSyncSettings] = useState<Record<string, boolean>>({});

  // Load sync settings for all platforms
  useEffect(() => {
    loadAllSyncSettings();
  }, []);

  const loadAllSyncSettings = async () => {
    try {
      const { data: settings } = await supabase
        .from('sync_settings')
        .select('platform, sync_active_only');
      
      if (settings) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.platform] = setting.sync_active_only;
          return acc;
        }, {} as Record<string, boolean>);
        setSyncSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error loading sync settings:', error);
    }
  };

  const initializeSyncStatus = (storeId: string, storeName: string): SyncStatus => ({
    storeId,
    storeName,
    status: 'idle',
    progress: 0
  });

  const updateSyncStatus = (storeId: string, updates: Partial<SyncStatus>) => {
    setSyncStatuses(prev => ({
      ...prev,
      [storeId]: { ...prev[storeId], ...updates }
    }));
  };

  const cleanAccessToken = (token: string) => {
    try {
      const parsed = JSON.parse(token);
      token = parsed.access_token || parsed.accessToken || token;
    } catch {
      // If parsing fails, use as-is
    }
    
    return token.toString().trim()
      .replace(/[\s\n\r\t\u2028\u2029]/g, '')
      .split(/\s+/)[0]
      .replace(/[^\w-]/g, '');
  };

  const syncSingleStore = async (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    if (!store) return;

    const statusKey = storeId;
    updateSyncStatus(statusKey, {
      ...initializeSyncStatus(storeId, store.store_name),
      status: 'syncing',
      progress: 10
    });

    try {
      // Verify store still exists and is active before syncing
      const { data: exists, error: verifyError } = await (supabase as any)
        .from('store_configurations')
        .select('id')
        .eq('id', store.id)
        .eq('user_id', session?.user?.id || '')
        .eq('is_active', true)
        .maybeSingle();
      if (verifyError && verifyError.code !== 'PGRST116') throw verifyError;
      if (!exists) {
        throw new Error('Selected store no longer exists or is inactive. Please refresh stores.');
      }

      if (store.platform === 'shopify') {
        const accessToken = cleanAccessToken(store.access_token);
        const activeOnly = syncSettings['shopify'] ?? true;
        
        updateSyncStatus(statusKey, { progress: 30 });

        const { data, error } = await supabase.functions.invoke('sync-shopify-products', {
          body: { 
            storeUrl: store.domain,
            accessToken: accessToken,
            syncActiveOnly: activeOnly
          }
        });

        if (error) throw error;

        updateSyncStatus(statusKey, { 
          status: 'success', 
          progress: 100,
          productsCount: data?.totalSynced || 0
        });

        const filterMsg = activeOnly ? ' (active products only)' : ' (all products)';
        toast({
          title: "Sync completed",
          description: `Successfully synced ${data?.totalSynced || 0} products from ${store.store_name}${filterMsg}`,
        });
      } else if (store.platform === 'ebay') {
        const activeOnly = syncSettings['ebay'] ?? true;
        
        updateSyncStatus(statusKey, { progress: 30 });

        const { data, error } = await supabase.functions.invoke('sync-ebay-products', {
          body: { 
            syncActiveOnly: activeOnly 
          }
        });

        if (error) throw error;

        updateSyncStatus(statusKey, { 
          status: 'success', 
          progress: 100,
          productsCount: data?.productsSynced || 0
        });

        const filterMsg = activeOnly ? ' (active products only)' : ' (all products)';
        toast({
          title: "eBay Sync completed",
          description: `Successfully synced ${data?.productsSynced || 0} products from ${store.store_name}${filterMsg}`,
        });
      } else {
        throw new Error(`Platform ${store.platform} not supported for sync`);
      }
    } catch (error) {
      console.error('Error syncing store:', error);
      updateSyncStatus(statusKey, { 
        status: 'error', 
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Sync failed",
        description: `Failed to sync ${store.store_name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const syncAllStores = async () => {
    setIsAllSyncing(true);
    const syncableStores = stores.filter(s => s.platform === 'shopify' || s.platform === 'ebay');
    
    // Initialize all store statuses
    syncableStores.forEach(store => {
      setSyncStatuses(prev => ({
        ...prev,
        [store.id]: initializeSyncStatus(store.id, store.store_name)
      }));
    });

    const syncPromises = syncableStores.map(store => syncSingleStore(store.id));
    
    try {
      await Promise.allSettled(syncPromises);
      
      const successCount = Object.values(syncStatuses).filter(s => s.status === 'success').length;
      const errorCount = Object.values(syncStatuses).filter(s => s.status === 'error').length;
      
      toast({
        title: "Bulk sync completed",
        description: `${successCount} stores synced successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
    } finally {
      setIsAllSyncing(false);
      onSyncComplete?.();
    }
  };

  const getSyncStatusIcon = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing':
        return <Clock className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RotateCcw className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSyncStatusBadge = (status: SyncStatus['status']) => {
    switch (status) {
      case 'syncing':
        return <Badge variant="secondary">Syncing...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  if (stores.length === 0) {
    return null;
  }

  const hasActiveSync = Object.values(syncStatuses).some(s => s.status === 'syncing') || isAllSyncing;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              disabled={hasActiveSync}
              className="flex items-center gap-2"
            >
              <RotateCcw className={`h-4 w-4 ${hasActiveSync ? 'animate-spin' : ''}`} />
              Sync Stores
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuItem onClick={syncAllStores} disabled={hasActiveSync}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Sync All Stores ({stores.length})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {stores.map(store => {
              const status = syncStatuses[store.id];
              return (
                <DropdownMenuItem 
                  key={store.id}
                  onClick={() => syncSingleStore(store.id)}
                  disabled={hasActiveSync}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {getSyncStatusIcon(status?.status || 'idle')}
                    <span>{store.store_name}</span>
                  </div>
                  {getSyncStatusBadge(status?.status || 'idle')}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sync Progress Cards */}
      {Object.values(syncStatuses).filter(s => s.status !== 'idle').length > 0 && (
        <div className="grid gap-2">
          {Object.values(syncStatuses)
            .filter(s => s.status !== 'idle')
            .map(status => (
              <Card key={status.storeId} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSyncStatusIcon(status.status)}
                    <span className="font-medium">{status.storeName}</span>
                  </div>
                  {getSyncStatusBadge(status.status)}
                </div>
                
                {status.status === 'syncing' && (
                  <Progress value={status.progress} className="h-2" />
                )}
                
                {status.status === 'success' && status.productsCount && (
                  <p className="text-sm text-muted-foreground">
                    Synced {status.productsCount} products
                  </p>
                )}
                
                {status.status === 'error' && status.error && (
                  <p className="text-sm text-red-600">{status.error}</p>
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};