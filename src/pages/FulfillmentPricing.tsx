import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FulfillmentNavbar } from "@/components/fulfillment/FulfillmentNavbar";
import { 
  Warehouse, 
  CheckCircle,
  ArrowRight,
  Users,
  Calculator,
  TrendingDown,
  Package,
  Star,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";

const FulfillmentPricing = () => {
  const pricingServices = [
    {
      name: "Receiving",
      price: "$0.50",
      unit: "per item",
      popular: false,
      description: "Professional receiving and putaway",
      features: [
        "Item receiving and inspection",
        "Photo documentation",
        "Inventory putaway and location",
        "Real-time inventory updates",
        "Condition assessment",
        "Barcode and label application"
      ],
      turnaround: "24 hours"
    },
    {
      name: "Storage", 
      price: "$0.75",
      unit: "per cubic foot/month",
      popular: true,
      description: "Secure climate-controlled storage",
      features: [
        "Climate controlled environment",
        "Bin location tracking",
        "Insurance coverage included",
        "Real-time inventory access",
        "Multi-location support",
        "Cycle counting included"
      ],
      turnaround: "Ongoing"
    },
    {
      name: "Pick & Pack",
      price: "$2.50", 
      unit: "per order",
      popular: false,
      description: "Complete order fulfillment",
      features: [
        "Order picking and verification",
        "Custom packaging options",
        "Quality control checks", 
        "Shipping carrier integration",
        "Custom inserts and branding",
        "Gift wrapping available"
      ],
      turnaround: "Same day"
    },
    {
      name: "Prep Services",
      price: "$0.75",
      unit: "per item", 
      popular: false,
      description: "FBA and marketplace prep",
      features: [
        "FBA prep and labeling",
        "Bundling and kitting services",
        "Polybagging and suffocation warnings",
        "Custom prep work",
        "Compliance verification",
        "FNSKU label application"
      ],
      turnaround: "1-2 days"
    }
  ];

  const addOnServices = [
    {
      service: "Rush Processing",
      price: "+$1.00",
      description: "Same-day processing guarantee"
    },
    {
      service: "Custom Photography",
      price: "$2.00",
      description: "Professional product photos (per item)"
    },
    {
      service: "Kitting & Bundling",
      price: "$1.50",
      description: "Custom bundle creation (per bundle)"
    },
    {
      service: "Returns Processing",
      price: "$1.25", 
      description: "Return inspection and restocking (per item)"
    },
    {
      service: "Quality Control",
      price: "$0.50",
      description: "Enhanced QC with documentation (per item)"
    },
    {
      service: "Custom Packaging",
      price: "$0.25",
      description: "Branded packaging materials (per order)"
    }
  ];

  const calculatorExamples = [
    {
      scenario: "Small Business",
      orders: "100 orders/month",
      items: "500 items stored",
      receiving: "50 items/month",
      monthly_cost: "$437.50",
      breakdown: "Storage: $375 | Pick/Pack: $250 | Receiving: $25"
    },
    {
      scenario: "Growing Business", 
      orders: "500 orders/month",
      items: "2,000 items stored",
      receiving: "200 items/month",
      monthly_cost: "$2,850",
      breakdown: "Storage: $1,500 | Pick/Pack: $1,250 | Receiving: $100"
    },
    {
      scenario: "Established Business",
      orders: "2,000 orders/month",
      items: "10,000 items stored",
      receiving: "1,000 items/month",
      monthly_cost: "$13,000",
      breakdown: "Storage: $7,500 | Pick/Pack: $5,000 | Receiving: $500"
    }
  ];

  const comparisonData = [
    {
      service: "Receiving",
      prepfox: "$0.50/item",
      traditional: "$0.75/item",
      savings: "33% savings"
    },
    {
      service: "Storage",
      prepfox: "$0.75/cu ft/mo",
      traditional: "$1.00/cu ft/mo",
      savings: "25% savings"
    },
    {
      service: "Pick & Pack", 
      prepfox: "$2.50/order",
      traditional: "$3.50/order",
      savings: "29% savings"
    },
    {
      service: "Prep Services",
      prepfox: "$0.75/item",
      traditional: "$1.25/item",
      savings: "40% savings"
    }
  ];

  const faqs = [
    {
      question: "Are there any setup fees or minimums?",
      answer: "No setup fees, no monthly minimums, and no long-term contracts. You only pay for the services you use."
    },
    {
      question: "How is storage calculated?",
      answer: "Storage is calculated by cubic feet used per month. We measure your inventory dimensions and charge only for actual space used."
    },
    {
      question: "What's included in pick & pack pricing?",
      answer: "Standard packaging materials, picking, packing, quality verification, and shipping integration. Custom packaging and branding are available for additional fees."
    },
    {
      question: "Do you offer volume discounts?",
      answer: "Yes! We offer custom pricing for high-volume accounts. Contact our team for enterprise pricing options."
    },
    {
      question: "How do you handle returns?",
      answer: "Returns processing is $1.25 per item and includes inspection, documentation, and restocking. We handle the entire returns workflow."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <FulfillmentNavbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            💰 30% Less Than Traditional 3PLs
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transparent, Fair
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Fulfillment Pricing</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Pay only for what you use. No hidden fees, no minimums, no setup costs. 
            Just honest, transparent pricing for professional fulfillment services.
          </p>

          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No minimums</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No contracts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Pricing */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Fulfillment Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Transparent pricing for all your fulfillment needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingServices.map((service, index) => (
              <Card key={index} className={`prep-fox-card relative ${service.popular ? 'ring-2 ring-primary shadow-glow scale-105' : ''}`}>
                {service.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-primary-foreground">
                    Most Used
                  </Badge>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary">{service.price}</span>
                      <div className="text-sm text-muted-foreground mt-1">{service.unit}</div>
                    </div>
                    <Badge variant="secondary" className="mb-4">
                      {service.turnaround}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-foreground mb-2">Included:</div>
                    {service.features.map((feature, featureIndex) => (
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
        </div>
      </section>

      {/* Add-On Services */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Additional Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Optional services to enhance your fulfillment operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {addOnServices.map((addon, index) => (
              <Card key={index} className="prep-fox-card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{addon.service}</h3>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {addon.price}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{addon.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Calculate Your Monthly Costs
            </h2>
            <p className="text-lg text-muted-foreground">
              See realistic pricing examples for different business sizes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {calculatorExamples.map((example, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg shadow-glow w-fit mx-auto mb-4">
                    <Calculator className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{example.scenario}</h3>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div>{example.orders}</div>
                    <div>{example.items}</div>
                    <div>{example.receiving}</div>
                  </div>
                  <div className="text-2xl font-bold text-primary mb-2">{example.monthly_cost}</div>
                  <div className="text-xs text-muted-foreground">{example.breakdown}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow">
              Get Custom Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              PrepFox vs Traditional 3PL Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              See how much you can save with our transparent pricing model
            </p>
          </div>

          <Card className="prep-fox-card max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-6 font-semibold text-foreground">Service</th>
                      <th className="text-center p-6 font-semibold text-primary">PrepFox Fulfill</th>
                      <th className="text-center p-6 font-semibold text-muted-foreground">Traditional 3PL</th>
                      <th className="text-center p-6 font-semibold text-foreground">Your Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-6 font-medium text-foreground">{item.service}</td>
                        <td className="p-6 text-center text-primary font-bold">{item.prepfox}</td>
                        <td className="p-6 text-center text-muted-foreground line-through">{item.traditional}</td>
                        <td className="p-6 text-center font-bold text-primary">{item.savings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              💡 Average savings of 30% compared to traditional 3PL providers
            </Badge>
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
              Everything you need to know about our fulfillment pricing
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
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get a custom quote based on your specific fulfillment needs. No hidden fees, no surprises.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Custom Quote
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Talk to Expert
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            Custom pricing • No setup fees • No minimums • No contracts
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
            © 2024 PrepFox Fulfill. All rights reserved. Transparent fulfillment pricing.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FulfillmentPricing;