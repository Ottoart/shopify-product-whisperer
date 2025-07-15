import { useState, useEffect } from "react";
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
import { TableColumnResizer } from './TableColumnResizer';
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
  CreditCard
} from "lucide-react";

type OrderCategory = {
  id: string;
  name: string;
  count: number;
  isExpanded: boolean;
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [filterDateRange, setFilterDateRange] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const { orders: ordersData, loading, error, fetchOrders } = useOrders();
  const { toast } = useToast();
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncData, setSyncData] = useState<any>(null);
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(false);
  const [storeConfigs, setStoreConfigs] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("awaiting");
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [editableOrder, setEditableOrder] = useState<Order | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedProductHandle, setSelectedProductHandle] = useState('');
  const [selectedProductTitle, setSelectedProductTitle] = useState('');
  
  const [categories, setCategories] = useState<OrderCategory[]>([
    { id: "awaiting_payment", name: "Awaiting Payment", count: 1, isExpanded: false },
    { id: "on_hold", name: "On Hold", count: 0, isExpanded: false },
    { id: "awaiting", name: "Awaiting Shipment", count: 15, isExpanded: true },
    { id: "manual", name: "Manual Orders", count: 0, isExpanded: false },
    { id: "rejected", name: "Rejected Fulfillment", count: 0, isExpanded: false },
    { id: "shipped", name: "Shipped", count: 8, isExpanded: false },
    { id: "delivered", name: "Delivered", count: 25, isExpanded: false },
    { id: "cancelled", name: "Cancelled", count: 2, isExpanded: false },
  ]);

  useEffect(() => {
    setOrders(ordersData);
  }, [ordersData]);

  useEffect(() => {
    fetchStoreConfigs();
  }, []);

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
        aValue = a.shippingDetails.serviceType || 'Standard';
        bValue = b.shippingDetails.serviceType || 'Standard';
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
    
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
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
    setEditableOrder(order);
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-muted/30 border-r p-4 overflow-y-auto">
        <div className="space-y-2">
          <h2 className="font-semibold text-lg mb-4">Orders</h2>
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  onClick={() => {
                    setActiveCategory(category.id);
                    setCategories(prev => prev.map(cat => 
                      cat.id === category.id 
                        ? { ...cat, isExpanded: !cat.isExpanded }
                        : cat
                    ));
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                    activeCategory === category.id 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted"
                  }`}
                >
                  <span>{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                    {category.isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t">
          <h3 className="font-medium text-sm mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Printer className="h-4 w-4 mr-2" />
              Print Labels
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Orders
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Orders
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Actions */}
        <div className="border-b p-4">
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
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {storeConfigs.map((store) => (
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

        {/* Orders Table */}
        <div className="flex-1 overflow-auto">
          <TableColumnResizer tableSelector=".orders-table" />
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const age = getAge(order.orderDate);
                return (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => handleSelectOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="link"
                          size="sm"
                          className="font-mono text-blue-600 p-0 h-auto"
                          onClick={() => handleOrderClick(order)}
                        >
                          {order.orderNumber}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6"
                          title="View in store"
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
                          onClick={() => {
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
                        {order.shippingDetails?.serviceType || "Standard"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

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
        </div>
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
    </div>
  );
}