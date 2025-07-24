import { useState, useEffect } from "react";
import { 
  Home, 
  Package, 
  BarChart, 
  Settings, 
  ShoppingCart, 
  Truck, 
  RefreshCw,
  Store,
  Shield,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useSessionContext } from '@supabase/auth-helpers-react';

interface Store {
  id: string;
  store_name: string;
  platform: string;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session } = useSessionContext();
  const [stores, setStores] = useState<Store[]>([]);
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const currentPath = location.pathname;
  
  useEffect(() => {
    if (session?.user?.id) {
      fetchStores();
    }
  }, [session?.user?.id]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('store_configurations')
        .select('id, store_name, platform')
        .eq('user_id', session?.user?.id)
        .eq('is_active', true);
      
      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const menuItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Analytics", url: "/analytics", icon: BarChart },
    { title: "Repricing", url: "/repricing", icon: RefreshCw },
    { title: "Shipping", url: "/shipping", icon: Truck },
    { title: "Settings", url: "/settings", icon: Settings },
    { title: "Admin", url: "/admin", icon: Shield },
  ];

  const isActive = (path: string) => currentPath === path;
  const isProductsActive = currentPath === '/products' || currentPath.startsWith('/products');
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Products section with store submenu */}
              <SidebarMenuItem>
                <Collapsible 
                  open={isProductsOpen} 
                  onOpenChange={setIsProductsOpen}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className={isProductsActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"}>
                      <Package className="mr-2 h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span>Products</span>
                          {isProductsOpen ? (
                            <ChevronDown className="ml-auto h-4 w-4" />
                          ) : (
                            <ChevronRight className="ml-auto h-4 w-4" />
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <NavLink 
                              to="/products" 
                              className={({ isActive }) => 
                                isActive && !searchParams.get('store') 
                                  ? "bg-muted text-primary font-medium" 
                                  : "hover:bg-muted/50"
                              }
                            >
                              <Store className="mr-2 h-4 w-4" />
                              All Stores
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        
                        {stores.map((store) => (
                          <SidebarMenuSubItem key={store.id}>
                            <SidebarMenuSubButton asChild>
                              <NavLink 
                                to={`/products?store=${store.id}`}
                                className={({ isActive }) => 
                                  isActive && searchParams.get('store') === store.id
                                    ? "bg-muted text-primary font-medium" 
                                    : "hover:bg-muted/50"
                                }
                              >
                                <Store className="mr-2 h-4 w-4" />
                                {store.store_name}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}