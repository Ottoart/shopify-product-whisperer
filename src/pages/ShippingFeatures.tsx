import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/MainLayout";
import { 
  Truck, 
  Package, 
  TrendingUp, 
  Zap, 
  Globe, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Warehouse,
  ShoppingCart,
  RefreshCw,
  Shield,
  Clock,
  Printer,
  Settings,
  Users,
  Target,
  Layers,
  MonitorSpeaker,
  FileText,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";

const ShippingFeatures = () => {
  const coreFeatures = [
    {
      icon: ShoppingCart,
      title: "Multi-Channel Order Management",
      description: "Centralize orders from all your sales channels in one unified dashboard. Never miss an order again with real-time synchronization.",
      features: [
        "Real-time order sync from 50+ platforms",
        "Automated order routing and prioritization", 
        "Bulk order processing and management",
        "Custom order filters and search",
        "Order status tracking and updates",
        "Automated customer notifications"
      ]
    },
    {
      icon: Package,
      title: "Smart Inventory Management",
      description: "Keep your inventory perfectly synchronized across all sales channels with intelligent stock management and forecasting.",
      features: [
        "Real-time inventory sync across all channels",
        "Low stock alerts and reorder notifications",
        "Multi-location inventory tracking",
        "Inventory forecasting and analytics", 
        "Automated stock allocation",
        "Bundle and kit inventory management"
      ]
    },
    {
      icon: Zap,
      title: "Advanced Shipping Automation",
      description: "Set up intelligent shipping rules that automatically process orders, select carriers, and print labels without manual intervention.",
      features: [
        "Custom automation rules and workflows",
        "Intelligent carrier selection",
        "Automated batch processing",
        "Smart packaging optimization",
        "Conditional shipping logic",
        "Exception handling and alerts"
      ]
    },
    {
      icon: Truck,
      title: "Multi-Carrier Rate Shopping",
      description: "Compare rates across 50+ carriers in real-time and automatically select the best option for each shipment.",
      features: [
        "Real-time rate comparison across 50+ carriers",
        "Negotiated carrier discounts up to 89% off",
        "International shipping capabilities", 
        "Carrier performance tracking",
        "Service level optimization",
        "Custom carrier preferences"
      ]
    },
    {
      icon: BarChart3,
      title: "Comprehensive Analytics",
      description: "Get deep insights into your shipping performance, costs, and customer satisfaction with powerful reporting tools.",
      features: [
        "Shipping cost analysis and optimization",
        "Delivery performance tracking",
        "Customer satisfaction metrics",
        "Carrier performance comparisons",
        "Custom reporting and dashboards",
        "ROI and savings calculations"
      ]
    },
    {
      icon: RefreshCw,
      title: "Streamlined Returns Management",
      description: "Automate your returns process with self-service portals, automated return labels, and intelligent routing.",
      features: [
        "Customer self-service return portals",
        "Automated return label generation",
        "Return reason tracking and analytics",
        "Intelligent return routing",
        "Refund and exchange automation",
        "Return policy enforcement"
      ]
    }
  ];

  const advancedFeatures = [
    {
      icon: Printer,
      title: "Label Printing & Tracking",
      description: "Professional label printing with tracking integration",
      benefits: ["Thermal printer support", "Bulk label printing", "Real-time tracking", "Custom label templates"]
    },
    {
      icon: Settings,
      title: "API & Integrations",
      description: "Connect with any system using our robust API",
      benefits: ["RESTful API", "Webhook support", "Custom integrations", "Developer tools"]
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security for your business data",
      benefits: ["SOC 2 compliant", "Data encryption", "Role-based access", "Audit trails"]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Multi-user support with role management",
      benefits: ["User roles & permissions", "Team workspaces", "Activity tracking", "Collaborative workflows"]
    }
  ];

  const comparisonFeatures = [
    {
      feature: "Order Management",
      prepfox: "✅ Multi-channel sync",
      shipstation: "✅ Basic sync",
      advantage: "Real-time sync with 50+ platforms"
    },
    {
      feature: "Automation Rules",
      prepfox: "✅ Advanced automation",
      shipstation: "✅ Basic rules",
      advantage: "AI-powered smart rules"
    },
    {
      feature: "Carrier Options",
      prepfox: "✅ 50+ carriers",
      shipstation: "✅ 40+ carriers",
      advantage: "More carrier options + better rates"
    },
    {
      feature: "Analytics",
      prepfox: "✅ Advanced reporting",
      shipstation: "✅ Basic reports",
      advantage: "Deep insights & ROI tracking"
    },
    {
      feature: "API Access",
      prepfox: "✅ Full API access",
      shipstation: "💰 Enterprise only",
      advantage: "API included in all plans"
    },
    {
      feature: "Pricing",
      prepfox: "✅ 10% cheaper",
      shipstation: "❌ More expensive",
      advantage: "Save $420+ per year"
    }
  ];

  return (
    <MainLayout>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            🚀 Advanced Shipping Features - 10x More Powerful Than ShipStation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Every Feature You Need
            <span className="bg-gradient-primary bg-clip-text text-transparent"> to Ship Like a Pro</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            From intelligent automation to advanced analytics, PrepFox Ship provides enterprise-grade 
            shipping capabilities that scale with your business.
          </p>

          <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Shipping Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to automate and optimize your shipping operations
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

      {/* Advanced Features */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Advanced Capabilities
            </h2>
            <p className="text-lg text-muted-foreground">
              Enterprise-grade features that set us apart from the competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advancedFeatures.map((feature, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg shadow-glow w-fit mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
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
              PrepFox Ship vs ShipStation
            </h2>
            <p className="text-lg text-muted-foreground">
              See how we compare feature by feature
            </p>
          </div>

          <Card className="prep-fox-card max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-6 font-semibold text-foreground">Feature</th>
                      <th className="text-center p-6 font-semibold text-primary">PrepFox Ship</th>
                      <th className="text-center p-6 font-semibold text-muted-foreground">ShipStation</th>
                      <th className="text-left p-6 font-semibold text-foreground">Our Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-6 font-medium text-foreground">{item.feature}</td>
                        <td className="p-6 text-center text-primary font-medium">{item.prepfox}</td>
                        <td className="p-6 text-center text-muted-foreground">{item.shipstation}</td>
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see why 10,000+ businesses choose PrepFox Ship over ShipStation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              View Pricing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            No credit card required • Setup in 15 minutes • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground/5 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">PrepFox Ship</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/shipping-privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/shipping-terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/shipping-support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/shipping-contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 PrepFox Ship. All rights reserved. Ship smarter, not harder.
          </div>
        </div>
      </footer>
    </MainLayout>
  );
};

export default ShippingFeatures;