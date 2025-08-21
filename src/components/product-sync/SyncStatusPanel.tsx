import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Play, Pause, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncJob {
  id: string;
  store_connection_id: string;
  store_name: string;
  platform: string;
  status: string;
  progress: number;
  total_products: number;
  synced_products: number;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
}

interface SyncStatusPanelProps {
  onSyncComplete: () => void;
}

export function SyncStatusPanel({ onSyncComplete }: SyncStatusPanelProps) {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStores();
    loadSyncStatus();
    
    // Set up real-time sync status updates
    const channel = supabase
      .channel('sync-status-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'store_connections'
      }, () => {
        loadSyncStatus();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('store_connections')
        .select('*')
        .eq('connection_status', 'connected');

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadSyncStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_connections')
        .select('*')
        .eq('connection_status', 'connected');

      if (error) throw error;

      // Transform store data into sync job format
      const jobs: SyncJob[] = (data || []).map(store => ({
        id: store.id,
        store_connection_id: store.id,
        store_name: store.store_name,
        platform: store.platform,
        status: store.sync_status || 'idle',
        progress: store.sync_status === 'syncing' ? 65 : store.sync_status === 'completed' ? 100 : 0,
        total_products: 0, // Would be populated by actual sync
        synced_products: 0, // Would be populated by actual sync
        error_message: store.error_message,
        started_at: store.last_sync_at,
        completed_at: store.sync_status === 'completed' ? store.last_sync_at : undefined
      }));

      setSyncJobs(jobs);
    } catch (error) {
      console.error('Error loading sync status:', error);
      toast({
        title: "Error",
        description: "Failed to load sync status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSync = async (storeId?: string) => {
    try {
      const targetStoreId = storeId || selectedStore;
      if (!targetStoreId) {
        toast({
          title: "Error",
          description: "Please select a store to sync",
          variant: "destructive"
        });
        return;
      }

      // Update sync status to syncing
      const { error } = await supabase
        .from('store_connections')
        .update({ 
          sync_status: 'syncing',
          last_sync_at: new Date().toISOString()
        })
        .eq('id', targetStoreId);

      if (error) throw error;

      toast({
        title: "Sync Started",
        description: "Product sync has been initiated"
      });

      loadSyncStatus();

      // Simulate sync completion after 10 seconds
      setTimeout(async () => {
        await supabase
          .from('store_connections')
          .update({ sync_status: 'idle' })
          .eq('id', targetStoreId);
        
        loadSyncStatus();
        onSyncComplete();
        
        toast({
          title: "Sync Complete",
          description: "Products have been synchronized successfully"
        });
      }, 10000);

    } catch (error) {
      console.error('Error starting sync:', error);
      toast({
        title: "Error",
        description: "Failed to start sync",
        variant: "destructive"
      });
    }
  };

  const stopSync = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from('store_connections')
        .update({ sync_status: 'idle' })
        .eq('id', storeId);

      if (error) throw error;

      toast({
        title: "Sync Stopped",
        description: "Product sync has been stopped"
      });

      loadSyncStatus();
    } catch (error) {
      console.error('Error stopping sync:', error);
      toast({
        title: "Error",
        description: "Failed to stop sync",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800">Syncing</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="prep-fox-card">
        <CardHeader>
          <div className="h-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-3 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Controls */}
      <Card className="prep-fox-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync Controls
          </CardTitle>
          <CardDescription>
            Start product synchronization from your connected stores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Store
              </label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a store to sync" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.store_name} ({store.platform})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => startSync()}
                disabled={!selectedStore || syncJobs.some(job => job.status === 'syncing')}
                className="prep-fox-button"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Sync
              </Button>
              <Button 
                onClick={() => loadSyncStatus()}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sync Jobs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Sync Status</h3>
        
        {syncJobs.length === 0 ? (
          <Card className="prep-fox-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No sync jobs</h3>
              <p className="text-muted-foreground">
                Connect stores to start syncing products
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {syncJobs.map((job) => (
              <Card key={job.id} className="prep-fox-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <CardTitle className="text-lg">{job.store_name}</CardTitle>
                        <CardDescription className="capitalize">
                          {job.platform} Store
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(job.status)}
                      {job.status === 'syncing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => stopSync(job.store_connection_id)}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Stop
                        </Button>
                      )}
                      {job.status === 'idle' && (
                        <Button
                          size="sm"
                          onClick={() => startSync(job.store_connection_id)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {job.status === 'syncing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{job.progress}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Products:</span>
                        <span className="ml-2 font-medium">{job.total_products}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Synced:</span>
                        <span className="ml-2 font-medium">{job.synced_products}</span>
                      </div>
                    </div>

                    {job.started_at && (
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(job.started_at).toLocaleString()}
                      </p>
                    )}

                    {job.error_message && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800">{job.error_message}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}