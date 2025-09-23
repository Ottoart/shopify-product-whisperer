import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Truck, 
  Package, 
  Clock, 
  Shield, 
  CheckCircle, 
  FileText, 
  Users,
  Star,
  ArrowRight,
  Target,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

export default function B2BFulfillment() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Building2 className="w-4 h-4 mr-2" />
              B2B Retail Fulfillment
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Enterprise B2B Fulfillment
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional B2B order fulfillment for wholesale, retail distribution, and corporate sales. EDI integration, bulk shipping, and enterprise-grade compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <Building2 className="w-5 h-5 mr-2" />
                  Start B2B Fulfillment
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">
                  Get Enterprise Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Partners */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Major Retailers</h2>
            <p className="text-xl text-muted-foreground">Enterprise-grade fulfillment for B2B partnerships</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              "Costco", "Target", "Walmart", "Home Depot",
              "Lowe's", "Best Buy", "Wayfair", "Faire"
            ].map((retailer, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-2">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{retailer}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core B2B Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="w-12 h-12 text-primary mb-4" />
                <CardTitle>EDI Integration</CardTitle>
                <CardDescription>
                  Full EDI compliance with automated purchase order processing, ASN generation, and invoice reconciliation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Bulk Order Processing</CardTitle>
                <CardDescription>
                  Handle large wholesale orders with specialized packaging, palletization, and LTL shipping coordination.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Compliance Management</CardTitle>
                <CardDescription>
                  Meet retailer-specific requirements including labeling standards, packaging specifications, and delivery windows.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* B2B Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Streamlined B2B Operations</h2>
            <p className="text-xl text-muted-foreground">From PO to delivery, we handle the entire B2B fulfillment process</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Purchase Order Receipt</CardTitle>
                <CardDescription>
                  Automatic PO processing through EDI or portal integration with real-time acknowledgment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Inventory Allocation</CardTitle>
                <CardDescription>
                  Automatic inventory reservation and allocation based on delivery requirements and priorities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Pick, Pack & Ship</CardTitle>
                <CardDescription>
                  Bulk picking with retailer-specific packaging, labeling, and documentation requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <CardTitle>ASN & Invoicing</CardTitle>
                <CardDescription>
                  Automatic ASN generation and invoice processing with full audit trail and compliance documentation.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Enterprise B2B Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Volume-based pricing designed for wholesale and retail distribution. 5% better than industry standards.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Standard B2B</CardTitle>
                  <CardDescription>Up to $100K monthly volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$4.75 <span className="text-lg font-normal">per order</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      EDI integration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Bulk processing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      ASN generation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Most Popular</Badge>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>$100K - $1M monthly volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$3.80 <span className="text-lg font-normal">per order</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Standard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dedicated account manager
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Custom compliance
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Global Enterprise</CardTitle>
                  <CardDescription>$1M+ monthly volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">Custom <span className="text-lg font-normal">pricing</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Enterprise
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Global fulfillment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      White-label solutions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" asChild>
              <Link to="/fulfillment/pricing">
                View Enterprise Pricing
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
              Scale Your B2B Operations
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Enterprise-grade fulfillment that grows with your wholesale and retail partnerships.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <Building2 className="w-5 h-5 mr-2" />
                Launch B2B Fulfillment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}