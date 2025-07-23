import { useState, useEffect } from "react";
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
  tags?: string;
  shopify_product_id?: string;
  shopify_synced_at?: string;
  shopify_sync_status?: string;
  published_at?: string;
  template_suffix?: string;
  published_scope?: string;
  admin_graphql_api_id?: string;
  category?: string;
  google_shopping_age_group?: string;
  google_shopping_condition?: string;
  google_shopping_gender?: string;
  google_shopping_product_category?: string;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showComparison, setShowComparison] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user) {
      Promise.all([fetchStores(), fetchProducts()]).finally(() => {
        setInitialLoad(false);
      });
    } else if (session === null) {
      // Session is definitely null (not loading)
      setInitialLoad(false);
    }
  }, [session]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('store_configurations')
        .select('*')
        .eq('user_id', session?.user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async (storeId?: string) => {
    try {
      setSyncLoading(true);
      
      if (storeId) {
        // Sync specific store
        const store = stores.find(s => s.id === storeId);
        if (store && store.platform === 'shopify') {
          // Parse access token if it's JSON
          let accessToken = store.access_token;
          try {
            const parsed = JSON.parse(accessToken);
            accessToken = parsed.access_token || parsed.accessToken || accessToken;
          } catch {
            // If parsing fails, use as-is (likely already a string)
          }

          const { error } = await supabase.functions.invoke('sync-shopify-products', {
            body: { 
              storeUrl: store.domain,
              accessToken: accessToken 
            }
          });
          if (error) throw error;
        }
      } else {
        // Sync all Shopify stores
        const shopifyStores = stores.filter(s => s.platform === 'shopify');
        for (const store of shopifyStores) {
          // Parse access token if it's JSON
          let accessToken = store.access_token;
          try {
            const parsed = JSON.parse(accessToken);
            accessToken = parsed.access_token || parsed.accessToken || accessToken;
          } catch {
            // If parsing fails, use as-is (likely already a string)
          }

          const { error } = await supabase.functions.invoke('sync-shopify-products', {
            body: { 
              storeUrl: store.domain,
              accessToken: accessToken 
            }
          });
          if (error) {
            console.error(`Sync failed for store ${store.store_name}:`, error);
          }
        }
      }

      toast({
        title: "Sync started",
        description: "Product sync is running in the background",
      });

      // Refresh products after a short delay
      setTimeout(() => {
        fetchProducts();
      }, 2000);
    } catch (error) {
      console.error('Error syncing products:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync products from store",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

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

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         (product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStore = selectedStore === "all" || product.store_platform === selectedStore;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;
    
    return matchesSearch && matchesStore && matchesStatus;
  });

  // Show loading only during initial page load
  if (initialLoad || !session) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-muted rounded animate-pulse" />
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
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage and optimize your product listings across all stores
          </p>
        </div>
        
        <div className="flex gap-2">
          {stores.length > 0 && (
            <Button 
              onClick={() => syncProducts()} 
              disabled={syncLoading}
              variant="outline"
            >
              <Sync className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
              Sync All Stores
            </Button>
          )}
          <ConnectStoreButton 
            onStoreConnected={fetchStores}
            variant="default"
          />
        </div>
      </div>

      {/* No stores connected state */}
      {stores.length === 0 && (
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

      {/* Products with Advanced Filtering */}
      {stores.length > 0 && (
        <>
          {products.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Sync your store to import products</p>
                <Button 
                  onClick={() => syncProducts()}
                  disabled={syncLoading}
                >
                  <Sync className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                  Sync Products
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ProductList
              products={products.map(p => ({
                id: p.id,
                title: p.title || '',
                handle: p.handle,
                type: p.product_type || '',
                vendor: p.vendor || '',
                category: p.category || '',
                tags: p.tags || '',
                published: p.status === 'active',
                option1Name: 'Title',
                option1Value: 'Default Title',
                variantSku: p.sku || '',
                variantGrams: 0,
                variantInventoryTracker: 'shopify',
                variantInventoryQty: p.inventory_quantity || 0,
                variantInventoryPolicy: 'deny',
                variantFulfillmentService: 'manual',
                variantPrice: p.price || 0,
                variantCompareAtPrice: 0,
                variantRequiresShipping: true,
                variantTaxable: true,
                variantBarcode: '',
                imagePosition: 1,
                imageSrc: p.images?.[0] || '',
                bodyHtml: p.body_html || '',
                seoTitle: p.title || '',
                seoDescription: '',
                googleShoppingCondition: p.google_shopping_condition || 'new',
                googleShoppingGender: p.google_shopping_gender || 'unisex',
                googleShoppingAgeGroup: p.google_shopping_age_group || 'adult',
                updatedAt: p.updated_at || '',
                shopifySyncStatus: p.shopify_sync_status,
                shopifySyncedAt: p.shopify_synced_at
              }))}
              selectedProducts={selectedProducts}
              onSelectionChange={setSelectedProducts}
              onAddToQueue={(productIds) => {
                toast({
                  title: "Products added to queue",
                  description: `${productIds.length} products added to optimization queue`,
                });
              }}
              onProductsUpdated={fetchProducts}
              onProductUpdated={(productId, updatedData) => {
                toast({
                  title: "Product updated",
                  description: "Product has been successfully updated",
                });
                fetchProducts();
              }}
              storeUrl={stores.find(s => s.platform === 'shopify')?.domain || ''}
            />
          )}
        </>
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