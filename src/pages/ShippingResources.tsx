import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, 
  CheckCircle,
  ArrowRight,
  Users,
  BookOpen,
  Video,
  FileText,
  MessageCircle,
  Phone,
  Mail,
  Download,
  ExternalLink,
  Clock,
  Star,
  Headphones,
  Code,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const ShippingResources = () => {
  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Comprehensive guides and API documentation",
      resources: [
        "Getting Started Guide",
        "API Documentation", 
        "Integration Tutorials",
        "Troubleshooting Guide"
      ]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides for all features",
      resources: [
        "Platform Overview",
        "Setting Up Automation",
        "Carrier Configuration",
        "Advanced Features"
      ]
    },
    {
      icon: FileText,
      title: "Best Practices",
      description: "Expert tips for optimizing your shipping",
      resources: [
        "Shipping Cost Optimization",
        "Automation Strategies",
        "Carrier Selection Guide",
        "International Shipping"
      ]
    },
    {
      icon: MessageCircle,
      title: "Community",
      description: "Connect with other PrepFox Ship users",
      resources: [
        "User Forum",
        "Success Stories",
        "Feature Requests",
        "Community Events"
      ]
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help from our support team",
      availability: "24/7",
      responseTime: "< 2 minutes",
      plans: "All plans"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Detailed help via email support",
      availability: "24/7",
      responseTime: "< 4 hours",
      plans: "All plans"
    },
    {
      icon: Phone,
      title: "Phone Support", 
      description: "Direct phone support for urgent issues",
      availability: "Business hours",
      responseTime: "Immediate",
      plans: "Standard & Premium"
    },
    {
      icon: Users,
      title: "Dedicated Manager",
      description: "Personal account manager for enterprise",
      availability: "Business hours",
      responseTime: "Same day",
      plans: "Premium only"
    }
  ];

  const downloadableResources = [
    {
      title: "ShipStation Migration Guide",
      description: "Complete guide to switching from ShipStation to PrepFox Ship",
      type: "PDF Guide",
      pages: "24 pages",
      popular: true
    },
    {
      title: "Shipping Cost Calculator",
      description: "Excel template to calculate your potential savings",
      type: "Excel Template",
      pages: "Interactive",
      popular: false
    },
    {
      title: "Automation Playbook",
      description: "30+ automation rules to streamline your workflow",
      type: "PDF Playbook",
      pages: "40 pages",
      popular: true
    },
    {
      title: "API Integration Examples",
      description: "Code samples and integration examples",
      type: "Code Repository",
      pages: "GitHub repo",
      popular: false
    }
  ];

  const webinars = [
    {
      title: "Shipping Automation Masterclass",
      date: "Every Tuesday",
      time: "2:00 PM EST",
      duration: "45 minutes",
      description: "Learn advanced automation strategies to save time and money"
    },
    {
      title: "API Integration Workshop",
      date: "Every Thursday", 
      time: "11:00 AM EST",
      duration: "60 minutes",
      description: "Hands-on workshop for developers and technical teams"
    },
    {
      title: "Carrier Optimization Strategies",
      date: "Monthly",
      time: "1:00 PM EST", 
      duration: "30 minutes",
      description: "Expert tips for choosing the right carriers and rates"
    }
  ];

  const faqs = [
    {
      question: "How long does it take to migrate from ShipStation?",
      answer: "Most businesses complete the migration in 1-2 hours. Our migration team provides step-by-step guidance and can handle the technical setup for you."
    },
    {
      question: "Can I keep my existing carrier accounts?",
      answer: "Yes! You can use your existing carrier accounts or take advantage of our negotiated rates, which are often 10-40% better than standard rates."
    },
    {
      question: "What happens to my historical shipping data?",
      answer: "We can import your historical data including orders, tracking information, and analytics. This ensures you maintain complete visibility into your shipping history."
    },
    {
      question: "Do you offer training for my team?",
      answer: "Yes! We provide comprehensive onboarding including team training sessions, custom workflow setup, and ongoing support to ensure your team is successful."
    },
    {
      question: "How does billing work during the trial?",
      answer: "The 30-day trial is completely free with no credit card required. After the trial, you're only billed for your actual usage based on the plan you choose."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">PrepFox Ship</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/shipping-features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
            <Link to="/shipping-pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/shipping-integrations" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link>
            <Link to="/shipping-resources" className="text-foreground font-medium">Resources</Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            <Button asChild className="bg-gradient-primary hover:shadow-glow transition-smooth">
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            📚 Complete Resource Library
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Everything You Need to
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Succeed</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            From getting started guides to advanced automation strategies, find all the resources 
            you need to maximize your shipping efficiency with PrepFox Ship.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-smooth text-lg px-8 py-6">
              Browse Documentation
              <BookOpen className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5">
              Contact Support
              <MessageCircle className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learning Resources
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive guides, tutorials, and documentation to help you master PrepFox Ship
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {resourceCategories.map((category, index) => (
              <Card key={index} className="prep-fox-card hover:shadow-elegant transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg shadow-glow w-fit mx-auto mb-4">
                    <category.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{category.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                  <div className="space-y-2">
                    {category.resources.map((resource, resourceIndex) => (
                      <div key={resourceIndex} className="flex items-center space-x-2 justify-center">
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-xs text-foreground">{resource}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4" variant="outline" size="sm">
                    Explore
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Help When You Need It
            </h2>
            <p className="text-lg text-muted-foreground">
              Multiple support channels to ensure you're never stuck
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportOptions.map((option, index) => (
              <Card key={index} className="prep-fox-card text-center">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg shadow-glow w-fit mx-auto mb-4">
                    <option.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{option.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{option.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="text-foreground font-medium">{option.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Response:</span>
                      <span className="text-foreground font-medium">{option.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Plans:</span>
                      <Badge variant="secondary" className="text-xs">{option.plans}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Free Downloadable Resources
            </h2>
            <p className="text-lg text-muted-foreground">
              Essential guides and tools to optimize your shipping operations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {downloadableResources.map((resource, index) => (
              <Card key={index} className={`prep-fox-card hover:shadow-elegant transition-all duration-300 ${resource.popular ? 'ring-1 ring-primary/20' : ''}`}>
                {resource.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                    Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-primary p-3 rounded-lg shadow-glow">
                      <Download className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{resource.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{resource.description}</p>
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                        <span className="text-xs text-muted-foreground">{resource.pages}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Download Free
                        <Download className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Webinars */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Live Training & Webinars
            </h2>
            <p className="text-lg text-muted-foreground">
              Join our experts for live training sessions and Q&A
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {webinars.map((webinar, index) => (
              <Card key={index} className="prep-fox-card">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Video className="h-5 w-5 text-primary" />
                    <Badge variant="secondary" className="text-xs">Live</Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{webinar.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{webinar.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{webinar.date} at {webinar.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{webinar.duration}</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    Register Free
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Common questions about PrepFox Ship features and migration
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="prep-fox-card">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
              View All FAQs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Our team of shipping experts is here to help you succeed. Get personalized guidance and support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              <MessageCircle className="mr-2 h-5 w-5" />
              Start Live Chat
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Schedule Call
              <Phone className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/80 mt-6">
            Available 24/7 • Expert shipping consultants • No sales pressure
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
    </div>
  );
};

export default ShippingResources;