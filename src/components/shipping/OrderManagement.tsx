import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SyncProgressDialog } from './SyncProgressDialog';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useOrders, type Order } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { ProductDetailsDialog } from './ProductDetailsDialog';
import { ShippingDetailsDialog } from './ShippingDetailsDialog';


import { 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Edit2,
  Printer,
  Download,
  Store,
  RefreshCw,
  Zap,
  MoreHorizontal,
  Tag,
  Users,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ExternalLink,
  StickyNote,
  Weight,
  CreditCard,
  Grid3X3
} from "lucide-react";
import { ShippedProductsView } from './ShippedProductsView';
import { LabelPurchaseDialog } from './LabelPurchaseDialog';
import { TableColumnResizer } from './TableColumnResizer';

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("awaiting"); // Default to awaiting
  const [viewMode, setViewMode] = useState<'orders' | 'products'>('orders');
  const [filterStore, setFilterStore] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL parameters
  useEffect(() => {
    const storeParam = searchParams.get('store');
    const statusParam = searchParams.get('status');
    
    if (storeParam) {
      setFilterStore(decodeURIComponent(storeParam));
    }
    if (statusParam) {
      setFilterStatus(statusParam);
      // Auto-switch to products view for shipped orders
      if (statusParam === 'shipped') {
        setViewMode('products');
      } else {
        setViewMode('orders');
      }
    }
  }, [searchParams]);
  const { orders: ordersData, loading, error, fetchOrders } = useOrders();
  const { toast } = useToast();
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncData, setSyncData] = useState<any>(null);
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(false);
  const [storeConfigs, setStoreConfigs] = useState<any[]>([]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [editableOrder, setEditableOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProductHandle, setSelectedProductHandle] = useState('');
  const [selectedProductTitle, setSelectedProductTitle] = useState('');
  const [showShippingDialog, setShowShippingDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLabelPurchaseDialog, setShowLabelPurchaseDialog] = useState(false);
  const [selectedOrderForLabelPurchase, setSelectedOrderForLabelPurchase] = useState<Order | null>(null);
  
  const handleRefreshOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // First sync from external stores
      console.log('🔄 Syncing orders from external stores...');
      const { data, error } = await supabase.functions.invoke('sync-orders', {
        body: { syncAll: true }
      });
      
      if (error) {
        console.error('❌ Sync error:', error);
        throw error;
      }
      
      console.log('✅ Sync successful:', data);
      
      // Then fetch updated orders from local database
      await fetchOrders();
      setLastRefresh(new Date());
      
      const message = data?.success && data?.message 
        ? data.message 
        : "Orders refreshed successfully";
        
      toast({
        title: "Orders refreshed",
        description: message,
      });
    } catch (error: any) {
      console.error('❌ Refresh failed:', error);
      toast({
        title: "Refresh failed",
        description: error.message || "Failed to refresh order data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrders, toast]);

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshOrders();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [handleRefreshOrders]);

  // Initial fetch on component mount - run only once
  useEffect(() => {
    handleRefreshOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter orders when data changes
  useEffect(() => {
    // Filter to only show orders that are awaiting shipment from active stores
    const filteredData = ordersData.filter(order => {
      // Only orders that are pending shipment (exclude shipped, delivered, cancelled, refunded)
      const isAwaitingShipment = ['awaiting', 'awaiting_payment', 'pending', 'processing', 'ready_to_ship'].includes(order.status);
      // Only from active stores
      const isFromActiveStore = storeConfigs.some(store => store.store_name === order.storeName && store.is_active);
      
      // Debug logging for eBay orders
      if (order.storePlatform === 'ebay') {
        console.log(`eBay Order ${order.orderNumber}: status=${order.status}, isAwaitingShipment=${isAwaitingShipment}, isFromActiveStore=${isFromActiveStore}, store=${order.storeName}, orderDate=${order.orderDate}`);
        
        // Log store config match details
        const matchingStore = storeConfigs.find(store => store.store_name === order.storeName);
        if (matchingStore) {
          console.log(`  Matching store found: ${matchingStore.store_name}, active: ${matchingStore.is_active}, platform: ${matchingStore.platform}`);
        } else {
          console.log(`  No matching store found for: ${order.storeName}. Available stores:`, storeConfigs.map(s => s.store_name));
        }
      }
      
      return isAwaitingShipment && isFromActiveStore;
    });
    setOrders(filteredData);
  }, [ordersData, storeConfigs]);

  // Fetch store configs on mount
  useEffect(() => {
    fetchStoreConfigs();
  }, []);

  const handleStoreUpdate = async (storeId: string) => {
    setIsRefreshing(true);
    try {
      // Call store-specific sync function
      const { data, error } = await supabase.functions.invoke('sync-orders', {
        body: { storeId }
      });
      
      if (error) {
        console.error('❌ Store sync error:', error);
        throw error;
      }
      
      console.log('✅ Store sync successful:', data);
      
      // Refresh orders after sync
      await fetchOrders();
      
      const message = data?.success && data?.message 
        ? data.message 
        : `Successfully synced orders for store`;
        
      toast({
        title: "Store updated",
        description: message,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update store orders",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateAllStores = async () => {
    setIsRefreshing(true);
    try {
      // Call sync for all stores
      const { data, error } = await supabase.functions.invoke('sync-orders', {
        body: { syncAll: true }
      });
      
      if (error) throw error;
      
      // Refresh orders after sync
      await fetchOrders();
      
      toast({
        title: "All stores updated",
        description: "Successfully synced orders for all stores",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update all stores",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchStoreConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('store_configurations')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setStoreConfigs(data || []);
    } catch (error) {
      console.error('Error fetching store configs:', error);
    }
  };

  const getAge = (orderDate: string) => {
    const now = new Date();
    const order = new Date(orderDate);
    const diffTime = Math.abs(now.getTime() - order.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return { text: "1 day", color: "green" };
    if (diffDays <= 3) return { text: `${diffDays} days`, color: "green" };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: "yellow" };
    return { text: `${diffDays} days`, color: "red" };
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const formatWeight = (weight: number) => {
    return `${weight.toFixed(2)} lbs`;
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ChevronDown className="h-3 w-3 opacity-50" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-3 w-3" /> : 
      <ChevronDown className="h-3 w-3" />;
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'orderNumber':
        aValue = a.orderNumber;
        bValue = b.orderNumber;
        break;
      case 'itemSku':
        aValue = a.items[0]?.sku || '';
        bValue = b.items[0]?.sku || '';
        break;
      case 'itemName':
        aValue = a.items[0]?.productTitle || '';
        bValue = b.items[0]?.productTitle || '';
        break;
      case 'quantity':
        aValue = a.items.reduce((sum, item) => sum + item.quantity, 0);
        bValue = b.items.reduce((sum, item) => sum + item.quantity, 0);
        break;
      case 'recipient':
        aValue = a.customerName;
        bValue = b.customerName;
        break;
      case 'totalAmount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'weight':
        aValue = a.packageDetails.weight || 0;
        bValue = b.packageDetails.weight || 0;
        break;
      case 'orderDate':
        aValue = new Date(a.orderDate).getTime();
        bValue = new Date(b.orderDate).getTime();
        break;
      case 'state':
        aValue = a.shippingAddress.state;
        bValue = b.shippingAddress.state;
        break;
      case 'requestedService':
        aValue = a.shippingDetails.requestedService || 'Standard';
        bValue = b.shippingDetails.requestedService || 'Standard';
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase();
    if (typeof bValue === 'string') bValue = bValue.toLowerCase();
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredOrders = sortedOrders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    
    // For status filtering, only allow pending shipment statuses
    const allowedStatuses = ['awaiting', 'awaiting_payment', 'pending', 'processing', 'ready_to_ship'];
    const matchesStatus = filterStatus === "all" || (allowedStatuses.includes(order.status) && order.status === filterStatus);
    const matchesStore = filterStore === "all" || order.storeName === filterStore;
    
    return matchesSearch && matchesStatus && matchesStore;
  });

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowShippingDialog(true);
  };

  const handleContinueBackground = () => {
    setBackgroundSync(true);
    setShowSyncDialog(false);
  };

  const getItemSummary = (items: any[]) => {
    if (items.length === 1) return items[0].productTitle;
    return `(${items.length} Items)`;
  };

  const getTotalQuantity = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleProductClick = (productHandle: string, productTitle: string) => {
    setSelectedProductHandle(productHandle);
    setSelectedProductTitle(productTitle);
    setShowProductDialog(true);
  };

  const handlePurchaseLabel = (order: Order) => {
    setSelectedOrderForLabelPurchase(order);
    setShowLabelPurchaseDialog(true);
  };

  const handleLabelPurchased = () => {
    // Refresh orders to update status
    fetchOrders();
    // Close the dialog after a short delay
    setTimeout(() => {
      setShowLabelPurchaseDialog(false);
      setSelectedOrderForLabelPurchase(null);
    }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Actions */}
        <div className="border-b p-4">
          {/* Store Update Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">
                {filterStatus === 'shipped' && viewMode === 'products' 
                  ? 'Shipped & In-Transit Products' 
                  : 'Awaiting Shipment Orders'
                }
              </h2>
              <Badge variant="secondary" className="text-sm">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </Badge>
              {filterStatus === 'shipped' && (
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant={viewMode === 'orders' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('orders')}
                    className="h-8 px-3"
                  >
                    <Package className="h-4 w-4 mr-1" />
                    Orders
                  </Button>
                  <Button
                    variant={viewMode === 'products' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('products')}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Products
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshOrders}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh All
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Update Store Orders
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleUpdateAllStores} disabled={isRefreshing}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Update All Stores
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {storeConfigs.map((store) => (
                    <DropdownMenuItem 
                      key={store.id} 
                      onClick={() => handleStoreUpdate(store.id)}
                      disabled={isRefreshing}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      Update {store.store_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="awaiting">Awaiting</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Active Stores</SelectItem>
                {storeConfigs.filter(store => store.is_active).map((store) => (
                  <SelectItem key={store.id} value={store.store_name}>
                    {store.store_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Order Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="older">Older than 30 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              Saved Filters
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm">
                Group By
              </Button>
              <Button variant="outline" size="sm">
                Columns
              </Button>
            </div>
          </div>
        </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {filterStatus === 'shipped' && viewMode === 'products' ? (
          <div className="p-6">
            <ShippedProductsView />
          </div>
        ) : (
          <>
            <div className="relative">
              <Table className="orders-table">
                <TableHeader className="sticky top-0 bg-background">
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedOrders(filteredOrders.map(o => o.id));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                    />
                  </TableHead>
                   <TableHead className="min-w-32">
                     <button 
                       className="flex items-center gap-1 hover:text-foreground/80" 
                       onClick={() => handleSort('orderNumber')}
                     >
                       Order # {getSortIcon('orderNumber')}
                     </button>
                   </TableHead>
                    <TableHead className="w-24">
                      <button 
                        className="flex items-center gap-1 hover:text-foreground/80" 
                        onClick={() => handleSort('itemSku')}
                      >
                        Item SKU {getSortIcon('itemSku')}
                      </button>
                    </TableHead>
                    <TableHead className="min-w-48">
                      <button 
                        className="flex items-center gap-1 hover:text-foreground/80" 
                        onClick={() => handleSort('itemName')}
                      >
                        Item Name {getSortIcon('itemName')}
                      </button>
                    </TableHead>
                    <TableHead className="w-20">
                      <button 
                        className="flex items-center gap-1 hover:text-foreground/80" 
                        onClick={() => handleSort('quantity')}
                      >
                        Quantity {getSortIcon('quantity')}
                      </button>
                    </TableHead>
                   <TableHead className="min-w-40">
                     <button 
                       className="flex items-center gap-1 hover:text-foreground/80" 
                       onClick={() => handleSort('recipient')}
                     >
                       Recipient {getSortIcon('recipient')}
                     </button>
                   </TableHead>
                   <TableHead className="w-20">Age</TableHead>
                   <TableHead className="w-24">
                     <button 
                       className="flex items-center gap-1 hover:text-foreground/80" 
                       onClick={() => handleSort('totalAmount')}
                     >
                       Order Total {getSortIcon('totalAmount')}
                     </button>
                   </TableHead>
                   <TableHead className="w-24">
                     <button 
                       className="flex items-center gap-1 hover:text-foreground/80" 
                       onClick={() => handleSort('weight')}
                     >
                       Weight {getSortIcon('weight')}
                     </button>
                   </TableHead>
                   <TableHead className="w-16">Notes</TableHead>
                   <TableHead className="w-24">
                     <button 
                       className="flex items-center gap-1 hover:text-foreground/80" 
                       onClick={() => handleSort('orderDate')}
                     >
                       Order Date {getSortIcon('orderDate')}
                     </button>
                   </TableHead>
                   <TableHead className="w-16">
                     <button 
                       className="flex items-center gap-1 hover:text-foreground/80" 
                       onClick={() => handleSort('state')}
                     >
                       State {getSortIcon('state')}
                     </button>
                   </TableHead>
                     <TableHead className="w-32">
                       <button 
                         className="flex items-center gap-1 hover:text-foreground/80" 
                         onClick={() => handleSort('requestedService')}
                       >
                         Requested Service {getSortIcon('requestedService')}
                       </button>
                     </TableHead>
                     <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const age = getAge(order.orderDate);
                  return (
                     <TableRow 
                       key={order.id} 
                       className="hover:bg-muted/30 cursor-pointer"
                       onClick={() => handleOrderClick(order)}
                     >
                       <TableCell onClick={(e) => e.stopPropagation()}>
                         <Checkbox
                           checked={selectedOrders.includes(order.id)}
                           onCheckedChange={() => handleSelectOrder(order.id)}
                         />
                       </TableCell>
                       <TableCell>
                         <div className="flex items-center gap-2">
                           <span className="font-mono text-blue-600 font-medium">
                             {order.orderNumber}
                           </span>
                           <Button
                             variant="ghost"
                             size="sm"
                             className="p-1 h-6 w-6"
                             title="View in store"
                             onClick={(e) => e.stopPropagation()}
                           >
                             <ExternalLink className="h-3 w-3" />
                           </Button>
                         </div>
                       </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.items.length === 1 
                            ? order.items[0].sku || "No SKU"
                            : (
                              <div title={order.items.map(i => i.sku || "No SKU").join(", ")}>
                                ({order.items.length} Items)
                              </div>
                            )
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded border flex-shrink-0 overflow-hidden">
                            {order.items[0]?.imageSrc ? (
                              <img 
                                src={order.items[0].imageSrc} 
                                alt={order.items[0].productTitle}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-400">No Image</span>
                              </div>
                            )}
                          </div>
                           <div 
                             className={`text-sm ${
                               order.items.length === 1 && order.items[0].productHandle 
                                 ? 'cursor-pointer hover:text-primary hover:underline text-blue-600' 
                                 : ''
                             }`}
                             onClick={(e) => {
                               e.stopPropagation();
                               if (order.items.length === 1 && order.items[0].productHandle) {
                                 console.log('Clicking product:', order.items[0].productHandle, order.items[0].productTitle);
                                 handleProductClick(order.items[0].productHandle, order.items[0].productTitle);
                               }
                             }}
                           >
                            {getItemSummary(order.items)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-center">
                          {getTotalQuantity(order.items)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{age.text}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(order.totalAmount, order.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatWeight(order.packageDetails?.weight || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.notes && (
                          <div className="flex items-center justify-center">
                            <div title={order.notes}>
                              <StickyNote className="h-4 w-4 text-blue-500" />
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(order.orderDate).toLocaleDateString('en-US', { 
                            month: '2-digit', 
                            day: '2-digit', 
                            year: 'numeric' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.shippingAddress.state}
                        </div>
                      </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.shippingDetails?.requestedService || "Not Set"}
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePurchaseLabel(order)}
                              className="flex items-center gap-1"
                            >
                              <Truck className="h-3 w-3" />
                              Ship Label
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOrderClick(order)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit Order
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Package className="h-4 w-4 mr-2" />
                                  Mark as Shipped
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              </Table>
              <TableColumnResizer tableSelector=".orders-table" />
            </div>

            {filteredOrders.length === 0 && (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || filterStore !== "all" || filterStatus !== "all" 
                    ? "Try adjusting your filters or search terms."
                    : "No orders available. Sync with your connected stores to see orders."
                  }
                </p>
                {orders.length === 0 && (
                  <Button onClick={fetchOrders}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Orders
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <SyncProgressDialog 
        open={showSyncDialog}
        onOpenChange={setShowSyncDialog}
        onContinueBackground={handleContinueBackground}
        syncData={syncData}
        isCompleted={syncCompleted}
        isError={syncError}
      />

      <ProductDetailsDialog
        isOpen={showProductDialog}
        onClose={() => setShowProductDialog(false)}
        productHandle={selectedProductHandle}
        productTitle={selectedProductTitle}
      />

      <ShippingDetailsDialog
        isOpen={showShippingDialog}
        onClose={() => setShowShippingDialog(false)}
        order={selectedOrder}
        onUpdateOrder={(orderId, updates) => {
          // Update the order in the orders list
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId ? { ...order, ...updates } : order
            )
          );
        }}
      />

      <LabelPurchaseDialog
        open={showLabelPurchaseDialog}
        onOpenChange={setShowLabelPurchaseDialog}
        order={selectedOrderForLabelPurchase}
        onLabelPurchased={handleLabelPurchased}
      />
    </div>
  );
}