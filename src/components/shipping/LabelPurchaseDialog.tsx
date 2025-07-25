import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useShippingRates } from '@/hooks/useShippingRates';
import { useOrders, type Order } from '@/hooks/useOrders';
import { Truck, Package, MapPin, Phone, AlertTriangle } from 'lucide-react';

interface LabelPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onLabelPurchased?: () => void;
}

export function LabelPurchaseDialog({ open, onOpenChange, order, onLabelPurchased }: LabelPurchaseDialogProps) {
  const { toast } = useToast();

  const [shipFromConfig, setShipFromConfig] = useState({
    name: '',
    company: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'CA',
    phone: '' // Add phone field
  });

  const [packageDetails, setPackageDetails] = useState({
    weight: 2.5,
    length: 12,
    width: 8,
    height: 4,
    value: 0
  });

  const [recipientPhone, setRecipientPhone] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  const {
    rates,
    loading: ratesLoading,
    calculateRates,
    purchaseLabel
  } = useShippingRates();

  // Load shipping configuration and rates when dialog opens
  useEffect(() => {
    if (open && order) {
      loadShippingConfiguration();
    }
  }, [open, order]);

  const loadShippingConfiguration = async () => {
    setLoadingConfig(true);
    try {
      console.log('📊 Loading shipping configuration...');

      // Load default shipping config
      const { data: configs } = await supabase
        .from('store_shipping_configs')
        .select('*')
        .eq('is_default', true)
        .limit(1);

      const config = configs?.[0];
      
      if (config) {
        setShipFromConfig({
          name: config.from_name || '',
          company: config.from_company || '',
          address: config.from_address_line1 || '',
          address2: config.from_address_line2 || '',
          city: config.from_city || '',
          state: config.from_state || '',
          zip: config.from_zip || '',
          country: config.from_country || 'CA',
          phone: config.from_phone || '' // Load phone from config
        });
        
        setShipperPhone(config.from_phone || ''); // Set shipper phone
      } else {
        // Default shipping config
        setShipFromConfig({
          name: 'Default Shipper',
          company: '',
          address: '123 Main St',
          address2: '',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US',
          phone: '555-0123' // Default phone
        });
        
        setShipperPhone('555-0123');
      }

      // Auto-calculate rates
      await calculateInitialRates();
    } catch (error) {
      console.error('Failed to load shipping configuration:', error);
      toast({
        title: "Configuration error",
        description: "Failed to load shipping configuration",
        variant: "destructive",
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  const calculateInitialRates = async () => {
    if (!order) return;

    console.log('🔄 Calculating initial rates for order:', order.id);
    console.log('📦 Package details:', packageDetails);
    console.log('📮 Ship from config:', shipFromConfig);

    const rateRequest = {
      order_id: order.id, // Match backend interface
      ship_from: shipFromConfig,
      shipTo: {
        name: order.customerName,
        address: order.shippingAddress.line1,
        address2: order.shippingAddress.line2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zip: order.shippingAddress.zip,
        country: order.shippingAddress.country
      },
      package: {
        weight: packageDetails.weight,
        length: packageDetails.length,
        width: packageDetails.width,
        height: packageDetails.height
      }
    };

    console.log('📡 Sending rate request:', JSON.stringify(rateRequest, null, 2));

    try {
      await calculateRates(rateRequest);
    } catch (error) {
      console.error('Failed to calculate rates:', error);
    }
  };

  const handleRecalculateRates = async () => {
    await calculateInitialRates();
  };

  const handlePurchaseLabel = async (rate: any) => {
    if (!order) return;

    // Validate required phone numbers for UPS
    if (rate.carrier === 'UPS') {
      if (!shipperPhone?.trim()) {
        toast({
          title: "Phone number required",
          description: "UPS requires a shipper phone number. Please enter your phone number.",
          variant: "destructive",
        });
        return;
      }
      
      if (!recipientPhone?.trim()) {
        toast({
          title: "Phone number required", 
          description: "UPS requires a recipient phone number. Please enter the recipient's phone number.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      console.log('🔄 Purchasing label for rate:', rate);
      console.log('📞 Using phone numbers - Shipper:', shipperPhone, 'Recipient:', recipientPhone);

      const shipFromWithPhone = {
        ...shipFromConfig,
        phone: shipperPhone || '514-555-0123'
      };

      const shipToWithPhone = {
        name: order.customerName,
        company: '',
        address: order.shippingAddress.line1,
        address2: order.shippingAddress.line2,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        zip: order.shippingAddress.zip,
        country: order.shippingAddress.country,
        phone: recipientPhone || shipperPhone || '514-555-0123'
      };

      const result = await purchaseLabel(
        order.id,
        rate.serviceCode,
        rate.carrier,
        shipFromWithPhone,
        shipToWithPhone,
        {
          ...packageDetails,
          value: packageDetails.value || order.totalAmount
        },
        {
          signatureRequired: false,
          insuranceValue: order.totalAmount
        }
      );

      console.log('✅ Label purchased successfully:', result);
      
      toast({
        title: "Label purchased successfully",
        description: `Tracking number: ${result.tracking_number || result.trackingNumber}`,
      });

      onLabelPurchased?.();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Failed to purchase label:', error);
      toast({
        title: "Label purchase failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
          Purchase Shipping Label - {order.orderNumber}
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{order.currency} {order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Destination:</span>
                <span className="font-medium text-right">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                </span>
                </div>
              </CardContent>
            </Card>

            {/* Ship From Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ship From Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from-name">From Name *</Label>
                    <Input
                      id="from-name"
                      value={shipFromConfig.name}
                      onChange={(e) => setShipFromConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Shipper name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-phone">From Phone * (Required for UPS)</Label>
                    <Input
                      id="from-phone"
                      value={shipperPhone}
                      onChange={(e) => setShipperPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from-company">From Company</Label>
                    <Input
                      id="from-company"
                      value={shipFromConfig.company}
                      onChange={(e) => setShipFromConfig(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Company name (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipient-phone">Recipient Phone * (Required for UPS)</Label>
                    <Input
                      id="recipient-phone"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="from-address">Address *</Label>
                    <Input
                      id="from-address"
                      value={shipFromConfig.address}
                      onChange={(e) => setShipFromConfig(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-address2">Address 2</Label>
                    <Input
                      id="from-address2"
                      value={shipFromConfig.address2}
                      onChange={(e) => setShipFromConfig(prev => ({ ...prev, address2: e.target.value }))}
                      placeholder="Apt, suite, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="from-city">City *</Label>
                    <Input
                      id="from-city"
                      value={shipFromConfig.city}
                      onChange={(e) => setShipFromConfig(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-state">State/Province *</Label>
                    <Input
                      id="from-state"
                      value={shipFromConfig.state}
                      onChange={(e) => setShipFromConfig(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State/Province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="from-zip">ZIP/Postal Code *</Label>
                    <Input
                      id="from-zip"
                      value={shipFromConfig.zip}
                      onChange={(e) => setShipFromConfig(prev => ({ ...prev, zip: e.target.value }))}
                      placeholder="ZIP/Postal"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Package Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (lbs) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={packageDetails.weight}
                      onChange={(e) => setPackageDetails(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0.1 }))}
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Declared Value ({order.currency}) *</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      min="0"
                      value={packageDetails.value || order.totalAmount}
                      onChange={(e) => setPackageDetails(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                      placeholder={order.totalAmount.toString()}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="length">Length (in) *</Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={packageDetails.length}
                      onChange={(e) => setPackageDetails(prev => ({ ...prev, length: parseFloat(e.target.value) || 0.1 }))}
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (in) *</Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={packageDetails.width}
                      onChange={(e) => setPackageDetails(prev => ({ ...prev, width: parseFloat(e.target.value) || 0.1 }))}
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (in) *</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={packageDetails.height}
                      onChange={(e) => setPackageDetails(prev => ({ ...prev, height: parseFloat(e.target.value) || 0.1 }))}
                      placeholder="4"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleRecalculateRates} 
                  variant="outline" 
                  className="w-full"
                  disabled={ratesLoading}
                >
                  {ratesLoading ? 'Calculating...' : 'Recalculate Rates'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Shipping Rates */}
          <div className="space-y-6">
            {/* Phone Number Requirements Alert */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Phone Numbers Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    UPS requires phone numbers for both shipper and recipient. Canada Post phone numbers are optional.
                  </p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Available Shipping Rates</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingConfig ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : ratesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Calculating shipping rates...
                    </div>
                  </div>
                ) : rates.length > 0 ? (
                  <div className="space-y-3">
                    {rates.map((rate, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{rate.carrier}</Badge>
                            <span className="font-medium">{rate.serviceName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rate.estimatedDays}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ${rate.cost.toFixed(2)}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handlePurchaseLabel(rate)}
                            className="mt-2"
                          >
                            Purchase Label
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No shipping rates available</p>
                    <p className="text-sm mt-1">Check your package details and addresses</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}