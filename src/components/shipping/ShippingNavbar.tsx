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
            <div className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
              {productMenuItems.map((item) => (
                <NavigationMenuLink asChild key={item.title}>
                  <Link
                    to={item.href}
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <div className="text-sm font-medium leading-none">{item.title}</div>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent data-[state=open]:bg-accent/50">
            Solutions
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
              {solutionsMenuItems.map((item) => (
                <NavigationMenuLink asChild key={item.title}>
                  <Link
                    to={item.href}
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <div className="text-sm font-medium leading-none">{item.title}</div>
                    </div>
                    <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                </NavigationMenuLink>
              ))}
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