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

const productMenuItems = [
  {
    title: "AI Repricer",
    description: "Intelligent pricing automation and competitor tracking",
    href: "/repricing/ai-repricing"
  },
  {
    title: "Business Repricing",
    description: "Enterprise-grade repricing for growing businesses",
    href: "/repricing/business-repricing"
  },
  {
    title: "Strategy Automation",
    description: "Create and manage advanced repricing strategies",
    href: "/repricing/strategy-automation"
  },
  {
    title: "Analytics & Reporting",
    description: "Track performance metrics and optimize your business",
    href: "/repricing/analytics"
  }
];

const solutionsMenuItems = [
  {
    title: "FBA Sellers",
    description: "Maximize your profits on Amazon FBA",
    href: "/repricing/solutions/fba"
  },
  {
    title: "Retail Arbitrage",
    description: "Win more Buy Boxes with advanced repricing",
    href: "/repricing/solutions/retail-arbitrage"
  },
  {
    title: "Private Label",
    description: "Optimize pricing for your own brand products",
    href: "/repricing/solutions/private-label"
  },
  {
    title: "Dropshippers",
    description: "Stay competitive with automated repricing",
    href: "/repricing/solutions/dropshippers"
  }
];

export function RepricingNavbar() {
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
            <Link to="/repricing-landing" className="font-bold text-xl text-primary">
              PrepFox Repricer
            </Link>
            
            <NavigationMenu className="ml-10 hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                      {productMenuItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                {item.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                      {solutionsMenuItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                {item.title}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/repricing/features" className={navigationMenuTriggerStyle()}>
                    Features
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/repricing/pricing" className={navigationMenuTriggerStyle()}>
                    Pricing
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/repricing">Dashboard</Link>
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