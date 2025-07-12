import { useState } from "react";
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
  Calculator
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
  { title: "PrepFox Dashboard", url: "/dashboard", icon: TrendingUp, description: "Main analytics dashboard" },
  { title: "AI Learning Dashboard", url: "/ai-dashboard", icon: BarChart3, description: "AI insights and learning" },
];

const shopifyItems = [
  { title: "Shopify Integration", url: "/shopify-integration", icon: Zap, description: "Connect and manage Shopify" },
  { title: "Sync Status", url: "/sync-status", icon: Database, description: "Monitor sync operations" },
];

const toolItems = [
  { title: "Analytics", url: "/analytics", icon: TrendingUp, description: "View performance metrics" },
  { title: "Product Activity", url: "/activity", icon: Activity, description: "Track product changes" },
  { title: "Bulk Editor", url: "/bulk-editor", icon: FileText, description: "Edit multiple products" },
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

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50";

  return (
    <Sidebar
      className={`${collapsed ? "w-12" : "w-56"} transition-all duration-300 hover:w-56 group`}
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

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary">
            <Zap className="h-4 w-4 mr-2" />
            <span className={`${collapsed ? "group-hover:inline hidden" : "inline"} transition-all duration-300`}>
              Tools
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
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
              {shippingItems.map((item) => (
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