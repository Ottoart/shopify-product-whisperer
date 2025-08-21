import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Store, Plus, Settings, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoreConnection {
  id: string;
  platform: string;
  store_name: string;
  store_url?: string;
  connection_status: string;
  last_sync_at?: string;
  sync_status: string;
  error_message?: string;
  created_at: string;
}

interface StoreConnectionHubProps {
  onConnectionChange: () => void;
}

export function StoreConnectionHub({ onConnectionChange }: StoreConnectionHubProps) {
  const [connections, setConnections] = useState<StoreConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newConnection, setNewConnection] = useState({
    platform: '',
    store_name: '',
    store_url: '',
    api_key: '',
    api_secret: '',
    additional_config: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error loading connections:', error);
      toast({
        title: "Error",
        description: "Failed to load store connections",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = async () => {
    if (!newConnection.platform || !newConnection.store_name) {
      toast({
        title: "Validation Error",
        description: "Platform and store name are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const credentials = {
        api_key: newConnection.api_key,
        api_secret: newConnection.api_secret,
        additional_config: newConnection.additional_config
      };

      const { error } = await supabase
        .from('store_connections')
        .insert({
          platform: newConnection.platform,
          store_name: newConnection.store_name,
          store_url: newConnection.store_url,
          api_credentials: credentials,
          connection_status: 'disconnected',
          user_id: (await supabase.auth.getUser()).data.user?.id!
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Store connection added successfully"
      });

      setShowAddDialog(false);
      setNewConnection({
        platform: '',
        store_name: '',
        store_url: '',
        api_key: '',
        api_secret: '',
        additional_config: ''
      });
      loadConnections();
      onConnectionChange();
    } catch (error) {
      console.error('Error adding connection:', error);
      toast({
        title: "Error",
        description: "Failed to add store connection",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    try {
      // For now, just simulate a connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error } = await supabase
        .from('store_connections')
        .update({ 
          connection_status: 'connected',
          error_message: null
        })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Connection test successful"
      });

      loadConnections();
      onConnectionChange();
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Error",
        description: "Connection test failed",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('store_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Success",  
        description: "Store connection deleted"
      });

      loadConnections();
      onConnectionChange();
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast({
        title: "Error",
        description: "Failed to delete connection",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="prep-fox-card">
            <CardHeader>
              <div className="h-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Store Connections</h2>
          <p className="text-sm text-muted-foreground">
            Connect your marketplaces to sync and optimize products
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="prep-fox-button flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Store Connection</DialogTitle>
              <DialogDescription>
                Connect a new marketplace or store to sync products
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select value={newConnection.platform} onValueChange={(value) => 
                  setNewConnection(prev => ({ ...prev, platform: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="ebay">eBay</SelectItem>
                    <SelectItem value="etsy">Etsy</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="store_name">Store Name</Label>
                <Input
                  id="store_name"
                  value={newConnection.store_name}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, store_name: e.target.value }))}
                  placeholder="My Store"
                />
              </div>
              <div>
                <Label htmlFor="store_url">Store URL (Optional)</Label>
                <Input
                  id="store_url"
                  value={newConnection.store_url}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, store_url: e.target.value }))}
                  placeholder="https://mystore.com"
                />
              </div>
              <div>
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={newConnection.api_key}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Your API key"
                />
              </div>
              <div>
                <Label htmlFor="api_secret">API Secret (if required)</Label>
                <Input
                  id="api_secret"
                  type="password"
                  value={newConnection.api_secret}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, api_secret: e.target.value }))}
                  placeholder="Your API secret"
                />
              </div>
              <div>
                <Label htmlFor="additional_config">Additional Config (JSON)</Label>
                <Textarea
                  id="additional_config"
                  value={newConnection.additional_config}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, additional_config: e.target.value }))}
                  placeholder='{"shop_domain": "mystore.myshopify.com"}'
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddConnection}>
                  Add Connection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connection Cards */}
      {connections.length === 0 ? (
        <Card className="prep-fox-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No stores connected</h3>
            <p className="text-muted-foreground mb-4">
              Connect your first marketplace to start syncing products
            </p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="prep-fox-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <Card key={connection.id} className="prep-fox-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(connection.connection_status)}
                    <CardTitle className="text-lg capitalize">
                      {connection.platform}
                    </CardTitle>
                  </div>
                  {getStatusBadge(connection.connection_status)}
                </div>
                <CardDescription>{connection.store_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connection.store_url && (
                    <p className="text-sm text-muted-foreground truncate">
                      {connection.store_url}
                    </p>
                  )}
                  {connection.last_sync_at && (
                    <p className="text-xs text-muted-foreground">
                      Last sync: {new Date(connection.last_sync_at).toLocaleDateString()}
                    </p>
                  )}
                  {connection.error_message && (
                    <p className="text-xs text-red-500">
                      Error: {connection.error_message}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestConnection(connection.id)}
                      className="flex-1"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteConnection(connection.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}