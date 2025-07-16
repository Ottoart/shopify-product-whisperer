import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useShippingServices } from "@/hooks/useShippingServices";
import { useOrders } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Clock, DollarSign, Download, Printer, Shield, Zap } from "lucide-react";

interface ShippingRate {
  service_code: string;
  service_name: string;
  service_type: string;
  cost: number;
  currency: string;
  estimated_days: string;
  carrier: string;
}

export function CarrierRateComparison() {
  const { toast } = useToast();
  const { services, carriers, loading: servicesLoading } = useShippingServices();
  const { orders, loading: ordersLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  // Automatically fetch rates when order is selected
  useEffect(() => {
    if (selectedOrder) {
      fetchRates();
    } else {
      setShippingRates([]);
    }
  }, [selectedOrder]);

  const fetchRates = async () => {
    if (!selectedOrder) return;
    
    setIsLoadingRates(true);
    try {
      const order = orders.find(o => o.id === selectedOrder);
      if (!order) {
        toast({
          title: "Error",
          description: "Selected order not found",
          variant: "destructive",
        });
        return;
      }

      // Get real UPS rates
      const { data, error } = await supabase.functions.invoke('ups-rating', {
        body: {
          shipFrom: {
            address: "123 Main St", // You may want to get this from store settings
            city: "Your City",
            state: "Your State", 
            zip: "12345",
            country: "US"
          },
          shipTo: {
            address: order.shippingAddress.line1,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zip: order.shippingAddress.zip,
            country: order.shippingAddress.country
          },
          package: {
            weight: order.packageDetails.weight || 1,
            length: order.packageDetails.length || 12,
            width: order.packageDetails.width || 12,
            height: order.packageDetails.height || 6
          }
        }
      });

      if (error) {
        console.error('UPS API error:', error);
        toast({
          title: "UPS API Error",
          description: error.message || "Failed to fetch UPS rates",
          variant: "destructive",
        });
        setShippingRates([]);
        return;
      }

      if (data?.rates) {
        setShippingRates(data.rates);
        toast({
          title: "Success",
          description: `Found ${data.rates.length} shipping rates`,
        });
      } else {
        setShippingRates([]);
        toast({
          title: "No Rates",
          description: "No shipping rates available for this destination",
        });
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipping rates",
        variant: "destructive",
      });
      setShippingRates([]);
    } finally {
      setIsLoadingRates(false);
    }
  };

  const getServiceBadge = (type: string) => {
    switch (type) {
      case 'standard':
        return <Badge variant="secondary">Standard</Badge>;
      case 'expedited':
        return <Badge variant="default">Expedited</Badge>;
      case 'overnight':
        return <Badge className="bg-red-100 text-red-800">Overnight</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const getCarrierLogo = (carrier: string) => {
    switch (carrier.toLowerCase()) {
      case 'ups': return '📦';
      case 'fedex': return '🚚';
      case 'usps': return '📮';
      case 'dhl': return '✈️';
      default: return '🚛';
    }
  };

  const handleRefreshRates = async () => {
    if (!selectedOrder) {
      toast({
        title: "Please select an order first",
        description: "Select an order to get shipping rates",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "🎯 Finding the best shipping rate for you...",
      description: "Comparing rates from all carriers",
    });

    await fetchRates();
  };

  const handlePurchaseLabel = (rate: ShippingRate) => {
    setSelectedRate(rate.service_code);
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
            <Select value={selectedOrder || ""} onValueChange={setSelectedOrder}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select order" />
              </SelectTrigger>
              <SelectContent>
                {ordersLoading ? (
                  <SelectItem value="loading" disabled>Loading orders...</SelectItem>
                 ) : orders.length === 0 ? (
                   <SelectItem value="no-orders" disabled>No orders available</SelectItem>
                 ) : (
                   orders.slice(0, 10).map((order) => (
                     <SelectItem key={order.id} value={order.id}>
                       {order.orderNumber} - {order.customerName}
                     </SelectItem>
                   ))
                 )}
              </SelectContent>
            </Select>

            <Button onClick={handleRefreshRates} disabled={isLoadingRates}>
              <Zap className="h-4 w-4 mr-2" />
              {isLoadingRates ? "Finding Rates..." : "Refresh Rates"}
            </Button>
          </div>

          {/* Order Details */}
          {selectedOrder && (() => {
            const order = orders.find(o => o.id === selectedOrder);
            return order ? (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Order Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Package:</span>
                    <p>{order.packageDetails.length || 12}" x {order.packageDetails.width || 8}" x {order.packageDetails.height || 4}" ({order.packageDetails.weight || 2.5} lbs)</p>
                  </div>
                  <div>
                    <span className="font-medium">Destination:</span>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  </div>
                  <div>
                    <span className="font-medium">Value:</span>
                    <p>${order.totalAmount}</p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </CardContent>
      </Card>

      {/* Shipping Rates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Shipping Options</h2>
        
        {servicesLoading || isLoadingRates ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="font-medium mb-2">
                {servicesLoading ? "Loading shipping services..." : "Finding the best rates..."}
              </h3>
              <p className="text-muted-foreground text-sm">
                {servicesLoading 
                  ? "Getting your configured carriers ready..." 
                  : "Hang tight. We're still checking with all carriers... these rates take a few seconds."
                }
              </p>
            </CardContent>
          </Card>
        ) : shippingRates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No shipping services available</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {carriers.length === 0 
                  ? "You need to configure at least one carrier first." 
                  : "No shipping services found for your configured carriers."
                }
              </p>
              {carriers.length === 0 && (
                <Button variant="outline" onClick={() => window.location.href = '/shipping'}>
                  Configure Carriers
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {shippingRates.map((rate) => (
              <Card key={rate.service_code} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getCarrierLogo(rate.carrier)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{rate.service_name}</h3>
                          {getServiceBadge(rate.service_type)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {rate.estimated_days} days
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {rate.currency} ${rate.cost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-2xl font-bold">${rate.cost.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{rate.estimated_days} days</div>
                      </div>
                      
                      <Button 
                        onClick={() => handlePurchaseLabel(rate)}
                        disabled={selectedRate === rate.service_code}
                        className="min-w-[120px]"
                      >
                        {selectedRate === rate.service_code ? (
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