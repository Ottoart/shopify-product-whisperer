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
}

export default function Products() {
  const session = useSession();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    if (session?.user) {
      fetchStores();
      fetchProducts();
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
      
      // Call sync function for specific store or all stores
      const { error } = await supabase.functions.invoke('sync-shopify-products', {
        body: storeId ? { storeId } : {}
      });

      if (error) throw error;

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
      const { error } = await supabase.functions.invoke('ai-optimize-product', {
        body: { productId }
      });

      if (error) throw error;

      toast({
        title: "AI Optimization started",
        description: "Your product is being optimized with AI",
      });

      // Refresh products
      fetchProducts();
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

  if (loading) {
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

      {/* Filters and Search */}
      {stores.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products by title or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.platform}>
                      {store.store_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      {stores.length > 0 && (
        <>
          {filteredProducts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground mb-4">
                  {searchTerm ? (
                    <>
                      <Search className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No products found</h3>
                      <p>Try adjusting your search or filters</p>
                    </>
                  ) : (
                    <>
                      <Plus className="w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No products yet</h3>
                      <p>Sync your store to import products</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => syncProducts()}
                        disabled={syncLoading}
                      >
                        <Sync className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                        Sync Products
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {product.ai_optimized && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500">
                        <Zap className="w-3 h-3 mr-1" />
                        AI Optimized
                      </Badge>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-2">
                        {product.title}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => optimizeWithAI(product.id)}>
                            <Zap className="w-4 h-4 mr-2" />
                            Optimize with AI
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View in Store
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                      <Badge variant="outline">
                        {product.store_platform || 'Unknown'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {product.sku && (
                        <div>SKU: {product.sku}</div>
                      )}
                      {product.price && (
                        <div className="font-semibold text-foreground">
                          ${product.price.toFixed(2)}
                        </div>
                      )}
                      {product.inventory_quantity !== undefined && (
                        <div>Stock: {product.inventory_quantity} units</div>
                      )}
                      {product.last_synced && (
                        <div className="text-xs">
                          Synced: {new Date(product.last_synced).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit3 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => optimizeWithAI(product.id)}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}