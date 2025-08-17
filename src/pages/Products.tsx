import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  RotateCcw as Sync, 
  Store, 
  ExternalLink,
  Zap,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ConnectStoreButton } from "@/components/ConnectStoreButton";
import { ProductComparison } from "@/components/ProductComparison";
import { ProductList } from "@/components/ProductList";
import { QueueManager } from "@/components/QueueManager";
import { SyncProgressDialog } from "@/components/SyncProgressDialog";
import { StoreSync } from "@/components/StoreSync";
import { SyncStatusDisplay } from "@/components/SyncStatusDisplay";
import { StoreSpecificSyncProgress } from "@/components/StoreSpecificSyncProgress";

import { useStores } from "@/contexts/StoreContext";
import { useShopifyCredentials } from "@/hooks/useShopifyCredentials";
import { useSearchParams } from "react-router-dom";

interface Product {
  id: string;
  title?: string;
  handle: string;
  description?: string;
  price?: number;
  images?: string[];
  status?: string;
  inventory_quantity?: number;
  sku?: string;
  store_platform?: string;
  last_synced?: string;
  ai_optimized?: boolean;
  // Additional database fields
  body_html?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  vendor?: string;
  product_type?: string;
  type?: string;
  tags?: string;
  shopify_product_id?: string;
  shopify_synced_at?: string;
  shopify_sync_status?: string;
  published_at?: string;
  published?: boolean;
  template_suffix?: string;
  published_scope?: string;
  admin_graphql_api_id?: string;
  category?: string;
  google_shopping_age_group?: string;
  google_shopping_condition?: string;
  google_shopping_gender?: string;
  google_shopping_product_category?: string;
  // Database snake_case fields
  option1_name?: string;
  option1_value?: string;
  variant_sku?: string;
  variant_grams?: number;
  variant_inventory_tracker?: string;
  variant_inventory_qty?: number;
  variant_inventory_policy?: string;
  variant_fulfillment_service?: string;
  variant_price?: number;
  variant_compare_at_price?: number;
  variant_requires_shipping?: boolean;
  variant_taxable?: boolean;
  variant_barcode?: string;
  image_position?: number;
  image_src?: string;
  seo_title?: string;
  seo_description?: string;
  listing_status?: string;
  store_name?: string;
  store_id?: string;
}

interface QueueItem {
  productId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface StoreConfig {
  id: string;
  store_name: string;
  platform: string;
  domain: string;
  is_active: boolean;
  access_token: string;
}

export default function Products() {
  const session = useSession();
  const { toast } = useToast();
  const { stores } = useStores();
  const { storeUrl, store: currentStore } = useShopifyCredentials();
  const [searchParams] = useSearchParams();
  const storeParam = searchParams.get('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showComparison, setShowComparison] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  // Queue management state
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    console.log('🔄 Products useEffect triggered:', { sessionExists: !!session?.user, sessionIsNull: session === null });
    if (session?.user) {
      fetchProducts().finally(() => {
        setInitialLoad(false);
      });
    } else if (session === null) {
      // Session is definitely null (not loading)
      setInitialLoad(false);
    }
  }, [session]);

