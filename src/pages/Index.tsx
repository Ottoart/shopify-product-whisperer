import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQueryClient } from '@tanstack/react-query';
import { Auth } from '@/components/Auth';
import { ProductList } from '@/components/ProductList';
import { QueueManager } from '@/components/QueueManager';
import { ProductTypeGenerator } from '@/components/ProductTypeGenerator';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import { useProducts } from '@/hooks/useProducts';
import { useEditTracking } from '@/hooks/useEditTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, LogOut, Store, Zap, BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  type: string;
  tags: string;
  category?: string;
  published: boolean;
  option1Name: string;
  option1Value: string;
  variantSku: string;
  variantGrams: number;
  variantInventoryTracker: string;
  variantInventoryQty: number;
  variantInventoryPolicy: string;
  variantFulfillmentService: string;
  variantPrice: number;
  variantCompareAtPrice: number;
  variantRequiresShipping: boolean;
  variantTaxable: boolean;
  variantBarcode: string;
  imagePosition: number;
  imageSrc: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  googleShoppingCondition: string;
  googleShoppingGender: string;
  googleShoppingAgeGroup: string;
  updatedAt: string;
  shopifySyncStatus?: string;
  shopifySyncedAt?: string;
}

export interface UpdatedProduct {
  title: string;
  type: string;
  description: string;
  tags: string;
  category?: string;
  vendor?: string;
  seoTitle?: string;
  seoDescription?: string;
  published?: boolean;
  variantPrice?: number;
  variantCompareAtPrice?: number;
  variantSku?: string;
  variantBarcode?: string;
  variantGrams?: number;
  variantInventoryQty?: number;
  variantInventoryPolicy?: string;
  variantRequiresShipping?: boolean;
  variantTaxable?: boolean;
  googleShoppingCondition?: string;
  googleShoppingGender?: string;
  googleShoppingAgeGroup?: string;
}

interface StoreConfig {
  platform: string;
  store_name: string;
  domain: string;
  is_active: boolean;
}

