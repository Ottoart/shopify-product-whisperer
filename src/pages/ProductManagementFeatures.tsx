import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductManagementNavbar } from "@/components/product-management/ProductManagementNavbar";
import { 
  Bot, Edit3, RefreshCw, BarChart3, Search, Target, 
  CheckCircle, ArrowRight, Sparkles, Clock, TrendingUp,
  Globe, Zap, Database, Users, Star, Play, Settings,
  FileText, Image, Tag, Filter, Layers, Workflow
} from "lucide-react";
import { Link } from "react-router-dom";

const ProductManagementFeatures = () => {
  const coreFeatures = [
    {
      icon: Bot,
      title: "AI Product Optimization",
      description: "Leverage advanced AI to automatically optimize product titles, descriptions, and tags for maximum marketplace visibility and conversion rates.",
      features: [
        "SEO-optimized title generation",
        "Conversion-focused descriptions", 
        "Smart keyword integration",
        "Marketplace-specific optimization",
        "A/B testing recommendations"
      ],
      demo: "Transform 'Blue Shirt' into 'Premium Men's Cotton Business Casual Blue Dress Shirt - Wrinkle Free, Slim Fit'"
    },
    {
      icon: Edit3,
      title: "Bulk Product Editor",
      description: "Edit thousands of products simultaneously with our powerful bulk editing tools. Make changes across all your sales channels in minutes, not hours.",
      features: [
        "Bulk price updates",
        "Category reassignment",
        "Tag management",
        "Description templates",
        "Conditional editing rules"
      ],
      demo: "Update pricing for 1,000+ products across 5 marketplaces in under 2 minutes"
    },
    {
      icon: RefreshCw,
      title: "Multi-Channel Sync",
      description: "Keep product data perfectly synchronized across all marketplaces. One change automatically updates everywhere, maintaining consistency.",
      features: [
        "Real-time synchronization",
        "Conflict resolution",
        "Selective sync rules",
        "Change tracking",
        "Rollback capabilities"
      ],
      demo: "Update once, sync everywhere - Amazon, eBay, Shopify, WooCommerce, and more"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track the impact of your optimizations with detailed analytics. See which changes drive the most sales and revenue growth.",
      features: [
        "Conversion tracking",
        "Revenue attribution",
        "Click-through rates",
        "Search ranking improvements",
        "ROI calculations"
      ],
      demo: "See 35% average conversion rate improvement after AI optimization"
    }
  ];

  const advancedFeatures = [
    {
      icon: Search,
      title: "SEO Intelligence",
      subtitle: "Marketplace Algorithm Optimization",
      features: ["Keyword research", "Competitor analysis", "Ranking optimization", "Search visibility"]
    },
    {
      icon: Target,
      title: "Smart Categorization", 
      subtitle: "AI-Powered Product Classification",
      features: ["Auto-categorization", "Tag suggestions", "Category optimization", "Compliance checking"]
    },
    {
      icon: FileText,
      title: "Content Templates",
      subtitle: "Standardized Product Content",
      features: ["Template library", "Brand consistency", "Bulk application", "Custom templates"]
    },
    {
      icon: Image,
      title: "Image Optimization",
      subtitle: "Visual Content Enhancement", 
      features: ["Image SEO", "Alt text generation", "Quality optimization", "Format conversion"]
    },
    {
      icon: Filter,
      title: "Advanced Filtering",
      subtitle: "Powerful Product Discovery",
      features: ["Complex filters", "Saved searches", "Custom views", "Quick actions"]
    },
    {
      icon: Workflow,
      title: "Automation Rules",
      subtitle: "Intelligent Workflow Automation",
      features: ["Trigger-based actions", "Conditional logic", "Scheduled updates", "Custom workflows"]
    }
  ];

  const integrations = [
    { name: "Shopify", logo: "🛍️", status: "Active" },
    { name: "Amazon", logo: "📦", status: "Active" },
    { name: "eBay", logo: "🔨", status: "Active" },
    { name: "WooCommerce", logo: "🛒", status: "Active" },
    { name: "Etsy", logo: "🎨", status: "Active" },
    { name: "BigCommerce", logo: "💼", status: "Beta" },
    { name: "Walmart", logo: "🏪", status: "Coming Soon" },
    { name: "Facebook Shop", logo: "👥", status: "Beta" }
  ];

  const workflows = [
    {
      step: 1,
      title: "Import Products",
      description: "Connect your stores and import existing product catalogs",
      icon: Database
    },
    {
      step: 2, 
      title: "AI Analysis",
      description: "Our AI analyzes each product for optimization opportunities",
      icon: Bot
    },
    {
      step: 3,
      title: "Apply Optimizations", 
      description: "Review and apply AI-suggested improvements with one click",
      icon: Sparkles
    },
    {
      step: 4,
      title: "Sync Everywhere",
      description: "Optimized products automatically sync across all channels",
      icon: RefreshCw
    },
    {
      step: 5,
      title: "Track Performance",
      description: "Monitor improvements with detailed analytics and reports",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ProductManagementNavbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🔥 Advanced Product Management Features
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Every Feature You Need to
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Scale Your Catalog</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            From AI-powered optimization to bulk editing and multi-channel sync - 
            discover all the tools that make product management effortless and profitable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              See Demo
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features Deep Dive */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Features That Drive Results
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the powerful features that help businesses optimize thousands of products and increase sales.
            </p>
          </div>

          <div className="space-y-16">
            {coreFeatures.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-cols-[1fr_1fr]' : 'lg:grid-cols-[1fr_1fr]'}`}>
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-gradient-primary p-4 rounded-xl shadow-glow">
                      <feature.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{feature.title}</h3>
                    </div>
                  </div>
                  
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="bg-gradient-primary hover:shadow-glow transition-smooth">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <Card className="prep-fox-card">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Example:</div>
                        <div className="text-foreground font-medium">{feature.demo}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features Grid */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Advanced Tools & Capabilities
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional-grade features for serious sellers and enterprises
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="prep-fox-card hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-primary p-3 rounded-lg shadow-glow group-hover:shadow-progress transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{feature.subtitle}</p>
                      <div className="space-y-1">
                        {feature.features.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                            <span className="text-xs text-foreground">{item}</span>
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

      {/* Workflow Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From import to optimization - see how easy product management becomes
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {workflows.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mb-4">
                    <step.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold text-accent-foreground">
                    {step.step}
                  </div>
                  {index < workflows.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-primary transform -translate-y-1/2" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Works With Your Existing Stack
            </h2>
            <p className="text-lg text-muted-foreground">
              Seamlessly integrate with all major e-commerce platforms and marketplaces
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{integration.logo}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{integration.name}</h3>
                  <Badge variant={integration.status === 'Active' ? 'default' : integration.status === 'Beta' ? 'secondary' : 'outline'} className="text-xs">
                    {integration.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
              View All Integrations
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Product Management?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who've already revolutionized their catalog management with AI.
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
        </div>
      </footer>
    </div>
  );
};

export default ProductManagementFeatures;