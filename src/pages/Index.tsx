import { useState, useEffect } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useQueryClient } from '@tanstack/react-query';
import { Auth } from '@/components/Auth';
import { ProductList } from '@/components/ProductList';
import { QueueManager } from '@/components/QueueManager';
import { ProductTypeGenerator } from '@/components/ProductTypeGenerator';
import { useProducts } from '@/hooks/useProducts';
import { useEditTracking } from '@/hooks/useEditTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, LogOut, Store, Zap, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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

const Index = () => {
  const { session } = useSessionContext();
  const { products, saveProducts, updateProduct, isSaving, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [queueItems, setQueueItems] = useState<Array<{ productId: string; status: 'pending' | 'processing' | 'completed' | 'error'; error?: string }>>([]);

  const { trackProductUpdate } = useEditTracking({ 
    onProductUpdate: (productId: string, updatedData: UpdatedProduct) => {
      updateProduct({ handle: productId, updatedData });
    }
  });


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
        {/* Welcome Section for New Users */}
        {products.length === 0 && (
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

        {/* Main Content */}
        {products.length > 0 && (
          <div className="space-y-6">
            {/* Products List */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>Products ({products.length})</CardTitle>
                      <CardDescription>
                        Select products to optimize with AI
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
                <CardContent className="p-0">
                  <ProductList
                    products={products}
                    selectedProducts={selectedProducts}
                    onSelectionChange={setSelectedProducts}
                    onAddToQueue={addToQueue}
                    onProductsUpdated={handleProductsUpdated}
                    onProductUpdated={handleUpdateProduct}
                    storeUrl=""
                  />
                </CardContent>
            </Card>

            {/* Product Type Generator */}
            <ProductTypeGenerator
              products={products}
              selectedProducts={selectedProducts}
              onProductsUpdated={handleProductsUpdated}
            />

            {/* Processing Queue */}
            <Card className="shadow-card border-0">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-success flex items-center justify-center">
                    <Zap className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <CardTitle>Processing Queue</CardTitle>
                    <CardDescription>
                      Track AI optimization progress
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <QueueManager
                  queueItems={queueItems}
                  products={products}
                  onUpdateStatus={updateQueueItemStatus}
                  onUpdateProduct={handleUpdateProduct}
                  onRemoveFromQueue={removeFromQueue}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;