const Index = () => {
  const { session } = useSessionContext();
  const { products, saveProducts, updateProduct, isSaving, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [queueItems, setQueueItems] = useState<Array<{ productId: string; status: 'pending' | 'processing' | 'completed' | 'error'; error?: string }>>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [stores, setStores] = useState<StoreConfig[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [syncingStores, setSyncingStores] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { trackProductUpdate } = useEditTracking({ 
    onProductUpdate: (productId: string, updatedData: UpdatedProduct) => {
      updateProduct({ handle: productId, updatedData });
    }
  });

  // Fetch active stores
  useEffect(() => {
    const fetchStores = async () => {
      if (!session?.user?.id) return;
      
      const { data, error } = await supabase
        .from('store_configurations')
        .select('platform, store_name, domain, is_active')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('store_name');
      
      if (!error && data) {
        setStores(data);
        if (data.length > 0 && !activeTab) {
          setActiveTab(data[0].store_name);
        }
      }
    };
    
    fetchStores();
  }, [session?.user?.id, activeTab]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  const addToQueue = (productIds: string[]) => {
    const newItems = productIds
      .filter(id => !queueItems.some(item => item.productId === id)) // Prevent duplicates
      .map(id => ({
        productId: id,
        status: 'pending' as const
      }));
    
    if (newItems.length > 0) {
      setQueueItems(prev => [...prev, ...newItems]);
    }
  };

  const updateQueueItemStatus = (productId: string, status: 'pending' | 'processing' | 'completed' | 'error', error?: string) => {
    setQueueItems(prev => 
      prev.map(item => 
        item.productId === productId 
          ? { ...item, status, error } 
          : item
      )
    );
  };

  const handleUpdateProduct = (productId: string, updatedData: UpdatedProduct) => {
    const originalProduct = products.find(p => p.id === productId);
    if (originalProduct) {
      trackProductUpdate(productId, originalProduct, updatedData, 'ai_suggestion');
    }
  };

  const removeFromQueue = (productId: string) => {
    setQueueItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleProductsUpdated = () => {
    // Invalidate and refetch products data without page reload
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  // Filter products by active store
  const getFilteredProducts = (storeName: string) => {
    return products.filter(product => {
      const store = stores.find(s => s.store_name === storeName);
      if (!store) return false;
      
      // Filter based on store platform/domain
      if (store.platform === 'shopify') {
        return product.vendor?.toLowerCase().includes(store.store_name.toLowerCase()) ||
               product.tags?.toLowerCase().includes(store.store_name.toLowerCase());
      } else if (store.platform === 'walmart') {
        return product.vendor?.toLowerCase().includes('walmart') ||
               product.tags?.toLowerCase().includes('walmart');
      } else if (store.platform === 'ebay') {
        return product.vendor?.toLowerCase().includes('ebay') ||
               product.tags?.toLowerCase().includes('ebay');
      }
      return false;
    });
  };

  // Handle manual sync for a specific store
  const handleStoreSync = async (store: StoreConfig, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setSyncingStores(prev => new Set(prev).add(store.store_name));
    
    try {
      let syncFunction = '';
      let message = '';
      
      if (store.platform === 'shopify') {
        syncFunction = 'sync-shopify-products';
        message = `Syncing products from ${store.store_name}...`;
      } else if (store.platform === 'ebay') {
        syncFunction = 'sync-ebay-products';
        message = `Syncing products from eBay store...`;
      } else {
        throw new Error(`Sync not supported for ${store.platform}`);
      }
      
      toast({
        title: "Sync Started",
        description: message,
      });
      
      const { data, error } = await supabase.functions.invoke(syncFunction);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: "Sync Successful",
        description: data.message || `Successfully synced products from ${store.store_name}`,
      });
      
      // Refresh products
      handleProductsUpdated();
      
    } catch (error: any) {
      console.error('Store sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || `Failed to sync products from ${store.store_name}`,
        variant: "destructive",
      });
    } finally {
      setSyncingStores(prev => {
        const newSet = new Set(prev);
        newSet.delete(store.store_name);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary-foreground">
              <Package className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Shopify Product Manager</h1>
                <p className="text-primary-foreground/80">AI-powered batch product optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-primary-foreground">
              <span className="text-sm opacity-80">{session.user?.email}</span>
              <Link to="/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  PrepFox Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner for Setup Guidance */}
        <WelcomeBanner />

        {/* Welcome Section for New Users - only show when not loading and no products and no stores */}
        {!isLoading && products.length === 0 && stores.length === 0 && (
          <Card className="shadow-card border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <Store className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Welcome to PrepFox</CardTitle>
              <CardDescription>
                AI-powered product management for your Shopify store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Use the sidebar to navigate to Shopify Integration and configure your store, then import products to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-card border-0">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground">Loading your products...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store Tabs - only show when we have stores */}
        {!isLoading && stores.length > 0 && (
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary-foreground" />
                </div>
                Product Management by Store
              </CardTitle>
              <CardDescription>
                Manage products across all your connected stores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(stores.length, 4)}, 1fr)` }}>
                  {stores.map((store, index) => (
                    <TabsTrigger 
                      key={`${store.platform}-${store.store_name}-${index}`} 
                      value={store.store_name}
                      className="flex items-center justify-between gap-2 px-4 py-2 relative group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Store className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{store.store_name}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex-shrink-0">
                          {getFilteredProducts(store.store_name).length}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleStoreSync(store, e)}
                        disabled={syncingStores.has(store.store_name)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20 flex-shrink-0"
                        title={`Sync ${store.store_name} products`}
                      >
                        <RefreshCw className={`h-3 w-3 ${syncingStores.has(store.store_name) ? 'animate-spin' : ''}`} />
                      </Button>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {stores.map((store) => {
                  const storeProducts = getFilteredProducts(store.store_name);
                  return (
                    <TabsContent key={store.store_name} value={store.store_name} className="space-y-6">
                      {/* Store Header */}
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <Store className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{store.store_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {store.platform.charAt(0).toUpperCase() + store.platform.slice(1)} • {store.domain}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{storeProducts.length} Products</p>
                          <p className="text-sm text-muted-foreground">Active products</p>
                        </div>
                      </div>

                      {storeProducts.length > 0 ? (
                        <div className="space-y-6">
                          {/* Products List */}
                          <Card className="border-0">
                            <CardContent className="p-0">
                              <ProductList
                                products={storeProducts}
                                selectedProducts={selectedProducts}
                                onSelectionChange={setSelectedProducts}
                                onAddToQueue={addToQueue}
                                onProductsUpdated={handleProductsUpdated}
                                onProductUpdated={handleUpdateProduct}
                                storeUrl={store.domain}
                              />
                            </CardContent>
                          </Card>

                          {/* Product Type Generator */}
                          <ProductTypeGenerator
                            products={storeProducts}
                            selectedProducts={selectedProducts}
                            onProductsUpdated={handleProductsUpdated}
                          />

                          {/* Processing Queue */}
                          <Card className="shadow-card border-0">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-gradient-success flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-accent-foreground" />
                                  </div>
                                  <div>
                                    <CardTitle>Processing Queue</CardTitle>
                                    <CardDescription>
                                      Track AI optimization progress for {store.store_name}
                                    </CardDescription>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Label htmlFor="bulk-mode" className="text-sm font-medium">
                                      Bulk Mode
                                    </Label>
                                    <Switch
                                      id="bulk-mode"
                                      checked={bulkMode}
                                      onCheckedChange={setBulkMode}
                                    />
                                    {bulkMode && (
                                      <AlertTriangle className="h-4 w-4 text-destructive" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0">
                              <QueueManager
                                queueItems={queueItems}
                                products={storeProducts}
                                onUpdateStatus={updateQueueItemStatus}
                                onUpdateProduct={handleUpdateProduct}
                                onRemoveFromQueue={removeFromQueue}
                                bulkMode={bulkMode}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      ) : (
                        <Card className="border-0">
                          <CardContent className="p-8">
                            <div className="text-center space-y-4">
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <h3 className="font-semibold">No products found</h3>
                                <p className="text-sm text-muted-foreground">
                                  No products found for {store.store_name}. Import products from your store to get started.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;