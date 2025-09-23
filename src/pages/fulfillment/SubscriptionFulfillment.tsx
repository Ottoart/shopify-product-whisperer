import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Calendar, 
  Users, 
  Heart, 
  Repeat, 
  CheckCircle, 
  Gift,
  Star,
  ArrowRight,
  Target,
  BarChart3,
  Palette,
  Truck
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SubscriptionFulfillment() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Package className="w-4 h-4 mr-2" />
              Subscription Box Fulfillment
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Elevate Your Subscription Experience
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Transform each delivery into a strategic brand moment. Professional subscription box fulfillment that builds loyalty, drives retention, and creates memorable unboxing experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <Package className="w-5 h-5 mr-2" />
                  Start Subscription Fulfillment
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">
                  Get Subscription Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Subscription Brands */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powering Subscription Success</h2>
            <p className="text-xl text-muted-foreground">Trusted by leading subscription box companies</p>
          </div>
          <div className="grid md:grid-cols-6 gap-8">
            {[
              "Beauty Box", "Snack Crate", "Book Club", "Pet Supplies", "Wellness Box", "Tech Gadgets"
            ].map((category, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-2">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{category}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscription Magic, Not Just Boxes</h2>
            <p className="text-xl text-muted-foreground">Every detail designed to create loyal subscribers</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <Gift className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Custom Packaging</CardTitle>
                <CardDescription>
                  Branded boxes, inserts, and packaging materials that reflect your brand identity and create memorable unboxing experiences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Flexible Scheduling</CardTitle>
                <CardDescription>
                  Monthly, bi-weekly, or custom schedules with automated processing and predictable delivery dates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Palette className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Kitting & Assembly</CardTitle>
                <CardDescription>
                  Expert product curation, personalized assembly, and quality control for perfect box consistency.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Repeat className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  Seamless integration with subscription platforms, billing cycles, and customer lifecycle management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Retention Analytics</CardTitle>
                <CardDescription>
                  Detailed reporting on shipping performance, delivery success rates, and customer satisfaction metrics.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Seamless Subscription Workflow</h2>
            <p className="text-xl text-muted-foreground">From curation to delivery, we handle every detail</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Product Curation</CardTitle>
                <CardDescription>
                  Receive and organize your curated products with SKU management and quality inspection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Box Assembly</CardTitle>
                <CardDescription>
                  Custom kitting with personalized inserts, branded materials, and quality control checks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Scheduled Shipping</CardTitle>
                <CardDescription>
                  Automated processing on your schedule with tracking notifications and delivery confirmation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <CardTitle>Customer Delight</CardTitle>
                <CardDescription>
                  Perfect unboxing experience that builds brand loyalty and encourages social sharing.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Categories */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscription Categories We Serve</h2>
            <p className="text-xl text-muted-foreground">Specialized fulfillment for every subscription niche</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: "Beauty & Wellness",
                examples: ["Skincare samples", "Makeup products", "Wellness supplements", "Self-care items"],
                icon: Heart
              },
              {
                category: "Food & Beverage",
                examples: ["Artisanal snacks", "Coffee subscriptions", "Meal kits", "Specialty foods"],
                icon: Package
              },
              {
                category: "Lifestyle & Hobbies",
                examples: ["Books & literature", "Pet supplies", "Craft materials", "Tech gadgets"],
                icon: Gift
              }
            ].map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <item.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{item.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.examples.map((example, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Structure */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Subscription Fulfillment Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Transparent pricing designed for subscription box success. 5% better than industry standards.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Starter Box</CardTitle>
                  <CardDescription>Up to 500 subscribers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$5.25 <span className="text-lg font-normal">per box</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Basic kitting & assembly
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Standard packaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Monthly scheduling
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Most Popular</Badge>
                  <CardTitle className="text-2xl">Growth Box</CardTitle>
                  <CardDescription>500-5,000 subscribers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$4.50 <span className="text-lg font-normal">per box</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Starter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Custom branding
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Flexible scheduling
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Premium Box</CardTitle>
                  <CardDescription>5,000+ subscribers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$3.75 <span className="text-lg font-normal">per box</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Growth
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Premium packaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dedicated account manager
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" asChild>
              <Link to="/fulfillment/pricing">
                View Complete Pricing
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Create Subscription Magic
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Transform your subscription boxes into brand moments that build lasting customer loyalty.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <Package className="w-5 h-5 mr-2" />
                Start Subscription Fulfillment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}