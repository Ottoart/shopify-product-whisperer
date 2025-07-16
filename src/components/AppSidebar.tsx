import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Package, 
  Settings, 
  Database, 
  Activity,
  Home,
  FileText,
  Zap,
  Users,
  TrendingUp,
  Globe,
  Truck,
  MapPin,
  RotateCcw,
  Calculator,
  Store,
  DollarSign,
  Warehouse,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Clock,
  FileX,
  XCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Marketplace Gateway", url: "/marketplace-gateway", icon: Globe, description: "Central connection hub" },
  { title: "Products", url: "/", icon: Package, description: "Manage your product catalog" },
  { title: "PrepFox Dashboard", url: "/dashboard", icon: TrendingUp, description: "Modules & subscriptions pricing" },
  { title: "AI Learning Dashboard", url: "/ai-dashboard", icon: BarChart3, description: "Analytics and insights" },
];

const shopifyItems = [
  { title: "Shopify Integration", url: "/shopify-integration", icon: Zap, description: "Connect and manage Shopify" },
  { title: "Sync Status", url: "/sync-status", icon: Database, description: "Monitor sync operations" },
];

const toolItems = [
  { title: "Analytics", url: "/analytics", icon: TrendingUp, description: "View performance metrics" },
  { title: "Product Activity", url: "/activity", icon: Activity, description: "Track product changes" },
  { title: "Bulk Editor", url: "/bulk-editor", icon: FileText, description: "Edit multiple products" },
  { title: "Inventory Management", url: "/inventory", icon: Warehouse, description: "Manage duplicates and variations" },
  { title: "Store Connections", url: "/settings", icon: Store, description: "Manage connected stores" },
];

const repricingItems = [
  { title: "Dynamic Repricing", url: "/repricing", icon: DollarSign, description: "Manage pricing strategies" },
];

const shippingItems = [
  { title: "Order Management", url: "/shipping", icon: Package, description: "Manage orders and shipping" },
  { title: "Tracking Center", url: "/shipping/tracking", icon: MapPin, description: "Track shipment status" },
  { title: "Returns Portal", url: "/shipping/returns", icon: RotateCcw, description: "Handle returns and refunds" },
  { title: "Rate Calculator", url: "/shipping/rates", icon: Calculator, description: "Calculate shipping costs" },
];

