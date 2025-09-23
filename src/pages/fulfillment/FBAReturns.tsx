import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RotateCcw, 
  Package, 
  BarChart3, 
  Clock, 
  Shield, 
  CheckCircle, 
  RefreshCw, 
  DollarSign,
  Star,
  ArrowRight,
  Target,
  Recycle
} from "lucide-react";
import { Link } from "react-router-dom";

export default function FBAReturns() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Amazon FBA Returns Management
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Turn Returns Into Revenue
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional Amazon FBA returns processing that transforms returned inventory into sellable units. Recover value from damaged products, liquidate unsellable items, and streamline your returns workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Start Returns Processing
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">
                  Get Returns Quote
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

      {/* Problem & Solution */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">The Hidden Cost of FBA Returns</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Amazon's return rate continues to climb, with some categories seeing 20-30% return rates. When products come back from FBA, they often pile up in Amazon's returns centers, eating into your profits through:
              </p>
              <ul className="space-y-3 text-muted-foreground mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  Monthly storage fees on unsellable inventory
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  Lost sales from products stuck in returns processing
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  Manual effort to track and manage returned items
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                  Disposal fees for items deemed unsellable
                </li>
              </ul>
              <Button asChild>
                <Link to="/fulfillment">
                  Solve Your Returns Problem
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-destructive/10 to-primary/10 rounded-lg p-8">
              <RotateCcw className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-center mb-4">Returns Recovery System</h3>
              <p className="text-center text-muted-foreground">Turn your returns into a profit center, not a cost center</p>
            </div>
          </div>
        </div>
      </section>

      {/* Returns Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Returns Management Solution</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From inspection to resale, we handle every aspect of your FBA returns with transparency and efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <Card>
              <CardHeader className="text-center">
                <Package className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Receive & Inspect</CardTitle>
                <CardDescription>
                  We receive your FBA returns and conduct thorough quality inspections to determine the best course of action.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <RefreshCw className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Refurbish & Repack</CardTitle>
                <CardDescription>
                  Salvageable items are cleaned, repackaged, and prepared for resale with new FNSKU labels and compliance checks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Multi-Channel Resale</CardTitle>
                <CardDescription>
                  Resell through Amazon, liquidation marketplaces, or direct-to-consumer channels to maximize recovery value.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>Analytics & Reporting</CardTitle>
                <CardDescription>
                  Detailed reporting on return rates, recovery percentages, and revenue recapture to optimize your strategy.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Returns Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What We Do with Your Returns</h2>
            <p className="text-xl text-muted-foreground">Maximizing value from every returned item</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-green-200">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                <CardTitle className="text-green-700">Like-New Returns</CardTitle>
                <CardDescription>
                  <strong>75-90% Recovery Rate</strong><br />
                  Items returned in original packaging with no damage. We inspect, repackage if needed, and send back to FBA for full-price resale.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Quality inspection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Repackaging if needed
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    New FNSKU labeling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Return to FBA inventory
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader>
                <RefreshCw className="w-12 h-12 text-yellow-500 mb-4" />
                <CardTitle className="text-yellow-700">Damaged/Used Returns</CardTitle>
                <CardDescription>
                  <strong>30-60% Recovery Rate</strong><br />
                  Items with minor damage or opened packaging. We refurbish when possible and sell through secondary channels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-yellow-500" />
                    Damage assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-yellow-500" />
                    Refurbishment when viable
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-yellow-500" />
                    Liquidation marketplace sales
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-yellow-500" />
                    Outlet store placement
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <Recycle className="w-12 h-12 text-red-500 mb-4" />
                <CardTitle className="text-red-700">Unsellable Returns</CardTitle>
                <CardDescription>
                  <strong>5-15% Recovery Rate</strong><br />
                  Heavily damaged or expired items. We salvage components, recycle materials, or handle disposal responsibly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <Recycle className="w-4 h-4 text-red-500" />
                    Component salvage
                  </li>
                  <li className="flex items-center gap-2">
                    <Recycle className="w-4 h-4 text-red-500" />
                    Material recycling
                  </li>
                  <li className="flex items-center gap-2">
                    <Recycle className="w-4 h-4 text-red-500" />
                    Responsible disposal
                  </li>
                  <li className="flex items-center gap-2">
                    <Recycle className="w-4 h-4 text-red-500" />
                    Tax write-off documentation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PrepFox for Returns?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <DollarSign className="w-12 h-12 text-green-500 mb-4" />
                <CardTitle>Maximize Recovery Value</CardTitle>
                <CardDescription>
                  Average 65% value recovery across all return categories. Our multi-channel approach ensures the best possible return on your returned inventory.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Fast Processing</CardTitle>
                <CardDescription>
                  48-72 hour inspection and processing times. Get sellable items back into inventory quickly to minimize lost sales opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  Comprehensive reporting on return reasons, recovery rates, and profit recovery. Use data to improve product quality and reduce future returns.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Full Compliance</CardTitle>
                <CardDescription>
                  All refurbished items meet Amazon's condition guidelines. We handle the complexity of Amazon's returns policies and requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Transparent Process</CardTitle>
                <CardDescription>
                  Photo documentation of all items, detailed condition reports, and full visibility into the refurbishment and resale process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Multi-Channel Sales</CardTitle>
                <CardDescription>
                  Access to Amazon, liquidation marketplaces, outlet stores, and direct-to-consumer channels for maximum revenue recovery.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Calculate Your Returns ROI</h2>
              <p className="text-xl text-muted-foreground">See how much you could recover from your FBA returns</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Returns Recovery Potential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">$10,000</div>
                    <div className="text-sm text-muted-foreground mb-4">Monthly Returns Value</div>
                    <div className="text-lg">
                      Typical Recovery: <span className="font-bold text-green-500">$6,500</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">$25,000</div>
                    <div className="text-sm text-muted-foreground mb-4">Monthly Returns Value</div>
                    <div className="text-lg">
                      Typical Recovery: <span className="font-bold text-green-500">$16,250</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">$50,000</div>
                    <div className="text-sm text-muted-foreground mb-4">Monthly Returns Value</div>
                    <div className="text-lg">
                      Typical Recovery: <span className="font-bold text-green-500">$32,500</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-8">
                  <p className="text-sm text-muted-foreground mb-4">Based on average 65% recovery rate across all return categories</p>
                  <Button asChild>
                    <Link to="/auth">
                      Get Your Custom Returns Analysis
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple Returns Processing Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Only pay when we recover value. Our success-based pricing aligns our incentives with your profitability.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Like-New Returns</CardTitle>
                  <CardDescription>15% of recovery value</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Quality inspection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Repackaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Return to FBA
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Most Common</Badge>
                  <CardTitle className="text-2xl">Refurbished Returns</CardTitle>
                  <CardDescription>25% of recovery value</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Like-New
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Refurbishment work
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Multi-channel sales
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Liquidation</CardTitle>
                  <CardDescription>35% of recovery value</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Component salvage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Bulk liquidation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Disposal handling
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
                <Link to="/auth">Get Returns Quote</Link>
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
              Stop Losing Money on Returns
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Turn your FBA returns into a profit center with our comprehensive returns management solution.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <RotateCcw className="w-5 h-5 mr-2" />
                Start Returns Recovery Today
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}