import { useState } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Auth } from '@/components/Auth';
import { useShopifyProductSync } from '@/hooks/useShopifyProductSync';
import { StoreConfig } from '@/components/StoreConfig';
import { ProductListItem } from '@/components/ProductListItem';
import { ProductEditDialog } from '@/components/ProductEditDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  AlertTriangle, 
  BarChart3,
  Home,
  RefreshCw,
  AlertCircle,
  Clock,
  Download,
  Database,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PrepFoxDashboard = () => {
  const { session } = useSessionContext();
  const { 
    localProducts, 
    localProductsCount, 
    syncStatus, 
    statusLoading, 
    productsLoading, 
    isSyncing, 
    syncProgress, 
    startFullSync, 
    syncBatch, 
    hasCredentials, 
    isCompleted, 
    isInProgress, 
    lastSyncAt 
  } = useShopifyProductSync();
  
  const [activeTab, setActiveTab] = useState('products');
  const [storeUrl, setStoreUrl] = useState(() => localStorage.getItem('shopify_domain') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('shopify_access_token') || '');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-products', {
        body: {
          action: 'delete',
          productId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Delete failed');

      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const handleProductUpdated = () => {
    // Products will refresh automatically through the query
  };

  if (!session) {
    return <Auth />;
  }

  // Show loading state
  if (statusLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show setup message if no credentials
  if (!hasCredentials) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-gradient-primary">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary-foreground">
                <BarChart3 className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold">PrepFox Dashboard</h1>
                  <p className="text-primary-foreground/80">Batch sync and manage your Shopify products</p>
                </div>
              </div>
              <Link to="/">
                <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <StoreConfig
            storeUrl={storeUrl}
            onStoreUrlChange={setStoreUrl}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
          />
        </div>
      </div>
    );
  }

  const products = localProducts || [];
  const totalProducts = localProductsCount || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary-foreground">
              <BarChart3 className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">PrepFox Dashboard</h1>
                <p className="text-primary-foreground/80">Batch sync and manage your Shopify products</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                {lastSyncAt && (
                  <p className="text-primary-foreground/80 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last sync: {new Date(lastSyncAt).toLocaleString()}
                  </p>
                )}
              </div>
              <Link to="/">
                <Button variant="outline" className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Sync Status Card */}
        <Card className="mb-8 shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Product Sync Status
            </CardTitle>
            <CardDescription>Sync your Shopify products in batches to manage them locally</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{totalProducts}</p>
                <p className="text-sm text-muted-foreground">Local Products</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {syncStatus?.sync_status === 'completed' ? (
                    <CheckCircle className="h-8 w-8 text-success mx-auto" />
                  ) : (
                    <Clock className="h-8 w-8 text-warning mx-auto" />
                  )}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {syncStatus?.sync_status || 'Not started'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{syncStatus?.total_synced || 0}</p>
                <p className="text-sm text-muted-foreground">Total Synced</p>
              </div>
            </div>

            {isSyncing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Syncing batch {syncProgress.current} of {syncProgress.total}</span>
                  <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
                </div>
                <Progress value={(syncProgress.current / syncProgress.total) * 100} />
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
                  <Download className="h-4 w-4" />
                )}
                {isSyncing ? 'Syncing...' : 'Full Sync'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => syncBatch()}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Sync Next Batch
              </Button>
            </div>

            {!isCompleted && totalProducts === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No products synced yet. Click "Full Sync" to start importing your Shopify products.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Products ({totalProducts})</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="sync">Sync Settings</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Local Product Database</CardTitle>
                <CardDescription>Manage your synced products</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {products.slice(0, 50).map((product) => (
                      <ProductListItem
                        key={product.id}
                        product={product}
                        storeUrl={storeUrl}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        showActions={true}
                      />
                    ))}
                    {products.length > 50 && (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        Showing first 50 of {products.length} products
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No products synced yet</p>
                    <p className="text-sm text-muted-foreground">Use the sync controls above to import your products</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-3xl font-bold">{totalProducts}</p>
                    </div>
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Published</p>
                      <p className="text-3xl font-bold">
                        {products.filter(p => p.published).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unpublished</p>
                      <p className="text-3xl font-bold">
                        {products.filter(p => !p.published).length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sync Settings Tab */}
          <TabsContent value="sync" className="space-y-6">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Sync Configuration</CardTitle>
                <CardDescription>Manage how your products are synced</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Store Configuration</label>
                  <StoreConfig
                    storeUrl={storeUrl}
                    onStoreUrlChange={setStoreUrl}
                    apiKey={apiKey}
                    onApiKeyChange={setApiKey}
                  />
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Sync Information</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Status:</strong> {syncStatus?.sync_status || 'Not started'}</p>
                    <p><strong>Last Sync:</strong> {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never'}</p>
                    <p><strong>Total Synced:</strong> {syncStatus?.total_synced || 0} products</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Product Edit Dialog */}
      <ProductEditDialog
        product={editingProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
};

export default PrepFoxDashboard;