const settingsItems = [
  { title: "Store Config", url: "/settings", icon: Settings, description: "Configure store settings" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [stores, setStores] = useState<Array<{id: string, store_name: string, platform: string}>>([]);
  const [expandedCatalogueItems, setExpandedCatalogueItems] = useState<Set<string>>(new Set());
  const [expandedShippingItems, setExpandedShippingItems] = useState<Set<string>>(new Set());
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase
          .from('store_configurations')
          .select('id, store_name, platform')
          .eq('is_active', true)
          .order('store_name');
        
        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error('Error fetching stores:', error);
      }
    };

    const fetchOrderCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('status, store_name')
          .order('status');
        
        if (error) throw error;
        
        // Count orders by status
        const counts: Record<string, number> = {};
        data?.forEach(order => {
          counts[order.status] = (counts[order.status] || 0) + 1;
          // Also count by store and status combination
          const storeStatusKey = `${order.store_name}-${order.status}`;
          counts[storeStatusKey] = (counts[storeStatusKey] || 0) + 1;
        });
        
        setOrderCounts(counts);
      } catch (error) {
        console.error('Error fetching order counts:', error);
      }
    };

    fetchStores();
    fetchOrderCounts();
  }, []);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  const toggleCatalogueItem = (itemTitle: string) => {
    const newExpanded = new Set(expandedCatalogueItems);
    if (newExpanded.has(itemTitle)) {
      newExpanded.delete(itemTitle);
    } else {
      newExpanded.add(itemTitle);
    }
    setExpandedCatalogueItems(newExpanded);
  };

  const toggleShippingItem = (itemTitle: string) => {
    const newExpanded = new Set(expandedShippingItems);
    if (newExpanded.has(itemTitle)) {
      newExpanded.delete(itemTitle);
    } else {
      newExpanded.add(itemTitle);
    }
    setExpandedShippingItems(newExpanded);
  };

  const getOrderCount = (status: string, storeName?: string) => {
    if (storeName) {
      return orderCounts[`${storeName}-${status}`] || 0;
    }
    return orderCounts[status] || 0;
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            <Home className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              PrepFox
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavCls}
                      title={collapsed ? item.description : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                          <span className="whitespace-nowrap">{item.title}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</span>
                        </div>
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Catalogue */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Package className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Catalogue
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <div key={item.title}>
                  {/* Main Tool Item */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        onClick={() => !collapsed && toggleCatalogueItem(item.title)}
                        className={getNavCls}
                        title={collapsed ? item.description : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                          <span className="whitespace-nowrap">{item.title}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</span>
                        </div>
                        {!collapsed && stores.length > 0 && (
                          <div className="ml-auto">
                            {expandedCatalogueItems.has(item.title) ? (
                              <ChevronDown className="h-3 w-3 animate-fade-in" />
                            ) : (
                              <ChevronRight className="h-3 w-3 animate-fade-in" />
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Expandable Store Subcategories */}
                  {!collapsed && expandedCatalogueItems.has(item.title) && stores.map((store) => (
                    <SidebarMenuItem key={`${item.title}-${store.id}`} className="animate-accordion-down">
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={`${item.url}?store=${encodeURIComponent(store.store_name)}`}
                          className={getNavCls}
                          title={`${item.description} for ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Repricing */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Repricing
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {repricingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavCls}
                      title={collapsed ? item.description : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">{item.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Shipping */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Truck className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Shipping
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Shipping Overview */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping-overview" 
                    end
                    className={getNavCls}
                    title={collapsed ? "Shipping overview and analytics" : undefined}
                    >
                      <BarChart3 className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Overview</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Shipping analytics</span>
                      </div>
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Awaiting Shipments with Store Filters */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping" 
                      end
                      onClick={() => !collapsed && toggleShippingItem("Awaiting Shipments")}
                      className={getNavCls}
                      title={collapsed ? "View all orders awaiting shipment" : undefined}
                      >
                        <Package className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">Awaiting Shipments</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">All stores awaiting shipment</span>
                         </div>
                         {!collapsed && getOrderCount('awaiting') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('awaiting')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("Awaiting Shipments") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for Awaiting Shipments */}
                {!collapsed && expandedShippingItems.has("Awaiting Shipments") && stores.map((store) => (
                  <SidebarMenuItem key={`awaiting-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=awaiting`}
                        className={getNavCls}
                        title={`Awaiting shipments from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('awaiting', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('awaiting', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Awaiting Payment */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping?status=awaiting_payment" 
                      onClick={() => !collapsed && toggleShippingItem("Awaiting Payment")}
                      className={getNavCls}
                      title={collapsed ? "Orders awaiting payment" : undefined}
                      >
                        <CreditCard className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">Awaiting Payment</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">Payment pending orders</span>
                         </div>
                         {!collapsed && getOrderCount('awaiting_payment') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('awaiting_payment')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("Awaiting Payment") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for Awaiting Payment */}
                {!collapsed && expandedShippingItems.has("Awaiting Payment") && stores.map((store) => (
                  <SidebarMenuItem key={`payment-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=awaiting_payment`}
                        className={getNavCls}
                        title={`Awaiting payment from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('awaiting_payment', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('awaiting_payment', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* On Hold */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping?status=on_hold" 
                      onClick={() => !collapsed && toggleShippingItem("On Hold")}
                      className={getNavCls}
                      title={collapsed ? "Orders on hold" : undefined}
                      >
                        <Clock className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">On Hold</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">Orders temporarily paused</span>
                         </div>
                         {!collapsed && getOrderCount('on_hold') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('on_hold')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("On Hold") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for On Hold */}
                {!collapsed && expandedShippingItems.has("On Hold") && stores.map((store) => (
                  <SidebarMenuItem key={`hold-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=on_hold`}
                        className={getNavCls}
                        title={`Orders on hold from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('on_hold', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('on_hold', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Manual Orders */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping?status=manual" 
                      onClick={() => !collapsed && toggleShippingItem("Manual Orders")}
                      className={getNavCls}
                      title={collapsed ? "Manually created orders" : undefined}
                      >
                        <FileX className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">Manual Orders</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">Manually created orders</span>
                         </div>
                         {!collapsed && getOrderCount('manual') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('manual')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("Manual Orders") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for Manual Orders */}
                {!collapsed && expandedShippingItems.has("Manual Orders") && stores.map((store) => (
                  <SidebarMenuItem key={`manual-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=manual`}
                        className={getNavCls}
                        title={`Manual orders from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('manual', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('manual', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Rejected Fulfillment */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping?status=rejected" 
                      onClick={() => !collapsed && toggleShippingItem("Rejected Fulfillment")}
                      className={getNavCls}
                      title={collapsed ? "Orders rejected for fulfillment" : undefined}
                      >
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">Rejected Fulfillment</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">Fulfillment rejected orders</span>
                         </div>
                         {!collapsed && getOrderCount('rejected') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('rejected')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("Rejected Fulfillment") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for Rejected Fulfillment */}
                {!collapsed && expandedShippingItems.has("Rejected Fulfillment") && stores.map((store) => (
                  <SidebarMenuItem key={`rejected-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=rejected`}
                        className={getNavCls}
                        title={`Rejected orders from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('rejected', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('rejected', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Shipped */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping?status=shipped" 
                      onClick={() => !collapsed && toggleShippingItem("Shipped")}
                      className={getNavCls}
                      title={collapsed ? "Shipped orders" : undefined}
                      >
                        <Truck className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">Shipped</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">Orders in transit</span>
                         </div>
                         {!collapsed && getOrderCount('shipped') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('shipped')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("Shipped") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for Shipped */}
                {!collapsed && expandedShippingItems.has("Shipped") && stores.map((store) => (
                  <SidebarMenuItem key={`shipped-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=shipped`}
                        className={getNavCls}
                        title={`Shipped orders from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('shipped', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('shipped', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Delivered */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping?status=delivered" 
                      onClick={() => !collapsed && toggleShippingItem("Delivered")}
                      className={getNavCls}
                      title={collapsed ? "Delivered orders" : undefined}
                      >
                        <CheckCircle className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">Delivered</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">Successfully delivered orders</span>
                         </div>
                         {!collapsed && getOrderCount('delivered') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('delivered')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("Delivered") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for Delivered */}
                {!collapsed && expandedShippingItems.has("Delivered") && stores.map((store) => (
                  <SidebarMenuItem key={`delivered-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=delivered`}
                        className={getNavCls}
                        title={`Delivered orders from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('delivered', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('delivered', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Cancelled */}
              <div>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/shipping?status=cancelled" 
                      onClick={() => !collapsed && toggleShippingItem("Cancelled")}
                      className={getNavCls}
                      title={collapsed ? "Cancelled orders" : undefined}
                      >
                        <XCircle className="h-4 w-4 flex-shrink-0" />
                         <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden ml-2`}>
                           <span className="whitespace-nowrap">Cancelled</span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">Cancelled orders</span>
                         </div>
                         {!collapsed && getOrderCount('cancelled') > 0 && (
                           <Badge variant="secondary" className="text-xs ml-auto mr-1">
                             {getOrderCount('cancelled')}
                           </Badge>
                         )}
                         {!collapsed && stores.length > 0 && (
                           <div className="ml-auto">
                             {expandedShippingItems.has("Cancelled") ? (
                               <ChevronDown className="h-3 w-3 animate-fade-in" />
                             ) : (
                               <ChevronRight className="h-3 w-3 animate-fade-in" />
                             )}
                           </div>
                         )}
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Store Subcategories for Cancelled */}
                {!collapsed && expandedShippingItems.has("Cancelled") && stores.map((store) => (
                  <SidebarMenuItem key={`cancelled-${store.id}`} className="animate-accordion-down">
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/shipping?store=${encodeURIComponent(store.store_name)}&status=cancelled`}
                        className={getNavCls}
                        title={`Cancelled orders from ${store.store_name}`}
                        >
                          <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                          <div className="flex flex-col transition-all duration-300 overflow-hidden">
                            <span className="whitespace-nowrap">{store.store_name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} store</span>
                          </div>
                          {getOrderCount('cancelled', store.store_name) > 0 && (
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {getOrderCount('cancelled', store.store_name)}
                            </Badge>
                          )}
                        </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>

              {/* Other Shipping Tools */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping/tracking" 
                    className={getNavCls}
                    title={collapsed ? "Track shipment status" : undefined}
                    >
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Tracking Center</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Track shipment status</span>
                      </div>
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping/returns" 
                    className={getNavCls}
                    title={collapsed ? "Handle returns and refunds" : undefined}
                    >
                      <RotateCcw className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Returns Portal</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Handle returns and refunds</span>
                      </div>
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping/rates" 
                    className={getNavCls}
                    title={collapsed ? "Calculate shipping costs" : undefined}
                    >
                      <Calculator className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Rate Calculator</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Calculate shipping costs</span>
                      </div>
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Shopify */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Database className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Shopify
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {shopifyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.description : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                          <span className="whitespace-nowrap">{item.title}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</span>
                        </div>
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Settings className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Settings
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={collapsed ? item.description : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                          <span className="whitespace-nowrap">{item.title}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{item.description}</span>
                        </div>
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}