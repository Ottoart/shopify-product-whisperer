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
                      <div className="w-[800px] p-8 bg-popover border shadow-xl rounded-lg">
                        <div className="grid grid-cols-3 gap-8">
                          <div className="col-span-2">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                              FULFILLMENT SERVICES
                            </h4>
                            <div className="grid grid-cols-2 gap-1">
                              {servicesMenuItems.map((item) => (
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
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                              QUICK ACCESS
                            </h4>
                            <div className="space-y-1">
                              <Link to="/fulfillment/features" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                                Features
                              </Link>
                              <Link to="/fulfillment/pricing" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                                Pricing
                              </Link>
                              <Link to="/fulfillment-quote" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                                Get Quote
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[700px] p-6 bg-popover border shadow-xl rounded-lg">
                        <div className="space-y-1">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                            FULFILLMENT PRODUCTS
                          </h4>
                          <div className="grid grid-cols-2 gap-1">
                            {productsMenuItems.map((item) => (
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
                      </div>
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