import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Truck, Clock, DollarSign, Download, Printer, Shield, Zap } from "lucide-react";

interface ShippingRate {
  id: string;
  carrier: string;
  logo: string;
  service: string;
  price: number;
  deliveryTime: string;
  type: 'ground' | 'express' | '2-day' | 'overnight';
}

export function CarrierRateComparison() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState("ORD-001");
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);

  // Mock shipping rates
  const shippingRates: ShippingRate[] = [
    {
      id: "ups-ground",
      carrier: "UPS",
      logo: "📦",
      service: "UPS Ground",
      price: 8.95,
      deliveryTime: "3-5 business days",
      type: "ground"
    },
    {
      id: "fedex-ground",
      carrier: "FedEx",
      logo: "🚚",
      service: "FedEx Ground",
      price: 9.20,
      deliveryTime: "3-5 business days",
      type: "ground"
    },
    {
      id: "ups-2day",
      carrier: "UPS",
      logo: "📦",
      service: "UPS 2nd Day Air",
      price: 15.50,
      deliveryTime: "2 business days",
      type: "2-day"
    },
    {
      id: "fedex-express",
      carrier: "FedEx",
      logo: "🚚",
      service: "FedEx Express Saver",
      price: 18.75,
      deliveryTime: "1-3 business days",
      type: "express"
    },
    {
      id: "usps-priority",
      carrier: "USPS",
      logo: "📮",
      service: "Priority Mail",
      price: 7.95,
      deliveryTime: "1-3 business days",
      type: "express"
    }
  ];

  const getServiceBadge = (type: ShippingRate['type']) => {
    switch (type) {
      case 'ground':
        return <Badge variant="secondary">Ground</Badge>;
      case 'express':
        return <Badge variant="default">Express</Badge>;
      case '2-day':
        return <Badge variant="outline">2-Day</Badge>;
      case 'overnight':
        return <Badge className="bg-red-100 text-red-800">Overnight</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const handleRefreshRates = () => {
    setIsLoadingRates(true);
    toast({
      title: "🎯 Finding the best shipping rate for you...",
      description: "Comparing rates from all carriers",
    });

    setTimeout(() => {
      setIsLoadingRates(false);
      toast({
        title: "📬 Just a sec... We're pulling the best shipping rates for you.",
        description: "Updated rates are now available",
      });
    }, 3000);
  };

  const handlePurchaseLabel = (rate: ShippingRate) => {
    setSelectedRate(rate.id);
    toast({
      title: "🎯 Processing your label...",
      description: "This might take a moment",
    });

    setTimeout(() => {
      toast({
        title: "✅ Done! Your label is ready.",
        description: `📦 Tracking #1Z999AA1234567890 added to Shopify. 🖨️ You can print this label now or later.`,
      });
      setSelectedRate(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Carrier Rate Comparison & Label Creation
          </CardTitle>
          <CardDescription>
            Get the best rate, fast — and ship confidently
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedOrder} onValueChange={setSelectedOrder}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORD-001">ORD-001 - John Smith</SelectItem>
                <SelectItem value="ORD-002">ORD-002 - Jane Doe</SelectItem>
                <SelectItem value="ORD-003">ORD-003 - Bob Wilson</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleRefreshRates} disabled={isLoadingRates}>
              <Zap className="h-4 w-4 mr-2" />
              {isLoadingRates ? "Finding Rates..." : "Refresh Rates"}
            </Button>
          </div>

          {/* Order Details */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Package:</span>
                <p>12" x 8" x 4" (2.5 lbs)</p>
              </div>
              <div>
                <span className="font-medium">Destination:</span>
                <p>New York, NY 10001</p>
              </div>
              <div>
                <span className="font-medium">Value:</span>
                <p>$129.99</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Rates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Shipping Options</h2>
        
        {isLoadingRates ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="font-medium mb-2">Finding the best rates...</h3>
              <p className="text-muted-foreground text-sm">
                Hang tight. We're still checking with all carriers... these rates take a few seconds.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {shippingRates.map((rate) => (
              <Card key={rate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{rate.logo}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{rate.service}</h3>
                          {getServiceBadge(rate.type)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {rate.deliveryTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${rate.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold">${rate.price.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{rate.deliveryTime}</div>
                      </div>
                      
                      <Button 
                        onClick={() => handlePurchaseLabel(rate)}
                        disabled={selectedRate === rate.id}
                        className="min-w-[120px]"
                      >
                        {selectedRate === rate.id ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Buy Label
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Additional Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Insurance</h4>
                <p className="text-sm text-muted-foreground">Protect shipment up to $100</p>
              </div>
              <div className="text-right">
                <div className="font-medium">+$2.50</div>
                <Button size="sm" variant="outline">Add</Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Signature Required</h4>
                <p className="text-sm text-muted-foreground">Require signature on delivery</p>
              </div>
              <div className="text-right">
                <div className="font-medium">+$5.00</div>
                <Button size="sm" variant="outline">Add</Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Later
            </Button>
            <Button variant="outline" className="flex-1">
              Auto-Print to Thermal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}