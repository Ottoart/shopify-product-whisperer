import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Truck, Package, Download, Printer, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { supabase } from '@/integrations/supabase/client';

interface ShippingRate {
  id: string;
  service_code: string;
  service_name: string;
  carrier: string;
  rate: number;
  currency: string;
  estimated_days: string;
  estimated_delivery?: string;
  total_rate: number;
}

interface ShipmentDetails {
  from: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  to: {
    name: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
  package: {
    weight: number;
    length: number;
    width: number;
    height: number;
    value?: number;
  };
  options?: {
    signature_required?: boolean;
    insurance?: boolean;
    saturday_delivery?: boolean;
  };
}

export function ShipStationIntegration() {
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState<string>('');
  const [shipFromAddress, setShipFromAddress] = useState({
    name: 'Your Business Name',
    company: 'Your Company',
    address: '123 Business St',
    city: 'Your City',
    state: 'ST',
    postal_code: '12345',
    country: 'US',
    phone: '555-0123'
  });
  const [packageDimensions, setPackageDimensions] = useState({
    weight: 1,
    length: 10,
    width: 8,
    height: 6,
    value: 100
  });
  const [additionalServices, setAdditionalServices] = useState({
    signature_required: false,
    insurance: false,
    saturday_delivery: false
  });

  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleGetRates = async () => {
    if (!selectedOrder) {
      toast({
        title: "Error",
        description: "Please select an order first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setRates([]);

    try {
      const order = orders.find(o => o.id === selectedOrder);
      if (!order) throw new Error('Order not found');

      const shipmentDetails: ShipmentDetails = {
        from: shipFromAddress,
        to: {
          name: order.customerName,
          address: order.shippingAddress.line1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postal_code: order.shippingAddress.zip,
          country: order.shippingAddress.country || 'US'
        },
        package: packageDimensions,
        options: additionalServices
      };

      const { data, error } = await supabase.functions.invoke('shipstation-get-rates', {
        body: { shipmentDetails }
      });

      if (error) throw error;

      setRates(data.rates || []);
      toast({
        title: "Success",
        description: `Found ${data.rates?.length || 0} shipping rates`,
      });

    } catch (error) {
      console.error('Error getting rates:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to get shipping rates',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!selectedOrder || !selectedRate) {
      toast({
        title: "Error",
        description: "Please select an order and shipping rate first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const order = orders.find(o => o.id === selectedOrder);
      const rate = rates.find(r => r.id === selectedRate);
      if (!order || !rate) throw new Error('Order or rate not found');

      const shipmentDetails: ShipmentDetails = {
        from: shipFromAddress,
        to: {
          name: order.customerName,
          address: order.shippingAddress.line1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postal_code: order.shippingAddress.zip,
          country: order.shippingAddress.country || 'US'
        },
        package: packageDimensions,
        options: additionalServices
      };

      const { data, error } = await supabase.functions.invoke('shipstation-create-label', {
        body: {
          shipmentDetails,
          serviceCode: rate.service_code
        }
      });

      if (error) throw error;

      // Save shipping label to database
      const { data: userData } = await supabase.auth.getUser();
      
      const { error: labelError } = await supabase
        .from('shipping_labels')
        .insert({
          user_id: userData.user?.id,
          order_id: selectedOrder,
          tracking_number: data.tracking_number,
          carrier: data.carrier,
          service_code: data.service_code,
          service_name: data.service_name,
          shipping_cost: data.cost,
          currency: data.currency,
          label_image_data: data.label_pdf,
          status: 'active'
        });

      if (labelError) throw labelError;

      toast({
        title: "Label Created Successfully",
        description: `Tracking number: ${data.tracking_number}`,
      });

      // Clear selections
      setSelectedOrder('');
      setSelectedRate('');
      setRates([]);

    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create shipping label',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedOrderData = orders.find(o => o.id === selectedOrder);
  const selectedRateData = rates.find(r => r.id === selectedRate);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">ShipStation Integration</h1>
          <p className="text-muted-foreground">Create shipping labels and manage shipments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Select Order
            </CardTitle>
            <CardDescription>
              Choose an order to create a shipping label for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="order-select">Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an order..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">#{order.orderNumber}</span>
                        <span className="text-sm text-muted-foreground">
                          {order.customerName} - ${order.totalAmount}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrderData && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Customer:</span>
                  <span>{selectedOrderData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span>${selectedOrderData.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant="secondary">{selectedOrderData.status}</Badge>
                </div>
                <Separator />
                <div className="text-sm">
                  <div className="font-medium">Shipping Address:</div>
                  <div className="text-muted-foreground">
                    {selectedOrderData.shippingAddress.line1}<br />
                    {selectedOrderData.shippingAddress.city}, {selectedOrderData.shippingAddress.state} {selectedOrderData.shippingAddress.zip}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ship From Address */}
        <Card>
          <CardHeader>
            <CardTitle>Ship From Address</CardTitle>
            <CardDescription>
              Configure your business shipping address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="from-name">Name</Label>
                <Input
                  id="from-name"
                  value={shipFromAddress.name}
                  onChange={(e) => setShipFromAddress(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="from-company">Company</Label>
                <Input
                  id="from-company"
                  value={shipFromAddress.company}
                  onChange={(e) => setShipFromAddress(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="from-address">Address</Label>
              <Input
                id="from-address"
                value={shipFromAddress.address}
                onChange={(e) => setShipFromAddress(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="from-city">City</Label>
                <Input
                  id="from-city"
                  value={shipFromAddress.city}
                  onChange={(e) => setShipFromAddress(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="from-state">State</Label>
                <Input
                  id="from-state"
                  value={shipFromAddress.state}
                  onChange={(e) => setShipFromAddress(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="from-postal">Postal Code</Label>
                <Input
                  id="from-postal"
                  value={shipFromAddress.postal_code}
                  onChange={(e) => setShipFromAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Package Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
            <CardDescription>
              Enter package dimensions and weight
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={packageDimensions.weight}
                  onChange={(e) => setPackageDimensions(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="length">Length (in)</Label>
                <Input
                  id="length"
                  type="number"
                  value={packageDimensions.length}
                  onChange={(e) => setPackageDimensions(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="width">Width (in)</Label>
                <Input
                  id="width"
                  type="number"
                  value={packageDimensions.width}
                  onChange={(e) => setPackageDimensions(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (in)</Label>
                <Input
                  id="height"
                  type="number"
                  value={packageDimensions.height}
                  onChange={(e) => setPackageDimensions(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="value">Package Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={packageDimensions.value}
                onChange={(e) => setPackageDimensions(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Get Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Rates</CardTitle>
            <CardDescription>
              Get rates from ShipStation carriers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGetRates} 
              disabled={loading || !selectedOrder}
              className="w-full"
            >
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Get Shipping Rates
            </Button>

            {rates.length > 0 && (
              <div className="space-y-3">
                <Label>Available Rates</Label>
                {rates.map(rate => (
                  <div
                    key={rate.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRate === rate.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedRate(rate.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{rate.service_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {rate.carrier} • {rate.estimated_days} days
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${rate.total_rate.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{rate.currency}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedRateData && (
              <Button
                onClick={handleCreateLabel}
                disabled={loading}
                className="w-full"
              >
                {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Printer className="h-4 w-4 mr-2" />}
                Create Shipping Label - ${selectedRateData.total_rate.toFixed(2)}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}