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
                <Link
                  to="/features"
                  className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  Features
                </Link>
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

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/auth"
              className="text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
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