import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { ChevronDown, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';

interface Store {
  id: string;
  store_name: string;
  platform: string;
  domain: string;
  access_token: string;
}

interface StoreSyncProps {
  stores: Store[];
  onSyncComplete: () => void;
}

interface SyncResult {
  storeId: string;
  storeName: string;
  success: boolean;
  error?: string;
  productsSynced?: number;
}

export const StoreSync: React.FC<StoreSyncProps> = ({ stores, onSyncComplete }) => {
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);

  const syncSingleStore = async (store: Store): Promise<SyncResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('sync-shopify-products', {
        body: {
          storeUrl: store.domain,
          accessToken: store.access_token,
          batchSize: 250,
          startPage: 1
        }
      });

      if (error) throw error;

      return {
        storeId: store.id,
        storeName: store.store_name,
        success: true,
        productsSynced: data?.productsSynced || 0
      };
    } catch (error) {
      console.error(`Error syncing store ${store.store_name}:`, error);
      return {
        storeId: store.id,
        storeName: store.store_name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const syncAllStores = async () => {
    if (!session?.user?.id || stores.length === 0) return;

    setIsSyncing(true);
    setSyncResults([]);

    const results: SyncResult[] = [];

    // Sync stores one by one to avoid overwhelming the API
    for (const store of stores) {
      const result = await syncSingleStore(store);
      results.push(result);
      setSyncResults([...results]);
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    if (failureCount === 0) {
      toast({
        title: "Sync Complete",
        description: `Successfully synced ${successCount} store(s)`,
      });
    } else {
      toast({
        title: "Sync Completed with Issues",
        description: `${successCount} stores synced successfully, ${failureCount} failed`,
        variant: "destructive",
      });
    }

    setIsSyncing(false);
    onSyncComplete();
  };

  const handleSingleStoreSync = async (store: Store) => {
    setIsSyncing(true);
    const result = await syncSingleStore(store);
    
    if (result.success) {
      toast({
        title: "Store Synced",
        description: `${store.store_name} synced successfully (${result.productsSynced} products)`,
      });
    } else {
      toast({
        title: "Sync Failed",
        description: `Failed to sync ${store.store_name}: ${result.error}`,
        variant: "destructive",
      });
    }
    
    setIsSyncing(false);
    onSyncComplete();
  };

  if (stores.length === 0) {
    return (
      <Button disabled>
        <RefreshCw className="mr-2 h-4 w-4" />
        No Stores Connected
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isSyncing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Stores'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem onClick={syncAllStores} disabled={isSyncing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All Stores ({stores.length})
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {stores.map((store) => (
            <DropdownMenuItem 
              key={store.id} 
              onClick={() => handleSingleStoreSync(store)}
              disabled={isSyncing}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {store.store_name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sync Results */}
      {syncResults.length > 0 && (
        <div className="space-y-1 text-sm">
          {syncResults.map((result) => (
            <div key={result.storeId} className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.storeName}: {result.success ? `${result.productsSynced} products` : result.error}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};