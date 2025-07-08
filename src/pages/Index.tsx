import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ProductList } from '@/components/ProductList';
import { QueueManager } from '@/components/QueueManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Upload, Zap } from 'lucide-react';

export interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  type: string;
  tags: string;
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
}

export interface UpdatedProduct {
  title: string;
  type: string;
  description: string;
  tags: string;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [queueItems, setQueueItems] = useState<Array<{ productId: string; status: 'pending' | 'processing' | 'completed' | 'error'; error?: string }>>([]);

  const handleFileUpload = (uploadedProducts: Product[]) => {
    setProducts(uploadedProducts);
    setSelectedProducts(new Set());
    setQueueItems([]);
  };

  const addToQueue = (productIds: string[]) => {
    const newItems = productIds.map(id => ({
      productId: id,
      status: 'pending' as const
    }));
    setQueueItems(prev => [...prev, ...newItems]);
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

  const updateProduct = (productId: string, updatedData: UpdatedProduct) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === productId 
          ? { 
              ...product, 
              title: updatedData.title,
              type: updatedData.type,
              bodyHtml: updatedData.description,
              tags: updatedData.tags
            } 
          : product
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-3 text-primary-foreground">
            <Package className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Shopify Product Manager</h1>
              <p className="text-primary-foreground/80">AI-powered batch product optimization</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Upload Section */}
        {products.length === 0 && (
          <Card className="shadow-card border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl">Upload Your Products</CardTitle>
              <CardDescription>
                Import your Shopify products CSV to get started with AI-powered optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUpload={handleFileUpload} />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products List */}
            <div className="lg:col-span-2">
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
                  />
                </CardContent>
              </Card>
            </div>

            {/* Queue Manager */}
            <div>
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
                    onUpdateProduct={updateProduct}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;