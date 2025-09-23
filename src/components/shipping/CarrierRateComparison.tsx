import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { Truck } from "lucide-react";
import { EnhancedShippingConfiguration } from "./EnhancedShippingConfiguration";

export function CarrierRateComparison() {
  const { toast } = useToast();
  const { orders, loading: ordersLoading, updateShippingDetails } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const handleShippingSelected = async (shippingData: any) => {
    if (!selectedOrder) return;

    try {
      await updateShippingDetails(selectedOrder, {
        requestedService: shippingData.requestedService,
        serviceType: shippingData.serviceCode,
        carrier: shippingData.carrier,
        cost: shippingData.cost,
        confirmationType: shippingData.confirmationType
      });

      toast({
        title: "Shipping Service Selected",
        description: `${shippingData.requestedService} has been set for this order`
      });
    } catch (error) {
      console.error('Error updating shipping details:', error);
      toast({
        title: "Error",
        description: "Failed to update shipping details",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Enhanced Shipping Configuration
          </CardTitle>
          <CardDescription>
            Configure ship from address, package details, and select shipping services with live rates
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
                {order.shippingDetails.requestedService && (
                  <div className="mt-2 p-2 bg-primary/10 rounded">
                    <span className="font-medium text-primary">
                      Requested Service: {order.shippingDetails.requestedService}
                    </span>
                  </div>
                )}
              </div>
            ) : null;
          })()}
        </CardContent>
      </Card>

      {/* Enhanced Shipping Configuration Component */}
      {selectedOrder && (
        <EnhancedShippingConfiguration 
          orderId={selectedOrder}
          onShippingSelected={handleShippingSelected}
        />
      )}
    </div>
  );
}