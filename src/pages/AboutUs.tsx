import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Globe, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  Award,
  Star,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  ExternalLink,
  Package,
  Truck,
  BarChart3,
  Store
} from "lucide-react";

export function AboutUs() {
  const features = [
    {
      icon: <Package className="h-6 w-6" />,
      title: "Product Management",
      description: "Streamline your product catalog across multiple marketplaces with AI-powered optimization."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Dynamic Repricing",
      description: "Automated pricing strategies that adapt to market conditions and competitor pricing."
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Order Management",
      description: "Comprehensive shipping and order tracking across all your connected stores."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Real-time insights and performance metrics to optimize your business operations."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Multi-Marketplace",
      description: "Connect and manage Shopify, eBay, Walmart, and Amazon from a single platform."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "SOC 2 Type II compliant with enterprise-grade encryption and data protection."
    }
  ];

  const marketplaces = [
    { name: "Shopify", status: "Fully Integrated", color: "bg-green-500" },
    { name: "eBay", status: "Coming Soon", color: "bg-blue-500" },
    { name: "Walmart", status: "Coming Soon", color: "bg-orange-500" },
    { name: "Amazon", status: "Planned", color: "bg-yellow-500" }
  ];

  const team = [
    {
      name: "Alex Johnson",
      role: "CEO & Founder",
      bio: "Former Amazon marketplace manager with 10+ years in e-commerce optimization.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Sarah Chen",
      role: "CTO",
      bio: "Ex-Shopify engineer specializing in marketplace integrations and AI systems.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b1e013c7?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Mike Rodriguez",
      role: "Head of Product",
      bio: "15 years experience in SaaS product development and marketplace analytics.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-6">
            <img 
              src="/src/assets/logo.png" 
              alt="PrepFox Logo" 
              className="h-16 md:h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            About PrepFox
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Revolutionizing e-commerce operations with AI-powered marketplace management, 
            dynamic pricing, and seamless multi-platform integration.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              10,000+ Merchants
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              $50M+ Revenue Processed
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Award className="h-4 w-4 mr-2" />
              SOC 2 Certified
            </Badge>
          </div>
        </div>

        {/* Mission Section */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Our Mission</CardTitle>
            <CardDescription className="text-lg">
              Empowering e-commerce businesses to scale efficiently across multiple marketplaces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Simplify</h3>
                <p className="text-muted-foreground">
                  Streamline complex marketplace operations into a single, intuitive platform.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Optimize</h3>
                <p className="text-muted-foreground">
                  Use AI and machine learning to maximize profits and minimize manual work.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Scale</h3>
                <p className="text-muted-foreground">
                  Enable businesses to expand across multiple marketplaces effortlessly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage, optimize, and scale your e-commerce operations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Marketplace Integration */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Marketplace Integrations</CardTitle>
            <CardDescription className="text-lg">
              Connect with major e-commerce platforms worldwide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketplaces.map((marketplace, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${marketplace.color}`} />
                    <span className="font-medium">{marketplace.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {marketplace.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Industry experts passionate about e-commerce innovation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto"
                    />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <div className="text-primary-foreground/80">Active Merchants</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">$50M+</div>
                <div className="text-primary-foreground/80">Revenue Processed</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-primary-foreground/80">Uptime SLA</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-primary-foreground/80">Customer Support</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Security & Compliance</CardTitle>
            <CardDescription className="text-lg">
              Enterprise-grade security you can trust
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 mx-auto text-green-500" />
                <h4 className="font-semibold">SOC 2 Type II</h4>
                <p className="text-sm text-muted-foreground">Certified compliance</p>
              </div>
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h4 className="font-semibold">PCI DSS</h4>
                <p className="text-sm text-muted-foreground">Payment security</p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="h-12 w-12 mx-auto text-green-500" />
                <h4 className="font-semibold">GDPR Ready</h4>
                <p className="text-sm text-muted-foreground">Data protection</p>
              </div>
              <div className="text-center space-y-2">
                <Star className="h-12 w-12 mx-auto text-green-500" />
                <h4 className="font-semibold">ISO 27001</h4>
                <p className="text-sm text-muted-foreground">Security standards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Get in Touch</CardTitle>
            <CardDescription className="text-lg">
              Ready to transform your e-commerce operations?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <Mail className="h-8 w-8 mx-auto text-primary" />
                <h4 className="font-semibold">Email</h4>
                <p className="text-muted-foreground">hello@123prepfox.com</p>
                <Button variant="outline" size="sm" onClick={() => window.open('mailto:hello@123prepfox.com')}>
                  Send Email
                </Button>
              </div>
              <div className="space-y-2">
                <Phone className="h-8 w-8 mx-auto text-primary" />
                <h4 className="font-semibold">Phone</h4>
                <p className="text-muted-foreground">+1 (555) 123-PREP</p>
                <Button variant="outline" size="sm" onClick={() => window.open('tel:+15551237737')}>
                  Call Now
                </Button>
              </div>
              <div className="space-y-2">
                <ExternalLink className="h-8 w-8 mx-auto text-primary" />
                <h4 className="font-semibold">Website</h4>
                <p className="text-muted-foreground">www.123prepfox.com</p>
                <Button variant="outline" size="sm" onClick={() => window.open('https://123prepfox.com', '_blank')}>
                  Visit Site
                </Button>
              </div>
            </div>

            <Separator />

            <div className="text-center space-y-4">
              <h4 className="text-xl font-semibold">Ready to Get Started?</h4>
              <p className="text-muted-foreground max-w-md mx-auto">
                Join thousands of merchants already using PrepFox to scale their e-commerce operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => window.open('https://123prepfox.com/signup', '_blank')}>
                  Start Free Trial
                </Button>
                <Button variant="outline" size="lg" onClick={() => window.open('https://123prepfox.com/demo', '_blank')}>
                  Schedule Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}