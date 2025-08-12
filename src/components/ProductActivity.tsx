import { useState, useEffect } from 'react';
import { useTabPersistence } from "@/hooks/useTabPersistence";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductEditor } from '@/components/ProductEditor';
import { Clock, CheckCircle, ExternalLink, RefreshCw, Package, Edit3, Upload, Zap, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import { getPublicProductUrl, getShopifyAdminProductUrl } from '@/utils/shopify';

interface ProductActivityProps {
  onProductsUpdated: () => void;
  storeUrl?: string;
}

export const ProductActivity = ({ onProductsUpdated, storeUrl }: ProductActivityProps) => {
  const [recentlyModified, setRecentlyModified] = useState<Product[]>([]);
  const [successfullyUploaded, setSuccessfullyUploaded] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { session } = useSessionContext();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useTabPersistence('product-activity', 'recent');

  const fetchActivityData = async () => {
    if (!session?.user?.id) return;

    try {
      setIsLoading(true);

      // Get recently modified products (last 24 hours)
      const { data: recentData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('updated_at', { ascending: false })
        .limit(10);

      // Get successfully uploaded products
      const { data: uploadedData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('shopify_sync_status', 'success')
        .order('shopify_synced_at', { ascending: false })
        .limit(10);

      if (recentData) {
        setRecentlyModified(recentData.map(transformProduct));
      }

      if (uploadedData) {
        setSuccessfullyUploaded(uploadedData.map(transformProduct));
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const transformProduct = (dbProduct: any): Product => ({
    id: dbProduct.id,
    handle: dbProduct.handle,
    title: dbProduct.title,
    vendor: dbProduct.vendor || '',
    type: dbProduct.type || '',
    tags: dbProduct.tags || '',
    category: dbProduct.category || '',
    published: dbProduct.published || false,
    option1Name: dbProduct.option1_name || '',
    option1Value: dbProduct.option1_value || '',
    variantSku: dbProduct.variant_sku || '',
    variantGrams: dbProduct.variant_grams || 0,
    variantInventoryTracker: dbProduct.variant_inventory_tracker || '',
    variantInventoryQty: dbProduct.variant_inventory_qty || 0,
    variantInventoryPolicy: dbProduct.variant_inventory_policy || '',
    variantFulfillmentService: dbProduct.variant_fulfillment_service || '',
    variantPrice: dbProduct.variant_price || 0,
    variantCompareAtPrice: dbProduct.variant_compare_at_price || 0,
    variantRequiresShipping: dbProduct.variant_requires_shipping || true,
    variantTaxable: dbProduct.variant_taxable || true,
    variantBarcode: dbProduct.variant_barcode || '',
    imagePosition: dbProduct.image_position || 0,
    imageSrc: dbProduct.image_src || '',
    bodyHtml: dbProduct.body_html || '',
    seoTitle: dbProduct.seo_title || '',
    seoDescription: dbProduct.seo_description || '',
    googleShoppingCondition: dbProduct.google_shopping_condition || '',
    googleShoppingGender: dbProduct.google_shopping_gender || '',
    googleShoppingAgeGroup: dbProduct.google_shopping_age_group || '',
    updatedAt: dbProduct.updated_at,
    shopifySyncStatus: dbProduct.shopify_sync_status,
    shopifySyncedAt: dbProduct.shopify_synced_at
  });

  const getProductUrl = (handle: string) => {
    return storeUrl ? getPublicProductUrl(storeUrl, handle) : null;
  };

  const getShopifyAdminUrl = (handle: string) => {
    return storeUrl ? getShopifyAdminProductUrl(storeUrl, handle) : null;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSelectAll = (products: Product[]) => {
    const productIds = products.map(p => p.id);
    if (productIds.every(id => selectedProducts.has(id))) {
      // Deselect all
      const newSelection = new Set(selectedProducts);
      productIds.forEach(id => newSelection.delete(id));
      setSelectedProducts(newSelection);
    } else {
      // Select all
      const newSelection = new Set(selectedProducts);
      productIds.forEach(id => newSelection.add(id));
      setSelectedProducts(newSelection);
    }
  };

  const handleEditSelected = () => {
    const selectedProductIds = Array.from(selectedProducts);
    if (selectedProductIds.length === 1) {
      const product = [...recentlyModified, ...successfullyUploaded].find(p => p.id === selectedProductIds[0]);
      if (product) {
        setEditingProduct(product);
      }
    } else {
      toast({
        title: "Select One Product",
        description: "Please select exactly one product to edit.",
        variant: "destructive",
      });
    }
  };

  const handleReuploadSelected = async () => {
    const selectedProductIds = Array.from(selectedProducts);
    if (selectedProductIds.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products to re-upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const productsToUpload = [...recentlyModified, ...successfullyUploaded]
        .filter(p => selectedProductIds.includes(p.id));

      const { data, error } = await supabase.functions.invoke('shopify-products', {
        body: { 
          action: 'update',
          products: productsToUpload.map(p => ({
            handle: p.handle,
            title: p.title,
            description: p.bodyHtml,
            type: p.type,
            tags: p.tags
          }))
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update sync status
      await supabase
        .from('products')
        .update({ 
          shopify_sync_status: 'success',
          shopify_synced_at: new Date().toISOString()
        })
        .in('handle', productsToUpload.map(p => p.handle))
        .eq('user_id', session.user.id);

      toast({
        title: "Upload Successful",
        description: `Successfully re-uploaded ${selectedProductIds.length} products to Shopify.`,
      });

      setSelectedProducts(new Set());
      onProductsUpdated();
      fetchActivityData();
    } catch (error: any) {
      console.error('Re-upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to re-upload products to Shopify.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSelected = async () => {
    const selectedProductIds = Array.from(selectedProducts);
    if (selectedProductIds.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products to delete.",
        variant: "destructive",
      });
      return;
    }

    // Check if any selected products are not pending
    const selectedPendingProducts = recentlyModified.filter(p => 
      selectedProductIds.includes(p.id) && 
      (!p.shopifySyncStatus || p.shopifySyncStatus === 'pending')
    );

    if (selectedPendingProducts.length === 0) {
      toast({
        title: "No Pending Products Selected",
        description: "Only pending products can be deleted.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPendingProducts.length !== selectedProductIds.length) {
      toast({
        title: "Mixed Selection",
        description: "Some selected products cannot be deleted. Only pending products will be removed.",
      });
    }

    setIsDeleting(true);
    try {
      const productHandles = selectedPendingProducts.map(p => p.handle);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .in('handle', productHandles)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Products Deleted",
        description: `Successfully deleted ${selectedPendingProducts.length} pending products.`,
      });

      setSelectedProducts(new Set());
      onProductsUpdated();
      fetchActivityData();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete products.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };


  useEffect(() => {
    fetchActivityData();
  }, [session?.user?.id]);

  if (!session?.user?.id) return null;

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Product Activity</CardTitle>
              <CardDescription>
                Track recent changes and Shopify uploads
              </CardDescription>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActivityData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recently Modified
            </TabsTrigger>
            <TabsTrigger value="uploaded" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Uploaded to Shopify
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-3 mt-4">
            {recentlyModified.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={recentlyModified.length > 0 && recentlyModified.every(p => selectedProducts.has(p.id))}
                    onCheckedChange={() => handleSelectAll(recentlyModified)}
                  />
                  <span className="text-sm font-medium">
                    Select All ({selectedProducts.size} selected)
                  </span>
                </div>
                {selectedProducts.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditSelected}
                      disabled={selectedProducts.size !== 1}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReuploadSelected}
                      disabled={isUploading}
                      className="bg-gradient-primary"
                    >
                      {isUploading ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3 mr-1" />
                      )}
                      Re-upload
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      Delete Pending
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {recentlyModified.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent modifications in the last 24 hours
              </p>
            ) : (
              recentlyModified.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                  {product.imageSrc && (
                    <div className="w-10 h-10 rounded overflow-hidden bg-secondary flex-shrink-0">
                      <img 
                        src={product.imageSrc} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{product.vendor}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(product.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getShopifyAdminUrl(product.handle) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getShopifyAdminUrl(product.handle)!, '_blank')}
                        title="Edit product in Shopify"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {product.shopifySyncStatus || 'pending'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="uploaded" className="space-y-3 mt-4">
            {successfullyUploaded.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={successfullyUploaded.length > 0 && successfullyUploaded.every(p => selectedProducts.has(p.id))}
                    onCheckedChange={() => handleSelectAll(successfullyUploaded)}
                  />
                  <span className="text-sm font-medium">
                    Select All ({selectedProducts.size} selected)
                  </span>
                </div>
                {selectedProducts.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditSelected}
                      disabled={selectedProducts.size !== 1}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReuploadSelected}
                      disabled={isUploading}
                      className="bg-gradient-primary"
                    >
                      {isUploading ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3 mr-1" />
                      )}
                      Re-upload
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {successfullyUploaded.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No products uploaded to Shopify yet
              </p>
            ) : (
              successfullyUploaded.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => handleSelectProduct(product.id)}
                  />
                  {product.imageSrc && (
                    <div className="w-10 h-10 rounded overflow-hidden bg-secondary flex-shrink-0">
                      <img 
                        src={product.imageSrc} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{product.vendor}</span>
                      <span>•</span>
                      <span>
                        {product.shopifySyncedAt ? formatTimeAgo(product.shopifySyncedAt) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getShopifyAdminUrl(product.handle) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getShopifyAdminUrl(product.handle)!, '_blank')}
                        title="Edit product in Shopify"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Product Editor Modal */}
      {editingProduct && (
        <ProductEditor
          product={editingProduct}
          isOpen={Boolean(editingProduct)}
          onClose={() => {
            setEditingProduct(null);
            setSelectedProducts(new Set());
          }}
          onProductUpdated={() => {
            onProductsUpdated();
            fetchActivityData();
          }}
        />
      )}
    </Card>
  );
};