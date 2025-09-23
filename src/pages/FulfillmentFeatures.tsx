import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FulfillmentNavbar } from "@/components/fulfillment/FulfillmentNavbar";
import { 
  Warehouse, 
  Package, 
  Zap, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Shield,
  Clock,
  Target,
  MapPin,
  Boxes,
  Camera,
  Settings,
  Users,
  TrendingUp,
  FileText,
  Search,
  QrCode
} from "lucide-react";
import { Link } from "react-router-dom";

const FulfillmentFeatures = () => {
  const coreFeatures = [
    {
      icon: Warehouse,
      title: "Advanced Warehouse Management",
      description: "Complete WMS with real-time inventory tracking, automated workflows, and multi-location support for scalable operations.",
      features: [
        "Real-time inventory tracking across all locations",
        "Automated putaway and location optimization", 
        "Cycle counting and inventory reconciliation",
        "Multi-location inventory management",
        "Bin location tracking and optimization",
        "Integration with barcode and RFID systems"
      ]
    },
    {
      icon: Package,
      title: "End-to-End Order Fulfillment",
      description: "Streamlined order processing from receipt to shipment with intelligent picking routes and quality verification.",
      features: [
        "Automated order prioritization and batching",
        "Optimized pick path generation",
        "Real-time order status tracking",
        "Multi-channel order consolidation",
        "Pick verification and quality control",
        "Automated packing slip generation"
      ]
    },
    {
      icon: Target,
      title: "Prep Services & Quality Control",
      description: "Complete prep services for FBA, marketplace compliance, and custom requirements with photo documentation.",
      features: [
        "FBA prep and labeling services",
        "Custom bundling and kitting",
        "Product photography and documentation",
        "Quality inspection workflows",
        "Compliance checking and validation",
        "Custom prep work and packaging"
      ]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics & Reporting",
      description: "Deep insights into fulfillment performance, inventory turnover, and operational efficiency with real-time dashboards.",
      features: [
        "Real-time performance dashboards",
        "Inventory turnover analysis",
        "Cost per order tracking",
        "SLA performance monitoring",
        "Custom reporting and alerts",
        "Forecasting and demand planning"
      ]
    },
    {
      icon: RefreshCw,
      title: "Returns Management System",
      description: "Comprehensive returns processing with inspection workflows, restocking automation, and refurbishment tracking.",
      features: [
        "Automated return label generation",
        "Return inspection and documentation",
        "Restocking workflow automation",
        "Refurbishment and repair tracking",
        "Return reason analysis and reporting",
        "Customer communication automation"
      ]
    },
    {
      icon: Zap,
      title: "Automation & Integration",
      description: "Seamless integration with e-commerce platforms, ERPs, and shipping carriers with intelligent automation workflows.",
      features: [
        "Real-time API integrations",
        "Automated workflow triggers",
        "EDI and data exchange capabilities",
        "Custom integration development",
        "Webhook and event notifications",
        "Batch processing and scheduling"
      ]
    }
  ];

  const specializedServices = [
    {
      icon: Camera,
      title: "Photo Documentation",
      description: "Professional product photography and documentation",
      benefits: ["Product condition photos", "Damage documentation", "Quality verification", "Custom photography"]
    },
    {
      icon: QrCode,
      title: "Barcode & Labeling",
      description: "Complete labeling and barcode management",
      benefits: ["Custom label printing", "Barcode generation", "Compliance labeling", "Asset tracking"]
    },
    {
      icon: Clock,
      title: "Same-Day Processing",
      description: "Expedited processing for urgent orders",
      benefits: ["Rush order processing", "Same-day shipping", "Priority handling", "Emergency fulfillment"]
    },
    {
      icon: Settings,
      title: "Custom Workflows",
      description: "Tailored processes for unique requirements",
      benefits: ["Custom automation", "Specialized handling", "Unique packaging", "Brand-specific processes"]
    }
  ];

  const comparisonFeatures = [
    {
      feature: "Inventory Accuracy",
      prepfox: "✅ 99.8% accuracy",
      traditional: "✅ 95% accuracy",
      advantage: "Advanced tracking & QC processes"
    },
    {
      feature: "Processing Speed",
      prepfox: "✅ Same-day processing",
      traditional: "✅ 1-2 day processing",
      advantage: "Automated workflows & optimization"
    },
    {
      feature: "Integration Options",
      prepfox: "✅ Real-time API",
      traditional: "✅ Basic integrations",
      advantage: "Advanced API & webhook support"
    },
    {
      feature: "Quality Control",
      prepfox: "✅ Photo documentation",
      traditional: "✅ Basic inspection",
      advantage: "Comprehensive QC with photos"
    },
    {
      feature: "Reporting",
      prepfox: "✅ Real-time dashboards",
      traditional: "✅ Daily reports",
      advantage: "Live data & custom reporting"
    },
    {
      feature: "Pricing Model",
      prepfox: "✅ Transparent per-item",
      traditional: "❌ Hidden fees",
      advantage: "No setup fees or minimums"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <FulfillmentNavbar />
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🚀 Enterprise-Grade Fulfillment Features
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Complete 3PL &
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Fulfillment Platform</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            From receiving to shipping, PrepFox Fulfill provides enterprise-grade warehouse management 
            and fulfillment capabilities that scale with your business.
          </p>

          <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
            Get Custom Quote
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Fulfillment Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run a professional fulfillment operation with enterprise-grade capabilities
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="prep-fox-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-gradient-primary p-3 rounded-lg shadow-glow">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-3">
                    {feature.features.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Services */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Specialized Services
            </h2>
            <p className="text-lg text-muted-foreground">
              Additional services to meet your unique fulfillment requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {specializedServices.map((service, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg shadow-glow w-fit mx-auto mb-4">
                    <service.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                  <div className="space-y-2">
                    {service.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-2 justify-center">
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-xs text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              PrepFox Fulfill vs Traditional 3PLs
            </h2>
            <p className="text-lg text-muted-foreground">
              See how our modern approach compares to traditional fulfillment providers
            </p>
          </div>

          <Card className="prep-fox-card max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-6 font-semibold text-foreground">Feature</th>
                      <th className="text-center p-6 font-semibold text-primary">PrepFox Fulfill</th>
                      <th className="text-center p-6 font-semibold text-muted-foreground">Traditional 3PL</th>
                      <th className="text-left p-6 font-semibold text-foreground">Our Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-6 font-medium text-foreground">{item.feature}</td>
                        <td className="p-6 text-center text-primary font-medium">{item.prepfox}</td>
                        <td className="p-6 text-center text-muted-foreground">{item.traditional}</td>
                        <td className="p-6 text-sm text-muted-foreground">{item.advantage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powered by Modern Technology
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our fulfillment operations are powered by cutting-edge technology for maximum efficiency and accuracy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="prep-fox-card text-center">
              <CardContent className="p-8">
                <div className="bg-gradient-primary p-4 rounded-lg shadow-glow w-fit mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Real-Time Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Live dashboards and reporting give you complete visibility into your fulfillment operations, 
                  inventory levels, and performance metrics.
                </p>
              </CardContent>
            </Card>

            <Card className="prep-fox-card text-center">
              <CardContent className="p-8">
                <div className="bg-gradient-primary p-4 rounded-lg shadow-glow w-fit mx-auto mb-6">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Smart Automation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  AI-powered automation optimizes pick routes, predicts demand, and automates routine tasks 
                  to maximize efficiency and reduce errors.
                </p>
              </CardContent>
            </Card>

            <Card className="prep-fox-card text-center">
              <CardContent className="p-8">
                <div className="bg-gradient-primary p-4 rounded-lg shadow-glow w-fit mx-auto mb-6">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Enterprise Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Bank-level security, compliance certifications, and data protection ensure your business 
                  and customer data is always secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Fulfillment?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get a custom quote and see how PrepFox Fulfill can streamline your operations with enterprise-grade features.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Get Custom Quote
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Schedule Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            No setup fees • Custom pricing • 99.8% accuracy guarantee
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
            © 2024 PrepFox Fulfill. All rights reserved. Professional fulfillment made simple.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FulfillmentFeatures;