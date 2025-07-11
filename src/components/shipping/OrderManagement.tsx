import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
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
  Download
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  store: string;
  status: 'awaiting' | 'shipped' | 'error' | 'processing';
  total: number;
  shippingCountry: string;
  date: string;
  weight?: number;
  address: {
    valid: boolean;
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shippingMethod?: string;
  tags: string[];
  trackingNumber?: string;
  items: Array<{
    name: string;
    quantity: number;
    sku: string;
  }>;
}

export function OrderManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // Mock data - replace with real data from your API
  const [orders] = useState<Order[]>([
    {
      id: "1",
      orderNumber: "ORD-001",
      customer: "John Smith",
      store: "Shopify Store",
      status: "awaiting",
      total: 129.99,
      shippingCountry: "US",
      date: "2024-01-15",
      weight: 2.5,
      address: {
        valid: true,
        line1: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US"
      },
      shippingMethod: "UPS Ground",
      tags: ["priority"],
      items: [
        { name: "Product A", quantity: 2, sku: "SKU-A" }
      ]
    },
    {
      id: "2",
      orderNumber: "ORD-002",
      customer: "Jane Doe",
      store: "Amazon",
      status: "error",
      total: 89.50,
      shippingCountry: "CA",
      date: "2024-01-16",
      address: {
        valid: false,
        line1: "456 Invalid Ave",
        city: "Toronto",
        state: "ON",
        zip: "",
        country: "CA"
      },
      tags: ["international"],
      items: [
        { name: "Product B", quantity: 1, sku: "SKU-B" }
      ]
    },
    {
      id: "3",
      orderNumber: "ORD-003",
      customer: "Bob Wilson",
      store: "Shopify Store",
      status: "shipped",
      total: 245.00,
      shippingCountry: "US",
      date: "2024-01-14",
      weight: 5.2,
      address: {
        valid: true,
        line1: "789 Oak St",
        city: "Los Angeles",
        state: "CA",
        zip: "90210",
        country: "US"
      },
      shippingMethod: "FedEx Express",
      trackingNumber: "1Z999AA1234567890",
      tags: ["high-value"],
      items: [
        { name: "Product C", quantity: 1, sku: "SKU-C" }
      ]
    }
  ]);

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
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getWarningIcons = (order: Order) => {
    const warnings = [];
    
    if (!order.weight) {
      warnings.push(
        <div key="weight" title="Missing weight">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        </div>
      );
    }
    
    if (!order.address.valid) {
      warnings.push(
        <div key="address" title="Invalid address">
          <MapPin className="h-4 w-4 text-red-500" />
        </div>
      );
    }
    
    if (!order.shippingMethod) {
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
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = filterStore === "all" || order.store === filterStore;
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

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Management
          </CardTitle>
          <CardDescription>
            Live feed of orders with color-coded statuses, filtering, and batch actions
          </CardDescription>
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
                <SelectItem value="Shopify Store">Shopify Store</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="eBay">eBay</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="awaiting">Awaiting Shipment</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
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
                      {getStatusBadge(order.status)}
                      <div className="flex gap-1">
                        {getWarningIcons(order)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {order.date}
                    </div>
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Customer:</span>
                      <p>{order.customer}</p>
                    </div>
                    <div>
                      <span className="font-medium">Store:</span>
                      <p>{order.store}</p>
                    </div>
                    <div>
                      <span className="font-medium">Total:</span>
                      <p className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {order.total.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Shipping:</span>
                      <p>{order.shippingCountry}</p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="text-sm">
                    <span className="font-medium">Address:</span>
                    <p className={order.address.valid ? "text-muted-foreground" : "text-red-600"}>
                      {order.address.line1}, {order.address.city}, {order.address.state} {order.address.zip}, {order.address.country}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="text-sm">
                    <span className="font-medium">Items:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {order.items.map((item, index) => (
                        <Badge key={index} variant="outline">
                          {item.quantity}x {item.name} ({item.sku})
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
                  {order.trackingNumber && (
                    <div className="text-sm">
                      <span className="font-medium">Tracking:</span>
                      <p className="font-mono">{order.trackingNumber}</p>
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
                    {order.trackingNumber && (
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
              <p className="text-muted-foreground">
                {searchTerm || filterStore !== "all" || filterStatus !== "all" 
                  ? "Try adjusting your filters or search terms."
                  : "Orders will appear here once you start receiving them."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}