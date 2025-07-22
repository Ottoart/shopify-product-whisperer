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
  Play
} from "lucide-react";
import { Link } from "react-router-dom";
import { TestEmailButton } from "@/components/TestEmailButton";

const LandingPage = () => {
  const features = [
    {
      icon: Truck,
      title: "Smart Shipping Automation",
      description: "Automate your entire shipping workflow with intelligent rate comparison, label printing, and carrier optimization.",
      benefits: ["90% faster processing", "30% cost savings", "99.9% accuracy"]
    },
    {
      icon: DollarSign,
      title: "Dynamic Repricing Engine",
      description: "AI-powered repricing that automatically adjusts your prices based on market conditions and competitor analysis.",
      benefits: ["25% profit increase", "Real-time updates", "Smart rules"]
    },
    {
      icon: Warehouse,
      title: "Fulfillment by PrepFox",
      description: "End-to-end warehouse management from receiving to shipping with real-time inventory tracking.",
      benefits: ["Zero stockouts", "2-day fulfillment", "Live tracking"]
    },
    {
      icon: Globe,
      title: "Multi-Platform Integration",
      description: "Connect all your sales channels - Shopify, eBay, Amazon, Walmart, and more in one unified dashboard.",
      benefits: ["200+ integrations", "Real-time sync", "Single dashboard"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechGear Plus",
      role: "Operations Manager",
      content: "PrepFox reduced our shipping costs by 35% and cut processing time in half. The ROI was immediate.",
      rating: 5,
      revenue: "$2M+ annual sales"
    },
    {
      name: "Mike Chen",
      company: "Fashion Forward",
      role: "CEO",
      content: "The repricing engine alone increased our margins by 18%. PrepFox pays for itself within weeks.",
      rating: 5,
      revenue: "$5M+ annual sales"
    },
    {
      name: "Lisa Rodriguez",
      company: "Home Essentials",
      role: "Founder",
      content: "Finally, one platform that handles everything. Our team loves how intuitive and powerful it is.",
      rating: 5,
      revenue: "$1M+ annual sales"
    }
  ];

  const integrations = [
    "Shopify", "eBay", "Amazon", "Walmart", "Etsy", "WooCommerce", 
    "BigCommerce", "Magento", "UPS", "FedEx", "USPS", "DHL"
  ];

  const stats = [
    { value: "50,000+", label: "Active Sellers" },
    { value: "100M+", label: "Orders Processed" },
    { value: "99.9%", label: "Uptime" },
    { value: "35%", label: "Average Cost Savings" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">PrepFox</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/about-us" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
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
            🚀 New: AI-Powered Shipping Optimization
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The Complete
            <span className="bg-gradient-primary bg-clip-text text-transparent"> E-commerce </span>
            Operations Platform
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Ship smarter, price better, and fulfill faster with PrepFox's all-in-one platform. 
            Join 50,000+ sellers who've reduced costs by 35% while scaling their operations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Free 30-Day Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5">
              Watch Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Free trial includes all premium features • No credit card required • Cancel anytime
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
              Everything You Need to Scale Your Business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From shipping automation to dynamic repricing, PrepFox provides all the tools 
              e-commerce sellers need in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="prep-fox-card hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-primary p-3 rounded-lg shadow-glow group-hover:shadow-progress transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Button variant="ghost" className="text-primary p-0 hover:bg-transparent hover:text-primary/90" asChild>
                          <Link to="/auth">
                            Learn more <ArrowRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by 50,000+ E-commerce Sellers
            </h2>
            <p className="text-lg text-muted-foreground">
              See why sellers choose PrepFox to scale their operations
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
                    <Badge variant="secondary" className="mt-2 text-xs">{testimonial.revenue}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Connect With Your Favorite Platforms
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            PrepFox integrates seamlessly with 200+ platforms, marketplaces, and shipping carriers.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {integrations.map((integration, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {integration}
              </Badge>
            ))}
          </div>

          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
            <Link to="/integrations">
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
            Ready to Transform Your Operations?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who've reduced costs by 35% and increased efficiency by 10x with PrepFox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Free 30-Day Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Schedule Demo
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            Get started in under 5 minutes • Full feature access • Expert onboarding included
          </p>
          
          <div className="mt-8">
            <TestEmailButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground/5 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">PrepFox</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 PrepFox. All rights reserved. Built for e-commerce sellers, by e-commerce experts.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;