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

const servicesMenuItems = [
  {
    title: "Receiving",
    description: "Professional inventory receiving and inspection services",
    href: "/fulfillment/services/receiving"
  },
  {
    title: "Storage",
    description: "Secure warehouse storage with real-time inventory tracking",
    href: "/fulfillment/services/storage"
  },
  {
    title: "Pick & Pack",
    description: "Fast and accurate order fulfillment operations",
    href: "/fulfillment/services/pick-pack"
  },
  {
    title: "Shipping Integration",
    description: "Multi-carrier shipping with discounted rates",
    href: "/fulfillment/services/shipping"
  }
];

const solutionsMenuItems = [
  {
    title: "FBA Prep",
    description: "Professional Amazon FBA preparation services",
    href: "/fulfillment/solutions/fba-prep"
  },
  {
    title: "3PL Services",
    description: "Complete third-party logistics solutions",
    href: "/fulfillment/solutions/3pl"
  },
  {
    title: "Dropshipping",
    description: "Streamlined dropshipping fulfillment operations",
    href: "/fulfillment/solutions/dropshipping"
  },
  {
    title: "Private Label",
    description: "Custom fulfillment for private label brands",
    href: "/fulfillment/solutions/private-label"
  }
];

export function FulfillmentNavbar() {
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
            <Link to="/fulfillment-landing" className="font-bold text-xl text-primary">
              PrepFox Fulfillment
            </Link>
            
            <NavigationMenu className="ml-10 hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Services</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                      {servicesMenuItems.map((item) => (
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
                  <Link to="/fulfillment/features" className={navigationMenuTriggerStyle()}>
                    Features
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/fulfillment/pricing" className={navigationMenuTriggerStyle()}>
                    Pricing
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/fulfillment-dashboard">Dashboard</Link>
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