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
  XCircle,
  CheckCircle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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
  { title: "Dynamic Repricing", url: "/repricing", icon: DollarSign, description: "Manage pricing strategies" },
  { title: "Store Connections", url: "/settings", icon: Store, description: "Manage connected stores" },
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

    fetchStores();
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

              {/* Main Order Management - All Stores */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping" 
                    end
                    className={getNavCls}
                    title={collapsed ? "View all orders from all stores" : undefined}
                    >
                      <Package className="h-4 w-4 flex-shrink-0" />
                       <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                         <span className="whitespace-nowrap">Awaiting Shipments</span>
                         <span className="text-xs text-muted-foreground whitespace-nowrap">All stores awaiting shipment</span>
                       </div>
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dynamic Store Subcategories */}
              {stores.map((store) => (
                <SidebarMenuItem key={store.id}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={collapsed ? `Orders from ${store.store_name}` : undefined}
                      >
                        <Store className="h-4 w-4 flex-shrink-0 ml-4" />
                        <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col transition-all duration-300 overflow-hidden`}>
                          <span className="whitespace-nowrap">{store.store_name}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{store.platform} orders</span>
                        </div>
                      </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Shipping Status Categories */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping?status=awaiting_payment" 
                    className={getNavCls}
                    title={collapsed ? "Orders awaiting payment" : undefined}
                    onClick={() => !collapsed && toggleCatalogueItem("awaiting_payment")}
                    >
                      <CreditCard className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Awaiting Payment</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Orders pending payment</span>
                      </div>
                      {!collapsed && stores.length > 0 && (
                        <div className="ml-auto">
                          {expandedCatalogueItems.has("awaiting_payment") ? (
                            <ChevronDown className="h-3 w-3 animate-fade-in" />
                          ) : (
                            <ChevronRight className="h-3 w-3 animate-fade-in" />
                          )}
                        </div>
                      )}
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Expandable Store Subcategories for Awaiting Payment */}
              {!collapsed && expandedCatalogueItems.has("awaiting_payment") && stores.map((store) => (
                <SidebarMenuItem key={`awaiting_payment-${store.id}`} className="animate-accordion-down">
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?status=awaiting_payment&store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={`Awaiting payment orders from ${store.store_name}`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                      <div className="flex flex-col transition-all duration-300 overflow-hidden">
                        <span className="whitespace-nowrap">{store.store_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Payment pending</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping?status=on_hold" 
                    className={getNavCls}
                    title={collapsed ? "Orders on hold" : undefined}
                    onClick={() => !collapsed && toggleCatalogueItem("on_hold")}
                    >
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">On Hold</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Orders temporarily held</span>
                      </div>
                      {!collapsed && stores.length > 0 && (
                        <div className="ml-auto">
                          {expandedCatalogueItems.has("on_hold") ? (
                            <ChevronDown className="h-3 w-3 animate-fade-in" />
                          ) : (
                            <ChevronRight className="h-3 w-3 animate-fade-in" />
                          )}
                        </div>
                      )}
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Expandable Store Subcategories for On Hold */}
              {!collapsed && expandedCatalogueItems.has("on_hold") && stores.map((store) => (
                <SidebarMenuItem key={`on_hold-${store.id}`} className="animate-accordion-down">
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?status=on_hold&store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={`On hold orders from ${store.store_name}`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                      <div className="flex flex-col transition-all duration-300 overflow-hidden">
                        <span className="whitespace-nowrap">{store.store_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Orders on hold</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping?status=manual" 
                    className={getNavCls}
                    title={collapsed ? "Manual orders" : undefined}
                    onClick={() => !collapsed && toggleCatalogueItem("manual")}
                    >
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Manual Orders</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Manually created orders</span>
                      </div>
                      {!collapsed && stores.length > 0 && (
                        <div className="ml-auto">
                          {expandedCatalogueItems.has("manual") ? (
                            <ChevronDown className="h-3 w-3 animate-fade-in" />
                          ) : (
                            <ChevronRight className="h-3 w-3 animate-fade-in" />
                          )}
                        </div>
                      )}
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Expandable Store Subcategories for Manual Orders */}
              {!collapsed && expandedCatalogueItems.has("manual") && stores.map((store) => (
                <SidebarMenuItem key={`manual-${store.id}`} className="animate-accordion-down">
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?status=manual&store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={`Manual orders from ${store.store_name}`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                      <div className="flex flex-col transition-all duration-300 overflow-hidden">
                        <span className="whitespace-nowrap">{store.store_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Manual orders</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping?status=rejected" 
                    className={getNavCls}
                    title={collapsed ? "Rejected fulfillment orders" : undefined}
                    onClick={() => !collapsed && toggleCatalogueItem("rejected")}
                    >
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Rejected Fulfillment</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Orders with fulfillment issues</span>
                      </div>
                      {!collapsed && stores.length > 0 && (
                        <div className="ml-auto">
                          {expandedCatalogueItems.has("rejected") ? (
                            <ChevronDown className="h-3 w-3 animate-fade-in" />
                          ) : (
                            <ChevronRight className="h-3 w-3 animate-fade-in" />
                          )}
                        </div>
                      )}
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Expandable Store Subcategories for Rejected Fulfillment */}
              {!collapsed && expandedCatalogueItems.has("rejected") && stores.map((store) => (
                <SidebarMenuItem key={`rejected-${store.id}`} className="animate-accordion-down">
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?status=rejected&store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={`Rejected fulfillment orders from ${store.store_name}`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                      <div className="flex flex-col transition-all duration-300 overflow-hidden">
                        <span className="whitespace-nowrap">{store.store_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Rejected orders</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping?status=shipped" 
                    className={getNavCls}
                    title={collapsed ? "Shipped orders" : undefined}
                    onClick={() => !collapsed && toggleCatalogueItem("shipped")}
                    >
                      <Truck className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Shipped</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Orders in transit</span>
                      </div>
                      {!collapsed && stores.length > 0 && (
                        <div className="ml-auto">
                          {expandedCatalogueItems.has("shipped") ? (
                            <ChevronDown className="h-3 w-3 animate-fade-in" />
                          ) : (
                            <ChevronRight className="h-3 w-3 animate-fade-in" />
                          )}
                        </div>
                      )}
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Expandable Store Subcategories for Shipped */}
              {!collapsed && expandedCatalogueItems.has("shipped") && stores.map((store) => (
                <SidebarMenuItem key={`shipped-${store.id}`} className="animate-accordion-down">
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?status=shipped&store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={`Shipped orders from ${store.store_name}`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                      <div className="flex flex-col transition-all duration-300 overflow-hidden">
                        <span className="whitespace-nowrap">{store.store_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Shipped orders</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping?status=delivered" 
                    className={getNavCls}
                    title={collapsed ? "Delivered orders" : undefined}
                    onClick={() => !collapsed && toggleCatalogueItem("delivered")}
                    >
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Delivered</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Successfully delivered</span>
                      </div>
                      {!collapsed && stores.length > 0 && (
                        <div className="ml-auto">
                          {expandedCatalogueItems.has("delivered") ? (
                            <ChevronDown className="h-3 w-3 animate-fade-in" />
                          ) : (
                            <ChevronRight className="h-3 w-3 animate-fade-in" />
                          )}
                        </div>
                      )}
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Expandable Store Subcategories for Delivered */}
              {!collapsed && expandedCatalogueItems.has("delivered") && stores.map((store) => (
                <SidebarMenuItem key={`delivered-${store.id}`} className="animate-accordion-down">
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?status=delivered&store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={`Delivered orders from ${store.store_name}`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                      <div className="flex flex-col transition-all duration-300 overflow-hidden">
                        <span className="whitespace-nowrap">{store.store_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Delivered orders</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/shipping?status=cancelled" 
                    className={getNavCls}
                    title={collapsed ? "Cancelled orders" : undefined}
                    onClick={() => !collapsed && toggleCatalogueItem("cancelled")}
                    >
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                      <div className={`${collapsed ? "group-hover:flex hidden" : "flex"} flex-col flex-1 transition-all duration-300 overflow-hidden`}>
                        <span className="whitespace-nowrap">Cancelled</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Cancelled orders</span>
                      </div>
                      {!collapsed && stores.length > 0 && (
                        <div className="ml-auto">
                          {expandedCatalogueItems.has("cancelled") ? (
                            <ChevronDown className="h-3 w-3 animate-fade-in" />
                          ) : (
                            <ChevronRight className="h-3 w-3 animate-fade-in" />
                          )}
                        </div>
                      )}
                    </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Expandable Store Subcategories for Cancelled */}
              {!collapsed && expandedCatalogueItems.has("cancelled") && stores.map((store) => (
                <SidebarMenuItem key={`cancelled-${store.id}`} className="animate-accordion-down">
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={`/shipping?status=cancelled&store=${encodeURIComponent(store.store_name)}`}
                      className={getNavCls}
                      title={`Cancelled orders from ${store.store_name}`}
                    >
                      <Store className="h-4 w-4 flex-shrink-0 ml-8" />
                      <div className="flex flex-col transition-all duration-300 overflow-hidden">
                        <span className="whitespace-nowrap">{store.store_name}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Cancelled orders</span>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

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