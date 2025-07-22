import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/usePermissions";
import { PermissionGate } from "@/components/auth/PermissionGate";
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
  AlertTriangle,
  Target
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
  { title: "PrepFox Dashboard", url: "/dashboard", icon: TrendingUp, description: "Modules & subscriptions pricing" },
  { title: "Shipping Module", url: "/shipping-landing", icon: Truck, description: "Multi-carrier shipping solution" },
  { title: "Repricing Module", url: "/repricing-landing", icon: DollarSign, description: "Smart repricing automation" }
];

const fulfillmentItems = [
  { title: "Send Inventory", url: "/send-inventory", icon: Warehouse, description: "Create fulfillment submissions" },
  { title: "Receiving", url: "/receiving", icon: CheckCircle, description: "Warehouse receiving dashboard" },
  { title: "Inventory Management", url: "/inventory-management", icon: Package, description: "Manage warehouse inventory" },
  { title: "Order Fulfillment", url: "/fulfillment", icon: Target, description: "Pick, pack, and ship orders" },
  { title: "Packing & Shipping", url: "/packing", icon: Package, description: "Pack orders and manage shipments" },
  { title: "Customer Portal", url: "/customer-portal", icon: Users, description: "Customer account management" },
  { title: "Customer Tracking", url: "/customer-tracking", icon: MapPin, description: "Public order tracking" },
];

const toolItems = [
  { title: "Products", url: "/products", icon: Package, description: "Manage your product catalog" },
  { title: "Product Activity", url: "/activity", icon: Activity, description: "Track product changes" },
  { title: "Bulk Editor", url: "/bulk-editor", icon: FileText, description: "Edit multiple products" },
];

const repricingItems = [
  { title: "Dynamic Repricing", url: "/repricing", icon: DollarSign, description: "Manage pricing strategies" },
  { title: "Listings", url: "/repricing?tab=listings", icon: FileText, description: "Manage product listings and prices" },
  { title: "Analytics", url: "/analytics", icon: TrendingUp, description: "View performance metrics", permission: "analytics_view", resourceType: "analytics" },
  { title: "Strategies", url: "/strategies", icon: Target, description: "Create and manage repricing strategies" },
];

const shippingItems = [
  { title: "Order Management", url: "/shipping", icon: Package, description: "Manage orders and shipping" },
  { title: "Tracking Center", url: "/shipping/tracking", icon: MapPin, description: "Track shipment status" },
  { title: "Returns Portal", url: "/shipping/returns", icon: RotateCcw, description: "Handle returns and refunds" },
  { title: "Rate Calculator", url: "/shipping/rates", icon: Calculator, description: "Calculate shipping costs" },
];

const settingsItems = [
  { title: "Store Management", url: "/settings", icon: Store, description: "Manage stores, connections, and integrations" },
  { title: "Carriers", url: "/carriers", icon: Truck, description: "Manage shipping carriers" },
  { title: "Admin Dashboard", url: "/admin", icon: Settings, description: "System administration (Admin only)", permission: "admin", resourceType: "system" },
];

export function AppSidebar() {
  const { data: userRole } = useUserRole();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const [stores, setStores] = useState<Array<{id: string, store_name: string, platform: string}>>([]);
  const [activeAccordionSection, setActiveAccordionSection] = useState<string | null>(null);
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
          .select('status, store_name, shipped_date, delivered_date')
          .eq('status', 'awaiting')
          .is('shipped_date', null)
          .is('delivered_date', null)
          .order('status');
        
        if (error) throw error;
        
        // Count orders by status (only active unshipped/undelivered awaiting orders)
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

  const toggleAccordionSection = (sectionId: string) => {
    if (activeAccordionSection === sectionId) {
      setActiveAccordionSection(null);
    } else {
      setActiveAccordionSection(sectionId);
    }
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

        {/* Fulfillment by PrepFox */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Target className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Fulfillment by PrepFox
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fulfillmentItems.map((item) => (
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

        {/* Product Catalogues */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Package className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Product Catalogues
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
                        onClick={() => !collapsed && toggleAccordionSection(`catalogue-${item.title}`)}
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
                            {activeAccordionSection === `catalogue-${item.title}` ? (
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
                  {!collapsed && activeAccordionSection === `catalogue-${item.title}` && stores.map((store) => (
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

        {/* Listings RePricer */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <DollarSign className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Listings RePricer
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {repricingItems.map((item) => {
                const menuContent = (
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
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {'permission' in item && item.permission ? (
                        <PermissionGate 
                          permission={item.permission as any} 
                          resourceType={item.resourceType || ""}
                        >
                          {menuContent}
                        </PermissionGate>
                      ) : (
                        menuContent
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Order Management */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Truck className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Order Management
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
                      onClick={() => !collapsed && toggleAccordionSection("shipping-Awaiting Shipments")}
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
                             {activeAccordionSection === "shipping-Awaiting Shipments" ? (
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
                {!collapsed && activeAccordionSection === "shipping-Awaiting Shipments" && stores.map((store) => (
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

              {/* Regular shipping items */}
              {shippingItems.slice(1).map((item) => (
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
              {settingsItems.map((item) => {
                const menuContent = (
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
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {'permission' in item && item.permission ? (
                        <PermissionGate 
                          permission={item.permission as any} 
                          resourceType={item.resourceType || ""}
                        >
                          {menuContent}
                        </PermissionGate>
                      ) : (
                        menuContent
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}