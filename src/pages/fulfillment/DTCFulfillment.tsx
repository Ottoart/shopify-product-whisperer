import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Truck, 
  Package, 
  Clock, 
  Shield, 
  CheckCircle, 
  MapPin, 
  Users,
  Star,
  ArrowRight,
  Target,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DTCFulfillment() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Direct-to-Consumer Fulfillment
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DTC Fulfillment That Scales
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Professional direct-to-consumer order fulfillment that grows with your brand. Fast shipping, branded packaging, and seamless integration with your favorite platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Start DTC Fulfillment
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

      {/* Key Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Same-Day Processing</CardTitle>
                <CardDescription>
                  Orders placed by 2 PM ship same day. 1-2 day delivery nationwide with our strategic warehouse network.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Branded Packaging</CardTitle>
                <CardDescription>
                  Custom packaging, inserts, and branded unboxing experiences that reinforce your brand with every delivery.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Multi-Channel Ready</CardTitle>
                <CardDescription>
                  Seamless integration with Shopify, WooCommerce, Amazon, eBay, and 50+ other sales channels.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transparent DTC Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Starting at $2.85 per order (5% less than competitors). No setup fees, no monthly minimums.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">$2.85</CardTitle>
                  <CardDescription>Per order + shipping</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Pick & pack
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Standard packaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Same-day processing
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Most Popular</Badge>
                  <CardTitle className="text-2xl">$3.80</CardTitle>
                  <CardDescription>Branded packaging</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Standard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Custom packaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Branded inserts
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
                      Kitting & assembly
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Gift wrapping
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Volume discounts
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" asChild>
              <Link to="/fulfillment/pricing">
                View Full Pricing
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
              Scale Your DTC Brand with Confidence
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Focus on growing your business while we handle the fulfillment. From 1 to 10,000 orders per day.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Start Your DTC Journey
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}