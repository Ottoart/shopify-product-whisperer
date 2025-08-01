import React from 'react';
import { Link } from 'react-router-dom';
import { SmartCTASection } from '@/components/ui/smart-cta';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Globe, 
  TrendingDown, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Truck,
  MapPin,
  Calculator,
  Star,
  BarChart3,
  Users,
  Building,
  FileText
} from 'lucide-react';

const Section321 = () => {
  const features = [
    {
      icon: DollarSign,
      title: "Eliminate Duty Fees",
      description: "Leverage $800 daily duty-free threshold for US customers"
    },
    {
      icon: MapPin,
      title: "Canadian Storage",
      description: "Store inventory in Canada to qualify for Section 321 benefits"
    },
    {
      icon: Globe,
      title: "Cross-Border Fulfillment",
      description: "Seamless order fulfillment from Canada to US customers"
    },
    {
      icon: TrendingDown,
      title: "Duty Drawback Programs",
      description: "Recover duties through strategic supply chain restructuring"
    },
    {
      icon: Shield,
      title: "Compliance Management",
      description: "Full regulatory compliance and documentation handling"
    },
    {
      icon: BarChart3,
      title: "Savings Analytics",
      description: "Track duty savings and optimize your supply chain costs"
    }
  ];

  const benefits = [
    "Save 10-25% on imported goods duties",
    "Leverage Canada's generous Free Trade Agreements",
    "Qualify for duty deferrals and drawback programs",
    "Reduce tariff exposure on Chinese imports",
    "Access Section 321 de minimis benefits",
    "Streamlined cross-border logistics"
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Import to Canada",
      description: "Ship your goods to our Canadian facilities to qualify for preferential duty treatment",
      icon: Building
    },
    {
      step: "2",
      title: "Store & Process",
      description: "We handle storage, prep, and order processing in compliance with all regulations",
      icon: Truck
    },
    {
      step: "3",
      title: "Fulfill Orders",
      description: "Ship Section 321-compliant orders (≤$800) duty-free to US customers",
      icon: Globe
    },
    {
      step: "4",
      title: "Claim Drawback",
      description: "Receive duty refunds on goods exported to US customers",
      icon: DollarSign
    }
  ];

  const savingsExamples = [
    {
      scenario: "Electronics (15% duty)",
      annualVolume: "$500K",
      traditionalDuty: "$75,000",
      section321Duty: "$0",
      savings: "$75,000"
    },
    {
      scenario: "Apparel (17% duty)",
      annualVolume: "$1M",
      traditionalDuty: "$170,000",
      section321Duty: "$0",
      savings: "$170,000"
    },
    {
      scenario: "Home goods (8% duty)",
      annualVolume: "$2M",
      traditionalDuty: "$160,000",
      section321Duty: "$0",
      savings: "$160,000"
    }
  ];

  const serviceRates = [
    {
      service: "Storage & Handling",
      rate: "$0.48",
      originalRate: "$0.50",
      unit: "per cubic foot/month"
    },
    {
      service: "Order Processing",
      rate: "$2.38",
      originalRate: "$2.50",
      unit: "per order"
    },
    {
      service: "Cross-Border Shipping",
      rate: "$8.55",
      originalRate: "$9.00",
      unit: "per package"
    },
    {
      service: "Compliance Documentation",
      rate: "$47",
      originalRate: "$49",
      unit: "per shipment"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            Fastest Growing Logistics Company 2025 - Clutch
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Eliminate Duty Fees with Section 321
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Import your goods to Canada and leverage Section 321 regulations to ship duty-free to US customers. Save 10-25% on duties with our compliant cross-border fulfillment solution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Calculate Savings <Calculator className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Section 321 Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Strategic supply chain restructuring to maximize duty savings and trade benefits
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-sm relative">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <step.icon className="h-8 w-8 text-primary" />
                    <Badge className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {step.step}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Complete Section 321 Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need for compliant cross-border fulfillment and duty optimization
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

      {/* Savings Examples */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Savings Examples
            </h2>
            <p className="text-xl text-muted-foreground">
              See how Section 321 can transform your duty expenses
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Annual Duty Savings Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Scenario</th>
                      <th className="text-center p-4 font-semibold">Annual Volume</th>
                      <th className="text-center p-4 font-semibold">Traditional Duty</th>
                      <th className="text-center p-4 font-semibold">Section 321 Duty</th>
                      <th className="text-center p-4 font-semibold">Annual Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savingsExamples.map((example, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4 font-medium">{example.scenario}</td>
                        <td className="p-4 text-center">{example.annualVolume}</td>
                        <td className="p-4 text-center text-muted-foreground">{example.traditionalDuty}</td>
                        <td className="p-4 text-center font-semibold text-primary">{example.section321Duty}</td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary" className="text-green-600 bg-green-50">
                            {example.savings}
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
                Maximize Your Trade Benefits
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our Section 321 program helps you navigate complex trade regulations while maximizing savings through strategic supply chain optimization.
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
                  <h3 className="text-3xl font-bold text-primary mb-2">$800</h3>
                  <p className="text-muted-foreground">Daily duty-free threshold per customer</p>
                </div>
                
                <div className="flex items-center justify-around text-center">
                  <div>
                    <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">100%</p>
                    <p className="text-sm text-muted-foreground">Compliance rate</p>
                  </div>
                  <div>
                    <TrendingDown className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">25%</p>
                    <p className="text-sm text-muted-foreground">Average savings</p>
                  </div>
                  <div>
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">150+</p>
                    <p className="text-sm text-muted-foreground">Brands served</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Transparent Service Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              5% better rates than competitors with full compliance included
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceRates.map((service, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-lg">{service.service}</CardTitle>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-bold">{service.rate}</span>
                      <span className="text-sm text-muted-foreground line-through">{service.originalRate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{service.unit}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    5% Savings
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <SmartCTASection
        serviceType="section-321"
        title="Ready to Eliminate Duty Fees?"
        description="Join 150+ brands using Section 321 to reduce duties and optimize their supply chain"
        className="py-16 px-4 bg-primary/5"
      />
    </div>
  );
};

export default Section321;