import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  CheckCircle,
  ArrowRight,
  Users,
  Calculator,
  TrendingDown,
  Zap,
  Star,
  X
} from "lucide-react";
import { Link } from "react-router-dom";

const ShippingPricing = () => {
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      shipments: "10 shipments/month",
      popular: false,
      description: "Perfect for getting started",
      features: [
        "Up to 10 shipments/month",
        "Basic order management", 
        "Single store connection",
        "Email support",
        "Basic reporting",
        "Standard carrier rates"
      ],
      limitations: [
        "Limited to 1 user",
        "Basic automation only"
      ]
    },
    {
      name: "Starter", 
      price: "$13.49",
      originalPrice: "$14.99",
      shipments: "50 shipments/month",
      popular: true,
      description: "Great for growing businesses",
      features: [
        "Up to 50 shipments/month",
        "Multi-channel order sync",
        "Advanced shipping automation",
        "All major carriers included",
        "Priority support",
        "Advanced analytics",
        "Discounted shipping rates",
        "Up to 3 users",
        "Custom branded tracking"
      ],
      limitations: []
    },
    {
      name: "Standard",
      price: "$26.99", 
      originalPrice: "$29.99",
      shipments: "500 shipments/month",
      popular: false,
      description: "For established businesses",
      features: [
        "Up to 500 shipments/month",
        "Advanced automation rules",
        "Inventory management",
        "Returns management", 
        "API access",
        "Custom integrations",
        "Maximum shipping discounts",
        "Up to 10 users",
        "Advanced reporting",
        "Phone support"
      ],
      limitations: []
    },
    {
      name: "Premium",
      price: "$314.99",
      originalPrice: "$349.99", 
      shipments: "Unlimited shipments",
      popular: false,
      description: "Enterprise-grade solution",
      features: [
        "Unlimited shipments",
        "White-label solution",
        "Dedicated account manager",
        "Custom reporting & analytics",
        "Priority carrier rates",
        "24/7 phone support",
        "Custom integrations",
        "Unlimited users",
        "Advanced security features",
        "SLA guarantee"
      ],
      limitations: []
    }
  ];

  const comparisonData = [
    {
      plan: "Free",
      prepfox: "$0",
      shipstation: "$0", 
      savings: "$0",
      shipments: "10"
    },
    {
      plan: "Starter",
      prepfox: "$13.49",
      shipstation: "$14.99",
      savings: "$1.50",
      shipments: "50"
    },
    {
      plan: "Standard", 
      prepfox: "$26.99",
      shipstation: "$29.99",
      savings: "$3.00",
      shipments: "500"
    },
    {
      plan: "Premium",
      prepfox: "$314.99",
      shipstation: "$349.99", 
      savings: "$35.00",
      shipments: "Unlimited"
    }
  ];

  const calculatorExamples = [
    {
      orders: "100 orders/month",
      prepfox: "$13.49/month",
      shipstation: "$14.99/month",
      yearly_savings: "$18"
    },
    {
      orders: "500 orders/month", 
      prepfox: "$26.99/month",
      shipstation: "$29.99/month",
      yearly_savings: "$36"
    },
    {
      orders: "2,000 orders/month",
      prepfox: "$314.99/month",
      shipstation: "$349.99/month", 
      yearly_savings: "$420"
    }
  ];

  const faqs = [
    {
      question: "What happens if I exceed my monthly shipment limit?",
      answer: "We'll automatically upgrade you to the next tier for that month, or you can upgrade manually. No overage fees or service interruptions."
    },
    {
      question: "Can I change plans anytime?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any charges."
    },
    {
      question: "Do you offer annual discounts?",
      answer: "Yes! Save 20% when you pay annually. Contact our sales team for enterprise volume discounts."
    },
    {
      question: "What's included in the free trial?",
      answer: "All features of the Starter plan for 30 days, including priority support and advanced automation."
    },
    {
      question: "Are shipping rates included?",
      answer: "You pay actual shipping costs to carriers, but we negotiate significant discounts (up to 89% off retail rates) that you benefit from."
    }
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
            <Link to="/shipping-pricing" className="text-foreground font-medium">Pricing</Link>
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
            💰 Save $420+ Per Year vs ShipStation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Simple, Transparent
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Pricing</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Get 10% better pricing than ShipStation with 10x better features. 
            No hidden fees, no surprises - just great value.
          </p>

          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
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
                    <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      {plan.originalPrice && (
                        <div className="text-sm text-muted-foreground">
                          <span className="line-through">{plan.originalPrice}</span>
                          <span className="text-primary ml-1">Save 10%</span>
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground mt-1">{plan.shipments}</div>
                    </div>
                    <Button className={`w-full mb-6 ${plan.popular ? 'bg-gradient-primary hover:shadow-glow' : ''}`} variant={plan.popular ? 'default' : 'outline'}>
                      {plan.name === 'Free' ? 'Start Free' : 'Start Trial'}
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground mb-2">Included:</div>
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <div className="text-sm font-medium text-muted-foreground mb-2 mt-4">Limitations:</div>
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-start space-x-2">
                            <X className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              PrepFox Ship vs ShipStation Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              See exactly how much you'll save with our transparent pricing
            </p>
          </div>

          <Card className="prep-fox-card max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-6 font-semibold text-foreground">Plan</th>
                      <th className="text-center p-6 font-semibold text-primary">PrepFox Ship</th>
                      <th className="text-center p-6 font-semibold text-muted-foreground">ShipStation</th>
                      <th className="text-center p-6 font-semibold text-foreground">Monthly Savings</th>
                      <th className="text-center p-6 font-semibold text-muted-foreground">Shipments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-6 font-medium text-foreground">{item.plan}</td>
                        <td className="p-6 text-center text-primary font-bold">{item.prepfox}</td>
                        <td className="p-6 text-center text-muted-foreground line-through">{item.shipstation}</td>
                        <td className="p-6 text-center font-bold text-primary">{item.savings}</td>
                        <td className="p-6 text-center text-muted-foreground">{item.shipments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              💡 Annual plans save an additional 20% - Save up to $504/year vs ShipStation
            </Badge>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Calculate Your Savings
            </h2>
            <p className="text-lg text-muted-foreground">
              See how much you could save by switching to PrepFox Ship
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {calculatorExamples.map((example, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg shadow-glow w-fit mx-auto mb-4">
                    <Calculator className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{example.orders}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">PrepFox Ship: </span>
                      <span className="font-medium text-primary">{example.prepfox}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">ShipStation: </span>
                      <span className="font-medium text-muted-foreground line-through">{example.shipstation}</span>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    Save {example.yearly_savings}/year
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="prep-fox-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
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
            Ready to Start Saving?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join 10,000+ businesses saving money and time with PrepFox Ship. Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Free 30-Day Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Talk to Sales
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            No credit card required • Setup in 15 minutes • Cancel anytime
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

export default ShippingPricing;