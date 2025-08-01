import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BreadcrumbNavigation from "@/components/ui/breadcrumb-navigation";
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
    title: "FBA Prep",
    description: "Professional Amazon FBA preparation services",
    href: "/fulfillment/services/fba-prep"
  },
  {
    title: "Amazon SFP",
    description: "Seller Fulfilled Prime logistics solutions",
    href: "/fulfillment/services/amazon-sfp"
  },
  {
    title: "FBA Returns",
    description: "Comprehensive Amazon FBA returns processing",
    href: "/fulfillment/services/amazon-fba-returns"
  },
  {
    title: "DTC Fulfillment",
    description: "Direct-to-consumer order fulfillment",
    href: "/fulfillment/services/dtc-fulfillment"
  },
  {
    title: "eCommerce Fulfillment",
    description: "Multi-channel ecommerce order processing",
    href: "/fulfillment/services/ecommerce-fulfillment"
  },
  {
    title: "B2B Fulfillment",
    description: "Business-to-business fulfillment solutions",
    href: "/fulfillment/services/b2b-fulfillment"
  },
  {
    title: "Omni-Channel 3PL",
    description: "Unified multi-channel logistics",
    href: "/fulfillment/services/omni-channel-3pl"
  },
  {
    title: "International Freight",
    description: "Global freight forwarding services",
    href: "/fulfillment/services/international-freight"
  },
  {
    title: "Subscription Fulfillment",
    description: "Recurring subscription box logistics",
    href: "/fulfillment/services/subscription-fulfillment"
  }
];

const productsMenuItems = [
  {
    title: "Prep Software",
    description: "All-in-one FBA management platform",
    href: "/fulfillment/products/prep-software"
  },
  {
    title: "Middle Mile Logistics",
    description: "Fast-track Amazon inbound shipping",
    href: "/fulfillment/products/middle-mile-logistics"
  },
  {
    title: "Section 321",
    description: "Duty-free cross-border fulfillment",
    href: "/fulfillment/products/section-321"
  },
  {
    title: "Drip Feeding",
    description: "Strategic FBA inventory scheduling",
    href: "/fulfillment/products/drip-feeding"
  },
  {
    title: "Wholesale Prep",
    description: "Enterprise-scale preparation services",
    href: "/fulfillment/products/wholesale-prep"
  },
  {
    title: "Global Marketplaces",
    description: "Multi-marketplace expansion platform",
    href: "/fulfillment/products/global-marketplaces"
  },
  {
    title: "Market Expansion",
    description: "Strategic marketplace growth services",
    href: "/fulfillment/products/market-expansion"
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
    <>
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
                      <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-3">
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
                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                        {productsMenuItems.map((item) => (
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
                    <NavigationMenuTrigger>Pricing</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:grid-cols-1">
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/fulfillment/pricing"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Pricing Overview
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Simple, transparent pricing plans
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <li>
                          <NavigationMenuLink asChild>
                            <Link
                              to="/fulfillment/pricing-detailed"
                              className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">
                                Detailed Pricing
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Complete pricing breakdown with calculator
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
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
      
      {/* Breadcrumb Navigation */}
      {location.pathname !== '/fulfillment-landing' && location.pathname !== '/' && (
        <div className="bg-muted/30 border-b">
          <div className="container mx-auto px-4 py-3">
            <BreadcrumbNavigation />
          </div>
        </div>
      )}
    </>
  );
}