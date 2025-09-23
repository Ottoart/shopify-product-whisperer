import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Truck, MapPin, DollarSign } from 'lucide-react';

interface LabelConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderData: {
    orderNumber: string;
    carrier: string;
    service: string;
    serviceName: string;
    shipTo: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    shipFrom: {
      name: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
    package: {
      weight: number;
      length: number;
      width: number;
      height: number;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    costs: {
      baseAmount: number;
      fuelSurcharge: number;
      hstAmount: number;
      gstAmount: number;
      pstAmount: number;
      deliveryConfirmation: number;
      totalCost: number;
      currency: string;
    };
    estimatedDelivery: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function LabelConfirmationDialog({
  open,
  onOpenChange,
  orderData,
  onConfirm,
  onCancel,
  isLoading = false
}: LabelConfirmationDialogProps) {
  const formatCurrency = (amount: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Cost Review - Order #{orderData.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipping Details */}
          <div className="space-y-4">
            {/* Carrier Service */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="w-4 h-4" />
                  {orderData.carrier}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{orderData.serviceName}</span>
                  <Badge variant="secondary">{orderData.service}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated Delivery: {orderData.estimatedDelivery}
                </p>
              </CardContent>
            </Card>

            {/* Ship To Address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4" />
                  Ship To Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{orderData.shipTo.name}</p>
                  <p className="text-sm">{orderData.shipTo.address}</p>
                  <p className="text-sm">
                    {orderData.shipTo.city}, {orderData.shipTo.state} {orderData.shipTo.zip}
                  </p>
                  <p className="text-sm font-medium">{orderData.shipTo.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Shipment Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Shipment Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price, orderData.costs.currency)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-4 h-4" />
                  Additional Charges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Base Amount</span>
                    <span>{formatCurrency(orderData.costs.baseAmount, orderData.costs.currency)}</span>
                  </div>
                  
                  {orderData.costs.gstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>GST Amount</span>
                      <span>{formatCurrency(orderData.costs.gstAmount, orderData.costs.currency)}</span>
                    </div>
                  )}
                  
                  {orderData.costs.hstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>HST Amount</span>
                      <span>{formatCurrency(orderData.costs.hstAmount, orderData.costs.currency)}</span>
                    </div>
                  )}
                  
                  {orderData.costs.pstAmount > 0 && (
                    <div className="flex justify-between">
                      <span>PST Amount</span>
                      <span>{formatCurrency(orderData.costs.pstAmount, orderData.costs.currency)}</span>
                    </div>
                  )}
                  
                  {orderData.costs.deliveryConfirmation > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Confirmation</span>
                      <span>{formatCurrency(orderData.costs.deliveryConfirmation, orderData.costs.currency)}</span>
                    </div>
                  )}
                  
                  {orderData.costs.fuelSurcharge > 0 && (
                    <div className="flex justify-between">
                      <span>Fuel Surcharge</span>
                      <span>{formatCurrency(orderData.costs.fuelSurcharge, orderData.costs.currency)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Postage Cost Subtotal:</span>
                    <span>{formatCurrency(orderData.costs.totalCost, orderData.costs.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Package Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-medium">{orderData.package.weight} lbs</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-medium">
                      {orderData.package.length}" × {orderData.package.width}" × {orderData.package.height}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Cost Display */}
            <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {orderData.carrier.charAt(0)}
                    </span>
                  </div>
                  <span className="font-medium">Cost Review</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(orderData.costs.totalCost, orderData.costs.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Creating Label...' : 'Continue'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}