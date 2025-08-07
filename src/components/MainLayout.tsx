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
  Box,
  HelpCircle,
  Users,
  BookOpen,
  Phone,
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

  // Fulfillment menu items
  const fulfillmentMenuItems = [
    {
      title: "FBA Prep",
      href: "/fulfillment/services/fba-prep",
      description: "Professional Amazon FBA preparation services",
      icon: Package,
    },
    {
      title: "3PL Fulfillment",
      href: "/fulfillment/services/fulfillment",
      description: "Complete order fulfillment solutions",
      icon: Warehouse,
    },
    {
      title: "Returns Processing",
      href: "/fulfillment/services/returns",
      description: "Comprehensive returns management",
      icon: Shield,
    },
    {
      title: "Inventory Storage",
      href: "/fulfillment/services/storage",
      description: "Secure and scalable inventory storage",
      icon: Box,
    },
  ];

  const fulfillmentSolutionsItems = [
    {
      title: "E-commerce Brands",
      href: "/fulfillment/solutions/ecommerce",
      description: "End-to-end fulfillment for online stores",
      icon: Store,
    },
    {
      title: "Amazon Sellers",
      href: "/fulfillment/solutions/amazon",
      description: "Specialized Amazon fulfillment services",
      icon: Layers,
    },
    {
      title: "Subscription Boxes",
      href: "/fulfillment/solutions/subscription",
      description: "Recurring subscription fulfillment",
      icon: Box,
    },
    {
      title: "B2B Distributors",
      href: "/fulfillment/solutions/b2b",
      description: "Bulk fulfillment for business customers",
      icon: Truck,
    },
  ];

  // Product Management menu items
  const productManagementMenuItems = [
    {
      title: "AI Optimization",
      href: "/product-management/features/ai-optimization",
      description: "Intelligent product optimization with machine learning",
      icon: Brain,
    },
    {
      title: "Bulk Editing",
      href: "/product-management/features/bulk-editing",
      description: "Efficient bulk editing tools for large inventories",
      icon: Settings,
    },
    {
      title: "Multi-Channel Sync",
      href: "/product-management/features/sync",
      description: "Synchronize products across all sales channels",
      icon: Globe,
    },
    {
      title: "Analytics Dashboard",
      href: "/product-management/features/analytics",
      description: "Deep insights into product performance and trends",
      icon: BarChart3,
    },
  ];

  const productManagementSolutionsItems = [
    {
      title: "E-commerce Sellers",
      href: "/product-management/solutions/ecommerce",
      description: "Optimize your online store product catalogs",
      icon: Store,
    },
    {
      title: "Amazon FBA",
      href: "/product-management/solutions/fba",
      description: "Specialized tools for Amazon FBA sellers",
      icon: Warehouse,
    },
    {
      title: "Marketplace Sellers",
      href: "/product-management/solutions/marketplace",
      description: "Multi-marketplace product management solutions",
      icon: Globe,
    },
    {
      title: "Enterprise",
      href: "/product-management/solutions/enterprise",
      description: "Scalable solutions for large product catalogs",
      icon: Layers,
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
                  <div className="w-[900px] p-8 bg-popover border shadow-xl rounded-lg">
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                          CAPABILITIES
                        </h4>
                        <div className="space-y-1">
                          {shippingMenuItems.map((item) => (
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
                          {shippingSolutionsItems.map((item) => (
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
                            <DollarSign className="h-3 w-3" />
                            Pricing Plans
                          </Link>
                          <Link to="/shipping" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Settings className="h-3 w-3" />
                            Dashboard
                          </Link>
                          <Link to="/shipping-integrations" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Zap className="h-3 w-3" />
                            Integrations
                          </Link>
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
                  <div className="w-[900px] p-8 bg-popover border shadow-xl rounded-lg">
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                          CAPABILITIES
                        </h4>
                        <div className="space-y-1">
                          {repricingMenuItems.map((item) => (
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
                          {repricingSolutionsItems.map((item) => (
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
                          <Link to="/repricing/features" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <BarChart3 className="h-3 w-3" />
                            Features Overview
                          </Link>
                          <Link to="/repricing/pricing" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <DollarSign className="h-3 w-3" />
                            Pricing Plans
                          </Link>
                          <Link to="/repricing" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Settings className="h-3 w-3" />
                            Dashboard
                          </Link>
                          <Link to="/strategies" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Target className="h-3 w-3" />
                            Strategies
                          </Link>
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
                  <div className="w-[900px] p-8 bg-popover border shadow-xl rounded-lg">
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                          CAPABILITIES
                        </h4>
                        <div className="space-y-1">
                          {fulfillmentMenuItems.map((item) => (
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
                          {fulfillmentSolutionsItems.map((item) => (
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
                          <Link to="/fulfillment/features" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <BarChart3 className="h-3 w-3" />
                            Features Overview
                          </Link>
                          <Link to="/fulfillment/pricing" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <DollarSign className="h-3 w-3" />
                            Pricing Plans
                          </Link>
                          <Link to="/fulfillment-dashboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Settings className="h-3 w-3" />
                            Dashboard
                          </Link>
                          <Link to="/fulfillment-quote" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Zap className="h-3 w-3" />
                            Get Quote
                          </Link>
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
                  <div className="w-[900px] p-8 bg-popover border shadow-xl rounded-lg">
                    <div className="grid grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border/50">
                          CAPABILITIES
                        </h4>
                        <div className="space-y-1">
                          {productManagementMenuItems.map((item) => (
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
                          {productManagementSolutionsItems.map((item) => (
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
                          <Link to="/product-management/features" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <BarChart3 className="h-3 w-3" />
                            Features Overview
                          </Link>
                          <Link to="/product-management/pricing" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <DollarSign className="h-3 w-3" />
                            Pricing Plans
                          </Link>
                          <Link to="/products" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Settings className="h-3 w-3" />
                            Dashboard
                          </Link>
                          <Link to="/bulk-editor" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                            <Zap className="h-3 w-3" />
                            Bulk Editor
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/store"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:from-primary/20 hover:to-secondary/20 hover:border-primary/40 hover:scale-105 focus:bg-accent focus:text-accent-foreground focus:outline-none"
                >
                  <Store className="mr-2 h-4 w-4" />
                  Store
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-foreground bg-transparent hover:bg-accent/50">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-6 bg-popover border shadow-xl rounded-lg">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pb-2 border-b border-border/50">
                        COMPANY
                      </h4>
                      <Link to="/about-us" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                        <Users className="h-3 w-3" />
                        About Us
                      </Link>
                      <Link to="#careers" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                        <Target className="h-3 w-3" />
                        Careers
                      </Link>
                      <Link to="#contact" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                        <Phone className="h-3 w-3" />
                        Contact Us
                      </Link>
                      <Link to="/privacy-policy" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                        <Shield className="h-3 w-3" />
                        Privacy Policy
                      </Link>
                      <div className="border-t mt-3 pt-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          RESOURCES
                        </h4>
                        <Link to="#documentation" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                          <BookOpen className="h-3 w-3" />
                          Documentation
                        </Link>
                        <Link to="#support" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                          <HelpCircle className="h-3 w-3" />
                          Support Center
                        </Link>
                        <Link to="#blog" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                          <Globe className="h-3 w-3" />
                          Blog
                        </Link>
                        <Link to="#api" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                          <Zap className="h-3 w-3" />
                          API Reference
                        </Link>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
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
                  <Link 
                    to="/store" 
                    className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:from-primary/20 hover:to-secondary/20 transition-all duration-200"
                  >
                    <Store className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">Store</span>
                  </Link>
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