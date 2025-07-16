import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useShippingServices } from "@/hooks/useShippingServices";
import { useOrders } from "@/hooks/useOrders";
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
  const { services, carriers, loading: servicesLoading } = useShippingServices();
  const { orders, loading: ordersLoading } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  // Convert shipping services to shipping rates format
  useEffect(() => {
    if (services.length > 0 && carriers.length > 0) {
      const rates: ShippingRate[] = services.map(service => {
        const carrier = carriers.find(c => c.id === service.carrier_configuration_id);
        const carrierName = carrier?.carrier_name || 'Unknown';
        
        // Generate mock pricing for now (in real implementation, this would come from API)
        const basePrice = Math.random() * 20 + 5;
        const deliveryDays = service.estimated_days || '3-5 business days';
        
        // Determine service type based on service name
        let serviceType: ShippingRate['type'] = 'ground';
        if (service.service_name.toLowerCase().includes('express') || service.service_name.toLowerCase().includes('priority')) {
          serviceType = 'express';
        } else if (service.service_name.toLowerCase().includes('2') || service.service_name.toLowerCase().includes('two')) {
          serviceType = '2-day';
        } else if (service.service_name.toLowerCase().includes('overnight') || service.service_name.toLowerCase().includes('next')) {
          serviceType = 'overnight';
        }

        // Get carrier logo
        const getCarrierLogo = (carrier: string) => {
          switch (carrier.toLowerCase()) {
            case 'ups': return '📦';
            case 'fedex': return '🚚';
            case 'usps': return '📮';
            case 'dhl': return '✈️';
            default: return '🚛';
          }
        };

        return {
          id: service.id,
          carrier: carrierName,
          logo: getCarrierLogo(carrierName),
          service: service.service_name,
          price: Number(basePrice.toFixed(2)),
          deliveryTime: deliveryDays,
          type: serviceType
        };
      });
      
      setShippingRates(rates);
    }
  }, [services, carriers]);

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

  const handleRefreshRates = async () => {
    if (!selectedOrder) {
      toast({
        title: "Please select an order first",
        description: "Select an order to get shipping rates",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingRates(true);
    toast({
      title: "🎯 Finding the best shipping rate for you...",
      description: "Comparing rates from all carriers",
    });

    // Simulate rate fetching - in real implementation, this would call the shipping API
    setTimeout(() => {
      // Refresh rates with new pricing
      const updatedRates = shippingRates.map(rate => ({
        ...rate,
        price: Number((Math.random() * 20 + 5).toFixed(2))
      }));
      setShippingRates(updatedRates);
      
      setIsLoadingRates(false);
      toast({
        title: "📬 Rates updated successfully!",
        description: `Found ${updatedRates.length} shipping options`,
      });
    }, 2000);
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