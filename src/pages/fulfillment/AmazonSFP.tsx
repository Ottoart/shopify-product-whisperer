import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Truck, 
  Package2, 
  Clock, 
  Shield, 
  CheckCircle, 
  MapPin, 
  Thermometer,
  Star,
  ArrowRight,
  Target,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AmazonSFP() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Crown className="w-4 h-4 mr-2" />
              Amazon Seller Fulfilled Prime
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Earn the Prime Badge with PrepFox
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              With Seller Fulfilled Prime (SFP), you unlock Amazon's coveted Prime badge while maintaining full control of your fulfillment process. PrepFox ensures your success by meeting Amazon's strict standards for 2-day nationwide delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/fulfillment">
                  <Crown className="w-5 h-5 mr-2" />
                  Get Prime Ready
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
              "Duracell", "Unilever", "Joe Boxer", 
              "Eight Sleep", "GNC", "Just About Foods"
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

      {/* Value Proposition */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Prime Without the Painful FBA Fees</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Amazon's fulfillment costs keep climbing—long-term storage fees, seasonal surcharges, and placement fees cutting into your margins. Yet you can't afford to lose the Prime badge that drives your conversions.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Our SFP solution delivers the best of both worlds: full Prime benefits with complete inventory control, no surprise fees, and the freedom to ship your way.
              </p>
              <Button asChild>
                <Link to="/fulfillment">
                  Learn More About SFP
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8">
              <Crown className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-center mb-4">Prime Delivery on Your Terms</h3>
              <p className="text-center text-muted-foreground">No FBA required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prime Delivery on Your Terms—No FBA Required</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Ex-Amazon, Now on Your Team</CardTitle>
                <CardDescription>
                  Our team is built for success, employing hundreds of ex-Amazon employees and industry experts who specialize in navigating Amazon's SFP program.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Crown className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Prime Speed, Zero FBA Strings</CardTitle>
                <CardDescription>
                  You don't need FBA to earn the Prime badge. As an Amazon-approved SFP partner, we deliver nationwide in 1-2 days with our strategic warehouse network.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Lower Fees, Higher Control</CardTitle>
                <CardDescription>
                  Say goodbye to Amazon's placement fees, seasonal storage costs, and risks of centralizing inventory. Gain better brand control while reducing costs.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Big & Bulky Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Too Big for FBA? Prime Delivery Without the Premium</h2>
            <h3 className="text-2xl font-semibold mb-6 text-primary">The Big & Bulky Prime Solution</h3>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Shipping oversized and heavy products is frustrating with Amazon—but not with us. Our strategically located SFP network handles items larger than a shoebox (over 18″ x 14″ x 8″ or 20+ lbs), giving you the Prime badge without FBA's limitations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="text-center">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">2-Day Delivery</CardTitle>
                <CardDescription>
                  Nationwide 2-day delivery for oversized items, meeting Amazon Prime standards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-lg">30-40% Savings</CardTitle>
                <CardDescription>
                  Save on fulfillment costs compared to FBA fees, with no seasonal storage charges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Package2 className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Oversized Handling</CardTitle>
                <CardDescription>
                  Seamless handling of oversized and heavy-duty items with specialized shipping capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Crown className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-lg">Prime Badge Benefits</CardTitle>
                <CardDescription>
                  Prime badge advantages without FBA restrictions—convert 3-5x more than FBM competitors
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Ready to Ship Big & Bulky with Prime Benefits?
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SFP Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Own the Prime Experience</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From custom branded packaging to Prime-level shipping speeds, multiple warehouses, and dedicated Amazon support—our SFP solution gives you complete control with the Prime badge advantage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Crown className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Earning Prime, Your Way</CardTitle>
                <CardDescription>
                  Get the Prime badge benefits without FBA's restrictions. Boost sales 3-5x through better placement and higher conversions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Thermometer className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Ship Meltables with Prime</CardTitle>
                <CardDescription>
                  Handle temperature-sensitive products year-round with our climate-controlled facilities while maintaining Prime eligibility.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Package2 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Branded Unboxing</CardTitle>
                <CardDescription>
                  Control your customer experience with custom packaging and inserts. Maintain your brand identity with 2-day Prime shipping.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-4" />
                <CardTitle>One Stock, All Channels</CardTitle>
                <CardDescription>
                  Use the same inventory across Amazon, Shopify, Walmart, Target, and Wayfair. Your SFP stock works double-duty.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Strategic Amazon Mix</CardTitle>
                <CardDescription>
                  Optimize across FBA, FBM, and SFP programs. Maintain Prime badges while reducing costs and avoiding seasonal fees.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Expert Ops Support</CardTitle>
                <CardDescription>
                  Daily check-ins and weekly compliance reviews from dedicated Amazon specialists. We handle all metrics and requirements.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Temperature Controlled Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Thermometer className="w-4 h-4 mr-2" />
              Temperature-Controlled Prime
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ship Meltables with Prime, Even in Summer Heat</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're Amazon-approved for Seller Fulfilled Prime (SFP) with temperature-controlled facilities operating 6 days a week. When the summer meltable policy forces your chocolates, probiotics, and supplements off FBA, we keep your Prime badge active with our climate-controlled network.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                Learn About Temperature Control
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get Prime-ready. Get selling.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Analyze & Plan</CardTitle>
                <CardDescription>
                  We assess your orders and design a warehouse strategy to meet Prime metrics and Amazon's strict SFP requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Integrate & Store</CardTitle>
                <CardDescription>
                  We connect to your Amazon store and other sales channels, then distribute inventory across our strategic fulfillment network.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Trial & Launch</CardTitle>
                <CardDescription>
                  We manage the 30-day SFP trial period, ensure compliance metrics are met, and get you fully Prime-badged with ongoing support.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">SFP Pricing That Works</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Save 30-40% compared to FBA fees while maintaining the Prime badge. No seasonal storage charges, no placement fees.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Standard Items</CardTitle>
                  <CardDescription>Prime-eligible fulfillment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">30-40% <span className="text-lg font-normal">savings vs FBA</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      2-day Prime delivery
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No placement fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Custom packaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Multi-channel inventory
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary">
                <CardHeader>
                  <Badge className="w-fit mb-2">Best for Oversized</Badge>
                  <CardTitle className="text-2xl">Big & Bulky Items</CardTitle>
                  <CardDescription>Prime for oversized products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-4">Up to 50% <span className="text-lg font-normal">savings vs FBA</span></div>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Everything in Standard
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Oversized item handling
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Specialized packaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No size restrictions
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
                <Link to="/auth">Get SFP Quote</Link>
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
              Prime-Ready In-House Fulfillment
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Fulfill Prime orders on your terms, from our facility. Leverage our expertise with Amazon's premier status.
            </p>
            <Button size="lg" asChild>
              <Link to="/fulfillment">
                <Crown className="w-5 h-5 mr-2" />
                Get Prime Ready Today
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}