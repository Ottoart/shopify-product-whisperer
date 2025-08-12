import { Database, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useShopifyProductSync } from '@/hooks/useShopifyProductSync';
import { useShopifyCredentials } from '@/hooks/useShopifyCredentials';

const SyncStatus = () => {
  const {
    syncStatus,
    localProductsCount,
    isSyncing,
    startFullSync,
    syncBatch,
    isCompleted,
    isInProgress,
    lastSyncAt
  } = useShopifyProductSync();
  const { store } = useShopifyCredentials();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'in_progress': return 'text-warning';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sync Status</h1>
          <p className="text-muted-foreground">Monitor Shopify synchronization operations</p>
          {store?.store_name && (
            <p className="text-sm text-muted-foreground">Active store: {store.store_name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Local Products</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{localProductsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Products in local database</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
              {getStatusIcon(syncStatus?.sync_status || 'pending')}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold capitalize ${getStatusColor(syncStatus?.sync_status || 'pending')}`}>
                {syncStatus?.sync_status || 'pending'}
              </div>
              <p className="text-xs text-muted-foreground">Current sync operation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Synced</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{syncStatus?.total_synced || 0}</div>
              <p className="text-xs text-muted-foreground">Products processed</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Sync Operations
            </CardTitle>
            <CardDescription>
              Control and monitor product synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastSyncAt && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last sync: {new Date(lastSyncAt).toLocaleString()}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                onClick={startFullSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                {isSyncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Full Sync'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => syncBatch()}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Sync Next Batch
              </Button>
            </div>

            {!isCompleted && localProductsCount === 0 && (
              <div className="p-4 border border-warning/20 bg-warning/10 rounded-lg">
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">No products synced yet</span>
                </div>
                <p className="text-sm text-warning/80 mt-1">
                  Click "Full Sync" to start importing your Shopify products.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync Details</CardTitle>
            <CardDescription>
              Current synchronization information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={isCompleted ? "default" : isInProgress ? "secondary" : "outline"}>
                  {syncStatus?.sync_status || 'Not started'}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Products Synced:</span>
                <span className="text-sm">{syncStatus?.total_synced || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Local Products:</span>
                <span className="text-sm">{localProductsCount || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated:</span>
                <span className="text-sm">
                  {syncStatus?.last_sync_at 
                    ? new Date(syncStatus.last_sync_at).toLocaleString() 
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SyncStatus;