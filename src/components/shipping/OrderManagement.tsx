import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SyncProgressDialog } from './SyncProgressDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useOrders, type Order } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
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
  Zap
} from "lucide-react";

export function OrderManagement() {
  const { toast } = useToast();
  const { orders, loading, fetchOrders } = useOrders();
  const [searchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState(storeFilter || "all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncData, setSyncData] = useState<any>(null);
  const [syncCompleted, setSyncCompleted] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState(false);

  // Update local filter when URL parameter changes
  useEffect(() => {
    if (storeFilter) {
      setFilterStore(storeFilter);
    }
  }, [storeFilter]);

  const handleSyncOrders = async () => {
    setSyncing(true);
    setShowSyncDialog(true);
    setSyncCompleted(false);
    setSyncError(false);
    setSyncData(null);
    setBackgroundSync(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('sync-orders', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      setSyncData(response.data);
      setSyncCompleted(true);

      // Only refresh orders if not in background mode
      if (!backgroundSync) {
        await fetchOrders();
      }
      
      if (!backgroundSync) {
        toast({
          title: "✅ Sync completed!",
          description: response.data.message || "Orders have been synchronized",
        });
      }
    } catch (error: any) {
      setSyncError(true);
      setSyncData({ error: error.message });
      
      if (!backgroundSync) {
        toast({
          title: "Sync failed",
          description: error.message || "Failed to sync orders",
          variant: "destructive"
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleContinueBackground = () => {
    setBackgroundSync(true);
    toast({
      title: "📱 Sync moved to background",
      description: "We'll notify you when it's complete. Keep working!",
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'awaiting':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300"><Clock className="h-3 w-3 mr-1" />Awaiting Shipment</Badge>;
      case 'shipped':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Shipped</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Package className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getWarningIcons = (order: Order) => {
    const warnings = [];
    
    if (!order.packageDetails.weight) {
      warnings.push(
        <div key="weight" title="Missing weight">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>
      );
    }
    
    if (!order.shippingAddress.validated) {
      warnings.push(
        <div key="address" title="Invalid address">
          <MapPin className="h-4 w-4 text-red-500" />
        </div>
      );
    }
    
    if (!order.shippingDetails.method) {
      warnings.push(
        <div key="shipping" title="No shipping method selected">
          <Truck className="h-4 w-4 text-orange-500" />
        </div>
      );
    }
    
    return warnings;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = filterStore === "all" || order.storeName === filterStore;
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    return matchesSearch && matchesStore && matchesStatus;
  });

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select orders to perform bulk actions.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: `🚀 Bulk processing started!`,
      description: `${action} for ${selectedOrders.length} orders. Sit back and relax.`,
    });

    // Simulate processing
    setTimeout(() => {
      toast({
        title: "✅ Done!",
        description: `${selectedOrders.length} orders updated successfully.`,
      });
      setSelectedOrders([]);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Loading orders...</h3>
            <p className="text-muted-foreground">Fetching your latest orders</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {storeFilter ? `${storeFilter} Orders` : "Order Management"}
              </CardTitle>
              <CardDescription>
                {storeFilter 
                  ? `Orders from ${storeFilter} store only`
                  : "Live feed of orders with color-coded statuses, filtering, and batch actions"
                }
              </CardDescription>
            </div>
            <Button onClick={handleSyncOrders} disabled={syncing}>
              {syncing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Orders
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {Array.from(new Set(orders.map(o => o.storeName))).map(store => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="awaiting">Awaiting Shipment</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-primary/5 rounded-lg border">
              <span className="text-sm font-medium">
                {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected:
              </span>
              <Button size="sm" onClick={() => handleBulkAction("Print Labels")}>
                <Printer className="h-4 w-4 mr-1" />
                Print Labels
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("Update Status")}>
                <Edit2 className="h-4 w-4 mr-1" />
                Bulk Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("Export")}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => handleSelectOrder(order.id)}
                />
                
                <div className="flex-1 space-y-4">
                  {/* Header Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Store className="h-3 w-3 mr-1" />
                        {order.storeName}
                      </Badge>
                      {getStatusBadge(order.status)}
                      <div className="flex gap-1">
                        {getWarningIcons(order)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Customer:</span>
                      <p>{order.customerName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Store:</span>
                      <p>{order.storeName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>
                      <p className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {order.totalAmount.toFixed(2)} {order.currency}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Shipping:</span>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="text-sm">
                    <span className="font-medium">Address:</span>
                    <p className={order.shippingAddress.validated ? "text-muted-foreground" : "text-red-600"}>
                      {order.shippingAddress.line1}
                      {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
                      , {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="text-sm">
                    <span className="font-medium">Items:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {order.items.map((item, index) => (
                        <Badge key={index} variant="outline">
                          {item.quantity}x {item.productTitle} {item.sku && `(${item.sku})`}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {order.tags.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {order.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tracking */}
                  {order.shippingDetails.trackingNumber && (
                    <div className="text-sm">
                      <span className="font-medium">Tracking:</span>
                      <p className="font-mono">{order.shippingDetails.trackingNumber}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button size="sm" variant="outline">
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    {order.status === 'awaiting' && (
                      <Button size="sm">
                        <Truck className="h-4 w-4 mr-1" />
                        Create Label
                      </Button>
                    )}
                    {order.shippingDetails.trackingNumber && (
                      <Button size="sm" variant="outline">
                        <Package className="h-4 w-4 mr-1" />
                        Track
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStore !== "all" || filterStatus !== "all" 
                  ? "Try adjusting your filters or search terms."
                  : "No orders available. Sync with your connected stores to see orders."
                }
              </p>
              {orders.length === 0 && (
                <Button onClick={handleSyncOrders} disabled={syncing}>
                  <Zap className="h-4 w-4 mr-2" />
                  Sync Orders from Stores
                </Button>
              )}
            </CardContent>
          </Card>
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
    </div>
  );
}