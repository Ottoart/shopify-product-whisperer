import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FulfillmentNavbar } from "@/components/fulfillment/FulfillmentNavbar";
import { 
  Warehouse, 
  Package, 
  TrendingUp, 
  Zap, 
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  DollarSign,
  ShoppingCart,
  Play,
  RefreshCw,
  Shield,
  Clock,
  Settings,
  Target,
  MapPin,
  Boxes
} from "lucide-react";
import { Link } from "react-router-dom";

const FulfillmentLanding = () => {
  const fulfillmentFeatures = [
    {
      icon: Warehouse,
      title: "Warehouse Management",
      description: "Complete WMS with receiving, putaway, picking, and packing. Manage your 3PL operations with enterprise-grade tools.",
      benefits: ["Real-time inventory tracking", "Multi-location support", "Automated workflows"]
    },
    {
      icon: Package,
      title: "Order Fulfillment", 
      description: "End-to-end order processing from receipt to shipment. Integrated picking, packing, and shipping workflows.",
      benefits: ["Pick optimization", "Pack verification", "Shipping integration"]
    },
    {
      icon: Zap,
      title: "Prep Services",
      description: "Complete prep services for FBA, FBM, and marketplace fulfillment. Labeling, bundling, and custom prep work.",
      benefits: ["FBA prep", "Custom bundling", "Quality control"]
    },
    {
      icon: BarChart3,
      title: "Inventory Analytics", 
      description: "Deep insights into inventory performance, turnover, and forecasting. Make data-driven stocking decisions.",
      benefits: ["Turnover analysis", "Demand forecasting", "Performance metrics"]
    },
    {
      icon: RefreshCw,
      title: "Returns Processing",
      description: "Streamlined returns management with inspection, restocking, and refurbishment workflows.",
      benefits: ["Return inspection", "Automated restocking", "Refurbishment tracking"]
    },
    {
      icon: Target,
      title: "Quality Control",
      description: "Built-in QC processes with photo documentation, condition tracking, and quality assurance workflows.",
      benefits: ["Photo documentation", "Condition tracking", "QA workflows"]
    }
  ];

  const pricingPlans = [
    {
      name: "Receiving",
      price: "$0.50",
      unit: "per item",
      popular: false,
      features: [
        "Item receiving & inspection",
        "Photo documentation", 
        "Inventory putaway",
        "Real-time updates",
        "Condition tracking"
      ]
    },
    {
      name: "Storage", 
      price: "$0.75",
      unit: "per cubic foot/month",
      popular: true,
      features: [
        "Climate controlled storage",
        "Bin location tracking",
        "Insurance included",
        "Real-time inventory",
        "Multi-location support"
      ]
    },
    {
      name: "Pick & Pack",
      price: "$2.50", 
      unit: "per order",
      popular: false,
      features: [
        "Order picking",
        "Custom packaging",
        "Quality verification", 
        "Shipping integration",
        "Custom inserts"
      ]
    },
    {
      name: "Prep Services",
      price: "$0.75",
      unit: "per item", 
      popular: false,
      features: [
        "FBA prep & labeling",
        "Bundling services",
        "Polybagging",
        "Custom prep work",
        "Quality control"
      ]
    }
  ];

  const integrations = [
    "Shopify", "Amazon FBA", "eBay", "WooCommerce", "Etsy", "BigCommerce", 
    "Walmart", "3PL Central", "ShipStation", "UPS", "FedEx", "USPS"
  ];

  const testimonials = [
    {
      name: "Jennifer Adams",
      company: "Beauty Essentials Co",
      role: "Operations Director", 
      content: "PrepFox Fulfill transformed our 3PL operations. 50% faster processing and perfect inventory accuracy.",
      rating: 5,
      volume: "5,000+ orders/month"
    },
    {
      name: "Michael Torres",
      company: "Tech Accessories Plus",
      role: "CEO",
      content: "Best fulfillment pricing we've found. Transparent costs and exceptional service quality.",
      rating: 5,
      volume: "10,000+ items stored"  
    },
    {
      name: "Sarah Kim",
      company: "Home & Garden Direct",
      role: "Fulfillment Manager",
      content: "The prep services are outstanding. Our FBA shipments are always perfect and compliant.",
      rating: 5,
      volume: "2,000+ prep items/month"
    }
  ];

  const stats = [
    { value: "99.8%", label: "Inventory Accuracy" },
    { value: "24hr", label: "Receiving Turnaround" },
    { value: "50+", label: "Warehouse Locations" },
    { value: "1M+", label: "Items Processed" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <FulfillmentNavbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🚀 3PL & Fulfillment Solution - Scale Your Business Effortlessly
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Complete Fulfillment </span>
            Solution
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            From receiving to shipping, PrepFox Fulfill handles your entire fulfillment operation. 
            Transparent pricing, real-time tracking, and enterprise-grade warehouse management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Get Custom Quote
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5">
              Tour Our Facilities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            No setup fees • Transparent pricing • 99.8% inventory accuracy
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
              Complete 3PL & Fulfillment Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to outsource your fulfillment operations with confidence. 
              From receiving to shipping, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fulfillmentFeatures.map((feature, index) => (
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
              Transparent, Fair Pricing
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Pay only for what you use. No hidden fees, no minimum commitments.
            </p>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              💰 30% less than traditional 3PLs
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
                      <div className="text-sm text-muted-foreground mt-1">{plan.unit}</div>
                    </div>
                    <Button className={`w-full mb-4 ${plan.popular ? 'bg-gradient-primary hover:shadow-glow' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      Get Quote
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
              Trusted by Growing Businesses
            </h2>
            <p className="text-lg text-muted-foreground">
              See why businesses choose PrepFox Fulfill for their 3PL needs
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
            Seamless Integrations
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with all your existing systems and marketplaces for smooth fulfillment operations.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {integrations.map((integration, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {integration}
              </Badge>
            ))}
          </div>

          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
            <Link to="/fulfillment-integrations">
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
            Ready to Scale Your Fulfillment?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get a custom quote and see how PrepFox Fulfill can streamline your operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Get Custom Quote
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Schedule Tour
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            Custom pricing • No setup fees • 99.8% accuracy guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground/5 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">PrepFox Fulfill</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/fulfillment-privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/fulfillment-terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/fulfillment-support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/fulfillment-contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 PrepFox Fulfill. All rights reserved. Scale your business with confidence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FulfillmentLanding;