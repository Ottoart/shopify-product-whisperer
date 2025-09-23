import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Truck, 
  Package, 
  Clock, 
  Shield, 
  CheckCircle, 
  Globe, 
  Zap,
  Star,
  ArrowRight,
  Target,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

export default function EcommerceFulfillment() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Store className="w-4 h-4 mr-2" />
              eCommerce Order Fulfillment
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              eCommerce Fulfillment Excellence
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Complete eCommerce order fulfillment solution that connects to all major platforms. Scale from startup to enterprise with automated workflows and global reach.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <Store className="w-5 h-5 mr-2" />
                  Launch eCommerce Fulfillment
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">
                  Get Platform Quote
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Integrations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect All Your Sales Channels</h2>
            <p className="text-xl text-muted-foreground">Seamless integration with 50+ eCommerce platforms</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              "Shopify", "WooCommerce", "BigCommerce", "Magento",
              "Amazon", "eBay", "Walmart", "Etsy",
              "Wayfair", "Target", "Faire", "Facebook Shop"
            ].map((platform, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-2">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{platform}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Real-Time Sync</CardTitle>
                <CardDescription>
                  Automatic inventory sync across all platforms. No overselling, no stockouts, no manual updates required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Global Shipping</CardTitle>
                <CardDescription>
                  Ship worldwide with optimized routing, duty handling, and international compliance management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Detailed reporting on fulfillment performance, shipping costs, and customer satisfaction metrics.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Scalable eCommerce Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Volume-based pricing that grows with your business. 5% better rates than competitors.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>Up to 1,000 orders/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$3.20 <span className="text-lg font-normal">per order</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      5 platform integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Standard shipping
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Basic analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Most Popular</Badge>
                  <CardTitle className="text-2xl">Growth</CardTitle>
                  <CardDescription>Up to 5,000 orders/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">$2.85 <span className="text-lg font-normal">per order</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Unlimited integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Express shipping options
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Advanced analytics
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>10,000+ orders/month</CardDescription>
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
                      Dedicated support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Custom integrations
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
              Power Your eCommerce Empire
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Connect all your sales channels and scale without limits. We handle the complexity, you focus on growth.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <Store className="w-5 h-5 mr-2" />
                Start Multi-Channel Fulfillment
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}