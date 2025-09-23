import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap, 
  CheckCircle, 
  ArrowRight,
  Database,
  Settings,
  TrendingUp,
  Globe,
  Users,
  Star
} from 'lucide-react';

const PrepSoftware = () => {
  const features = [
    {
      icon: Monitor,
      title: "Real-Time Dashboard",
      description: "Live inventory tracking with instant updates and automated alerts"
    },
    {
      icon: Database,
      title: "Direct Seller Central Integration",
      description: "Seamless API connection eliminates manual data entry and errors"
    },
    {
      icon: BarChart3,
      title: "Smart Analytics & Reporting",
      description: "Advanced insights on performance, costs, and optimization opportunities"
    },
    {
      icon: Settings,
      title: "Automated Workflows",
      description: "Smart routing, prep decisions, and shipping automation"
    },
    {
      icon: Shield,
      title: "Quality Control Tracking",
      description: "Photo documentation and compliance monitoring for every shipment"
    },
    {
      icon: TrendingUp,
      title: "Predictive Forecasting",
      description: "AI-powered demand prediction and inventory optimization"
    }
  ];

  const benefits = [
    "Reduce operational overhead by 60%",
    "Eliminate manual spreadsheet tracking",
    "Real-time inventory visibility across all channels",
    "Automated prep and shipping decisions",
    "Comprehensive quality control documentation",
    "Scalable platform that grows with your business"
  ];

  const pricing = [
    {
      tier: "Starter",
      price: "$47",
      originalPrice: "$49",
      description: "Perfect for new sellers",
      features: [
        "Up to 100 SKUs",
        "Basic dashboard",
        "Email support",
        "Standard reporting"
      ]
    },
    {
      tier: "Professional",
      price: "$142",
      originalPrice: "$149",
      description: "For growing businesses",
      features: [
        "Up to 1,000 SKUs",
        "Advanced analytics",
        "Priority support",
        "Custom workflows",
        "API access"
      ],
      popular: true
    },
    {
      tier: "Enterprise",
      price: "$333",
      originalPrice: "$349",
      description: "For high-volume sellers",
      features: [
        "Unlimited SKUs",
        "White-label options",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced forecasting"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            Industry-Leading FBA Software Platform
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Command Center for Amazon Success
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Ditch the spreadsheets and endless emails. Our FBA prep software streamlines your entire Amazon operation with real-time tracking, automated workflows, and intelligent insights.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Schedule Demo
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
              Built by Sellers, For Sellers
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature designed to solve real FBA challenges and streamline your operations
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

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transform Your FBA Operations
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our platform eliminates the chaos of managing Amazon logistics with intelligent automation and real-time visibility.
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
                  <Clock className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Save 15+ Hours/Week</h3>
                    <p className="text-muted-foreground">Eliminate manual tracking and data entry</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">99.9% Accuracy</h3>
                    <p className="text-muted-foreground">Automated processes reduce human error</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Globe className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Multi-Channel Ready</h3>
                    <p className="text-muted-foreground">Integrates with all major platforms</p>
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
              Transparent Pricing That Scales
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your business. 5% better value than competitors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.tier}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground line-through">${plan.originalPrice}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
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

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Streamline Your FBA Operations?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of sellers who've transformed their Amazon business with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Contact Sales
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrepSoftware;