import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  Package, 
  TrendingUp, 
  Zap, 
  Globe, 
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  Target,
  DollarSign,
  Warehouse,
  ShoppingCart,
  Play,
  RefreshCw,
  Shield,
  Clock,
  Printer,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

const ShippingLanding = () => {
  const shippingFeatures = [
    {
      icon: ShoppingCart,
      title: "Order Management",
      description: "Consolidate orders from multiple sales channels into one unified dashboard. Never miss an order again.",
      benefits: ["Multi-channel sync", "Real-time updates", "Bulk processing"]
    },
    {
      icon: Package,
      title: "Inventory Management", 
      description: "Keep inventory synchronized across all platforms automatically. Prevent overselling with real-time stock updates.",
      benefits: ["Auto-sync inventory", "Low stock alerts", "Multi-location support"]
    },
    {
      icon: Zap,
      title: "Shipping Automation",
      description: "Set smart shipping rules and automate your entire fulfillment process. Process hundreds of orders in minutes.",
      benefits: ["Smart rules engine", "Batch processing", "Auto-carrier selection"]
    },
    {
      icon: Truck,
      title: "Multi-Carrier Shipping",
      description: "Compare rates and ship with UPS, FedEx, USPS, DHL, and 50+ carriers. Always get the best rates.",
      benefits: ["50+ carriers", "Rate comparison", "Discounted rates"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting", 
      description: "Get deep insights into your shipping performance, costs, and delivery times with powerful analytics.",
      benefits: ["Cost analytics", "Performance tracking", "Custom reports"]
    },
    {
      icon: RefreshCw,
      title: "Returns Management",
      description: "Streamline your returns process with automated return labels and customer self-service portals.",
      benefits: ["Auto return labels", "Self-service portal", "Return analytics"]
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      shipments: "10 shipments/month",
      popular: false,
      features: [
        "Up to 10 shipments/month",
        "Basic order management", 
        "Single store connection",
        "Standard support",
        "Basic reporting"
      ]
    },
    {
      name: "Starter", 
      price: "$13.49",
      originalPrice: "$14.99",
      shipments: "50 shipments/month",
      popular: true,
      features: [
        "Up to 50 shipments/month",
        "Multi-channel order sync",
        "Shipping automation rules",
        "All major carriers",
        "Priority support",
        "Advanced analytics"
      ]
    },
    {
      name: "Standard",
      price: "$26.99", 
      originalPrice: "$29.99",
      shipments: "500 shipments/month",
      popular: false,
      features: [
        "Up to 500 shipments/month",
        "Advanced automation",
        "Inventory management",
        "Returns management", 
        "API access",
        "Custom integrations"
      ]
    },
    {
      name: "Premium",
      price: "$314.99",
      originalPrice: "$349.99", 
      shipments: "Unlimited shipments",
      popular: false,
      features: [
        "Unlimited shipments",
        "White-label solution",
        "Dedicated account manager",
        "Custom reporting",
        "Priority carrier rates",
        "24/7 phone support"
      ]
    }
  ];

  const integrations = [
    "Shopify", "Amazon", "eBay", "WooCommerce", "Etsy", "BigCommerce", 
    "Walmart", "Magento", "Squarespace", "WIX", "UPS", "FedEx", "USPS", "DHL"
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      company: "TechGadgets Pro",
      role: "Operations Manager", 
      content: "PrepFox Ship saved us 40% on shipping costs and cut our processing time by 75%. The automation is incredible.",
      rating: 5,
      volume: "2,000+ orders/month"
    },
    {
      name: "David Chen",
      company: "Fashion Forward LLC",
      role: "CEO",
      content: "Switched from ShipStation and never looked back. Better features, better pricing, better support.",
      rating: 5,
      volume: "5,000+ orders/month"  
    },
    {
      name: "Maria Rodriguez",
      company: "Home Essentials Co",
      role: "Fulfillment Director",
      content: "The multi-carrier comparison alone pays for itself. We're getting the best rates every single time.",
      rating: 5,
      volume: "10,000+ orders/month"
    }
  ];

  const stats = [
    { value: "10M+", label: "Orders Shipped" },
    { value: "40%", label: "Average Savings" },
    { value: "50+", label: "Shipping Carriers" },
    { value: "99.9%", label: "Uptime" }
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
            <Link to="/shipping-features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/shipping-pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/shipping-integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link>
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
            🚀 ShipStation Alternative - 40% Less Cost, 10x Better Features
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Smart Shipping </span>
            Platform That Scales
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Ship smarter, not harder. PrepFox Ship combines powerful automation, multi-carrier shipping, 
            and intelligent analytics to save you time and money on every shipment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial - 10 Shipments
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5">
              Compare to ShipStation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Free forever plan • No credit card required • Switch in 15 minutes
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Ship Like a Pro
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From order management to delivery tracking, PrepFox Ship handles every aspect 
              of your shipping workflow with enterprise-grade automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shippingFeatures.map((feature, index) => (
              <Card key={index} className="prep-fox-card hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-primary p-3 rounded-lg shadow-glow group-hover:shadow-progress transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground mb-3 text-sm leading-relaxed">{feature.description}</p>
                      <div className="space-y-1">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                            <span className="text-xs text-foreground">{benefit}</span>
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

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Pay 10% less than ShipStation for 10x better features
            </p>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              💰 Save $420+ per year vs ShipStation
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`prep-fox-card relative ${plan.popular ? 'ring-2 ring-primary shadow-glow' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      {plan.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through ml-2">{plan.originalPrice}</span>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">{plan.shipments}</div>
                    </div>
                    <Button className={`w-full mb-4 ${plan.popular ? 'bg-gradient-primary hover:shadow-glow' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      {plan.name === 'Free' ? 'Start Free' : 'Start Trial'}
                    </Button>
                    <div className="space-y-2 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by 10,000+ Shipping Pros
            </h2>
            <p className="text-lg text-muted-foreground">
              See why businesses switch from ShipStation to PrepFox Ship
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="prep-fox-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                    <Badge variant="secondary" className="mt-2 text-xs">{testimonial.volume}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Connect Everything You Use
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Seamlessly integrate with all major e-commerce platforms and shipping carriers.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {integrations.map((integration, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {integration}
              </Badge>
            ))}
          </div>

          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
            <Link to="/shipping-integrations">
              View All Integrations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Ship Smarter?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join 10,000+ businesses who've reduced shipping costs by 40% with PrepFox Ship.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Talk to Sales
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            Setup in 15 minutes • Free forever plan • No contracts
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

export default ShippingLanding;