import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { RepricingNavbar } from "@/components/repricing/RepricingNavbar";

const pricingPlans = [
  {
    name: "Starter",
    price: 49,
    billing: "per month",
    description: "Perfect for small sellers just getting started",
    features: [
      "Up to 100 active listings",
      "Basic pricing rules",
      "Daily price updates",
      "Email support",
      "Single marketplace",
    ],
    limitations: [
      "No API access",
      "No advanced analytics",
      "Limited rule customization",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: 99,
    billing: "per month",
    description: "For growing businesses with more complex needs",
    features: [
      "Up to 1,000 active listings",
      "Advanced pricing rules",
      "Hourly price updates",
      "Priority email support",
      "Multi-marketplace support",
      "Performance analytics",
      "Buy Box tracking",
    ],
    limitations: [
      "Limited API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: 249,
    billing: "per month",
    description: "For large sellers with high-volume needs",
    features: [
      "Unlimited active listings",
      "Custom pricing strategies",
      "Real-time price updates",
      "Dedicated account manager",
      "Full API access",
      "Advanced analytics and reporting",
      "Multi-marketplace support",
      "Buy Box optimization",
      "Custom rule engine",
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
  }
];

export default function RepricingPricing() {
  return (
    <div className="min-h-screen bg-background">
      <RepricingNavbar />
      <section className="container mx-auto px-4 py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`border ${plan.popular ? 'border-primary' : 'border-border/50'} relative`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <div className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="ml-1 text-sm text-muted-foreground">
                      {plan.billing}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-6">
                  {plan.description}
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Included features:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation) => (
                          <li key={limitation} className="flex items-start">
                            <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                            <span className="text-sm">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link to="/contact">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Can I switch plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Is there a contract or commitment?</h3>
            <p className="text-muted-foreground">
              No, all plans are month-to-month with no long-term commitment. You can cancel anytime.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Do you offer a free trial?</h3>
            <p className="text-muted-foreground">
              Yes, we offer a 14-day free trial on all plans so you can test the features before committing.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Which marketplaces do you support?</h3>
            <p className="text-muted-foreground">
              We currently support Amazon, eBay, Walmart, and Shopify, with more marketplaces being added regularly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}