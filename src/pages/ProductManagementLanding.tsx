import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Database, 
  TrendingUp, 
  Zap, 
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Users,
  Target,
  ShoppingCart,
  Play,
  RefreshCw,
  Bot,
  Clock,
  Settings,
  Search,
  Edit3,
  Globe
} from "lucide-react";
import { Link } from "react-router-dom";

const ProductManagementLanding = () => {
  const productFeatures = [
    {
      icon: Bot,
      title: "AI Product Optimization",
      description: "Transform your product listings with AI-powered optimization. Improve titles, descriptions, and tags for maximum visibility.",
      benefits: ["AI-powered optimization", "SEO enhancement", "Conversion improvement"]
    },
    {
      icon: Edit3,
      title: "Bulk Product Editor", 
      description: "Edit hundreds of products simultaneously with our powerful bulk editing tools. Make changes across platforms in minutes.",
      benefits: ["Bulk editing", "Multi-platform sync", "Time-saving automation"]
    },
    {
      icon: RefreshCw,
      title: "Multi-Channel Sync",
      description: "Keep product data synchronized across all marketplaces automatically. One change updates everywhere.",
      benefits: ["Real-time sync", "Multi-marketplace", "Automated updates"]
    },
    {
      icon: BarChart3,
      title: "Performance Analytics", 
      description: "Track product performance with detailed analytics. See which optimizations drive the most sales.",
      benefits: ["Performance tracking", "ROI analysis", "Data-driven insights"]
    },
    {
      icon: Search,
      title: "SEO Optimization",
      description: "Optimize your products for search engines and marketplace algorithms with built-in SEO tools.",
      benefits: ["Keyword optimization", "Search ranking", "Visibility boost"]
    },
    {
      icon: Target,
      title: "Smart Categorization",
      description: "AI-powered product categorization and tagging ensures your products are always in the right category.",
      benefits: ["Auto-categorization", "Tag suggestions", "Category optimization"]
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      products: "Up to 100 products",
      popular: false,
      features: [
        "AI optimization for 100 products",
        "Bulk editing tools", 
        "2 marketplace connections",
        "Basic analytics",
        "Email support"
      ]
    },
    {
      name: "Professional", 
      price: "$79",
      products: "Up to 1,000 products",
      popular: true,
      features: [
        "AI optimization for 1,000 products",
        "Advanced bulk editing",
        "5 marketplace connections",
        "Advanced analytics & reporting",
        "Priority support",
        "Custom optimization rules"
      ]
    },
    {
      name: "Enterprise",
      price: "$199", 
      products: "Up to 10,000 products",
      popular: false,
      features: [
        "AI optimization for 10,000 products",
        "Unlimited marketplace connections",
        "Advanced analytics suite",
        "Custom integrations", 
        "API access",
        "Dedicated account manager"
      ]
    },
    {
      name: "Custom",
      price: "Contact us",
      products: "Unlimited products", 
      popular: false,
      features: [
        "Unlimited product optimization",
        "White-label solution",
        "Custom development",
        "Enterprise integrations",
        "24/7 phone support",
        "Custom SLA"
      ]
    }
  ];

  const integrations = [
    "Shopify", "Amazon", "eBay", "WooCommerce", "Etsy", "BigCommerce", 
    "Walmart", "Magento", "Squarespace", "WIX", "Prestashop", "Opencart"
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      company: "Modern Electronics",
      role: "E-commerce Manager", 
      content: "Our conversion rates increased by 35% after using AI optimization. The time savings alone pays for itself.",
      rating: 5,
      volume: "2,500+ products"
    },
    {
      name: "Maria Gonzalez",
      company: "Fashion Forward",
      role: "Product Manager",
      content: "Managing 5,000 products across 4 marketplaces used to be impossible. Now it's automated and seamless.",
      rating: 5,
      volume: "5,000+ products"  
    },
    {
      name: "David Kim",
      company: "Home & Garden Pro",
      role: "Operations Director",
      content: "The AI suggestions are incredible. Our Amazon rankings improved dramatically in just 2 weeks.",
      rating: 5,
      volume: "1,200+ products"
    }
  ];

  const stats = [
    { value: "35%", label: "Avg. Conversion Increase" },
    { value: "10M+", label: "Products Optimized" },
    { value: "85%", label: "Time Savings" },
    { value: "99.9%", label: "Sync Accuracy" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">PrepFox Catalog</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/product-management-features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/product-management-pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/product-management-integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link>
            <Link to="/product-management-resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
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
            🚀 AI-Powered Product Management - 10x Faster Optimization
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Smart Product </span>
            Management Platform
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Optimize thousands of products with AI, sync across all marketplaces automatically, 
            and boost your sales with intelligent product management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial - 30 Days
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5">
              See AI in Action
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            Free trial includes 100 AI optimizations • No credit card required
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
              AI-Powered Product Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to optimize, manage, and synchronize your product catalog 
              across all sales channels with intelligent automation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productFeatures.map((feature, index) => (
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
              Simple, Scalable Pricing
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Choose the plan that fits your catalog size and optimization needs
            </p>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              💰 ROI guarantee - see 3x return or get your money back
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
                      {plan.price !== "Contact us" && (
                        <div className="text-sm text-muted-foreground mt-1">per month</div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">{plan.products}</div>
                    </div>
                    <Button className={`w-full mb-4 ${plan.popular ? 'bg-gradient-primary hover:shadow-glow' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      {plan.name === 'Custom' ? 'Contact Sales' : 'Start Trial'}
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
              Trusted by Smart Sellers
            </h2>
            <p className="text-lg text-muted-foreground">
              See how businesses are scaling their product catalogs with AI
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

      {/* AI Demo Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              See AI Optimization in Action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how our AI transforms product listings for maximum visibility and conversions
            </p>
          </div>

          <Card className="prep-fox-card max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Before AI Optimization</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Title:</div>
                    <div className="text-sm text-foreground mb-4">Wireless Headphones</div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Description:</div>
                    <div className="text-sm text-foreground">Good quality headphones with wireless connectivity.</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">After AI Optimization</h3>
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Title:</div>
                    <div className="text-sm text-foreground mb-4">Premium Wireless Bluetooth Headphones - Noise Canceling, 30Hr Battery, Hi-Fi Sound</div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Description:</div>
                    <div className="text-sm text-foreground">Experience premium audio with advanced noise cancellation technology. 30-hour battery life, crystal-clear Hi-Fi sound, and comfortable over-ear design perfect for travel, work, and entertainment.</div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  🎯 Result: 45% increase in click-through rate
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sync Across All Platforms
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Connect with all major e-commerce platforms and marketplaces for seamless product management.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {integrations.map((integration, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {integration}
              </Badge>
            ))}
          </div>

          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
            <Link to="/product-management-integrations">
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
            Ready to Scale Your Catalog?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start optimizing your products with AI today and see the difference intelligent automation makes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Schedule Demo
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            30-day trial • 100 free optimizations • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground/5 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">PrepFox Catalog</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/product-management-privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/product-management-terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/product-management-support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/product-management-contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 PrepFox Catalog. All rights reserved. Smart product management made simple.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductManagementLanding;