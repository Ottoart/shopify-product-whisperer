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
  XCircle,
  Plus,
  Settings
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { ProductImportExportDialog } from "@/components/admin/ProductImportExportDialog";

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
  cost?: number;
  markup_percentage?: number;
  last_scraped_at?: string;
}

interface SyncSchedule {
  id: string;
  name: string;
  suppliers: string[];
  collections: string[];
  frequency: string;
  time_of_day?: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  auto_approve?: boolean;
  markup_percentage?: number;
}

interface BulkEditData {
  price_adjustment?: number;
  price_adjustment_type?: 'percentage' | 'fixed';
  markup_percentage?: number;
  category?: string;
  status?: string;
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
  const [scrapingProgress, setScrapingProgress] = useState<any>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<BulkEditData>({});
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSchedules();
  }, []);

  const fetchProducts = async () => {
    try {
      // Mock empty products since ProductWhisper tables were removed
      setProducts([]);
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
      // For now, we'll create mock schedules since the table might not be fully synced
      const mockSchedules: SyncSchedule[] = [
        {
          id: '1',
          name: 'Daily Staples Sync',
          suppliers: ['staples'],
          collections: ['office-supplies', 'technology'],
          frequency: 'daily',
          time_of_day: '09:00',
          is_active: true,
          last_run_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          auto_approve: false,
          markup_percentage: 25
        }
      ];
      setSchedules(mockSchedules);
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
      // Mock update since ProductWhisper tables were removed
      toast({
        title: "ProductWhisper System Removed",
        description: "Product management functionality has been removed from this application.",
        variant: "destructive",
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

  const handleBulkEdit = async () => {
    try {
      // Mock update since ProductWhisper tables were removed
      toast({
        title: "ProductWhisper System Removed",
        description: "Product management functionality has been removed from this application.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('Error bulk editing products:', error);
      toast({
        title: "Bulk Edit Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const createSchedule = async (scheduleData: Partial<SyncSchedule>) => {
    const newSchedule: SyncSchedule = {
      id: Date.now().toString(),
      name: scheduleData.name || 'New Schedule',
      suppliers: scheduleData.suppliers || [],
      collections: scheduleData.collections || [],
      frequency: scheduleData.frequency || 'daily',
      time_of_day: scheduleData.time_of_day || '09:00',
      is_active: true,
      next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      auto_approve: scheduleData.auto_approve || false,
      markup_percentage: scheduleData.markup_percentage || 20
    };
    
    setSchedules([...schedules, newSchedule]);
    setShowScheduleDialog(false);
    
    toast({
      title: "Schedule Created",
      description: "Sync schedule has been created successfully",
    });
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
            Phase 2: Enhanced admin interface with automation and bulk operations
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
          
          {products.length === 0 && (
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  const { data, error } = await supabase.functions.invoke('seed-sample-products');
                  if (error) throw error;
                  await fetchProducts();
                  toast({
                    title: "Sample Products Added",
                    description: "10 sample products have been added to get you started"
                  });
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                  });
                }
              }}
            >
              <Package className="h-4 w-4 mr-2" />
              Add Sample Products
            </Button>
          )}
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
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowExportDialog(true)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowImportDialog(true)}
                  >
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
                  <Button size="sm" variant="outline" onClick={() => setShowBulkEdit(true)}>
                    Bulk Edit
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
                    <TableHead>Markup</TableHead>
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
                        <div className="text-sm font-medium">
                          {product.markup_percentage ? `${product.markup_percentage}%` : 'N/A'}
                        </div>
                        {product.cost && (
                          <div className="text-xs text-muted-foreground">
                            Cost: ${product.cost.toFixed(2)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(product.updated_at).toLocaleDateString()}
                        </div>
                        {product.last_scraped_at && (
                          <div className="text-xs text-muted-foreground">
                            Scraped: {new Date(product.last_scraped_at).toLocaleDateString()}
                          </div>
                        )}
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

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sync Schedules</CardTitle>
                  <CardDescription>
                    Automated product synchronization from suppliers
                  </CardDescription>
                </div>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Suppliers</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Auto Approve</TableHead>
                    <TableHead>Markup</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {schedule.suppliers.map(supplier => (
                            <Badge key={supplier} variant="outline" className="text-xs">
                              {supplier.toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {schedule.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.auto_approve ? 'default' : 'secondary'}>
                          {schedule.auto_approve ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{schedule.markup_percentage}%</span>
                      </TableCell>
                      <TableCell>
                        {schedule.last_run_at ? new Date(schedule.last_run_at).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        {schedule.next_run_at ? new Date(schedule.next_run_at).toLocaleDateString() : 'Not scheduled'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                          {schedule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {schedules.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No sync schedules configured. Create one to automate product updates.
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
                <div className="text-2xl font-bold">2/5</div>
                <p className="text-xs text-muted-foreground">
                  Phase 2: Enhanced Interface Complete
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Price Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Under $10</span>
                    <span>{products.filter(p => p.price < 10).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>$10 - $50</span>
                    <span>{products.filter(p => p.price >= 10 && p.price < 50).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>$50 - $100</span>
                    <span>{products.filter(p => p.price >= 50 && p.price < 100).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Over $100</span>
                    <span>{products.filter(p => p.price >= 100).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active</span>
                    <span>{products.filter(p => p.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Draft</span>
                    <span>{products.filter(p => p.status === 'draft').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discontinued</span>
                    <span>{products.filter(p => p.status === 'discontinued').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Management</CardTitle>
              <CardDescription>
                Configure supplier settings, markup rules, and collection mappings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suppliers.map(supplier => {
                  const supplierProducts = products.filter(p => p.supplier === supplier);
                  const avgPrice = supplierProducts.length > 0 
                    ? supplierProducts.reduce((sum, p) => sum + p.price, 0) / supplierProducts.length 
                    : 0;
                  
                  return (
                    <Card key={supplier}>
                      <CardHeader>
                        <CardTitle className="text-lg">{supplier.toUpperCase()}</CardTitle>
                        <CardDescription>
                          {supplierProducts.length} products
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Products:</span>
                              <div className="font-medium">{supplierProducts.length}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Avg Price:</span>
                              <div className="font-medium">${avgPrice.toFixed(2)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Active:</span>
                              <div className="font-medium">
                                {supplierProducts.filter(p => p.status === 'active').length}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Last Sync:</span>
                              <div className="font-medium">Today</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Default Markup %</Label>
                            <Input type="number" placeholder="25" defaultValue="25" />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Auto-approve new products</Label>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" id={`auto-${supplier}`} />
                              <label htmlFor={`auto-${supplier}`} className="text-sm">
                                Automatically activate scraped products
                              </label>
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm" className="w-full">
                            Configure Collections
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bulk Edit Dialog */}
      {showBulkEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Bulk Edit Products</CardTitle>
              <CardDescription>
                Edit {selectedProducts.length} selected products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Price Adjustment</Label>
                <div className="flex gap-2">
                  <Select value={bulkEditData.price_adjustment_type} onValueChange={(value: 'percentage' | 'fixed') => setBulkEditData({...bulkEditData, price_adjustment_type: value})}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder={bulkEditData.price_adjustment_type === 'percentage' ? '10' : '5.00'}
                    value={bulkEditData.price_adjustment || ''}
                    onChange={(e) => setBulkEditData({...bulkEditData, price_adjustment: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Markup Percentage</Label>
                <Input 
                  type="number" 
                  placeholder="25"
                  value={bulkEditData.markup_percentage || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, markup_percentage: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Input 
                  placeholder="Office Supplies"
                  value={bulkEditData.category || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, category: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={bulkEditData.status} onValueChange={(value) => setBulkEditData({...bulkEditData, status: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={handleBulkEdit} className="flex-1">
                  Apply Changes
                </Button>
                <Button variant="outline" onClick={() => setShowBulkEdit(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Sync Schedule</CardTitle>
              <CardDescription>
                Set up automated product synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Schedule Name</Label>
                <Input placeholder="Daily Staples Sync" />
              </div>
              
              <div className="space-y-2">
                <Label>Suppliers</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staples">Staples</SelectItem>
                    <SelectItem value="uline">Uline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Default Markup %</Label>
                <Input type="number" placeholder="25" />
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-approve" />
                <Label htmlFor="auto-approve">Auto-approve new products</Label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={() => createSchedule({
                  name: 'New Schedule',
                  suppliers: ['staples'],
                  collections: [],
                  frequency: 'daily',
                  markup_percentage: 25,
                  auto_approve: false
                })} className="flex-1">
                  Create Schedule
                </Button>
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import/Export Dialogs */}
      <ProductImportExportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
      
      <ProductImportExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
      />
    </div>
  );
}