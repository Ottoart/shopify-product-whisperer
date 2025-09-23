import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Truck, 
  BarChart3, 
  Clock, 
  Shield, 
  CheckCircle, 
  MapPin, 
  Smartphone,
  Star,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FBAPrep() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Package className="w-4 h-4 mr-2" />
              Amazon FBA Prep Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              No Sweat FBA Prep Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional Amazon FBA preparation that reduces fees to zero. Complete compliance and tracking services that exceed Amazon standards as the leading FBA Prep Service provider.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <Package className="w-5 h-5 mr-2" />
                  Get Started Today
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/fulfillment/pricing">
                  View Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-2">
              <Star className="w-4 h-4 mr-2" />
              PrepFox ranked fastest growing logistics company in 2025
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
            {[
              "Global Brand 1", "Global Brand 2", "Global Brand 3", 
              "Global Brand 4", "Global Brand 5", "Global Brand 6"
            ].map((brand, index) => (
              <div key={index} className="text-center">
                <div className="h-12 bg-muted rounded flex items-center justify-center">
                  <span className="text-sm font-medium">{brand}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect FBA Prep, Unlimited Growth</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your Amazon business isn't average—so why settle for average FBA prep? We handle product inspection, labeling, bundling, and packaging for successful Amazon selling.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Amazon Prep Experts</CardTitle>
                <CardDescription>
                  The world's largest FBA Prep Providers, powered by the best Amazon operations. When Amazon changes, your strategy changes too.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="w-12 h-12 text-primary mb-4" />
                <CardTitle>50+ Locations</CardTitle>
                <CardDescription>
                  50+ warehouses across strategically located centers throughout the country, near suppliers and Amazon DCs for faster processing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="w-12 h-12 text-primary mb-4" />
                <CardTitle>FBA Prep App</CardTitle>
                <CardDescription>
                  Command center that integrates seamlessly with Seller Central, offering real-time updates and automated notifications.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* All-in-One Platform */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Your All-in-One FBA Logistics Platform</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Stop spending on spreadsheets and endless emails; streamline your operations with the first all-in-one FBA prep and ship platform.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Your Command Center for FBA</h3>
                    <p className="text-muted-foreground">Purpose-built design with intuitive UX. Automates operational tasks frontend to backend, tracks inventory, and simplifies communications.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Purpose-Built FBA Software</h3>
                    <p className="text-muted-foreground">Direct Seller Central integration with automated FBA processes, powerful shipping tools, and accurate EDI/ASN outputs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">50+ Locations, One Platform</h3>
                    <p className="text-muted-foreground">Manage nationwide locations from a single hub. When we receive, you can see exactly where your products are in our network.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 text-center">
              <Package className="w-24 h-24 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Triple-Check Verification Process</h3>
              <p className="text-muted-foreground">For omnichannel order accuracy and complete Amazon FBA compliance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success, Streamlined</h2>
            <p className="text-xl text-muted-foreground">Next-level FBA support for growing businesses</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Lightning Turnaround</CardTitle>
                <CardDescription>
                  All FBA requests processed and shipped within 48 hours, resulting in faster FBA check-in and higher margins.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Truck className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Zero Placement Fees</CardTitle>
                <CardDescription>
                  Save 40%+ on standard shipping rates, eliminating hidden fees and costly shipping from supplier to Amazon.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Multiple Locations</CardTitle>
                <CardDescription>
                  Strategic warehouse locations in 10+ states reduce transit times, putting products closer to customers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Mission Control Center</CardTitle>
                <CardDescription>
                  Unmatched inventory tracking, FBA feed batch processing, and storage limit optimization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Amazon Prime Badge</CardTitle>
                <CardDescription>
                  98% Prime Badge coverage means your products are Prime-eligible and processed faster with 2-day shipping.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Compliance & Global Reach</CardTitle>
                <CardDescription>
                  Meet all FBA standards with expert compliance teams. Expand internationally with worldwide shipping.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Starting at $0.38 per unit (5% less than competitors). All-inclusive pricing covers labeling, bagging, shipment creation, and more—with zero placement fees.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">$0.38</CardTitle>
                  <CardDescription>Per unit FBA prep</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      FNSKU labeling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Quality inspection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Standard packaging
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Most Popular</Badge>
                  <CardTitle className="text-2xl">$0.76</CardTitle>
                  <CardDescription>Per unit with poly bagging</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Basic
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Poly bagging protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Bubble wrap option
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Custom</CardTitle>
                  <CardDescription>Enterprise solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Bundle creation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Custom kitting
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Volume discounts
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment/pricing">
                  View Full Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">Get Custom Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Simplify Prep, Maximize Your Profits
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Supercharge your profits with our elite prep services that transform and optimize your entire Amazon operation.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <Package className="w-5 h-5 mr-2" />
                Start Your FBA Prep Journey
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}