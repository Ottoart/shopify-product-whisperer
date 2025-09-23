import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Scale, 
  CheckCircle, 
  ArrowRight,
  Shield,
  Truck,
  BarChart3,
  Star,
  Building,
  Users,
  Zap,
  Target,
  Globe,
  Clock
} from 'lucide-react';

const WholesalePrep = () => {
  const features = [
    {
      icon: Scale,
      title: "Massive Volume Handling",
      description: "Process over 1 million units monthly with enterprise-grade systems"
    },
    {
      icon: Shield,
      title: "Quality Verification",
      description: "Comprehensive inspection and verification for every wholesale shipment"
    },
    {
      icon: Target,
      title: "Intelligent Labeling",
      description: "Advanced barcode and FNSKU management for wholesale operations"
    },
    {
      icon: Package,
      title: "Bundling & Kitting",
      description: "Professional product bundling and kit assembly services"
    },
    {
      icon: Truck,
      title: "Expedited Processing",
      description: "Fast-track wholesale prep with 48-hour processing guarantee"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Detailed reporting on prep quality, speed, and cost optimization"
    }
  ];

  const services = [
    {
      service: "Product Inspection",
      description: "Complete quality control for wholesale inventory",
      volume: "Unlimited",
      guarantee: "99.9% accuracy"
    },
    {
      service: "FNSKU Labeling",
      description: "Barcode application and management",
      volume: "1M+ units/month",
      guarantee: "Zero errors"
    },
    {
      service: "Bundling & Kitting",
      description: "Custom product combinations and sets",
      volume: "Any complexity",
      guarantee: "Brand standards"
    },
    {
      service: "Packaging Optimization",
      description: "Cost-effective packaging solutions",
      volume: "All shipments",
      guarantee: "Damage protection"
    },
    {
      service: "Compliance Management",
      description: "FBA requirement adherence",
      volume: "Full coverage",
      guarantee: "100% compliant"
    },
    {
      service: "Expedited Processing",
      description: "Priority wholesale handling",
      volume: "Rush orders",
      guarantee: "48-hour SLA"
    }
  ];

  const benefits = [
    "Handle 10x larger volumes than standard prep",
    "Reduce prep costs by 30% through economies of scale",
    "99.9% accuracy on wholesale shipments",
    "48-hour processing for urgent wholesale orders",
    "Dedicated wholesale account management",
    "Custom workflows for your specific requirements"
  ];

  const volumeTiers = [
    {
      tier: "High Volume",
      volume: "10K-100K units/month",
      rate: "$0.42",
      originalRate: "$0.44",
      description: "Ideal for growing wholesalers",
      features: [
        "Standard prep services",
        "Quality verification",
        "Basic reporting",
        "Email support"
      ]
    },
    {
      tier: "Enterprise",
      volume: "100K-500K units/month",
      rate: "$0.38",
      originalRate: "$0.40",
      description: "For established wholesale operations",
      features: [
        "All High Volume features",
        "Expedited processing",
        "Advanced analytics",
        "Dedicated account manager",
        "Custom workflows"
      ],
      popular: true
    },
    {
      tier: "Mega Scale",
      volume: "500K+ units/month",
      rate: "$0.33",
      originalRate: "$0.35",
      description: "Maximum capacity and customization",
      features: [
        "All Enterprise features",
        "White-glove service",
        "Custom automation",
        "24/7 priority support",
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
            Fastest Growing Logistics Company 2025 - Clutch
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Path to Amazon Wholesale Success
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transform wholesale complexity into streamlined success with comprehensive FBA prep strategies that minimize costs and maximize marketplace potential. Built for enterprise-scale operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Wholesale Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Tour Our Facility
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
              Wholesale Preparation, Redefined
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Game-changing FBA wholesale solutions that transform raw inventory into seller-optimized assets
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

      {/* Services Table */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Wholesale Services
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for large-scale FBA preparation
            </p>
          </div>
          
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Service Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Service</th>
                      <th className="text-center p-4 font-semibold">Description</th>
                      <th className="text-center p-4 font-semibold">Capacity</th>
                      <th className="text-center p-4 font-semibold">Guarantee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4 font-medium">{service.service}</td>
                        <td className="p-4 text-center text-muted-foreground">{service.description}</td>
                        <td className="p-4 text-center font-semibold text-primary">{service.volume}</td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary">{service.guarantee}</Badge>
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
                Scaling Beyond Limits
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your marketplace ambitions demand more than standard prep. We deliver comprehensive verification, intelligent labeling, and seamless wholesale fulfillment.
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
                  <h3 className="text-3xl font-bold text-primary mb-2">1M+</h3>
                  <p className="text-muted-foreground">Units processed monthly</p>
                </div>
                
                <div className="flex items-center justify-around text-center">
                  <div>
                    <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">48 Hours</p>
                    <p className="text-sm text-muted-foreground">Processing SLA</p>
                  </div>
                  <div>
                    <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">99.9%</p>
                    <p className="text-sm text-muted-foreground">Accuracy rate</p>
                  </div>
                  <div>
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="font-semibold">200+</p>
                    <p className="text-sm text-muted-foreground">Wholesale clients</p>
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
              Volume-Based Wholesale Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Scale pricing that grows with your business. 5% better rates than competitors.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {volumeTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">{tier.tier}</CardTitle>
                  <CardDescription className="text-sm">{tier.volume}</CardDescription>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-3xl font-bold">{tier.rate}</span>
                      <span className="text-sm text-muted-foreground line-through">{tier.originalRate}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">per unit</p>
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
            Ready to Scale Your Wholesale Operations?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join 200+ wholesale brands using our enterprise-grade prep services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Get Wholesale Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/quote">
                Schedule Facility Tour
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WholesalePrep;