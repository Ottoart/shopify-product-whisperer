import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SyncProgressDialog } from './SyncProgressDialog';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Zap,
  MoreHorizontal,
  Tag,
  Users
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Loading Orders...</h1>
        </div>
        <div className="border rounded-lg p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-medium mb-2">Loading orders...</h3>
          <p className="text-muted-foreground">Fetching your latest orders</p>
        </div>
      </div>
    );
  }

  const getAge = (orderDate: string) => {
    const now = new Date();
    const orderTime = new Date(orderDate);
    const diffHours = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours} hr`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hr`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Section with Title and Reload */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">
            {storeFilter ? `${storeFilter} - ` : ""}Awaiting Shipment
          </h1>
          <Button variant="ghost" size="sm" onClick={handleSyncOrders} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Reload
          </Button>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-2">
        <Button disabled={selectedOrders.length === 0}>
          <Printer className="h-4 w-4 mr-1" />
          Create + Print Labels
        </Button>
        <Button variant="outline" disabled={selectedOrders.length === 0}>
          Get Rate
        </Button>
        <Button variant="outline" disabled={selectedOrders.length === 0}>
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
        <Button variant="outline" disabled={selectedOrders.length === 0}>
          <Users className="h-4 w-4 mr-1" />
          Assign To
        </Button>
        <Button variant="outline" disabled={selectedOrders.length === 0}>
          <Tag className="h-4 w-4 mr-1" />
          Tag
        </Button>
        <Button variant="outline">
          <Package className="h-4 w-4 mr-1" />
          New Order
        </Button>
        <Button variant="outline" disabled={selectedOrders.length === 0}>
          Bulk Update
        </Button>
        <Button variant="outline" disabled={selectedOrders.length === 0}>
          Allocate
        </Button>
        <Button variant="outline" disabled={selectedOrders.length === 0}>
          <MoreHorizontal className="h-4 w-4 mr-1" />
          Other Actions
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="outline" size="sm" className="bg-blue-50 text-blue-700">
          All
        </Button>
        <span className="text-sm text-muted-foreground">Filter By:</span>
        
        <Select value={filterStore} onValueChange={setFilterStore}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stores</SelectItem>
            {Array.from(new Set(orders.map(o => o.storeName))).map(store => (
              <SelectItem key={store} value={store}>{store}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-24 h-8">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-36 h-8">
            <SelectValue placeholder="Allocation Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Order Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-24 h-8">
            <SelectValue placeholder="Other" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
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

      {/* Orders Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
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
              <TableHead className="min-w-32">Order #</TableHead>
              <TableHead className="min-w-80">Item Name</TableHead>
              <TableHead className="w-20">Quantity</TableHead>
              <TableHead className="min-w-40">Recipient</TableHead>
              <TableHead className="w-20">Age</TableHead>
              <TableHead className="min-w-24">Order</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-24">Weight</TableHead>
              <TableHead className="min-w-32">Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.includes(order.id)}
                    onCheckedChange={() => handleSelectOrder(order.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-mono text-blue-600 hover:underline cursor-pointer">
                    {order.orderNumber}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        {item.productTitle}
                        {item.sku && <span className="text-muted-foreground"> ({item.sku})</span>}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">{item.quantity}</div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm">{order.customerName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{getAge(order.orderDate)}</span>
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
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                    {order.status === 'awaiting' ? 'ON' : order.status.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {order.packageDetails?.weight ? 
                      `${order.packageDetails.weight} kg` : 
                      '0 kg'
                    }
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {order.notes || '-'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
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
              <Button onClick={handleSyncOrders} disabled={syncing}>
                <Zap className="h-4 w-4 mr-2" />
                Sync Orders from Stores
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer with pagination info */}
      <div className="text-sm text-muted-foreground">
        Viewing 1 - {filteredOrders.length} of {filteredOrders.length}
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