  // Log when products state changes
  useEffect(() => {
    console.log('📦 Products state changed:', { 
      totalProducts: products.length, 
      firstFewProducts: products.slice(0, 3).map(p => ({ title: p.title, store_name: p.store_name })),
      storeParam 
    });
  }, [products, storeParam]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting fetchProducts for user:', session?.user?.id);
      
      let allProducts: any[] = [];
      let hasMore = true;
      let page = 0;
      const pageSize = 1000;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', session?.user?.id)
          .order('updated_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          allProducts = [...allProducts, ...data];
          console.log(`📄 Fetched page ${page + 1}: ${data.length} products. Total so far: ${allProducts.length}`);
          
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      console.log('✅ Total products fetched:', allProducts.length);
      console.log('📊 Store distribution:', {
        uniqueStoreNames: [...new Set(allProducts.map(p => p.store_name).filter(Boolean))],
        storeNameCounts: allProducts.reduce((acc, p) => {
          const storeName = p.store_name || 'Unknown';
          acc[storeName] = (acc[storeName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      setProducts(allProducts || []);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('✅ fetchProducts completed');
    }
  }, [session?.user?.id, toast]);


  const optimizeWithAI = async (productId: string) => {
    try {
      // Find the product in our current list
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Prepare product data for AI optimization
      const productData = {
        title: product.title || '',
        type: product.product_type || '',
        description: product.body_html || '',
        tags: product.tags || '',
        vendor: product.vendor || '',
        variant_price: product.price || 0,
        variant_compare_at_price: 0,
        variant_sku: product.sku || '',
        variant_barcode: '',
        variant_grams: 0,
      };

      toast({
        title: "AI Optimization starting",
        description: "Generating optimized version...",
      });

      const { data, error } = await supabase.functions.invoke('ai-optimize-product', {
        body: { 
          productHandle: product.handle,
          productData,
          useDirectAI: true
        }
      });

      if (error) throw error;

      if (data?.success && data?.optimizedData) {
        // Transform the AI response to match ProductComparison expected format
        const optimizedData = {
          title: data.optimizedData.title || product.title || '',
          description: data.optimizedData.description || product.body_html || '',
          tags: data.optimizedData.tags || product.tags || '',
          type: data.optimizedData.type || product.product_type || '',
          category: data.optimizedData.category || product.category || '',
          vendor: data.optimizedData.vendor || product.vendor || '',
          seo_title: data.optimizedData.seo_title || '',
          seo_description: data.optimizedData.seo_description || '',
          published: data.optimizedData.published || true,
          variant_price: data.optimizedData.variant_price || product.price || 0,
          variant_compare_at_price: data.optimizedData.variant_compare_at_price || 0,
          variant_sku: data.optimizedData.variant_sku || product.sku || '',
          variant_barcode: data.optimizedData.variant_barcode || '',
          variant_grams: data.optimizedData.variant_grams || 0,
          variant_inventory_qty: data.optimizedData.variant_inventory_qty || product.inventory_quantity || 0,
          variant_inventory_policy: data.optimizedData.variant_inventory_policy || 'deny',
          variant_requires_shipping: data.optimizedData.variant_requires_shipping || true,
          variant_taxable: data.optimizedData.variant_taxable || true,
          google_shopping_condition: data.optimizedData.google_shopping_condition || product.google_shopping_condition || 'new',
          google_shopping_gender: data.optimizedData.google_shopping_gender || product.google_shopping_gender || 'unisex',
          google_shopping_age_group: data.optimizedData.google_shopping_age_group || product.google_shopping_age_group || 'adult',
        };

        // Set up the comparison dialog
        setSelectedProduct(product);
        setOptimizedData(optimizedData);
        setShowComparison(true);
      } else {
        throw new Error('No optimized data received');
      }
    } catch (error) {
      console.error('Error optimizing product:', error);
      toast({
        title: "Optimization failed",
        description: "Failed to optimize product with AI",
        variant: "destructive",
      });
    }
  };

  // Queue management functions
  const addToQueue = (productIds: string[]) => {
    const newItems = productIds.map(id => ({
      productId: id,
      status: 'pending' as const
    }));
    setQueueItems(prev => [...prev, ...newItems]);
    setShowQueue(true); // Show queue when items are added
    console.log('Adding to queue:', productIds);
  };

  const updateQueueItemStatus = (productId: string, status: 'pending' | 'processing' | 'completed' | 'error', error?: string) => {
    setQueueItems(prev => prev.map(item => 
      item.productId === productId ? { ...item, status, error } : item
    ));
  };

  const removeFromQueue = (productId: string) => {
    setQueueItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleUpdateProduct = (productId: string, updatedData: any) => {
    // Refresh the products list after updates
    fetchProducts();
  };

  // Memoized filtering with proper dependencies and enhanced debugging
  const filteredProducts = useMemo(() => {
    console.log('🎯 Computing filteredProducts with dependencies:', {
      productsLength: products.length,
      storeParam,
      searchTerm,
      selectedStore,
      selectedStatus,
      loading,
      hasProducts: products.length > 0
    });

    // Don't filter if still loading or no products
    if (loading || products.length === 0) {
      console.log('⏳ Skipping filtering - still loading or no products');
      return [];
    }

    const filtered = products.filter(product => {
      // Validate product has required fields for debugging
      if (!product.store_name && !product.vendor) {
        console.warn('⚠️ Product missing store_name and vendor:', { title: product.title, id: product.id });
      }

      const matchesSearch = searchTerm === '' || 
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.handle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Enhanced store matching with debugging
      let matchesStore = false;
      if (storeParam) {
        // When viewing a specific store (?store=...), filter by store_name
        matchesStore = product.store_name?.toLowerCase() === storeParam.toLowerCase();
        
        // Debug specific product matches
        if (product.store_name?.toLowerCase() === storeParam.toLowerCase()) {
          console.log('✅ Product matches store filter:', { 
            title: product.title, 
            store_name: product.store_name, 
            storeParam 
          });
        }
      } else {
        matchesStore = selectedStore === "all" || product.vendor === selectedStore;
      }
      
      const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
      
      return matchesSearch && matchesStore && matchesStatus;
    });

    console.log('🔍 Filtering Results:', {
      storeParam,
      totalProducts: products.length,
      filteredCount: filtered.length,
      matchingStoreNames: products
        .filter(p => p.store_name?.toLowerCase() === storeParam?.toLowerCase())
        .slice(0, 5)
        .map(p => ({ title: p.title, store_name: p.store_name })),
      allUniqueStoreNames: [...new Set(products.map(p => p.store_name).filter(Boolean))]
    });

    return filtered;
  }, [products, storeParam, searchTerm, selectedStore, selectedStatus, loading]);

  // Log filtered products changes
  useEffect(() => {
    console.log('📊 Filtered products updated:', {
      count: filteredProducts.length,
      firstThree: filteredProducts.slice(0, 3).map(p => ({ title: p.title, store_name: p.store_name }))
    });
  }, [filteredProducts]);

  // Show consistent loading for both users
  if (initialLoad) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
              <div className="h-4 bg-muted rounded w-96 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
              <div className="h-10 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {storeParam && currentStore ? `${currentStore.store_name} Products` : 'Products'}
            {queueItems.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {queueItems.filter(item => item.status === 'pending').length} in queue
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            {storeParam && currentStore 
              ? `Manage and optimize products from ${currentStore.store_name}`
              : 'Manage and optimize your product listings across all stores'
            }
            {products.length > 0 && (
              <span className="block mt-1 text-sm font-medium">
                {storeParam 
                  ? `Showing ${filteredProducts.length} products from ${currentStore?.store_name || storeParam}`
                  : `Showing ${filteredProducts.length} of ${products.length} products`
                }
                {!storeParam && stores.map(store => {
                  // Count products by store_name or vendor name
                  const storeProducts = products.filter(p => 
                    p.store_name === store.store_name || p.vendor === store.store_name
                  );
                  return storeProducts.length > 0 ? (
                    <span key={store.id} className="block text-xs text-muted-foreground/70">
                      {store.store_name}: {storeProducts.length} products
                    </span>
                  ) : null;
                })}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          {stores.length > 0 && (
            <StoreSync onSyncComplete={fetchProducts} />
          )}
          <ConnectStoreButton 
            variant="default"
          />
        </div>
      </div>

      {/* No stores connected state */}
      {stores.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No stores connected</h3>
            <p className="text-muted-foreground mb-6">
              Connect your first store to start managing products
            </p>
            <ConnectStoreButton />
          </CardContent>
        </Card>
      )}

      {/* Sync Status Display */}
      {stores.length > 0 && !storeParam && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Sync Status</h2>
          <SyncStatusDisplay />
        </div>
      )}
      
      {/* Store-specific sync status only when viewing specific store */}
      {storeParam && currentStore && (
        <StoreSpecificSyncProgress 
          storeName={currentStore.store_name} 
          platform={currentStore.platform} 
        />
      )}

      {/* Cleanup Component */}
      


      {/* Products with Advanced Filtering */}
      {stores.length > 0 && !loading && (
        <>
          {products.length === 0 && !loading ? (
            <Card className="text-center py-12">
              <CardContent>
                <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Sync your store to import products</p>
                <StoreSync onSyncComplete={fetchProducts} />
              </CardContent>
            </Card>
          ) : (
            <ProductList
              products={products.map(p => ({
                id: p.handle,
                title: p.title || '',
                handle: p.handle,
                type: p.type || '',
                vendor: p.vendor || '',
                category: p.category || '',
                tags: p.tags || '',
                published: p.published || false,
                option1Name: p.option1_name || '',
                option1Value: p.option1_value || '',
                variantSku: p.variant_sku || '',
                variantGrams: p.variant_grams || 0,
                variantInventoryTracker: p.variant_inventory_tracker || '',
                variantInventoryQty: p.variant_inventory_qty || 0,
                variantInventoryPolicy: p.variant_inventory_policy || '',
                variantFulfillmentService: p.variant_fulfillment_service || '',
                variantPrice: p.variant_price || 0,
                variantCompareAtPrice: p.variant_compare_at_price || 0,
                variantRequiresShipping: p.variant_requires_shipping || true,
                variantTaxable: p.variant_taxable || true,
                variantBarcode: p.variant_barcode || '',
                imagePosition: p.image_position || 0,
                imageSrc: p.image_src || '',
                bodyHtml: p.body_html || '',
                seoTitle: p.seo_title || '',
                seoDescription: p.seo_description || '',
                googleShoppingCondition: p.google_shopping_condition || 'new',
                googleShoppingGender: p.google_shopping_gender || 'unisex',
                googleShoppingAgeGroup: p.google_shopping_age_group || 'adult',
                updatedAt: p.updated_at || '',
                shopifySyncStatus: p.shopify_sync_status,
                shopifySyncedAt: p.shopify_synced_at,
                listingStatus: p.listing_status
              }))}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
              onAddToQueue={addToQueue}
              onProductsUpdated={fetchProducts}
              onProductUpdated={(productId, updatedData) => {
                toast({
                  title: "Product updated",
                  description: "Product has been successfully updated",
                });
                fetchProducts();
              }}
              storeUrl={storeUrl || ''}
            />
          )}
        </>
      )}

      {/* AI Optimization Queue */}
      {queueItems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Optimization Queue
                <Badge variant="outline" className="ml-2">
                  {queueItems.filter(item => item.status === 'pending').length} pending
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQueue(!showQueue)}
              >
                {showQueue ? 'Hide' : 'Show'} Queue
                <Eye className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          {showQueue && (
            <CardContent>
              <QueueManager
                queueItems={queueItems}
                products={products.map(p => ({
                  id: p.handle,
                  title: p.title || '',
                  handle: p.handle,
                  type: p.type || '',
                  vendor: p.vendor || '',
                  category: p.category || '',
                  tags: p.tags || '',
                  published: p.published || false,
                  option1Name: p.option1_name || '',
                  option1Value: p.option1_value || '',
                  variantSku: p.variant_sku || '',
                  variantGrams: p.variant_grams || 0,
                  variantInventoryTracker: p.variant_inventory_tracker || '',
                  variantInventoryQty: p.variant_inventory_qty || 0,
                  variantInventoryPolicy: p.variant_inventory_policy || '',
                  variantFulfillmentService: p.variant_fulfillment_service || '',
                  variantPrice: p.variant_price || 0,
                  variantCompareAtPrice: p.variant_compare_at_price || 0,
                  variantRequiresShipping: p.variant_requires_shipping || true,
                  variantTaxable: p.variant_taxable || true,
                  variantBarcode: p.variant_barcode || '',
                  imagePosition: p.image_position || 0,
                  imageSrc: p.image_src || '',
                  bodyHtml: p.body_html || '',
                  seoTitle: p.seo_title || '',
                  seoDescription: p.seo_description || '',
                  googleShoppingCondition: p.google_shopping_condition || 'new',
                  googleShoppingGender: p.google_shopping_gender || 'unisex',
                  googleShoppingAgeGroup: p.google_shopping_age_group || 'adult',
                  updatedAt: p.updated_at || '',
                  shopifySyncStatus: p.shopify_sync_status,
                  shopifySyncedAt: p.shopify_synced_at,
                  listingStatus: p.listing_status
                }))}
                onUpdateStatus={updateQueueItemStatus}
                onUpdateProduct={handleUpdateProduct}
                onRemoveFromQueue={removeFromQueue}
                bulkMode={false}
              />
            </CardContent>
          )}
        </Card>
      )}

      {/* AI Optimization Comparison Dialog */}
      {selectedProduct && optimizedData && (
        <ProductComparison
          isOpen={showComparison}
          onClose={() => {
            setShowComparison(false);
            setSelectedProduct(null);
            setOptimizedData(null);
          }}
          originalProduct={{
            id: selectedProduct.id,
            handle: selectedProduct.handle,
            title: selectedProduct.title || '',
            body_html: selectedProduct.body_html || null,
            tags: selectedProduct.tags || null,
            type: selectedProduct.product_type || null,
            category: selectedProduct.category || null,
            vendor: selectedProduct.vendor || null,
            seo_title: null,
            seo_description: null,
            published: null,
            variant_price: selectedProduct.price || null,
            variant_compare_at_price: null,
            variant_sku: selectedProduct.sku || null,
            variant_barcode: null,
            variant_grams: null,
            variant_inventory_qty: selectedProduct.inventory_quantity || null,
            variant_inventory_policy: null,
            variant_requires_shipping: null,
            variant_taxable: null,
            google_shopping_condition: selectedProduct.google_shopping_condition || null,
            google_shopping_gender: selectedProduct.google_shopping_gender || null,
            google_shopping_age_group: selectedProduct.google_shopping_age_group || null,
          }}
          optimizedProduct={optimizedData}
          onSave={() => {
            setShowComparison(false);
            setSelectedProduct(null);
            setOptimizedData(null);
            fetchProducts(); // Refresh the products list
          }}
        />
      )}

    </div>
  );
}