import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Map, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Building,
  Users,
  Star,
  Plane,
  DollarSign,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

const GlobalMarketplaces = () => {
  const features = [
    {
      icon: Globe,
      title: "12+ Marketplace Integration",
      description: "Seamless integration across Amazon, eBay, Walmart, Target, and more"
    },
    {
      icon: Map,
      title: "Multi-Region Fulfillment",
      description: "Strategically located fulfillment centers across North America and Europe"
    },
    {
      icon: Shield,
      title: "Compliance Management",
      description: "Navigate complex international regulations and marketplace requirements"
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Data-driven insights for optimal global market positioning"
    },
    {
      icon: Zap,
      title: "Unified Operations",
      description: "Single dashboard to manage all your global marketplace operations"
    },
    {
      icon: Target,
      title: "Localized Strategy",
      description: "Region-specific pricing, content, and fulfillment optimization"
    }
  ];

  const supportedMarketplaces = [
    { name: "Amazon Global", regions: "US, CA, UK, DE, FR, IT, ES, JP, AU" },
    { name: "eBay International", regions: "US, UK, DE, AU, CA" },
    { name: "Walmart Marketplace", regions: "US, CA, MX" },
    { name: "Target Plus", regions: "US" },
    { name: "Shopify Markets", regions: "Global" },
    { name: "Etsy", regions: "US, UK, CA, AU" },
    { name: "Overstock", regions: "US" },
    { name: "Wayfair", regions: "US, UK, DE, CA" },
    { name: "Newegg Global", regions: "US, CA, UK" },
    { name: "Rakuten", regions: "US, JP" },
    { name: "Facebook Marketplace", regions: "Global" },
    { name: "Google Shopping", regions: "Global" }
  ];

  const benefits = [
    "Access 12+ major marketplaces through one partner",
    "Reduce global logistics complexity by 60%",
    "Increase international sales by 150% average",
    "Navigate regulations across multiple countries",
    "Optimize pricing for each regional market",
    "Centralized inventory management across all channels"
  ];

  const globalStats = [
    {
      metric: "Marketplaces",
      value: "12+",
      description: "Integrated platforms"
    },
    {
      metric: "Countries",
      value: "25+",
      description: "Markets served"
    },
    {
      metric: "Revenue Growth",
      value: "150%",
      description: "Average increase"
    },
    {
      metric: "Compliance Rate",
      value: "100%",
      description: "Regulatory adherence"
    }
  ];

  const serviceTiers = [
    {
      tier: "Multi-Market Starter",
      markets: "3-5 marketplaces",
      price: "$285",
      originalPrice: "$299",
      description: "Perfect for expanding brands",
      features: [
        "3-5 marketplace integrations",
        "Basic compliance support",
        "Unified inventory management",
        "Monthly performance reports",
        "Email support"
      ]
    },
    {
      tier: "Global Expansion",
      markets: "6-10 marketplaces",
      price: "$570",
      originalPrice: "$599",
      description: "Comprehensive global reach",
      features: [
        "6-10 marketplace integrations",
        "Advanced compliance management",
        "Multi-region fulfillment",
        "Real-time analytics",
        "Dedicated account manager",
        "Weekly strategy calls"
      ],
      popular: true
    },
    {
      tier: "Enterprise Global",
      markets: "All 12+ marketplaces",
      price: "$950",
      originalPrice: "$999",
      description: "Complete global dominance",
      features: [
        "All marketplace integrations",
        "White-glove service",
        "Custom compliance solutions",
        "24/7 priority support",
        "Executive reporting",
        "Performance guarantees"
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
            Top 100 B2B Logistics Company 2025 - Clutch
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Global Marketplace
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Expand your reach across 12+ marketplaces through a single, trusted partner. Our network of fulfillment centers provides comprehensive logistics services designed to boost your global e-commerce operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Explore Global Opportunities <Globe className="ml-2 h-5 w-5" />
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

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Global Market Expansion Made Simple
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Drive international success with purpose-built 3PL fulfillment tailored for global market domination
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

      {/* Supported Marketplaces */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Supported Global Marketplaces
            </h2>
            <p className="text-xl text-muted-foreground">
              Connect to the world's largest e-commerce platforms
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedMarketplaces.map((marketplace, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{marketplace.name}</h3>
                    <p className="text-sm text-muted-foreground">{marketplace.regions}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Stats */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Growth-Focused Global Partner
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We deliver region-specific pricing and overcome regulatory barriers in cross-continental shipping that converts international buyers into brand ambassadors.
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
            
            <div className="grid grid-cols-2 gap-6">
              {globalStats.map((stat, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="font-semibold mb-1">{stat.metric}</div>
                  <div className="text-sm text-muted-foreground">{stat.description}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Capabilities */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Global Services
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for successful international expansion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <Building className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Strategic Relationships</h3>
              <p className="text-sm text-muted-foreground">Direct partnerships with major marketplaces</p>
            </Card>
            
            <Card className="text-center p-6">
              <Plane className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Global Fulfillment</h3>
              <p className="text-sm text-muted-foreground">Multi-region logistics networks</p>
            </Card>
            
            <Card className="text-center p-6">
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Market Intelligence</h3>
              <p className="text-sm text-muted-foreground">Data-driven expansion strategies</p>
            </Card>
            
            <Card className="text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Compliance Management</h3>
              <p className="text-sm text-muted-foreground">International regulations handled</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Global Expansion Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Scale-based pricing for international growth. 5% better value than competitors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {serviceTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.tier}</CardTitle>
                  <CardDescription className="text-sm">{tier.markets}</CardDescription>
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
            Ready to Go Global?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join brands expanding across 12+ marketplaces with our global fulfillment network
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Global Strategy <Globe className="ml-2 h-5 w-5" />
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

export default GlobalMarketplaces;