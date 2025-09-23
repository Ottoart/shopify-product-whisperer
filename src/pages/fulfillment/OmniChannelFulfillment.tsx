import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Globe2, 
  Zap, 
  Package, 
  Truck, 
  ShoppingCart, 
  CheckCircle, 
  Users,
  Star,
  ArrowRight,
  Target,
  BarChart3,
  Network,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function OmniChannelFulfillment() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Network className="w-4 h-4 mr-2" />
              Omni-Channel 3PL
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              One Platform, Every Channel
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Seamless omni-channel fulfillment across Amazon FBA, DTC, retail, and marketplace channels. Scale your brand with unified inventory and consistent customer experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <Network className="w-5 h-5 mr-2" />
                  Start Omni-Channel
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">
                  Get Custom Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powering Ambitious Brands</h2>
            <p className="text-xl text-muted-foreground">Trusted by high-growth companies scaling across channels</p>
          </div>
          <div className="grid md:grid-cols-6 gap-8">
            {[
              "Duracell", "Unilever", "JBL", "Thrasio", "Unybrands", "Joe Boxer"
            ].map((brand, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-2">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{brand}</CardTitle>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unified Fulfillment Network</h2>
            <p className="text-xl text-muted-foreground">One inventory pool, infinite sales channels</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <Network className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Multi-Channel Integration</CardTitle>
                <CardDescription>
                  Seamlessly connect Amazon FBA, Shopify, WooCommerce, eBay, Walmart, and 50+ sales channels from one dashboard.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Unified Inventory Pool</CardTitle>
                <CardDescription>
                  Share inventory across all channels with real-time sync. No more overselling or channel conflicts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Prime-Speed Delivery</CardTitle>
                <CardDescription>
                  Strategic warehouse placement delivers 1-2 day shipping nationwide with 99.8% accuracy guarantee.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Truck className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Smart Order Routing</CardTitle>
                <CardDescription>
                  AI-powered routing optimizes fulfillment location, shipping method, and delivery speed for each order automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>
                  Track performance across all channels with unified reporting, inventory insights, and profitability analysis.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Channel Support */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Every Channel, One Solution</h2>
            <p className="text-xl text-muted-foreground">Native integrations with all major sales platforms</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Amazon FBA", desc: "Full FBA prep & inbound" },
              { name: "Direct-to-Consumer", desc: "Shopify, WooCommerce, Custom" },
              { name: "Marketplaces", desc: "eBay, Walmart, Etsy, Faire" },
              { name: "B2B Wholesale", desc: "EDI, bulk orders, compliance" },
              { name: "Retail Distribution", desc: "Target, Costco, major retailers" },
              { name: "International", desc: "Global shipping & compliance" },
              { name: "Subscription Boxes", desc: "Recurring fulfillment" },
              { name: "Custom Channels", desc: "API integrations available" }
            ].map((channel, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center mb-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{channel.name}</CardTitle>
                  <CardDescription className="text-sm">{channel.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Proven Results</h2>
            <p className="text-xl text-muted-foreground">Industry-leading performance across all channels</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">99.8%</div>
                <CardTitle>Order Accuracy</CardTitle>
                <CardDescription>Triple-check quality control</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">2x</div>
                <CardTitle>Faster Scaling</CardTitle>
                <CardDescription>vs traditional 3PLs</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24hrs</div>
                <CardTitle>Order Processing</CardTitle>
                <CardDescription>Same-day shipping available</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50+</div>
                <CardTitle>Channel Integrations</CardTitle>
                <CardDescription>Native platform connections</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Omni-Channel Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Unified pricing across all channels. 5% better rates than traditional 3PLs.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>Up to 500 orders/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$3.75 <span className="text-lg font-normal">per order</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      All channel integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Unified inventory
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Real-time analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Most Popular</Badge>
                  <CardTitle className="text-2xl">Growth</CardTitle>
                  <CardDescription>500-5,000 orders/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$2.85 <span className="text-lg font-normal">per order</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Starter
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Priority fulfillment
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dedicated success manager
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>5,000+ orders/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$2.38 <span className="text-lg font-normal">per order</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Growth
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Custom integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      White-label options
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
              Scale Across Every Channel
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Unify your fulfillment operations and deliver exceptional experiences across all sales channels.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <Network className="w-5 h-5 mr-2" />
                Start Omni-Channel Fulfillment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}