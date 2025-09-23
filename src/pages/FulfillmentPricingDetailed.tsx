import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calculator, 
  CheckCircle, 
  ArrowRight,
  Star,
  Package,
  Truck,
  DollarSign,
  Shield,
  Zap,
  Target,
  TrendingDown
} from 'lucide-react';

const FulfillmentPricingPage = () => {
  const [units, setUnits] = useState(1000);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Calculate pricing with 5% better rates than AMZ Prep
  const calculatePricing = (unitCount: number) => {
    let rate = 0.38; // Base rate (5% better than AMZ Prep's $0.40)
    if (unitCount >= 5000) rate = 0.33; // Volume discount
    if (unitCount >= 10000) rate = 0.28; // Higher volume
    return rate * unitCount;
  };

  React.useEffect(() => {
    setCalculatedPrice(calculatePricing(units));
  }, [units]);

  const pricingTiers = [
    {
      name: "Starter",
      volume: "100-999 units/month",
      itemPrep: "$0.38",
      originalPrice: "$0.40",
      caseForwarding: "$1.43",
      originalCase: "$1.50",
      inbound: "$1.43",
      originalInbound: "$1.50",
      features: [
        "1-3 days to Amazon",
        "FNSKU labeling included",
        "Basic quality checks",
        "Email support",
        "Standard reporting"
      ]
    },
    {
      name: "Professional",
      volume: "1,000-4,999 units/month",
      itemPrep: "$0.35",
      originalPrice: "$0.37",
      caseForwarding: "$1.38",
      originalCase: "$1.45",
      inbound: "$1.38",
      originalInbound: "$1.45",
      features: [
        "All Starter features",
        "Priority processing",
        "Advanced quality control",
        "Dedicated account manager",
        "Real-time tracking",
        "Custom reporting"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      volume: "5,000+ units/month",
      itemPrep: "$0.33",
      originalPrice: "$0.35",
      caseForwarding: "$1.33",
      originalCase: "$1.40",
      inbound: "$1.33",
      originalInbound: "$1.40",
      features: [
        "All Professional features",
        "Custom pricing available",
        "White-glove service",
        "24/7 priority support",
        "Performance guarantees",
        "Custom integrations"
      ]
    }
  ];

  const additionalServices = [
    {
      service: "Bundling/Kitting",
      ourPrice: "$0.48",
      competitorPrice: "$0.50",
      description: "Per bundled item"
    },
    {
      service: "Storage (per pallet)",
      ourPrice: "$43",
      competitorPrice: "$45",
      description: "Monthly storage fee"
    },
    {
      service: "Pallet Inbound",
      ourPrice: "$7.60",
      competitorPrice: "$8.00",
      description: "Per pallet received"
    },
    {
      service: "Returns Processing",
      ourPrice: "$0.95",
      competitorPrice: "$1.00",
      description: "Per returned item"
    },
    {
      service: "Photo Documentation",
      ourPrice: "$0.19",
      competitorPrice: "$0.20",
      description: "Per photo taken"
    },
    {
      service: "Custom Packaging",
      ourPrice: "$0.76",
      competitorPrice: "$0.80",
      description: "Per custom package"
    }
  ];

  const benefits = [
    "5% better rates than leading competitors",
    "Zero Amazon placement fees",
    "1-3 day processing to FBA",
    "Comprehensive prep services included",
    "On-site FBA manager support",
    "Auto-generated shipping plans"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            Top FBA Prep Center 2025 - Golden Seller Awards
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Price That Fits. Prep That Wins.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Fuel your FBA operations with transparent pricing that's 5% better than competitors. No hidden fees, just comprehensive logistics solutions that scale with your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Custom Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Calculate Savings
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Calculator */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4 flex items-center justify-center">
                <Calculator className="h-8 w-8 mr-3 text-primary" />
                Pricing Calculator
              </CardTitle>
              <CardDescription className="text-lg">
                Calculate your monthly fulfillment costs with our transparent pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="units" className="text-lg font-semibold">Monthly Units</Label>
                    <Input
                      id="units"
                      type="number"
                      value={units}
                      onChange={(e) => setUnits(Number(e.target.value))}
                      className="text-lg mt-2"
                      min="1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Per-unit rate:</span>
                      <span className="font-semibold">${(calculatePricing(1)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume discount:</span>
                      <span className="text-green-600 font-semibold">
                        {units >= 5000 ? "Applied" : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-6 rounded-lg text-center">
                  <h3 className="text-2xl font-bold mb-2">Estimated Monthly Cost</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    ${calculatedPrice.toFixed(2)}
                  </div>
                  <p className="text-muted-foreground">
                    5% savings vs competitors: <span className="text-green-600 font-semibold">
                      ${(calculatedPrice * 0.053).toFixed(2)}
                    </span>
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <Link to="/fulfillment/quote">
                      Get Detailed Quote
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Pricing Tiers */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Zero Placement Fees. Full Amazon Prep Power.
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple pricing that covers all your FBA preparation needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.volume}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Item Prep:</span>
                      <div className="text-right">
                        <span className="text-lg font-bold">{tier.itemPrep}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {tier.originalPrice}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Case Forwarding:</span>
                      <div className="text-right">
                        <span className="text-lg font-bold">{tier.caseForwarding}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {tier.originalCase}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Inbound Fee:</span>
                      <div className="text-right">
                        <span className="text-lg font-bold">{tier.inbound}</span>
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          {tier.originalInbound}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button asChild className="w-full" variant={tier.popular ? "default" : "outline"}>
                    <Link to="/fulfillment/quote">
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Additional Services Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive add-on services with transparent pricing
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Service</th>
                      <th className="text-center p-4 font-semibold">Our Price</th>
                      <th className="text-center p-4 font-semibold">Competitor Price</th>
                      <th className="text-center p-4 font-semibold">Description</th>
                      <th className="text-center p-4 font-semibold">Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {additionalServices.map((service, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4 font-medium">{service.service}</td>
                        <td className="p-4 text-center font-bold text-primary">{service.ourPrice}</td>
                        <td className="p-4 text-center text-muted-foreground line-through">
                          {service.competitorPrice}
                        </td>
                        <td className="p-4 text-center text-sm">{service.description}</td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary" className="text-green-600 bg-green-50">
                            5% Less
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Get More Done for Less
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ship to one location, and we handle everything. Our tech-driven approach transforms your Amazon fulfillment from complex to completely effortless.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-8 shadow-lg">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Package className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">1-3 Days Processing</h3>
                    <p className="text-muted-foreground">Fastest turnaround in the industry</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <TrendingDown className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">5% Better Rates</h3>
                    <p className="text-muted-foreground">Guaranteed savings vs competitors</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Zero Hidden Fees</h3>
                    <p className="text-muted-foreground">Transparent, all-inclusive pricing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Save 5% on Your FBA Prep Costs?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of sellers who've chosen our transparent, competitive pricing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Custom Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Contact Sales Team
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FulfillmentPricingPage;