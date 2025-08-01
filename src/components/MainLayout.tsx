import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import {
  Truck,
  Package,
  TrendingUp,
  Target,
  BarChart3,
  Zap,
  Layers,
  Shield,
  Brain,
  DollarSign,
  Store,
  Globe,
  Bot,
  Settings,
  ShoppingCart,
  Warehouse,
  Menu,
} from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Shipping menu items
  const shippingMenuItems = [
    {
      title: "Order Management",
      href: "/shipping-features",
      description: "Centralized order processing from all channels",
      icon: ShoppingCart,
    },
    {
      title: "Multi-Carrier Shipping",
      href: "/shipping-features",
      description: "Compare rates from 50+ carriers instantly",
      icon: Truck,
    },
    {
      title: "Inventory Sync",
      href: "/shipping-features",
      description: "Real-time inventory across all platforms",
      icon: Package,
    },
    {
      title: "Shipping Analytics",
      href: "/shipping-features",
      description: "Track performance and optimize costs",
      icon: BarChart3,
    },
  ];

  const shippingSolutionsItems = [
    {
      title: "E-commerce Sellers",
      href: "/shipping-features",
      description: "Streamline your online store shipping",
      icon: Store,
    },
    {
      title: "Amazon FBA Sellers",
      href: "/shipping-features",
      description: "Optimize your FBA prep and shipping",
      icon: Warehouse,
    },
    {
      title: "Dropshippers",
      href: "/shipping-features",
      description: "Automate dropshipping fulfillment",
      icon: Globe,
    },
    {
      title: "3PL Providers",
      href: "/shipping-features",
      description: "Scale your fulfillment operations",
      icon: Layers,
    },
  ];

  // Repricing menu items
  const repricingMenuItems = [
    {
      title: "AI Repricer",
      href: "/repricing/features",
      description: "Intelligent pricing with machine learning algorithms",
      icon: Brain,
    },
    {
      title: "Business Repricing",
      href: "/repricing/features",
      description: "Advanced repricing strategies for enterprise sellers",
      icon: TrendingUp,
    },
    {
      title: "Strategy Automation",
      href: "/repricing/features",
      description: "Automated rule-based pricing optimization",
      icon: Target,
    },
    {
      title: "Analytics Dashboard",
      href: "/repricing/features",
      description: "Real-time insights and performance metrics",
      icon: BarChart3,
    },
  ];

  const repricingSolutionsItems = [
    {
      title: "FBA Sellers",
      href: "/repricing/features",
      description: "Optimize Buy Box winning strategies",
      icon: Store,
    },
    {
      title: "Retail Arbitrage",
      href: "/repricing/features",
      description: "Maximize margins on resale products",
      icon: DollarSign,
    },
    {
      title: "Private Label",
      href: "/repricing/features",
      description: "Protect brand pricing and market position",
      icon: Layers,
    },
    {
      title: "Dropshippers",
      href: "/repricing/features",
      description: "Competitive pricing for dropshipping business",
      icon: Globe,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? "shadow-sm" : ""
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">PrepFox</span>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground bg-transparent hover:bg-accent/50">
                  Shipping
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] min-h-[400px] p-6 bg-background border rounded-lg shadow-lg">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Product</h4>
                        <div className="space-y-3">
                          {shippingMenuItems.map((item) => (
                            <Link
                              key={item.title}
                              to={item.href}
                              className="block p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <item.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-foreground">{item.title}</h5>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Solutions</h4>
                        <div className="space-y-3">
                          {shippingSolutionsItems.map((item) => (
                            <Link
                              key={item.title}
                              to={item.href}
                              className="block p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <item.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-foreground">{item.title}</h5>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Quick Links</h4>
                        <div className="space-y-2">
                          <Link to="/shipping-features" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Features</Link>
                          <Link to="/shipping-pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Pricing</Link>
                          <Link to="/shipping" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Dashboard</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground bg-transparent hover:bg-accent/50">
                  Repricing
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[800px] min-h-[400px] p-6 bg-background border rounded-lg shadow-lg">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Product</h4>
                        <div className="space-y-3">
                          {repricingMenuItems.map((item) => (
                            <Link
                              key={item.title}
                              to={item.href}
                              className="block p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <item.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-foreground">{item.title}</h5>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Solutions</h4>
                        <div className="space-y-3">
                          {repricingSolutionsItems.map((item) => (
                            <Link
                              key={item.title}
                              to={item.href}
                              className="block p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                            >
                              <div className="flex items-start space-x-3">
                                <div className="p-1 rounded bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                  <item.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-foreground">{item.title}</h5>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Quick Links</h4>
                        <div className="space-y-2">
                          <Link to="/repricing/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Features</Link>
                          <Link to="/repricing/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Pricing</Link>
                          <Link to="/repricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Dashboard</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground bg-transparent hover:bg-accent/50">
                  Fulfillment
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[600px] min-h-[300px] p-6 bg-background border rounded-lg shadow-lg">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Services</h4>
                        <div className="space-y-2">
                          <Link to="/fulfillment/services/receiving" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Receiving</Link>
                          <Link to="/fulfillment/services/storage" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Storage</Link>
                          <Link to="/fulfillment/services/pick-pack" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Pick & Pack</Link>
                          <Link to="/fulfillment/services/shipping-integration" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Shipping Integration</Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Quick Links</h4>
                        <div className="space-y-2">
                          <Link to="/fulfillment/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Features</Link>
                          <Link to="/fulfillment/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Pricing</Link>
                          <Link to="/fulfillment-dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Dashboard</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground bg-transparent hover:bg-accent/50">
                  Product Management
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[600px] min-h-[300px] p-6 bg-background border rounded-lg shadow-lg">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Features</h4>
                        <div className="space-y-2">
                          <Link to="/product-management/features/ai-optimization" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">AI Optimization</Link>
                          <Link to="/product-management/features/bulk-editing" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Bulk Editing</Link>
                          <Link to="/product-management/features/multi-channel-sync" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Multi-Channel Sync</Link>
                          <Link to="/product-management/features/quality-control" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Quality Control</Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-3">Quick Links</h4>
                        <div className="space-y-2">
                          <Link to="/product-management/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Features</Link>
                          <Link to="/product-management/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Pricing</Link>
                          <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors block">Dashboard</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/pricing"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Pricing
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/dashboard"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Dashboard
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="relative z-10 border-2 border-primary/20">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] z-[100]">
              <div className="flex flex-col space-y-4 mt-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-left">Shipping</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Product</div>
                        {shippingMenuItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <item.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        ))}
                        <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Solutions</div>
                        {shippingSolutionsItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <item.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="repricing">
                    <AccordionTrigger className="text-left">Repricing</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Product</div>
                        {repricingMenuItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <item.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        ))}
                        <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Solutions</div>
                        {repricingSolutionsItems.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                          >
                            <item.icon className="h-4 w-4 text-primary" />
                            <span className="text-sm">{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="fulfillment">
                    <AccordionTrigger className="text-left">Fulfillment</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Services</div>
                        <Link to="/fulfillment/services/receiving" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <Warehouse className="h-4 w-4 text-primary" />
                          <span className="text-sm">Receiving</span>
                        </Link>
                        <Link to="/fulfillment/services/storage" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="text-sm">Storage</span>
                        </Link>
                        <Link to="/fulfillment/services/pick-pack" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <ShoppingCart className="h-4 w-4 text-primary" />
                          <span className="text-sm">Pick & Pack</span>
                        </Link>
                        <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Quick Links</div>
                        <Link to="/fulfillment/features" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <span className="text-sm">Features</span>
                        </Link>
                        <Link to="/fulfillment/pricing" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <span className="text-sm">Pricing</span>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="product-management">
                    <AccordionTrigger className="text-left">Product Management</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Features</div>
                        <Link to="/product-management/features/ai-optimization" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <Brain className="h-4 w-4 text-primary" />
                          <span className="text-sm">AI Optimization</span>
                        </Link>
                        <Link to="/product-management/features/bulk-editing" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <Settings className="h-4 w-4 text-primary" />
                          <span className="text-sm">Bulk Editing</span>
                        </Link>
                        <Link to="/product-management/features/multi-channel-sync" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="text-sm">Multi-Channel Sync</span>
                        </Link>
                        <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Quick Links</div>
                        <Link to="/product-management/features" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <span className="text-sm">Features</span>
                        </Link>
                        <Link to="/product-management/pricing" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                          <span className="text-sm">Pricing</span>
                        </Link>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="space-y-2">
                  <Link to="/features" className="block p-2 rounded-lg hover:bg-accent/50 transition-colors text-foreground">
                    Features
                  </Link>
                  <Link to="/pricing" className="block p-2 rounded-lg hover:bg-accent/50 transition-colors text-foreground">
                    Pricing
                  </Link>
                  <Link to="/dashboard" className="block p-2 rounded-lg hover:bg-accent/50 transition-colors text-foreground">
                    Dashboard
                  </Link>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <Link to="/auth" className="block p-2 rounded-lg hover:bg-accent/50 transition-colors text-muted-foreground">
                    Sign In
                  </Link>
                  <Button asChild className="w-full">
                    <Link to="/auth">Sign Up</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Button asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}
    </div>
  );
}