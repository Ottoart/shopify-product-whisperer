import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Package, Truck, Settings, BarChart3, Zap, ShoppingCart, Store, Box } from "lucide-react";

const productMenuItems = [
  {
    title: "Order Management",
    href: "/shipping-features",
    description: "Centralize and automate order processing across all channels",
    icon: Package,
  },
  {
    title: "Multi-Carrier Shipping",
    href: "/shipping-features",
    description: "Compare rates and ship with UPS, Canada Post, and more",
    icon: Truck,
  },
  {
    title: "Shipping Automation",
    href: "/shipping-features",
    description: "Automated label generation and fulfillment workflows",
    icon: Zap,
  },
  {
    title: "Inventory Sync",
    href: "/shipping-features",
    description: "Real-time inventory synchronization across platforms",
    icon: Box,
  },
];

const solutionsMenuItems = [
  {
    title: "E-commerce Sellers",
    href: "/shipping-features",
    description: "Complete shipping solution for online stores",
    icon: ShoppingCart,
  },
  {
    title: "Amazon FBA Sellers",
    href: "/shipping-features", 
    description: "Optimize your FBA shipping and prep operations",
    icon: Store,
  },
  {
    title: "Shopify Merchants",
    href: "/shipping-features",
    description: "Native Shopify integration for seamless shipping",
    icon: Settings,
  },
  {
    title: "Multi-Channel Retailers",
    href: "/shipping-features",
    description: "Unified shipping across all sales channels",
    icon: BarChart3,
  },
];

export function ShippingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-accent/50">
            Product
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[800px] p-8 bg-popover border shadow-xl rounded-lg">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                    CAPABILITIES
                  </h4>
                  <div className="space-y-1">
                    {productMenuItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        className="flex items-start gap-3 p-3 rounded-md hover:bg-accent group transition-all duration-200"
                      >
                        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                    SOLUTIONS
                  </h4>
                  <div className="space-y-1">
                    {solutionsMenuItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.href}
                        className="flex items-start gap-3 p-3 rounded-md hover:bg-accent group transition-all duration-200"
                      >
                        <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                    RESOURCES
                  </h4>
                  <div className="space-y-1">
                    <Link to="/shipping-features" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                      <BarChart3 className="h-3 w-3" />
                      Features Overview
                    </Link>
                    <Link to="/shipping-pricing" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                      <Package className="h-3 w-3" />
                      Pricing Plans
                    </Link>
                    <Link to="/shipping-integrations" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                      <Zap className="h-3 w-3" />
                      Integrations
                    </Link>
                    <Link to="/shipping-resources" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                      <Settings className="h-3 w-3" />
                      Resources
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-accent/50">
            Solutions
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[600px] p-6 bg-popover border shadow-xl rounded-lg">
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                  SOLUTIONS
                </h4>
                {solutionsMenuItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className="flex items-start gap-3 p-3 rounded-md hover:bg-accent group transition-all duration-200"
                  >
                    <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/shipping-features" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            Features
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/shipping-pricing" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            Pricing
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link to="/shipping" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
            Dashboard
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}