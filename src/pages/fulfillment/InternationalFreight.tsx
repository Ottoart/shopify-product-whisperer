import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Ship, 
  Plane, 
  Globe2, 
  Package, 
  Clock, 
  Shield, 
  CheckCircle, 
  Truck,
  Star,
  ArrowRight,
  Target,
  BarChart3,
  DollarSign,
  MapPin
} from "lucide-react";
import { Link } from "react-router-dom";

export default function InternationalFreight() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Ship className="w-4 h-4 mr-2" />
              International Freight Forwarding
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Global Freight, Local Control
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              End-to-end freight forwarding from ocean containers to air cargo. Move inventory smarter, faster, and more cost-effectively with preferred global carrier rates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/auth">
                  <Ship className="w-5 h-5 mr-2" />
                  Get Freight Quote
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/auth">
                  Calculate Shipping Costs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Global Partners */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Global Carrier Network</h2>
            <p className="text-xl text-muted-foreground">Preferred rates with world-class freight partners</p>
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            {[
              "Maersk", "MSC", "CMA CGM", "COSCO", "Hapag-Lloyd"
            ].map((carrier, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center mx-auto mb-2">
                    <Ship className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{carrier}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Freight Solutions</h2>
            <p className="text-xl text-muted-foreground">From origin to destination, we handle every detail</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <Ship className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Ocean Freight</CardTitle>
                <CardDescription>
                  FCL and LCL ocean shipping with competitive rates, customs clearance, and door-to-door delivery.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Plane className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Air Freight</CardTitle>
                <CardDescription>
                  Express air cargo for time-sensitive shipments with full tracking and expedited customs processing.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Truck className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Ground Transportation</CardTitle>
                <CardDescription>
                  Last-mile delivery and inland transportation to fulfillment centers and final destinations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Customs & Compliance</CardTitle>
                <CardDescription>
                  Expert customs brokerage, duty optimization, and regulatory compliance for seamless border crossings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Package className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Cargo Insurance</CardTitle>
                <CardDescription>
                  Comprehensive coverage and risk management for your valuable inventory during international transit.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Global Routes */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Shipping Routes</h2>
            <p className="text-xl text-muted-foreground">Major trade lanes with frequent departures</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <MapPin className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Asia to North America</CardTitle>
                <CardDescription>
                  China, Vietnam, India to US West Coast ports (LA, Long Beach, Oakland) with rail connections nationwide.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ocean Transit:</span>
                    <span className="font-semibold">12-18 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Departures:</span>
                    <span className="font-semibold">Multiple sailings</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Europe to North America</CardTitle>
                <CardDescription>
                  Hamburg, Rotterdam, Southampton to US East Coast ports (New York, Savannah, Norfolk).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ocean Transit:</span>
                    <span className="font-semibold">8-12 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Departures:</span>
                    <span className="font-semibold">Daily sailings</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Freight Process */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Streamlined Shipping Process</h2>
            <p className="text-xl text-muted-foreground">From booking to delivery, we handle every step</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Quote & Book</CardTitle>
                <CardDescription>
                  Get instant quotes, compare rates, and book your shipment with preferred carriers online.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Pickup & Export</CardTitle>
                <CardDescription>
                  We arrange pickup from your supplier, handle export documentation, and load at origin port.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Transit & Tracking</CardTitle>
                <CardDescription>
                  Real-time shipment tracking with milestone updates and proactive delay notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-primary">4</span>
                </div>
                <CardTitle>Customs & Delivery</CardTitle>
                <CardDescription>
                  Expert customs clearance and final delivery to your fulfillment center or destination.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Structure */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Transparent Freight Pricing</h2>
            <p className="text-xl text-muted-foreground mb-8">
              No hidden fees. Volume discounts available. 5% better than traditional forwarders.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <Ship className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Ocean Freight</CardTitle>
                  <CardDescription>20ft & 40ft container rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>China to US West Coast (20ft):</span>
                      <span className="font-bold">$1,425</span>
                    </div>
                    <div className="flex justify-between">
                      <span>China to US West Coast (40ft):</span>
                      <span className="font-bold">$1,900</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Europe to US East Coast (20ft):</span>
                      <span className="font-bold">$1,235</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      * Includes port handling, documentation
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Plane className="w-12 h-12 text-primary mb-4" />
                  <CardTitle className="text-2xl">Air Freight</CardTitle>
                  <CardDescription>Express & economy air rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>China to US (per kg):</span>
                      <span className="font-bold">$4.25</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Europe to US (per kg):</span>
                      <span className="font-bold">$3.80</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Express delivery (per kg):</span>
                      <span className="font-bold">$7.60</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      * Volume discounts for 1000kg+
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button size="lg" asChild>
              <Link to="/auth">
                Get Custom Freight Quote
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
              Move Your Inventory Globally
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Simplify international shipping with expert freight forwarding and preferred carrier rates.
            </p>
            <Button size="lg" asChild>
              <Link to="/auth">
                <Ship className="w-5 h-5 mr-2" />
                Start Freight Forwarding
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}