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
  TrendingUp
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
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            <Home className="h-4 w-4 mr-2" />
            {!collapsed && "PrepFox"}
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
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
            {!collapsed && "Tools"}
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
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
            {!collapsed && "Shopify"}
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
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
            {!collapsed && "Settings"}
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
                      <item.icon className="h-4 w-4" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span>{item.title}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      )}
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