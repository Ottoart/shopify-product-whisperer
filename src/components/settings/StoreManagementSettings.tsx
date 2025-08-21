import { useState } from 'react';
import { useStores } from '@/contexts/StoreContext';
import { StoreConnectionFlow } from '@/components/store-connection/StoreConnectionFlow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Store, Settings, TestTube, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function StoreManagementSettings() {
  const { stores, loading, refreshStores } = useStores();
  const [showConnectionFlow, setShowConnectionFlow] = useState(false);

  const handleDisconnectStore = async (storeId: string, storeName: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_configurations')
        .update({ is_active: false })
        .eq('id', storeId);

      if (error) throw error;

      toast.success(`Disconnected ${storeName}`);
      refreshStores();
    } catch (error) {
      toast.error('Failed to disconnect store');
      console.error('Error disconnecting store:', error);
    }
  };

  const handleTestConnection = async (store: any) => {
    if (store.platform !== 'shopify') {
      toast.info('Connection testing is currently only available for Shopify stores');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('test-shopify-connection', {
        body: { storeId: store.id }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Connection to ${store.store_name} is working!`);
      } else {
        toast.error(`Connection failed: ${data.error}`);
      }
    } catch (error) {
      toast.error('Failed to test connection');
      console.error('Error testing connection:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'shopify':
        return '🛍️';
      case 'ebay':
        return '🏪';
      case 'amazon':
        return '📦';
      default:
        return '🏬';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'shopify':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ebay':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'amazon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Connected Stores</h3>
          <p className="text-sm text-muted-foreground">
            Manage your connected marketplaces and stores
          </p>
        </div>
        <Button onClick={() => setShowConnectionFlow(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Connect Store
        </Button>
      </div>

      {stores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No stores connected</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Connect your first store to start syncing products and managing orders across platforms.
            </p>
            <Button onClick={() => setShowConnectionFlow(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Connect Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getPlatformIcon(store.platform)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.store_name || 'Unnamed Store'}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={getPlatformColor(store.platform)}
                        >
                          {store.platform.charAt(0).toUpperCase() + store.platform.slice(1)}
                        </Badge>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Connected
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(store)}
                      className="gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnectStore(store.id, store.store_name)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Disconnect
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {store.domain && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Store URL:</span>
                      <a 
                        href={store.domain.startsWith('http') ? store.domain : `https://${store.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {store.domain}
                      </a>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>Last sync: Recently</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4" />
                      <span>Auto-sync enabled</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StoreConnectionFlow
        open={showConnectionFlow}
        onOpenChange={setShowConnectionFlow}
        onSuccess={() => {
          refreshStores();
          setShowConnectionFlow(false);
        }}
      />
    </div>
  );
}