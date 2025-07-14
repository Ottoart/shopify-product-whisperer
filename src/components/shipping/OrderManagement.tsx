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
  const { toast } = useToast();
  const { orders, loading, fetchOrders } = useOrders();
  const [searchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState(storeFilter || "all");
  const [filterStatus, setFilterStatus] = useState("awaiting");
  const [filterDestination, setFilterDestination] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [filterAllocation, setFilterAllocation] = useState("all");
  const [filterOrderDate, setFilterOrderDate] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
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
  
  const [categories, setCategories] = useState<OrderCategory[]>([
    { id: "awaiting_payment", name: "Awaiting Payment", count: 1, isExpanded: false },
    { id: "on_hold", name: "On Hold", count: 0, isExpanded: false },
    { id: "awaiting", name: "Awaiting Shipment", count: 15, isExpanded: true },
    { id: "manual", name: "Manual Orders", count: 0, isExpanded: false },
    { id: "rejected", name: "Rejected Fulfillment", count: 0, isExpanded: false },
    { id: "pending", name: "Pending Fulfillment", count: 0, isExpanded: false },
    { id: "shipped", name: "Shipped", count: 0, isExpanded: false },
    { id: "cancelled", name: "Cancelled", count: 0, isExpanded: false },
    { id: "alerts", name: "Order Alerts", count: 0, isExpanded: false },
  ]);

  // Update local filter when URL parameter changes
  useEffect(() => {
    if (storeFilter) {
      setFilterStore(storeFilter);
    }
  }, [storeFilter]);

  // Fetch store configurations and update category counts
  useEffect(() => {
    const fetchStoreConfigs = async () => {
      const { data } = await supabase
        .from('store_configurations')
        .select('*')
        .eq('is_active', true);
      setStoreConfigs(data || []);
    };
    fetchStoreConfigs();
    
    // Update category counts based on orders
    const updatedCategories = categories.map(cat => ({
      ...cat,
      count: orders.filter(order => {
        switch (cat.id) {
          case "awaiting": return order.status === "awaiting";
          case "shipped": return order.status === "shipped";
          case "cancelled": return order.status === "cancelled";
          case "processing": return order.status === "processing";
          default: return false;
        }
      }).length
    }));
    setCategories(updatedCategories);
  }, [orders]);

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

  const handleSyncSpecificStore = async (storeName: string) => {
    setSyncing(true);
    setShowSyncDialog(true);
    setSyncCompleted(false);
    setSyncError(false);
    setSyncData(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Pass specific store filter to the sync function
      const response = await supabase.functions.invoke('sync-orders', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { storeFilter: storeName }
      });

      if (response.error) {
        throw response.error;
      }

      setSyncData(response.data);
      setSyncCompleted(true);
      await fetchOrders();
      
      toast({
        title: "✅ Store sync completed!",
        description: `${storeName} orders have been synchronized`,
      });
    } catch (error: any) {
      setSyncError(true);
      setSyncData({ error: error.message });
      
      toast({
        title: "Sync failed",
        description: error.message || `Failed to sync ${storeName} orders`,
        variant: "destructive"
      });
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

  const handleResyncWithItems = async () => {
    if (!confirm('This will delete all existing orders and re-sync them with their items. Continue?')) {
      return;
    }

    try {
      // First clear all existing orders and items
      console.log('Clearing existing orders to ensure clean sync with items...');
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all orders
      
      if (deleteError) {
        console.warn('Could not clear existing orders:', deleteError.message);
      }

      toast({
        title: "Database cleared",
        description: "Now syncing fresh orders with items...",
      });

      // Then trigger normal sync
      await handleSyncOrders();
    } catch (error: any) {
      toast({
        title: "Error during resync",
        description: error.message,
        variant: "destructive"
      });
    }
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

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(prev => prev.map(cat => ({
      ...cat,
      isExpanded: cat.id === categoryId ? !cat.isExpanded : false
    })));
    setActiveCategory(categoryId);
    setFilterStatus(categoryId);
  };

  // Sort functionality
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const handleOrderClick = (order: Order) => {
    console.log('Selected order:', order);
    console.log('Order items:', order.items);
    setSelectedOrderForLabel(order);
    setEditableOrder({...order}); // Create editable copy
    setShowLabelModal(true);
  };

  let filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === "all" || order.storeName === filterStore;
    
    const matchesStatus = activeCategory === "all" || (() => {
      switch (activeCategory) {
        case "awaiting_payment": return order.status === "processing" || order.status === "awaiting";
        case "on_hold": return order.status === "error";
        case "awaiting": return order.status === "awaiting";
        case "manual": return order.status === "awaiting";
        case "rejected": return order.status === "error";
        case "pending": return order.status === "processing";
        case "shipped": return order.status === "shipped";
        case "cancelled": return order.status === "cancelled";
        case "alerts": return order.status === "error";
        default: return true;
      }
    })();
    
    const matchesDestination = filterDestination === "all" || 
                              order.shippingAddress.country === filterDestination ||
                              order.shippingAddress.state === filterDestination;
    
    const matchesTag = filterTag === "all" || 
                      (order.tags && order.tags.includes(filterTag));
    
    const matchesOrderDate = filterOrderDate === "all" || (() => {
      const orderDate = new Date(order.orderDate);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filterOrderDate) {
        case "today": return diffDays === 0;
        case "yesterday": return diffDays === 1;
        case "last_7_days": return diffDays <= 7;
        case "last_30_days": return diffDays <= 30;
        case "older": return diffDays > 30;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStore && matchesStatus && matchesDestination && 
           matchesTag && matchesOrderDate;
  });

  // Apply sorting
  if (sortField) {
    filteredOrders = [...filteredOrders].sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a];
      let bValue: any = b[sortField as keyof typeof b];
      
      // Handle specific field mappings
      if (sortField === 'recipient') {
        aValue = a.customerName;
        bValue = b.customerName;
      } else if (sortField === 'state') {
        aValue = a.shippingAddress.state;
        bValue = b.shippingAddress.state;
      } else if (sortField === 'orderDate') {
        aValue = new Date(a.orderDate);
        bValue = new Date(b.orderDate);
      } else if (sortField === 'totalAmount') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortField === 'weight') {
        aValue = parseFloat((a.packageDetails.weight || 0).toString()) || 0;
        bValue = parseFloat((b.packageDetails.weight || 0).toString()) || 0;
      }
      
      // Convert to string for comparison if not already a number or date
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

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

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select orders to delete.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedOrders.length} selected orders? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .in('id', selectedOrders);

      if (error) throw error;

      toast({
        title: "✅ Orders deleted",
        description: `${selectedOrders.length} orders have been deleted successfully.`,
      });

      setSelectedOrders([]);
      await fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error deleting orders",
        description: error.message,
        variant: "destructive"
      });
    }
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
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return { text: `${diffMinutes} min`, color: "green" };
    } else if (diffHours < 48) {
      return { text: `${diffHours} hr`, color: diffHours < 1 ? "green" : "orange" };
    } else {
      return { text: `${diffDays} days`, color: "red" };
    }
  };

  const formatWeight = (grams: number) => {
    if (!grams) return "0 kg";
    const kg = Math.floor(grams / 1000);
    const g = grams % 1000;
    return kg > 0 ? `${kg} kg ${g} g` : `${g} g`;
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  };

  const getItemSummary = (items: any[]) => {
    if (items.length === 1) return items[0].productTitle;
    return `(${items.length} Items)`;
  };

  const getTotalQuantity = (items: any[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
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
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-between text-left h-8 ${
                    category.isExpanded ? 'bg-blue-100 text-blue-900' : ''
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <div className="flex items-center gap-2">
                    {category.isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="text-sm">{category.name}</span>
                  </div>
                  {category.count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  )}
                </Button>
                {category.isExpanded && (
                  <div className="ml-6 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-7 text-blue-700 bg-blue-50"
                    >
                      All Orders
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {categories.find(c => c.id === activeCategory)?.name || "Orders"}
            </h1>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                {storeConfigs.length} Active Stores
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" disabled={syncing} className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    Update All Stores
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleSyncOrders}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync All Stores
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleResyncWithItems}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Fix Missing Items (Re-sync)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {storeConfigs.map((store) => (
                    <DropdownMenuItem 
                      key={store.id} 
                      onClick={() => handleSyncSpecificStore(store.store_name)}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      {store.store_name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
              <Users className="h-4 w-4 mr-1" />
              Assign To
            </Button>
            <Button variant="outline" disabled={selectedOrders.length === 0}>
              <Tag className="h-4 w-4 mr-1" />
              Tag
            </Button>
            <Button variant="outline" disabled={selectedOrders.length === 0}>
              Bulk Update
            </Button>
            <Button variant="outline" disabled={selectedOrders.length === 0}>
              Allocate
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={selectedOrders.length === 0}
              onClick={handleBulkDelete}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Delete Selected ({selectedOrders.length})
            </Button>
            <Button variant="outline" disabled={selectedOrders.length === 0}>
              <MoreHorizontal className="h-4 w-4 mr-1" />
              Other Actions
            </Button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search orders by number, customer, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
                {orders.length > 0 && Array.from(new Set(orders.map(o => o.storeName).filter(name => name && name.trim() !== ""))).map(store => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDestination} onValueChange={setFilterDestination}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {orders.length > 0 && Array.from(new Set(orders.map(o => o.shippingAddress?.country).filter(country => country && country.trim() !== ""))).map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
                {orders.length > 0 && Array.from(new Set(orders.map(o => o.shippingAddress?.state).filter(state => state && state.trim() !== ""))).map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue placeholder="Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {orders.length > 0 && Array.from(new Set(orders.flatMap(o => o.tags || []).filter(tag => tag && tag.trim() !== ""))).map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="me">Assigned to Me</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAllocation} onValueChange={setFilterAllocation}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue placeholder="Allocation Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Allocations</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="partial">Partially Allocated</SelectItem>
                <SelectItem value="unallocated">Unallocated</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterOrderDate} onValueChange={setFilterOrderDate}>
              <SelectTrigger className="w-32 h-8">
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
          <Table>
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
                 <TableHead className="w-24">Item SKU</TableHead>
                 <TableHead className="min-w-48">Item Name</TableHead>
                 <TableHead className="w-20">Quantity</TableHead>
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
                 <TableHead className="w-32">Requested Service</TableHead>
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
                        <div className="w-8 h-8 bg-gray-200 rounded border flex-shrink-0"></div>
                        <div className="text-sm">
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
                      <div 
                        className="text-sm cursor-pointer hover:text-blue-600"
                        title={`${order.shippingAddress.line1}\n${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}\n${order.shippingAddress.country}`}
                      >
                        {order.customerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`text-sm ${
                          age.color === 'green' ? 'text-green-600' :
                          age.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                        }`}
                      >
                        {age.color === 'green' && '🟢'}
                        {age.color === 'orange' && '🟠'}
                        {age.color === 'red' && '🔴'}
                        {age.text}
                      </span>
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
                            <StickyNote className="h-4 w-4 text-blue-500 cursor-pointer" />
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
                      <div 
                        className="text-sm"
                        title={order.shippingAddress.state}
                      >
                        {order.shippingAddress.state.substring(0, 2).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.shippingDetails?.method || "Standard"}
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
                <Button onClick={handleSyncOrders} disabled={syncing}>
                  <Zap className="h-4 w-4 mr-2" />
                  Sync Orders from Stores
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer with pagination info */}
        <div className="p-4 border-t text-sm text-muted-foreground">
          Viewing 1 - {filteredOrders.length} of {filteredOrders.length} (Default: 250 per page)
        </div>
      </div>

      {/* Shipping Label Modal */}
      <Dialog open={showLabelModal} onOpenChange={setShowLabelModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Shipping Label - Order #{selectedOrderForLabel?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrderForLabel && editableOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Order #</label>
                        <div className="text-lg font-mono">{selectedOrderForLabel.orderNumber}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Customer</label>
                        <div>{selectedOrderForLabel.customerName}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Order Total</label>
                        <div className="text-lg font-semibold">{formatCurrency(selectedOrderForLabel.totalAmount, selectedOrderForLabel.currency)}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                        <div>{new Date(selectedOrderForLabel.orderDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Items Summary</label>
                      <div className="text-sm">{selectedOrderForLabel.items.length} items, {getTotalQuantity(selectedOrderForLabel.items)} total quantity</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Input 
                        value={editableOrder.customerName}
                        onChange={(e) => setEditableOrder({...editableOrder, customerName: e.target.value})}
                        placeholder="Customer Name"
                      />
                      <Input 
                        value={editableOrder.shippingAddress.line1}
                        onChange={(e) => setEditableOrder({
                          ...editableOrder, 
                          shippingAddress: {...editableOrder.shippingAddress, line1: e.target.value}
                        })}
                        placeholder="Address Line 1"
                      />
                      <Input 
                        value={editableOrder.shippingAddress.line2 || ''}
                        onChange={(e) => setEditableOrder({
                          ...editableOrder, 
                          shippingAddress: {...editableOrder.shippingAddress, line2: e.target.value}
                        })}
                        placeholder="Address Line 2 (Optional)"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input 
                          value={editableOrder.shippingAddress.city}
                          onChange={(e) => setEditableOrder({
                            ...editableOrder, 
                            shippingAddress: {...editableOrder.shippingAddress, city: e.target.value}
                          })}
                          placeholder="City"
                        />
                        <Input 
                          value={editableOrder.shippingAddress.state}
                          onChange={(e) => setEditableOrder({
                            ...editableOrder, 
                            shippingAddress: {...editableOrder.shippingAddress, state: e.target.value}
                          })}
                          placeholder="State"
                        />
                        <Input 
                          value={editableOrder.shippingAddress.zip}
                          onChange={(e) => setEditableOrder({
                            ...editableOrder, 
                            shippingAddress: {...editableOrder.shippingAddress, zip: e.target.value}
                          })}
                          placeholder="ZIP"
                        />
                      </div>
                      <Input 
                        value={editableOrder.shippingAddress.country}
                        onChange={(e) => setEditableOrder({
                          ...editableOrder, 
                          shippingAddress: {...editableOrder.shippingAddress, country: e.target.value}
                        })}
                        placeholder="Country"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-1">Weight (grams)</label>
                      <Input 
                        type="number"
                        value={editableOrder.packageDetails?.weight || 0}
                        onChange={(e) => setEditableOrder({
                          ...editableOrder, 
                          packageDetails: {
                            ...editableOrder.packageDetails,
                            weight: parseInt(e.target.value) || 0
                          }
                        })}
                        placeholder="Weight"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-1">Length (cm)</label>
                      <Input 
                        type="number"
                        value={editableOrder.packageDetails?.length || 0}
                        onChange={(e) => setEditableOrder({
                          ...editableOrder, 
                          packageDetails: {
                            ...editableOrder.packageDetails,
                            length: parseInt(e.target.value) || 0
                          }
                        })}
                        placeholder="Length"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-1">Width (cm)</label>
                      <Input 
                        type="number"
                        value={editableOrder.packageDetails?.width || 0}
                        onChange={(e) => setEditableOrder({
                          ...editableOrder, 
                          packageDetails: {
                            ...editableOrder.packageDetails,
                            width: parseInt(e.target.value) || 0
                          }
                        })}
                        placeholder="Width"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-1">Height (cm)</label>
                      <Input 
                        type="number"
                        value={editableOrder.packageDetails?.height || 0}
                        onChange={(e) => setEditableOrder({
                          ...editableOrder, 
                          packageDetails: {
                            ...editableOrder.packageDetails,
                            height: parseInt(e.target.value) || 0
                          }
                        })}
                        placeholder="Height"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrderForLabel.items && selectedOrderForLabel.items.length > 0 ? (
                      selectedOrderForLabel.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded border flex-shrink-0 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.productTitle}</div>
                            <div className="text-sm text-muted-foreground">SKU: {item.sku || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">Weight: {item.weight ? formatWeight(item.weight) : "Not specified"}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold">Qty: {item.quantity}</div>
                            <div className="text-sm text-muted-foreground">{formatCurrency(item.price)} each</div>
                            <div className="font-medium">{formatCurrency(item.price * item.quantity)} total</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No items found for this order</p>
                        <p className="text-sm mt-2">Order items may not have been synced yet</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Order Items
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Available Shipping Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground mb-3">
                      Click "Get Rates" to fetch real-time shipping rates for this package
                    </div>
                    <div className="flex justify-center">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          toast({
                            title: "Getting rates...",
                            description: "Fetching shipping rates from carriers"
                          });
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Get Shipping Rates
                      </Button>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      No shipping rates available. Get rates to compare services and costs.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-muted-foreground">
                  Total package weight: {formatWeight(editableOrder.packageDetails?.weight || 0)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowLabelModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      toast({
                        title: "Label creation not yet implemented",
                        description: "This feature will be available once shipping rates are integrated.",
                        variant: "destructive"
                      });
                    }}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Create Label
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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