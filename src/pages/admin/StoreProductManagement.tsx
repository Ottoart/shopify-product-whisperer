import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Play, 
  Search, 
  Download, 
  Upload, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface StoreProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  image_url?: string;
  category?: string;
  supplier: string;
  status: string;
  inventory_quantity?: number;
  updated_at: string;
}

export default function StoreProductManagement() {
  const { toast } = useToast();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [scrapingProgress, setScrapingProgress] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('store_products')
        .select('*')
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

  const triggerManualScraping = async (suppliers: string[] = ['staples']) => {
    try {
      setScrapingProgress({ status: 'running', message: 'Starting scraping...' });
      
      const { data, error } = await supabase.functions.invoke('enhanced-scraping-engine', {
        body: { suppliers, maxProducts: 50 }
      });

      if (error) throw error;

      setScrapingProgress({ 
        status: 'completed', 
        message: `Scraping completed: ${data.details?.inserted || 0} new, ${data.details?.updated || 0} updated`
      });

      await fetchProducts();

      toast({
        title: "Scraping Completed",
        description: `Found ${data.details?.totalProductsFound || 0} products.`,
      });

    } catch (error: any) {
      console.error('Error running scraping:', error);
      setScrapingProgress({ status: 'error', message: error.message });
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setScrapingProgress(null), 5000);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const { error } = await supabase
        .from('store_products')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', selectedProducts);

      if (error) throw error;

      await fetchProducts();
      setSelectedProducts([]);
      
      toast({
        title: "Bulk Update Complete",
        description: `Updated ${selectedProducts.length} products to ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating products:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesSupplier = supplierFilter === "all" || product.supplier === supplierFilter;

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const suppliers = [...new Set(products.map(p => p.supplier))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            Store Product Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Phase 1: Enhanced scraping and product management
          </p>
        </div>

        <Button 
          onClick={() => triggerManualScraping()}
          disabled={scrapingProgress?.status === 'running'}
        >
          <Play className="h-4 w-4 mr-2" />
          Run Manual Sync
        </Button>
      </div>

      {scrapingProgress && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {scrapingProgress.status === 'running' && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              )}
              {scrapingProgress.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {scrapingProgress.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
              <span className="font-medium">{scrapingProgress.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Product Catalog</CardTitle>
                  <CardDescription>
                    Manage your store products and inventory
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProducts.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedProducts.length} products selected
                  </span>
                  <Button size="sm" onClick={() => handleBulkStatusUpdate('active')}>
                    Activate
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('draft')}>
                    Draft
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleBulkStatusUpdate('discontinued')}>
                    Discontinue
                  </Button>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts(filteredProducts.map(p => p.id));
                          } else {
                            setSelectedProducts([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([...selectedProducts, product.id]);
                            } else {
                              setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.category || 'Uncategorized'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${product.price.toFixed(2)} {product.currency}</div>
                        {product.compare_at_price && (
                          <div className="text-sm text-muted-foreground line-through">
                            ${product.compare_at_price.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.supplier.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          product.status === 'active' ? 'default' :
                          product.status === 'draft' ? 'secondary' : 'destructive'
                        }>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={(product.inventory_quantity || 0) > 0 ? 'default' : 'destructive'}>
                          {product.inventory_quantity || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(product.updated_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No products found. Try running a manual sync to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all suppliers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{suppliers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Connected integrations
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Phase Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1/5</div>
                <p className="text-xs text-muted-foreground">
                  Phase 1: Foundation Complete
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}