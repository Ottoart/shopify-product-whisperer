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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  currency: string;
  image_url?: string;
  category: string;
  subcategory?: string;
  supplier: string;
  supplier_product_id: string;
  supplier_url?: string;
  status: string;
  visibility: string;
  in_stock: boolean;
  featured: boolean;
  tags: string[];
  specifications: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface SyncSchedule {
  id: string;
  name: string;
  suppliers: string[];
  collections: string[];
  frequency: string;
  time_of_day: string;
  is_active: boolean;
  last_run?: string;
  next_run: string;
  last_result?: any;
  settings: {
    maxProducts?: number;
    priceChangeThreshold?: number;
    autoApprove?: boolean;
    notifications?: boolean;
  };
}

export default function StoreProductManagement() {
  const { toast } = useToast();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [schedules, setSchedules] = useState<SyncSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [newScheduleOpen, setNewScheduleOpen] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    fetchSchedules();
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

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('sync_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
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
        message: `Scraping completed: ${data.details.inserted} new, ${data.details.updated} updated`,
        details: data.details
      });

      // Refresh products
      await fetchProducts();

      toast({
        title: "Scraping Completed",
        description: `Found ${data.details.totalProductsFound} products. ${data.details.inserted} new, ${data.details.updated} updated.`,
      });

    } catch (error) {
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
    } catch (error) {
      console.error('Error updating products:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateSchedule = async (scheduleData: Partial<SyncSchedule>) => {
    try {
      const { error } = await supabase
        .from('sync_schedules')
        .insert({
          ...scheduleData,
          next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
        });

      if (error) throw error;

      await fetchSchedules();
      setNewScheduleOpen(false);
      
      toast({
        title: "Schedule Created",
        description: "Sync schedule has been created successfully",
      });
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Creation Failed",
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
            Manage your store products, automated syncing, and supplier integrations
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => triggerManualScraping()}
            disabled={scrapingProgress?.status === 'running'}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Manual Sync
          </Button>
          
          <Dialog open={newProductOpen} onOpenChange={setNewProductOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Create a new product manually or import from supplier
                </DialogDescription>
              </DialogHeader>
              {/* Add product form would go here */}
            </DialogContent>
          </Dialog>
        </div>
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
          <TabsTrigger value="automation">Automation ({schedules.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                    <SelectItem value="inactive">Inactive</SelectItem>
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
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate('inactive')}>
                    Deactivate
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
                    <TableHead>Actions</TableHead>
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
                            <div className="text-sm text-muted-foreground">{product.category}</div>
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
                          product.status === 'inactive' ? 'secondary' : 'destructive'
                        }>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.in_stock ? 'default' : 'destructive'}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(product.updated_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sync Schedules</CardTitle>
                  <CardDescription>
                    Automated product syncing from suppliers
                  </CardDescription>
                </div>
                <Dialog open={newScheduleOpen} onOpenChange={setNewScheduleOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Schedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Sync Schedule</DialogTitle>
                      <DialogDescription>
                        Set up automated product syncing from suppliers
                      </DialogDescription>
                    </DialogHeader>
                    {/* Schedule creation form would go here */}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{schedule.name}</h3>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                            <span>Suppliers: {schedule.suppliers.join(', ')}</span>
                            <span>Frequency: {schedule.frequency}</span>
                            <span>Next run: {new Date(schedule.next_run).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                            {schedule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Switch checked={schedule.is_active} />
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {products.filter(p => p.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{suppliers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Connected suppliers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Schedules</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedules.length}</div>
                <p className="text-xs text-muted-foreground">
                  {schedules.filter(s => s.is_active).length} active
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
              <CardDescription>
                Configure your store and automation preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-approve scraped products</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically make scraped products visible in the store
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Price change notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when product prices change significantly
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Stock monitoring</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor supplier stock levels and update availability
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}