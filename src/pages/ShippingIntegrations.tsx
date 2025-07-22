import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  CheckCircle,
  ArrowRight,
  Users,
  Globe,
  Zap,
  Store,
  ShoppingCart,
  Package,
  Smartphone,
  Code,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const ShippingIntegrations = () => {
  const ecommercePlatforms = [
    {
      name: "Shopify",
      logo: "🛍️",
      description: "Complete Shopify integration with real-time order sync",
      features: ["Real-time order sync", "Inventory management", "Auto-fulfillment", "Customer notifications"],
      popular: true
    },
    {
      name: "Amazon",
      logo: "📦",
      description: "Seamless Amazon Seller Central integration",
      features: ["FBA & FBM orders", "Multi-marketplace", "Inventory sync", "Performance tracking"],
      popular: true
    },
    {
      name: "eBay",
      logo: "🏪",
      description: "Complete eBay store management and fulfillment",
      features: ["Multi-store support", "Best Offer handling", "Inventory sync", "Auto-feedback"],
      popular: true
    },
    {
      name: "WooCommerce",
      logo: "🌐",
      description: "WordPress/WooCommerce plugin for seamless integration",
      features: ["Direct plugin", "Order automation", "Stock sync", "Custom fields"],
      popular: false
    },
    {
      name: "Etsy",
      logo: "🎨",
      description: "Artisan-friendly Etsy shop integration",
      features: ["Handmade workflows", "Custom packaging", "Variation handling", "Shop policies"],
      popular: false
    },
    {
      name: "BigCommerce",
      logo: "🏢",
      description: "Enterprise-grade BigCommerce integration",
      features: ["API integration", "Bulk operations", "Advanced automation", "Custom apps"],
      popular: false
    },
    {
      name: "Walmart",
      logo: "⭐",
      description: "Walmart Marketplace seller integration", 
      features: ["Marketplace orders", "Inventory sync", "Performance metrics", "Compliance tools"],
      popular: false
    },
    {
      name: "Magento",
      logo: "🔶",
      description: "Flexible Magento Commerce integration",
      features: ["Multi-store", "B2B features", "Custom attributes", "Advanced rules"],
      popular: false
    }
  ];

  const shippingCarriers = [
    {
      name: "UPS",
      logo: "🚚",
      description: "Full UPS integration with discounted rates",
      features: ["Up to 89% off rates", "Ground & Air services", "International shipping", "Tracking & returns"],
      rates: "Up to 89% off"
    },
    {
      name: "FedEx",
      logo: "✈️", 
      description: "Complete FedEx services and rate shopping",
      features: ["Express & Ground", "International", "Freight services", "Advanced tracking"],
      rates: "Up to 85% off"
    },
    {
      name: "USPS",
      logo: "📮",
      description: "US Postal Service with commercial pricing",
      features: ["Priority & Express", "First-Class", "International", "PO Box delivery"],
      rates: "Commercial Plus"
    },
    {
      name: "DHL",
      logo: "🌍",
      description: "Global DHL Express integration",
      features: ["International express", "Same-day delivery", "Logistics solutions", "Customs handling"],
      rates: "Negotiated rates"
    },
    {
      name: "Canada Post",
      logo: "🍁",
      description: "Complete Canada Post integration",
      features: ["Domestic & international", "Expedited services", "Signature services", "Tracking"],
      rates: "Commercial rates"
    },
    {
      name: "OnTrac",
      logo: "🌟",
      description: "West Coast regional carrier",
      features: ["Ground delivery", "Regional coverage", "Signature services", "Residential delivery"],
      rates: "Regional rates"
    }
  ];

  const businessTools = [
    {
      name: "QuickBooks",
      logo: "💼",
      description: "Seamless accounting integration",
      features: ["Automatic transaction sync", "Tax reporting", "Invoice management", "Financial reporting"]
    },
    {
      name: "Xero",
      logo: "📊",
      description: "Cloud accounting integration",
      features: ["Real-time sync", "Multi-currency", "Bank reconciliation", "Financial insights"]
    },
    {
      name: "Slack",
      logo: "💬",
      description: "Team notifications and alerts",
      features: ["Order notifications", "Error alerts", "Team collaboration", "Custom channels"]
    },
    {
      name: "Zapier",
      logo: "⚡",
      description: "Connect with 1000+ apps via Zapier",
      features: ["Custom workflows", "Automated triggers", "Data sync", "Multi-step automation"]
    }
  ];

  const apiFeatures = [
    {
      icon: Code,
      title: "RESTful API",
      description: "Complete API access for custom integrations",
      features: ["Full CRUD operations", "Webhook support", "Rate limiting", "API documentation"]
    },
    {
      icon: Settings,
      title: "Custom Integrations",
      description: "Build custom integrations for your specific needs",
      features: ["SDK libraries", "Custom endpoints", "Data mapping", "Technical support"]
    },
    {
      icon: Zap,
      title: "Real-time Webhooks",
      description: "Get instant notifications for order events",
      features: ["Order status updates", "Shipment tracking", "Inventory changes", "Custom events"]
    }
  ];

  const integrationStats = [
    { value: "200+", label: "Total Integrations" },
    { value: "50+", label: "Shipping Carriers" },
    { value: "99.9%", label: "API Uptime" },
    { value: "15min", label: "Average Setup Time" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">PrepFox Ship</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/shipping-features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/shipping-pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/shipping-integrations" className="text-foreground font-medium">Integrations</Link>
            <Link to="/shipping-resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Button asChild className="bg-gradient-primary hover:shadow-glow transition-smooth">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🔗 200+ Integrations Available
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Connect
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Everything </span>
            You Use
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            PrepFox Ship integrates seamlessly with all major e-commerce platforms, 
            shipping carriers, and business tools. Get up and running in minutes.
          </p>

          <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
            View All Integrations
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto mt-12">
            {integrationStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* E-commerce Platforms */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              E-commerce Platforms
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect all your sales channels in one unified dashboard with real-time synchronization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ecommercePlatforms.map((platform, index) => (
              <Card key={index} className={`prep-fox-card hover:shadow-elegant transition-all duration-300 ${platform.popular ? 'ring-1 ring-primary/20' : ''}`}>
                {platform.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                    Popular
                  </Badge>
                )}
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{platform.logo}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{platform.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{platform.description}</p>
                  <div className="space-y-2">
                    {platform.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-xs text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping Carriers */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shipping Carriers
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare rates across 50+ carriers and get up to 89% off retail shipping rates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shippingCarriers.map((carrier, index) => (
              <Card key={index} className="prep-fox-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{carrier.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{carrier.name}</h3>
                        <Badge variant="secondary" className="text-xs">{carrier.rates}</Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{carrier.description}</p>
                      <div className="space-y-1">
                        {carrier.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="text-xs text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Business Tools */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Business Tools & Software
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your entire business workflow with integrated accounting, CRM, and productivity tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessTools.map((tool, index) => (
              <Card key={index} className="prep-fox-card hover:shadow-elegant transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{tool.logo}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{tool.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{tool.description}</p>
                  <div className="space-y-2">
                    {tool.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-xs text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API & Custom Integrations */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              API & Custom Integrations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build custom integrations or connect with any system using our robust API and webhook system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {apiFeatures.map((feature, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-8">
                  <div className="bg-gradient-primary p-3 rounded-lg shadow-glow w-fit mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-2 justify-center">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
              View API Documentation
              <Code className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Setup Process */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Setup in Minutes, Not Hours
            </h2>
            <p className="text-lg text-muted-foreground">
              Our simple setup process gets you connected and shipping in under 15 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Connect Stores", description: "Link your sales channels with one-click setup" },
              { step: "2", title: "Add Carriers", description: "Connect shipping carriers and get instant rates" },
              { step: "3", title: "Set Rules", description: "Configure automation rules for your workflow" },
              { step: "4", title: "Start Shipping", description: "Begin processing orders automatically" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <span className="font-bold">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Connect Everything?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join 10,000+ businesses who've streamlined their operations with PrepFox Ship's powerful integrations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Talk to Integration Expert
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            Setup in 15 minutes • All integrations included • Expert support available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground/5 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">PrepFox Ship</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/shipping-privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/shipping-terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/shipping-support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/shipping-contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 PrepFox Ship. All rights reserved. Ship smarter, not harder.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ShippingIntegrations;