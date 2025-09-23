import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductManagementNavbar } from "@/components/product-management/ProductManagementNavbar";
import { 
  CheckCircle, ArrowRight, Sparkles, Star, Users, Play,
  Bot, Edit3, RefreshCw, BarChart3, Clock, Zap,
  HelpCircle, Shield, Phone, Mail
} from "lucide-react";
import { Link } from "react-router-dom";

const ProductManagementPricing = () => {
  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      subtitle: "Perfect for small catalogs",
      products: "Up to 100 products",
      popular: false,
      description: "Essential AI optimization for growing businesses",
      features: [
        "AI optimization for 100 products/month",
        "Bulk editing tools", 
        "2 marketplace connections",
        "Basic performance analytics",
        "Email support",
        "Product templates",
        "SEO optimization"
      ],
      limitations: [
        "Limited to 100 products",
        "Basic analytics only",
        "Email support only"
      ],
      cta: "Start Free Trial"
    },
    {
      name: "Professional", 
      price: "$79",
      subtitle: "Most popular for growing stores",
      products: "Up to 1,000 products",
      popular: true,
      description: "Advanced features for serious sellers",
      features: [
        "AI optimization for 1,000 products/month",
        "Advanced bulk editing with templates",
        "5 marketplace connections",
        "Advanced analytics & reporting",
        "Priority email support",
        "Custom optimization rules",
        "A/B testing capabilities",
        "Advanced SEO tools",
        "Product performance tracking"
      ],
      limitations: [],
      cta: "Start Free Trial"
    },
    {
      name: "Business",
      price: "$199", 
      subtitle: "For large catalogs",
      products: "Up to 10,000 products",
      popular: false,
      description: "Enterprise-grade features for scaling businesses",
      features: [
        "AI optimization for 10,000 products/month",
        "Unlimited marketplace connections",
        "Advanced analytics suite with custom reports",
        "Custom integrations & API access", 
        "Priority phone + email support",
        "Dedicated account manager",
        "Advanced automation rules",
        "White-label options",
        "Custom onboarding & training"
      ],
      limitations: [],
      cta: "Contact Sales"
    },
    {
      name: "Enterprise",
      price: "Custom",
      subtitle: "Unlimited scale",
      products: "Unlimited products", 
      popular: false,
      description: "Fully customized solution for enterprise needs",
      features: [
        "Unlimited product optimization",
        "White-label solution",
        "Custom development & integrations",
        "Enterprise security & compliance",
        "24/7 phone support",
        "Custom SLA agreements",
        "Advanced reporting & analytics",
        "Multi-tenant architecture",
        "Custom training & onboarding"
      ],
      limitations: [],
      cta: "Contact Sales"
    }
  ];

  const addOns = [
    {
      name: "Extra AI Optimizations",
      price: "$0.10",
      unit: "per product",
      description: "Additional AI optimizations beyond your plan limit"
    },
    {
      name: "Premium Support",
      price: "$99",
      unit: "per month",
      description: "Priority phone support and dedicated success manager"
    },
    {
      name: "Custom Integrations",
      price: "$500",
      unit: "per integration",
      description: "Connect to custom platforms or internal systems"
    },
    {
      name: "Advanced Analytics",
      price: "$49",
      unit: "per month", 
      description: "Enhanced reporting with custom dashboards"
    }
  ];

  const faqs = [
    {
      question: "How does the AI optimization work?",
      answer: "Our AI analyzes your product data, marketplace trends, and competitor listings to generate optimized titles, descriptions, and tags that improve search visibility and conversion rates."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and you'll be prorated for any difference in cost."
    },
    {
      question: "What marketplaces do you support?",
      answer: "We support all major marketplaces including Amazon, eBay, Shopify, WooCommerce, Etsy, BigCommerce, Walmart, and many more. New integrations are added regularly."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! We offer a 30-day free trial with 100 AI optimizations included. No credit card required to start."
    },
    {
      question: "How accurate is the sync between platforms?",
      answer: "Our sync accuracy is 99.9%. We use advanced conflict resolution and real-time monitoring to ensure your product data stays consistent across all channels."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with the results, we'll refund your first month's payment."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      company: "TechGear Pro",
      role: "E-commerce Director",
      content: "The Professional plan paid for itself in the first week. Our conversion rates increased by 40% across all channels.",
      savings: "$12,000/month increase",
      plan: "Professional"
    },
    {
      name: "Marcus Rodriguez", 
      company: "Home & Garden Express",
      role: "Operations Manager",
      content: "Managing 8,000 products used to take our team 20 hours per week. Now it takes 2 hours with AI optimization.",
      savings: "18 hours/week saved",
      plan: "Business"
    },
    {
      name: "Lisa Thompson",
      company: "Fashion Forward",
      role: "Product Manager", 
      content: "The ROI is incredible. We're seeing 3x return on investment within 60 days of starting.",
      savings: "300% ROI",
      plan: "Professional"
    }
  ];

  const comparisonFeatures = [
    { feature: "AI Product Optimization", starter: "100/month", professional: "1,000/month", business: "10,000/month", enterprise: "Unlimited" },
    { feature: "Marketplace Connections", starter: "2", professional: "5", business: "Unlimited", enterprise: "Unlimited" },
    { feature: "Bulk Editing", starter: "✓", professional: "✓ Advanced", business: "✓ Advanced", enterprise: "✓ Custom" },
    { feature: "Analytics & Reporting", starter: "Basic", professional: "Advanced", business: "Custom Reports", enterprise: "Enterprise Suite" },
    { feature: "Support", starter: "Email", professional: "Priority Email", business: "Phone + Email", enterprise: "24/7 Phone" },
    { feature: "API Access", starter: "✗", professional: "✗", business: "✓", enterprise: "✓" },
    { feature: "Custom Integrations", starter: "✗", professional: "✗", business: "✓", enterprise: "✓" },
    { feature: "White-label Options", starter: "✗", professional: "✗", business: "✓", enterprise: "✓" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ProductManagementNavbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            💰 Simple, Transparent Pricing - ROI Guaranteed
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Pricing That
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Scales With You</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your catalog size. All plans include our AI optimization engine, 
            multi-channel sync, and analytics. Start free, upgrade anytime.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-foreground">30-day free trial</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-foreground">Money-back guarantee</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full" />
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-foreground">Instant setup</span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`prep-fox-card relative ${plan.popular ? 'ring-2 ring-primary shadow-glow scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.subtitle}</p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      {plan.price !== "Custom" && (
                        <div className="text-sm text-muted-foreground mt-1">per month</div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">{plan.products}</div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
                    <Button className={`w-full mb-6 ${plan.popular ? 'bg-gradient-primary hover:shadow-glow' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      {plan.cta}
                    </Button>
                  </div>
                  
                  <div className="space-y-3 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">All plans include 30-day free trial • No setup fees • Cancel anytime</p>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
              Compare All Features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Feature Comparison
            </h2>
            <p className="text-lg text-muted-foreground">
              See exactly what's included in each plan
            </p>
          </div>

          <Card className="prep-fox-card overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                      <th className="text-center p-4 font-semibold text-foreground">Starter</th>
                      <th className="text-center p-4 font-semibold text-foreground bg-primary/5">Professional</th>
                      <th className="text-center p-4 font-semibold text-foreground">Business</th>
                      <th className="text-center p-4 font-semibold text-foreground">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4 font-medium text-foreground">{row.feature}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.starter}</td>
                        <td className="p-4 text-center text-foreground bg-primary/5 font-medium">{row.professional}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.business}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              See how our customers are achieving incredible ROI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="prep-fox-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary" className="text-xs">{testimonial.plan} Plan</Badge>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{testimonial.savings}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Add-ons & Extras
            </h2>
            <p className="text-lg text-muted-foreground">
              Enhance your plan with additional capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {addOns.map((addon, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{addon.name}</h3>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-primary">{addon.price}</span>
                    <div className="text-sm text-muted-foreground">{addon.unit}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{addon.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="prep-fox-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                <Mail className="mr-2 h-4 w-4" />
                Email Support
              </Button>
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                <Phone className="mr-2 h-4 w-4" />
                Schedule Call
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Optimize Your Catalog?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see the difference AI optimization makes for your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Play className="mr-2 h-5 w-5" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Schedule Demo
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80">
            30-day trial • 100 free optimizations • No credit card required • Cancel anytime
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

export default ProductManagementPricing;