import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billing: "forever",
    description: "Perfect for getting started with basic features",
    popular: false,
    features: [
      "Up to 10 shipments/month",
      "Basic order management",
      "Single store connection",
      "Email support",
      "Basic analytics",
      "Standard shipping rates"
    ],
    limitations: [
      "Limited to 1 user",
      "No repricing automation",
      "No fulfillment services",
      "No product management tools"
    ],
    entitlements: {
      shipping: true,
      repricing: false,
      fulfillment: false,
      productManagement: false
    }
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    billing: "per month",
    description: "Great for growing businesses with basic automation",
    popular: true,
    features: [
      "Up to 100 shipments/month",
      "Multi-channel order sync",
      "Basic repricing automation",
      "Priority support",
      "Advanced analytics",
      "Discounted shipping rates",
      "Up to 3 users"
    ],
    limitations: [
      "No fulfillment services",
      "Limited product management"
    ],
    entitlements: {
      shipping: true,
      repricing: true,
      fulfillment: false,
      productManagement: false
    }
  },
  {
    id: "pro", 
    name: "Pro",
    price: 99,
    billing: "per month",
    description: "Full-featured solution for established businesses",
    popular: false,
    features: [
      "Up to 1,000 shipments/month",
      "Advanced repricing strategies",
      "Fulfillment center integration",
      "Inventory management",
      "API access",
      "Custom integrations",
      "Up to 10 users",
      "Phone support"
    ],
    limitations: [
      "Limited product management features"
    ],
    entitlements: {
      shipping: true,
      repricing: true,
      fulfillment: true,
      productManagement: false
    }
  },
  {
    id: "business",
    name: "Business",
    price: 299,
    billing: "per month", 
    description: "Enterprise-grade solution with full access",
    popular: false,
    features: [
      "Unlimited shipments",
      "Advanced AI repricing",
      "Full fulfillment automation",
      "Complete product management suite",
      "White-label options",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom reporting",
      "Unlimited users"
    ],
    limitations: [],
    entitlements: {
      shipping: true,
      repricing: true,
      fulfillment: true,
      productManagement: true
    }
  }
];

const moduleFeatures = {
  shipping: [
    "Multi-carrier shipping",
    "Rate comparison",
    "Label printing",
    "Tracking automation",
    "Returns management"
  ],
  repricing: [
    "Competitor monitoring",
    "Dynamic pricing rules",
    "Profit optimization",
    "Market analysis",
    "Automated adjustments"
  ],
  fulfillment: [
    "Inventory management",
    "Order processing",
    "Pick & pack automation",
    "3PL integration",
    "Quality control"
  ],
  productManagement: [
    "Product catalog sync",
    "Bulk editing tools",
    "Performance analytics",
    "SEO optimization",
    "Cross-platform management"
  ]
};

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const handleStartTrial = async (planId: string) => {
    if (!session?.user) {
      // Redirect to auth if not logged in
      window.location.href = '/auth?redirect=/pricing';
      return;
    }

    try {
      setIsLoading(planId);
      
      if (planId === 'free') {
        // For free plan, just redirect to dashboard
        window.location.href = '/';
        return;
      }

      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('billing-create-checkout', {
        body: { planId, billingCycle }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      toast({
        title: "Error",
        description: "Failed to start trial. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const getDiscountedPrice = (price: number) => {
    return billingCycle === 'yearly' ? Math.round(price * 0.8) : price;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Star className="h-4 w-4 mr-1" />
            30-Day Free Trial • No Credit Card Required
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Simple, Transparent
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Pricing</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage shipping, repricing, fulfillment, and products. 
            Start free, scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={billingCycle === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
            <span className={billingCycle === 'yearly' ? 'text-foreground font-medium' : 'text-muted-foreground'}>
              Yearly
              <Badge className="ml-2 bg-primary/10 text-primary border-primary/20">Save 20%</Badge>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan) => {
              const displayPrice = getDiscountedPrice(plan.price);
              const isPopular = plan.popular;
              
              return (
                <Card 
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-lg ${
                    isPopular ? 'ring-2 ring-primary shadow-glow scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">
                      Most Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        ${displayPrice}
                      </span>
                      <span className="text-muted-foreground">/{plan.billing}</span>
                      {billingCycle === 'yearly' && plan.price > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="line-through">${plan.price}</span>
                          <span className="text-primary ml-1">Save 20%</span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Included Features */}
                    <div>
                      <h4 className="font-medium mb-3">What's included:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Module Access */}
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Module Access:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(plan.entitlements).map(([module, enabled]) => (
                          <div key={module} className="flex items-center gap-2">
                            {enabled ? (
                              <Check className="h-3 w-3 text-primary" />
                            ) : (
                              <X className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span className={`text-xs ${enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {module === 'productManagement' ? 'Products' : 
                               module.charAt(0).toUpperCase() + module.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3 text-muted-foreground">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className="w-full"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleStartTrial(plan.id)}
                      disabled={isLoading === plan.id}
                    >
                      {isLoading === plan.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Starting...
                        </>
                      ) : (
                        <>
                          {plan.name === 'Free' ? 'Get Started Free' : 'Start Free Trial'}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module Features Breakdown */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-muted-foreground">
              Four powerful modules working together to scale your e-commerce business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Object.entries(moduleFeatures).map(([module, features]) => (
              <Card key={module}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    {module === 'productManagement' ? 'Product Management' : 
                     module.charAt(0).toUpperCase() + module.slice(1)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Can I change plans anytime?",
                answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we prorate any charges."
              },
              {
                question: "What happens after the free trial?",
                answer: "Your trial automatically converts to the plan you selected. You can cancel anytime during the trial with no charges."
              },
              {
                question: "Do you offer annual discounts?",
                answer: "Yes! Annual plans save 20% compared to monthly billing. Enterprise customers get additional volume discounts."
              },
              {
                question: "Can I use multiple modules?",
                answer: "Absolutely! Higher-tier plans include access to multiple modules. You can mix and match features as your business grows."
              },
              {
                question: "Is there a setup fee?",
                answer: "No setup fees, no hidden costs. You only pay for your chosen plan, and we include onboarding and migration support."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Scale Your Business?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who trust our platform to manage their operations. 
            Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-6"
              onClick={() => handleStartTrial('starter')}
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            30-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}