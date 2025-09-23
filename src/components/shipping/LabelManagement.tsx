import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Package, Truck, Clock, MapPin } from 'lucide-react';
import { useShippingRates } from '@/hooks/useShippingRates';

interface ShippingLabel {
  id: string;
  carrier: string;
  service_code: string;
  service_name: string;
  tracking_number: string;
  cost: number;
  currency: string;
  status: string;
  created_at: string;
  label_url?: string;
  order_id?: string;
}

interface LabelPurchaseDialogProps {
  selectedRate: any;
  orderDetails: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LabelPurchaseDialog({ 
  selectedRate, 
  orderDetails, 
  onSuccess, 
  onCancel 
}: LabelPurchaseDialogProps) {
  const [purchasing, setPurchasing] = useState(false);
  const { toast } = useToast();
  const { purchaseLabel } = useShippingRates();

  const handlePurchase = async () => {
    if (!selectedRate || !orderDetails) return;

    setPurchasing(true);
    try {
      console.log('🛒 Purchasing label for:', {
        carrier: selectedRate.carrier,
        serviceCode: selectedRate.serviceCode,
        serviceName: selectedRate.serviceName,
        cost: selectedRate.cost
      });

      const result = await purchaseLabel(
        orderDetails.order_id || orderDetails.id,
        selectedRate.serviceCode,
        selectedRate.carrier,
        orderDetails.ship_from,
        orderDetails.ship_to,
        orderDetails.package,
        {
          signatureRequired: false,
          insuranceValue: orderDetails.package?.value || 100
        }
      );

      console.log('✅ Label purchase result:', result);

      toast({
        title: "Label created successfully!",
        description: `${selectedRate.carrier} ${selectedRate.serviceName} label created with tracking: ${result.tracking_number || result.trackingNumber}`,
      });

      onSuccess();
    } catch (error) {
      console.error('❌ Label purchase failed:', error);
      toast({
        title: "Label purchase failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Purchase Shipping Label
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Carrier:</span>
              <span>{selectedRate?.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Service:</span>
              <span>{selectedRate?.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Cost:</span>
              <span className="font-bold">${selectedRate?.cost?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Estimated Delivery:</span>
              <span>{selectedRate?.estimatedDays}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Shipping Details</h4>
            <div className="text-sm space-y-1">
              <div><strong>From:</strong> {orderDetails?.ship_from?.city}, {orderDetails?.ship_from?.state}</div>
              <div><strong>To:</strong> {orderDetails?.ship_to?.city}, {orderDetails?.ship_to?.state}</div>
              <div><strong>Weight:</strong> {orderDetails?.package?.weight} lbs</div>
              <div><strong>Dimensions:</strong> {orderDetails?.package?.length}"×{orderDetails?.package?.width}"×{orderDetails?.package?.height}"</div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
              disabled={purchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1"
              disabled={purchasing}
            >
              {purchasing ? 'Creating Label...' : 'Purchase Label'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ShippingLabelsManager() {
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { downloadLabel } = useShippingRates();

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const { data, error } = await supabase
        .from('shipment_labels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLabels(data || []);
    } catch (error) {
      console.error('❌ Failed to fetch labels:', error);
      toast({
        title: "Failed to load labels",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (label: ShippingLabel) => {
    try {
      if (label.carrier === 'Canada Post') {
        await downloadLabel(label.id);
      } else if (label.label_url) {
        window.open(label.label_url, '_blank');
        toast({
          title: "Label opened",
          description: "Shipping label has been opened in a new window.",
        });
      } else {
        toast({
          title: "Label not available",
          description: "Label download is not available for this shipment.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Download failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'printed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Labels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading labels...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Shipping Labels
        </CardTitle>
      </CardHeader>
      <CardContent>
        {labels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No shipping labels found. Purchase your first label by calculating rates for an order.
          </div>
        ) : (
          <div className="space-y-4">
            {labels.map((label) => (
              <Card key={label.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{label.carrier}</span>
                        <Badge variant="secondary">{label.service_name}</Badge>
                        <Badge className={getStatusColor(label.status)}>
                          {label.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>Tracking: {label.tracking_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(label.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium">
                          {label.cost ? `${label.currency} $${label.cost.toFixed(2)}` : 'Cost not available'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(label)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}