import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Globe, 
  Users, 
  CheckCircle, 
  ArrowRight,
  BarChart3,
  Map,
  Star,
  Building,
  Zap,
  Shield,
  Rocket,
  DollarSign
} from 'lucide-react';

const MarketExpansion = () => {
  const features = [
    {
      icon: Target,
      title: "Strategic Market Analysis",
      description: "Data-driven market selection and penetration strategies"
    },
    {
      icon: Building,
      title: "Channel Partnerships",
      description: "Access to exclusive marketplace relationships and hard-to-join channels"
    },
    {
      icon: Globe,
      title: "Cross-Platform Management",
      description: "Unified operations across 12+ marketplaces from one dashboard"
    },
    {
      icon: BarChart3,
      title: "Performance Optimization",
      description: "Continuous optimization of listings, pricing, and fulfillment metrics"
    },
    {
      icon: Shield,
      title: "Brand Protection",
      description: "Comprehensive brand monitoring and protection across all channels"
    },
    {
      icon: Rocket,
      title: "Growth Acceleration",
      description: "Proven strategies to scale revenue and market presence rapidly"
    }
  ];

  const expansionServices = [
    {
      category: "Marketplace Management",
      services: [
        "Strategic Relationships",
        "Fulfillment Speed Optimization", 
        "Metric Management",
        "Template Management",
        "Customer Service",
        "API Integrations"
      ]
    },
    {
      category: "Revenue Optimization",
      services: [
        "Dynamic Pricing",
        "Listing Management",
        "Product Compliance",
        "Returns Management",
        "Enhanced Brand Content",
        "Demand Forecasting"
      ]
    },
    {
      category: "Marketing & Growth",
      services: [
        "SEO Optimized Content",
        "Feedback Management",
        "Promotions & Deals",
        "Sponsored Ads",
        "StoreFront Management",
        "Brand Advertising"
      ]
    },
    {
      category: "Advanced Strategy",
      services: [
        "Review Generation",
        "Policy Adherence",
        "Affiliate Marketing",
        "International Expansion",
        "Performance Analytics",
        "Competitive Intelligence"
      ]
    }
  ];

  const benefits = [
    "Expand to 12+ marketplaces through one partner",
    "Increase revenue by 200-400% within 12 months",
    "Access hard-to-join premium channels",
    "Unified management across all platforms",
    "Expert marketplace relationship management",
    "Comprehensive brand protection and monitoring"
  ];

  const marketplaceTiers = [
    {
      tier: "Market Explorer",
      marketplaces: "3-5 new channels",
      price: "$475",
      originalPrice: "$499",
      description: "Perfect for initial expansion",
      features: [
        "3-5 marketplace onboarding",
        "Basic optimization",
        "Monthly reporting",
        "Email support",
        "Standard integrations"
      ]
    },
    {
      tier: "Growth Accelerator",
      marketplaces: "6-10 channels",
      price: "$1,425",
      originalPrice: "$1,499",
      description: "Comprehensive multi-channel growth",
      features: [
        "6-10 marketplace management",
        "Advanced optimization",
        "Real-time analytics",
        "Dedicated account manager",
        "Custom strategies",
        "Weekly performance reviews"
      ],
      popular: true
    },
    {
      tier: "Market Domination",
      marketplaces: "All 12+ channels",
      price: "$2,375",
      originalPrice: "$2,499",
      description: "Complete marketplace ecosystem",
      features: [
        "All marketplace access",
        "White-glove service",
        "Executive reporting",
        "24/7 priority support",
        "Custom development",
        "Performance guarantees"
      ]
    }
  ];

  const successMetrics = [
    {
      metric: "Revenue Growth",
      value: "300%",
      description: "Average increase in 12 months",
      icon: TrendingUp
    },
    {
      metric: "New Channels",
      value: "12+",
      description: "Marketplaces available",
      icon: Globe
    },
    {
      metric: "Client Success Rate",
      value: "95%",
      description: "Expansion success rate",
      icon: Target
    },
    {
      metric: "Time to Market",
      value: "30 days",
      description: "Average expansion timeline",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            Marketplace Expansion Specialists
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Expand & Diversify Your Marketplace Business
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Grow your reach across 12+ marketplaces through a single, trusted partner. Access exclusive channels, optimize performance, and scale revenue with our proven expansion strategies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Start Expansion <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Market Analysis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {successMetrics.map((metric, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <metric.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                <div className="font-semibold mb-1">{metric.metric}</div>
                <div className="text-sm text-muted-foreground">{metric.description}</div>
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
              Cross-Platform Selling with One Partner
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Each marketplace comes with specific requirements and challenges. We're your one-partner solution for increasing discoverability and unlocking new revenue streams.
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

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Marketplace Management, Multiplied
            </h2>
            <p className="text-xl text-muted-foreground">
              Simplify your ecommerce operation with a single solution for all marketplaces
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {expansionServices.map((category, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-primary">{category.category}</h3>
                <ul className="space-y-2">
                  {category.services.map((service, serviceIndex) => (
                    <li key={serviceIndex} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{service}</span>
                    </li>
                  ))}
                </ul>
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
                Elevate Your Standing Across Multiple Marketplaces
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Expanding beyond one or two channels is complex. Each marketplace comes with specific requirements, variables, and unique challenges. We simplify this complexity.
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
                  <h3 className="text-3xl font-bold text-primary mb-2">12+</h3>
                  <p className="text-muted-foreground">Marketplaces available for expansion</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Map className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Strategic Relationships</h4>
                      <p className="text-sm text-muted-foreground">Direct partnerships with major platforms</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">More Channels, More Shoppers</h4>
                      <p className="text-sm text-muted-foreground">Reach millions of new customers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Revenue Multiplication</h4>
                      <p className="text-sm text-muted-foreground">300% average growth in 12 months</p>
                    </div>
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
              Expansion Investment Plans
            </h2>
            <p className="text-xl text-muted-foreground">
              Scale-based pricing for marketplace growth. 5% better value than competitors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {marketplaceTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.tier}</CardTitle>
                  <CardDescription className="text-sm">{tier.marketplaces}</CardDescription>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-sm text-muted-foreground line-through">{tier.originalPrice}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full mt-6" variant={tier.popular ? "default" : "outline"}>
                    <Link to="/fulfillment/quote">
                      Start Expansion
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
            Ready to Multiply Your Marketplace Presence?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join brands achieving 300% revenue growth through strategic marketplace expansion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Expansion Strategy <Rocket className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Schedule Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MarketExpansion;