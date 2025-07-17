import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useShippingRates, type ShippingRate } from '@/hooks/useShippingRates';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Truck, 
  DollarSign, 
  Calendar, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Printer,
  Download,
  Weight,
  Ruler,
  Shield,
  FileText
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  storeName: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    validated: boolean;
  };
  packageDetails: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  items: Array<{
    productTitle: string;
    quantity: number;
    weight?: number;
  }>;
}

interface LabelPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onLabelPurchased?: () => void;
}

export function LabelPurchaseDialog({ 
  open, 
  onOpenChange, 
  order,
  onLabelPurchased 
}: LabelPurchaseDialogProps) {
  const [step, setStep] = useState<'rates' | 'purchase' | 'confirmation'>('rates');
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [shipFromConfig, setShipFromConfig] = useState<any>(null);
  const [packageDetails, setPackageDetails] = useState({
    weight: 1,
    length: 12,
    width: 8,
    height: 4,
    packageType: '02'
  });
  const [additionalServices, setAdditionalServices] = useState({
    signatureRequired: false,
    insuranceValue: 0,
    saturdayDelivery: false
  });
  const [purchasedLabel, setPurchasedLabel] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const { rates, loading, calculateRates, purchaseLabel } = useShippingRates();
  const { toast } = useToast();

  // Load shipping configuration and calculate rates when dialog opens
  useEffect(() => {
    if (open && order) {
      loadShippingConfig();
    }
  }, [open, order]);

  // Update package details from order when it changes
  useEffect(() => {
    if (order?.packageDetails) {
      setPackageDetails(prev => ({
        ...prev,
        weight: order.packageDetails.weight || 1,
        length: order.packageDetails.length || 12,
        width: order.packageDetails.width || 8,
        height: order.packageDetails.height || 4
      }));
    }
  }, [order]);

  const loadShippingConfig = async () => {
    if (!order) return;
    
    setLoadingConfig(true);
    try {
      // Load default shipping configuration for the store
      const { data: config, error } = await supabase
        .from('store_shipping_configs')
        .select('*')
        .eq('store_name', order.storeName)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is okay
        console.error('Error loading shipping config:', error);
      }

      if (config) {
        setShipFromConfig({
          name: config.from_name,
          company: config.from_company || '',
          address: config.from_address_line1,
          address2: config.from_address_line2 || '',
          city: config.from_city,
          state: config.from_state,
          zip: config.from_zip,
          country: config.from_country
        });
      } else {
        // Use default configuration
        setShipFromConfig({
          name: 'Default Sender',
          company: '',
          address: '123 Main St',
          address2: '',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US'
        });
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

    const rateRequest = {
      orderId: order.id,
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

    await calculateRates(rateRequest);
  };

  const handleRecalculateRates = async () => {
    if (!order) return;
    
    const rateRequest = {
      orderId: order.id,
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
      },
      additionalServices
    };

    await calculateRates(rateRequest);
  };

  const handlePurchaseLabel = async () => {
    if (!selectedRate || !order || !shipFromConfig) return;

    try {
      const result = await purchaseLabel(
        order.id,
        selectedRate.serviceCode,
        shipFromConfig,
        {
          name: order.customerName,
          address: order.shippingAddress.line1,
          address2: order.shippingAddress.line2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zip: order.shippingAddress.zip,
          country: order.shippingAddress.country
        },
        packageDetails,
        additionalServices
      );

      setPurchasedLabel(result);
      setStep('confirmation');
      onLabelPurchased?.();
    } catch (error) {
      console.error('Failed to purchase label:', error);
    }
  };

  const handlePrintLabel = () => {
    if (!purchasedLabel?.labelUrl) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shipping Label - ${purchasedLabel.trackingNumber}</title>
            <style>
              body { margin: 0; padding: 20px; text-align: center; }
              img { max-width: 100%; height: auto; }
              .header { margin-bottom: 20px; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Shipping Label</h2>
              <p>Tracking: ${purchasedLabel.trackingNumber}</p>
              <p>Order: ${order?.orderNumber}</p>
            </div>
            <img src="${purchasedLabel.labelUrl}" alt="Shipping Label" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadLabel = () => {
    if (!purchasedLabel?.labelUrl) return;
    
    const link = document.createElement('a');
    link.href = purchasedLabel.labelUrl;
    link.download = `label-${purchasedLabel.trackingNumber}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetDialog = () => {
    setStep('rates');
    setSelectedRate(null);
    setPurchasedLabel(null);
    setPackageDetails({
      weight: order?.packageDetails?.weight || 1,
      length: order?.packageDetails?.length || 12,
      width: order?.packageDetails?.width || 8,
      height: order?.packageDetails?.height || 4,
      packageType: '02'
    });
    setAdditionalServices({
      signatureRequired: false,
      insuranceValue: 0,
      saturdayDelivery: false
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) {
        setTimeout(resetDialog, 200); // Reset after dialog closes
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Shipping Label - Order #{order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Customer:</span> {order.customerName}
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span> {formatCurrency(order.totalAmount)}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Ship to:</span>{' '}
                {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </div>
            </div>
          </CardContent>
        </Card>

        {loadingConfig ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading shipping configuration...
          </div>
        ) : (
          <>
            {/* Step 1: Rate Selection */}
            {step === 'rates' && (
              <div className="space-y-6">
                {/* Package Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Weight className="h-4 w-4" />
                      Package Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={packageDetails.weight}
                          onChange={(e) => setPackageDetails(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="length">Length (in)</Label>
                        <Input
                          id="length"
                          type="number"
                          value={packageDetails.length}
                          onChange={(e) => setPackageDetails(prev => ({ ...prev, length: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="width">Width (in)</Label>
                        <Input
                          id="width"
                          type="number"
                          value={packageDetails.width}
                          onChange={(e) => setPackageDetails(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height (in)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={packageDetails.height}
                          onChange={(e) => setPackageDetails(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="packageType">Package Type</Label>
                        <Select value={packageDetails.packageType} onValueChange={(value) => setPackageDetails(prev => ({ ...prev, packageType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="02">Customer Supplied Package</SelectItem>
                            <SelectItem value="01">UPS Letter</SelectItem>
                            <SelectItem value="03">Tube</SelectItem>
                            <SelectItem value="04">PAK</SelectItem>
                            <SelectItem value="21">UPS Express Box</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleRecalculateRates} disabled={loading}>
                          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Recalculate Rates
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Services */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Additional Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="signature"
                          checked={additionalServices.signatureRequired}
                          onCheckedChange={(checked) => setAdditionalServices(prev => ({ ...prev, signatureRequired: checked as boolean }))}
                        />
                        <Label htmlFor="signature">Signature Required</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saturday"
                          checked={additionalServices.saturdayDelivery}
                          onCheckedChange={(checked) => setAdditionalServices(prev => ({ ...prev, saturdayDelivery: checked as boolean }))}
                        />
                        <Label htmlFor="saturday">Saturday Delivery</Label>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="insurance">Insurance Value ($)</Label>
                      <Input
                        id="insurance"
                        type="number"
                        step="0.01"
                        value={additionalServices.insuranceValue}
                        onChange={(e) => setAdditionalServices(prev => ({ ...prev, insuranceValue: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Rates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Available Shipping Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                        Calculating shipping rates...
                      </div>
                    ) : rates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        No shipping rates available. Please check your package details and try again.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {rates.map((rate, index) => (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              selectedRate?.serviceCode === rate.serviceCode
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedRate(rate)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  selectedRate?.serviceCode === rate.serviceCode
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`} />
                                <div>
                                  <div className="font-medium">{rate.serviceName}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {rate.estimatedDays}
                                    </span>
                                    <span>{rate.estimatedDelivery}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-semibold">{formatCurrency(rate.cost)}</div>
                                <Badge variant="secondary" className="text-xs">{rate.carrier}</Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => setStep('purchase')} 
                    disabled={!selectedRate}
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Purchase Label
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Purchase Confirmation */}
            {step === 'purchase' && selectedRate && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Purchase Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Service:</span> {selectedRate.serviceName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cost:</span> {formatCurrency(selectedRate.cost)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Delivery:</span> {selectedRate.estimatedDays}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Est. Date:</span> {selectedRate.estimatedDelivery}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div><strong>Package:</strong> {packageDetails.weight} lbs, {packageDetails.length}×{packageDetails.width}×{packageDetails.height} in</div>
                      {additionalServices.signatureRequired && <div><strong>Signature Required:</strong> Yes</div>}
                      {additionalServices.saturdayDelivery && <div><strong>Saturday Delivery:</strong> Yes</div>}
                      {additionalServices.insuranceValue > 0 && <div><strong>Insurance:</strong> {formatCurrency(additionalServices.insuranceValue)}</div>}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('rates')}>
                    Back to Rates
                  </Button>
                  <Button 
                    onClick={handlePurchaseLabel} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Confirm Purchase
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation & Print */}
            {step === 'confirmation' && purchasedLabel && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      Label Purchased Successfully!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground">Tracking Number:</span>
                        <div className="font-mono font-semibold">{purchasedLabel.trackingNumber}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Cost:</span>
                        <div className="font-semibold">{formatCurrency(purchasedLabel.cost)}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Estimated Delivery:</span>
                        <div>{purchasedLabel.estimatedDelivery}</div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Shipping Label</h4>
                      <div className="border rounded-lg p-4 bg-muted/50">
                        <img 
                          src={purchasedLabel.labelUrl} 
                          alt="Shipping Label" 
                          className="max-w-full h-auto mx-auto"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button onClick={handlePrintLabel} className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        Print Label
                      </Button>
                      <Button variant="outline" onClick={handleDownloadLabel} className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}