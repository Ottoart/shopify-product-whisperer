import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Clock, 
  DollarSign, 
  MapPin, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Package,
  TrendingDown,
  Calendar,
  Star,
  BarChart3,
  Users
} from 'lucide-react';

const MiddleMileLogistics = () => {
  const features = [
    {
      icon: Clock,
      title: "1-2 Day Inbound Times",
      description: "Fastest Amazon inbound processing in the industry"
    },
    {
      icon: DollarSign,
      title: "Zero Placement Fees",
      description: "Avoid Amazon's costly placement and inbound fees"
    },
    {
      icon: Truck,
      title: "Direct FBA Network",
      description: "Daily injections into Amazon fulfillment centers"
    },
    {
      icon: MapPin,
      title: "Strategic Hub Locations",
      description: "Optimally positioned warehouses for fastest delivery"
    },
    {
      icon: Shield,
      title: "Guaranteed Delivery",
      description: "SLA-backed transit times with full insurance coverage"
    },
    {
      icon: BarChart3,
      title: "Real-Time Tracking",
      description: "Live shipment visibility and delivery confirmations"
    }
  ];

  const benefits = [
    "50% faster than traditional Amazon inbound",
    "Eliminate $0.30-$1.50 per unit placement fees",
    "Reduce total logistics costs by 25%",
    "Skip 3-week Amazon wait times",
    "Guaranteed inventory availability",
    "Full shipment insurance included"
  ];

  const comparison = [
    {
      metric: "Inbound Speed",
      amazon: "7-21 days",
      ours: "1-2 days",
      improvement: "90% faster"
    },
    {
      metric: "Placement Fees",
      amazon: "$0.30-$1.50/unit",
      ours: "$0.00",
      improvement: "100% savings"
    },
    {
      metric: "Transit Cost",
      amazon: "$2.50/lb",
      ours: "$2.38/lb",
      improvement: "5% lower"
    },
    {
      metric: "Tracking Updates",
      amazon: "Limited",
      ours: "Real-time",
      improvement: "24/7 visibility"
    }
  ];

  const pricingTiers = [
    {
      volume: "0-10K lbs/month",
      rate: "$2.38",
      originalRate: "$2.50",
      description: "Perfect for growing brands"
    },
    {
      volume: "10K-50K lbs/month",
      rate: "$2.14",
      originalRate: "$2.25",
      description: "Optimized for scaling businesses",
      popular: true
    },
    {
      volume: "50K+ lbs/month",
      rate: "$1.90",
      originalRate: "$2.00",
      description: "Enterprise volume pricing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            Amazon Seller's Choice: Best Logistics Partner 2025
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Skip Amazon Fees. Stock Faster.
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Our middle mile logistics network gets your inventory live in 1-2 days without Amazon's placement fees or delays. Join hundreds of brands saving 25% on total logistics costs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Shipping Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                View Route Map
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built to Beat Amazon at Its Own Game
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our freight network is optimized for Amazon's requirements and speed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Brands Choose Our Middle Mile
            </h2>
            <p className="text-xl text-muted-foreground">
              Side-by-side comparison with traditional Amazon logistics
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Metric</th>
                      <th className="text-center p-4 font-semibold">Amazon Standard</th>
                      <th className="text-center p-4 font-semibold">Our Network</th>
                      <th className="text-center p-4 font-semibold">Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4 font-medium">{row.metric}</td>
                        <td className="p-4 text-center text-muted-foreground">{row.amazon}</td>
                        <td className="p-4 text-center font-semibold text-primary">{row.ours}</td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary">{row.improvement}</Badge>
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
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transform Your Inbound Strategy
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Eliminate the pain points of Amazon logistics while reducing costs and improving speed.
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
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary mb-2">$50K+</h3>
                  <p className="text-muted-foreground">Average annual savings per brand</p>
                </div>
                
                <div className="flex items-center justify-around text-center">
                  <div>
                    <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">1-2 Days</p>
                    <p className="text-sm text-muted-foreground">Typical inbound time</p>
                  </div>
                  <div>
                    <TrendingDown className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">25% Less</p>
                    <p className="text-sm text-muted-foreground">Total logistics cost</p>
                  </div>
                  <div>
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">500+</p>
                    <p className="text-sm text-muted-foreground">Satisfied brands</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transparent Volume Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Pay per pound with no hidden fees. 5% better rates than competitors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.volume}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold">{tier.rate}</span>
                      <span className="text-sm text-muted-foreground line-through">{tier.originalRate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">per pound</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">1-2 day inbound speed</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Zero placement fees</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Real-time tracking</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Full insurance coverage</span>
                    </li>
                  </ul>
                  <Button asChild className="w-full" variant={tier.popular ? "default" : "outline"}>
                    <Link to="/fulfillment/quote">
                      Get Quote
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Skip Amazon Fees?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of brands using our middle mile network to reduce costs and speed up delivery
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Shipping Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Talk to Logistics Expert
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MiddleMileLogistics;