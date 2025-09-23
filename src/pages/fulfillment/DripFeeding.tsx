import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Calendar, 
  Shield, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Target,
  DollarSign,
  Package,
  Star,
  Clock,
  AlertTriangle,
  Zap,
  Users
} from 'lucide-react';

const DripFeeding = () => {
  const features = [
    {
      icon: Calendar,
      title: "Strategic Timing",
      description: "AI-powered inventory release schedules optimized for sales velocity"
    },
    {
      icon: Shield,
      title: "Storage Fee Protection",
      description: "Avoid Amazon's costly long-term storage fees with intelligent planning"
    },
    {
      icon: BarChart3,
      title: "IPI Optimization",
      description: "Maintain healthy Inventory Performance Index scores automatically"
    },
    {
      icon: Target,
      title: "Stock Coverage Analysis",
      description: "Perfect balance between stockouts and excess inventory"
    },
    {
      icon: TrendingUp,
      title: "Sales Velocity Maintenance",
      description: "Consistent product availability for maximum marketplace visibility"
    },
    {
      icon: Zap,
      title: "Real-Time Adjustments",
      description: "Dynamic schedule updates based on sales performance and trends"
    }
  ];

  const benefits = [
    "Reduce storage costs by 40-60%",
    "Eliminate long-term storage fees",
    "Maintain 95%+ stock availability",
    "Optimize IPI scores automatically",
    "Maximize profit margins through timing",
    "Minimize stockout risks"
  ];

  const dripStrategies = [
    {
      strategy: "Seasonal Products",
      description: "Perfect timing for holiday and seasonal inventory",
      example: "Halloween costumes released in early October",
      savings: "65% storage savings"
    },
    {
      strategy: "High-Volume SKUs",
      description: "Steady flow for fast-moving products",
      example: "Weekly shipments of best-sellers",
      savings: "40% cost reduction"
    },
    {
      strategy: "New Product Launches",
      description: "Gradual market introduction with performance monitoring",
      example: "Test batches before full inventory commitment",
      savings: "Risk mitigation"
    },
    {
      strategy: "Clearance Items",
      description: "Strategic release to avoid deep discounts",
      example: "Controlled clearance over 90 days",
      savings: "25% higher margins"
    }
  ];

  const pricingTiers = [
    {
      tier: "Smart Drip",
      price: "$0.19",
      originalPrice: "$0.20",
      description: "AI-powered basic scheduling",
      features: [
        "Automated release schedules",
        "Storage fee optimization",
        "Basic performance tracking",
        "Monthly strategy reviews"
      ]
    },
    {
      tier: "Strategic Drip",
      price: "$0.33",
      originalPrice: "$0.35",
      description: "Advanced optimization with insights",
      features: [
        "Advanced AI forecasting",
        "Real-time adjustments",
        "IPI score management",
        "Weekly strategy calls",
        "Custom reporting"
      ],
      popular: true
    },
    {
      tier: "Enterprise Drip",
      price: "$0.47",
      originalPrice: "$0.49",
      description: "White-glove strategic management",
      features: [
        "Dedicated strategist",
        "Custom algorithms",
        "Multi-marketplace optimization",
        "Daily monitoring",
        "Risk insurance"
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
            Fastest Growing Logistics Company 2025 - Clutch
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Inventory, Strategically Delivered
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Scale your Amazon success with our expert drip feed fulfillment. We implement strategic inventory delivery schedules that optimize profit margins while avoiding storage penalties and stockout risks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Strategy Consultation <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              FBA Inventory, Perfectly Timed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Achieve remarkable Amazon growth through data-driven inventory deployment
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

      {/* Drip Strategies */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proven Drip Feed Strategies
            </h2>
            <p className="text-xl text-muted-foreground">
              Tailored approaches for different product types and business goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dripStrategies.map((strategy, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start space-x-4">
                  <Badge variant="outline" className="mt-1">{strategy.savings}</Badge>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{strategy.strategy}</h3>
                    <p className="text-muted-foreground mb-3">{strategy.description}</p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium">Example: {strategy.example}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Transform Your Inventory Strategy
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our drip feeding service eliminates the guesswork from inventory management, using advanced analytics to optimize every shipment.
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
                  <h3 className="text-3xl font-bold text-primary mb-2">$75K+</h3>
                  <p className="text-muted-foreground">Average annual storage savings</p>
                </div>
                
                <div className="flex items-center justify-around text-center">
                  <div>
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">24/7</p>
                    <p className="text-sm text-muted-foreground">Monitoring</p>
                  </div>
                  <div>
                    <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">Zero</p>
                    <p className="text-sm text-muted-foreground">Stockouts</p>
                  </div>
                  <div>
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">500+</p>
                    <p className="text-sm text-muted-foreground">Brands served</p>
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
              Flexible Drip Feed Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Pay per unit with no setup fees. 5% better value than competitors.
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
                  <CardTitle className="text-2xl">{tier.tier}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold">{tier.price}</span>
                      <span className="text-sm text-muted-foreground line-through">{tier.originalPrice}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">per unit handled</p>
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
            Ready to Optimize Your Inventory Strategy?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of brands using our drip feed service to reduce costs and maximize profits
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Talk to Strategist <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Calculate ROI
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DripFeeding;