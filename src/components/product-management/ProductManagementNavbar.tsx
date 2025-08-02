import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const featuresMenuItems = [
  {
    title: "AI Optimization",
    description: "Intelligent product optimization with machine learning",
    href: "/product-management/features/ai-optimization"
  },
  {
    title: "Bulk Editing",
    description: "Efficient bulk editing tools for large inventories",
    href: "/product-management/features/bulk-editing"
  },
  {
    title: "Multi-Channel Sync",
    description: "Synchronize products across all sales channels",
    href: "/product-management/features/sync"
  },
  {
    title: "Analytics",
    description: "Deep insights into product performance and trends",
    href: "/product-management/features/analytics"
  }
];

const solutionsMenuItems = [
  {
    title: "E-commerce Sellers",
    description: "Optimize your online store product catalogs",
    href: "/product-management/solutions/ecommerce"
  },
  {
    title: "Amazon FBA",
    description: "Specialized tools for Amazon FBA sellers",
    href: "/product-management/solutions/fba"
  },
  {
    title: "Marketplace Sellers",
    description: "Multi-marketplace product management solutions",
    href: "/product-management/solutions/marketplace"
  },
  {
    title: "Enterprise",
    description: "Scalable solutions for large product catalogs",
    href: "/product-management/solutions/enterprise"
  }
];

export function ProductManagementNavbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  return (
    <div className={cn(
      "w-full z-50 transition-all duration-200",
      isScrolled ? "sticky top-0 border-b shadow-sm bg-background/95 backdrop-blur-sm" : ""
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/product-management-landing" className="font-bold text-xl text-primary">
              PrepFox Product Management
            </Link>
            
            <NavigationMenu className="ml-10 hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] p-6 bg-popover border shadow-xl rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                          PRODUCT MANAGEMENT FEATURES
                        </h4>
                        {featuresMenuItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-accent group transition-all duration-200"
                          >
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
                  <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] p-6 bg-popover border shadow-xl rounded-lg">
                      <div className="space-y-1">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                          BUSINESS SOLUTIONS
                        </h4>
                        {solutionsMenuItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-accent group transition-all duration-200"
                          >
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
                  <Link to="/product-management/features" className={navigationMenuTriggerStyle()}>
                    Features
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/product-management/pricing" className={navigationMenuTriggerStyle()}>
                    Pricing
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/products">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}