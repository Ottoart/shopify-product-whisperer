import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Package, Printer, Eye, Edit, MapPin, DollarSign, User, Truck, Clock, AlertTriangle, Settings, Loader2, RefreshCw, AlertCircle, Lock, Globe, Plus } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { useShippingServices } from "@/hooks/useShippingServices";
import { CarrierConfigurationDialog } from "./CarrierConfigurationDialog";
import { EnhancedShippingConfiguration } from "./EnhancedShippingConfiguration";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
interface ShippingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
}

interface ShippingRate {
  carrier: string;
  service_code: string;
  service_name: string;
  service_type: string;
  cost: number;
  currency: string;
  estimated_days: string;
  delivery_date?: string;
  supports_tracking: boolean;
  supports_insurance: boolean;
  supports_signature: boolean;
}

export function ShippingDetailsDialog({ isOpen, onClose, order, onUpdateOrder }: ShippingDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [showCarrierConfig, setShowCarrierConfig] = useState(false);
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const { services, carriers, loading: servicesLoading, refreshServices } = useShippingServices();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    weight: order?.packageDetails?.weight || 0,
    length: order?.packageDetails?.length || 0,
    width: order?.packageDetails?.width || 0,
    height: order?.packageDetails?.height || 0,
    serviceType: order?.shippingDetails?.serviceType || "",
    carrier: order?.shippingDetails?.carrier || "",
    packageType: "12x6x4",
    confirmation: "none",
    insurance: "none",
    noteToBuyer: "",
    noteFromBuyer: "",
    giftNote: "",
    customField1: "",
    customField2: "",
    customField3: "",
    brand: "none",
    packingSlip: "default",
    shipmentNotification: "default",
    deliveryNotification: "default"
  });

  // Update form data when order changes
  useEffect(() => {
    if (order) {
      setFormData(prev => ({
        ...prev,
        weight: order.packageDetails?.weight || 0,
        length: order.packageDetails?.length || 0,
        width: order.packageDetails?.width || 0,
        height: order.packageDetails?.height || 0,
        serviceType: order.shippingDetails?.serviceType || "",
        carrier: order.shippingDetails?.carrier || ""
      }));
    }
  }, [order]);

  if (!order) return null;

  // Group services by carrier for easier display
  const servicesByCarrier = services.reduce((acc, service) => {
    const carrierName = service.carrier_name || 'Unknown';
    if (!acc[carrierName]) {
      acc[carrierName] = [];
    }
    acc[carrierName].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  const handleUpdateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onUpdateOrder) {
      onUpdateOrder(order.id, {
        packageDetails: {
          ...order.packageDetails,
          weight: formData.weight,
          length: formData.length,
          width: formData.width,
          height: formData.height
        },
        shippingDetails: {
          ...order.shippingDetails,
          serviceType: formData.serviceType,
          carrier: formData.carrier
        }
      });
    }
    setIsEditing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const fetchShippingRates = async () => {
    if (!order) return;
    
    setLoadingRates(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-shipping-rates', {
        body: {
          order_id: order.id,
          ship_from: {
            name: "Default Store",
            address: "123 Store Street",
            city: "Your City", 
            state: "Your State",
            zip: "12345",
            country: "US"
          },
          service_preferences: ["standard", "expedited", "overnight"],
          additional_services: {
            signature_required: formData.confirmation === "signature",
            insurance_value: formData.insurance !== "none" ? order.totalAmount : undefined
          }
        }
      });

      if (error) {
        console.error('Error fetching rates:', error);
        toast({
          title: "Error fetching rates",
          description: "Failed to get shipping rates. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data?.rates) {
        setRates(data.rates);
        toast({
          title: "Rates updated",
          description: `Found ${data.rates.length} shipping options`,
        });
      }
    } catch (error) {
      console.error('Rate fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipping rates",
        variant: "destructive"
      });
    } finally {
      setLoadingRates(false);
    }
  };

  const handleSelectRate = (rate: ShippingRate) => {
    setSelectedRate(rate);
    if (onUpdateOrder) {
      onUpdateOrder(order.id, {
        shippingDetails: {
          ...order.shippingDetails,
          cost: rate.cost,
          carrier: rate.carrier,
          serviceType: rate.service_name
        }
      });
    }
  };

  const testUPSAuth = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-ups-auth');
      
      if (error) {
        console.error('UPS Auth Test Error:', error);
        toast({
          title: "UPS Test Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log('UPS Auth Test Result:', data);
      toast({
        title: "UPS Test Complete",
        description: `Status: ${data.status}, Success: ${data.success}`,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('UPS Auth Test Error:', error);
      toast({
        title: "UPS Test Failed",
        description: "Failed to test UPS authentication",
        variant: "destructive",
      });
    }
  };


  const createShippingLabel = async (retryCount = 0) => {
    console.log('🏷️ Starting label creation...');
    
    if (!selectedRate || !order) {
      console.error('❌ Missing requirements:', { selectedRate: Boolean(selectedRate), order: Boolean(order) });
      toast({
        title: "No rate selected",
        description: "Please select a shipping rate first",
        variant: "destructive"
      });
      return;
    }

    console.log('✅ Selected rate:', selectedRate);
    console.log('✅ Order:', order);

    try {
      // Get UPS carrier configuration
      const upsCarrier = carriers.find(c => c.carrier_name === 'UPS');
      if (!upsCarrier || !upsCarrier.is_active) {
        toast({
          title: "Configuration Error",
          description: "UPS is not configured or not active. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Get the ship-from address from store configuration
      const { data: storeConfig, error: storeError } = await supabase
        .from('store_shipping_configs')
        .select('*')
        .eq('is_default', true)
        .maybeSingle();

      if (storeError || !storeConfig) {
        toast({
          title: "Configuration Error",
          description: "No default shipping address configured. Please add a ship-from address first.",
          variant: "destructive",
        });
        return;
      }

      // UPS account number for label creation
      const upsAccountNumber = "A906G5";

      console.log('📞 Calling UPS shipment function with data:', {
        orderId: order.id,
        serviceCode: selectedRate.service_code,
        shipFrom: {
          name: storeConfig.from_name,
          company: storeConfig.from_company,
          address: storeConfig.from_address_line1,
          address2: storeConfig.from_address_line2,
          city: storeConfig.from_city,
          state: storeConfig.from_state,
          zip: storeConfig.from_zip,
          country: storeConfig.from_country,
          phone: storeConfig.from_phone
        }
      });

      const { data, error } = await supabase.functions.invoke('ups-shipment', {
        body: {
          orderId: order.id,
          serviceCode: selectedRate.service_code,
          shipFrom: {
            name: storeConfig.from_name,
            company: storeConfig.from_company,
            address: storeConfig.from_address_line1,
            address2: storeConfig.from_address_line2,
            city: storeConfig.from_city,
            state: storeConfig.from_state,
            zip: storeConfig.from_zip,
            country: storeConfig.from_country,
            phone: storeConfig.from_phone
          },
          shipTo: {
            name: order.customerName,
            address: order.shippingAddress.line1,
            address2: order.shippingAddress.line2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zip: order.shippingAddress.zip,
            country: order.shippingAddress.country === 'Canada' ? 'CA' : 
                    order.shippingAddress.country === 'United States' ? 'US' : 
                    order.shippingAddress.country
          },
          package: {
            weight: formData.weight || 1,
            length: formData.length || 12,
            width: formData.width || 8,
            height: formData.height || 4,
            packageType: "02" // Customer Supplied Package
          },
          paymentInfo: {
            shipperAccountNumber: upsAccountNumber,
            paymentType: "prepaid"
          },
          additionalServices: {
            signatureRequired: formData.confirmation === "signature",
            insuranceValue: formData.insurance !== "none" ? order.totalAmount : undefined
          }
        }
      });

      console.log('📡 UPS shipment function response:', { data, error });

      if (error) {
        console.error('❌ Label creation error:', error);
        console.log('📊 Full error context:', { error, data });
        
        // Try to extract more specific error information
        let errorMessage = "Failed to create shipping label";
        let shouldRetry = false;

        // Check if we have specific error data from the edge function
        if (data?.error) {
          errorMessage = data.error;
          if (data.code === 'UPS_TOKEN_EXPIRED' || data.code === 'UPS_AUTH_FAILED') {
            shouldRetry = true;
          }
        } else if (error.message?.includes('non-2xx status code')) {
          // Generic Supabase function error - try to get more details
          errorMessage = "UPS API request failed. Please check your UPS configuration.";
          shouldRetry = true; // Try once to refresh token
        }
        
        // Check if it's a token expiration error that we can retry
        if (shouldRetry && retryCount < 1) {
          console.log('🔄 Attempting to refresh token and retry...');
          toast({
            title: "Refreshing authentication",
            description: "UPS token may have expired, refreshing and retrying...",
          });
          
          // Try to refresh the token
          try {
            const { data: refreshData, error: refreshError } = await supabase.functions.invoke('refresh-ups-token');
            if (!refreshError && refreshData?.success) {
              console.log('✅ Token refreshed, retrying label creation...');
              // Retry the label creation
              return createShippingLabel(retryCount + 1);
            } else {
              console.error('❌ Token refresh failed:', refreshError);
              errorMessage = "Failed to refresh UPS authentication. Please re-connect UPS.";
            }
          } catch (refreshError) {
            console.error('❌ Token refresh exception:', refreshError);
            errorMessage = "Failed to refresh UPS authentication. Please re-connect UPS.";
          }
        }
        
        logger.error('Shipping', 'Label creation failed', { 
          error: errorMessage,
          orderId: order.id,
          serviceCode: selectedRate?.service_code,
          retryCount 
        });
        
        toast({
          title: "Label creation failed",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        logger.success('Shipping', 'Label created successfully', { 
          trackingNumber: data.trackingNumber,
          orderId: order.id,
          serviceCode: selectedRate?.service_code 
        });
        toast({
          title: "Label created successfully",
          description: `Tracking number: ${data.trackingNumber}`,
        });

        // Update order with tracking info
        if (onUpdateOrder) {
          onUpdateOrder(order.id, {
            shippingDetails: {
              ...order.shippingDetails,
              carrier: selectedRate.carrier,
              serviceType: selectedRate.service_name,
              trackingNumber: data.trackingNumber
            },
            status: 'shipped'
          });
        }
      }
    } catch (error) {
      console.error('Label creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create shipping label",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order.orderNumber} - Shipment Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={testUPSAuth}
              >
                Test UPS
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => createShippingLabel()}
                disabled={!selectedRate}
              >
                <Printer className="h-4 w-4 mr-2" />
                Create + Print Label
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* UPS OAuth Authorization Alert - Only show if UPS is not authorized */}
        {(() => {
          const upsCarrier = carriers.find(c => c.carrier_name === 'UPS');
          const isUpsAuthorized = upsCarrier?.is_active && 
                                 upsCarrier?.api_credentials?.access_token &&
                                 (!upsCarrier?.api_credentials?.token_expires_at || 
                                  new Date(upsCarrier.api_credentials.token_expires_at) > new Date());
          
          if (isUpsAuthorized) return null;
          
          return (
            <div className="mb-4 p-3 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">UPS Authorization Required</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const { data, error } = await supabase.functions.invoke('ups-oauth-url');
                      if (error) throw error;
                      if (data?.authUrl) {
                        window.open(data.authUrl, '_blank');
                        toast({
                          title: "OAuth Authorization",
                          description: "Complete UPS authorization in the new window to enable label creation.",
                        });
                      }
                    } catch (error) {
                      console.error('OAuth error:', error);
                      toast({
                        title: "OAuth Error",
                        description: "Failed to generate OAuth URL",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Authorize UPS OAuth
                </Button>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                You need to complete UPS OAuth authorization before creating shipping labels.
              </p>
            </div>
          );
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Shipment Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Shipment Details</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Ship To Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MapPin className="h-5 w-5" />
                      Ship To Address
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="font-medium">{order.customerName}</div>
                      <div>{order.shippingAddress.line1}</div>
                      {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                      <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</div>
                      <div>{order.shippingAddress.country}</div>
                      <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        Validate Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <DollarSign className="h-5 w-5" />
                      Cost Summary
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Product</span>
                        <span>{formatCurrency(order.totalAmount - (order.shippingDetails?.cost || 0), order.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{formatCurrency(order.shippingDetails?.cost || 0, order.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(0, order.currency)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Total Paid</span>
                        <span>{formatCurrency(order.totalAmount, order.currency)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Fields */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="noteFromBuyer">Note From Buyer</Label>
                      <Textarea 
                        id="noteFromBuyer"
                        placeholder="Customer notes..."
                        value={formData.noteFromBuyer}
                        onChange={(e) => handleUpdateField('noteFromBuyer', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="noteToBuyer">Note To Buyer</Label>
                      <Textarea 
                        id="noteToBuyer"
                        placeholder="Add a note for the customer..."
                        value={formData.noteToBuyer}
                        onChange={(e) => handleUpdateField('noteToBuyer', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="giftNote">Gift Note</Label>
                      <Textarea 
                        id="giftNote"
                        placeholder="Gift message..."
                        value={formData.giftNote}
                        onChange={(e) => handleUpdateField('giftNote', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="customField1">Custom Field 1</Label>
                        <Input 
                          id="customField1"
                          value={formData.customField1}
                          onChange={(e) => handleUpdateField('customField1', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customField2">Custom Field 2</Label>
                        <Input 
                          id="customField2"
                          value={formData.customField2}
                          onChange={(e) => handleUpdateField('customField2', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customField3">Custom Field 3</Label>
                        <Input 
                          id="customField3"
                          value={formData.customField3}
                          onChange={(e) => handleUpdateField('customField3', e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Communication */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Communication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Brand</Label>
                      <Select value={formData.brand} onValueChange={(value) => handleUpdateField('brand', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Packing Slip</Label>
                      <Select value={formData.packingSlip} onValueChange={(value) => handleUpdateField('packingSlip', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Default 4&quot; x 6&quot;" />
                        </SelectTrigger>
                        <SelectContent>
                      <SelectItem value="default">Default 4&quot; x 6&quot;</SelectItem>
                      <SelectItem value="large">Large 8.5&quot; x 11&quot;</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Shipment Notification</Label>
                      <Select value={formData.shipmentNotification} onValueChange={(value) => handleUpdateField('shipmentNotification', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Don't Send Email (Default)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Don't Send Email (Default)</SelectItem>
                          <SelectItem value="send">Send Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Delivery Notification</Label>
                      <Select value={formData.deliveryNotification} onValueChange={(value) => handleUpdateField('deliveryNotification', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Don't Send Email (Default)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Don't Send Email (Default)</SelectItem>
                          <SelectItem value="send">Send Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="marketplaceNotify" />
                      <Label htmlFor="marketplaceNotify">Do not notify marketplace</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Shipment Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded border overflow-hidden">
                            {item.imageSrc ? (
                              <img 
                                src={item.imageSrc} 
                                alt={item.productTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productTitle}</h4>
                            {item.variantTitle && (
                              <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                            )}
                            <p className="text-sm text-muted-foreground">SKU: {item.sku || "N/A"}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">Qty: {item.quantity}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(item.price, order.currency)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* International Shipping - Customs Declarations */}
                {order.shippingAddress?.country !== 'US' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Customs Declarations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Select Contents*</Label>
                          <Select defaultValue="merchandise">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="merchandise">Merchandise</SelectItem>
                              <SelectItem value="documents">Documents</SelectItem>
                              <SelectItem value="gift">Gift</SelectItem>
                              <SelectItem value="sample">Sample</SelectItem>
                              <SelectItem value="return">Return</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">If Undeliverable*</Label>
                          <Select defaultValue="return">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="return">Return To Sender</SelectItem>
                              <SelectItem value="abandon">Abandon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Duties Paid</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">$</span>
                            <Input type="number" step="0.01" placeholder="0.00" className="rounded-l-none" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Postage Paid</Label>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">$</span>
                            <Input type="number" step="0.01" placeholder="0.00" className="rounded-l-none" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Export Declaration Number</Label>
                          <Input placeholder="Optional" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Invoice Number</Label>
                          <Input placeholder="Optional" />
                        </div>
                      </div>

                      {/* Customs Declaration Items - Linked to Order Items */}
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Declaration Items</h4>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Item
                          </Button>
                        </div>
                        
                        {order.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-7 gap-2 items-end p-3 bg-muted/50 rounded-md">
                            <div>
                              <Label className="text-xs text-muted-foreground">Description*</Label>
                              <Input defaultValue={item.productTitle} className="text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">SKU</Label>
                              <Input defaultValue={item.sku || ""} className="text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Quantity*</Label>
                              <Input type="number" defaultValue={item.quantity} className="text-sm" />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Item Value*</Label>
                              <div className="flex">
                                <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs">$</span>
                                <Input type="number" step="0.01" defaultValue={item.price} className="rounded-l-none text-sm" />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Total Value*</Label>
                              <div className="flex">
                                <span className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs">$</span>
                                <Input type="number" step="0.01" defaultValue={(item.price * item.quantity).toFixed(2)} className="rounded-l-none text-sm" readOnly />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">HS Code*</Label>
                              <Input defaultValue="999999" className="text-sm" placeholder="Commodity code" />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Origin*</Label>
                              <Select defaultValue="US">
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="MX">Mexico</SelectItem>
                                  <SelectItem value="GB">United Kingdom</SelectItem>
                                  <SelectItem value="DE">Germany</SelectItem>
                                  <SelectItem value="FR">France</SelectItem>
                                  <SelectItem value="JP">Japan</SelectItem>
                                  <SelectItem value="CN">China</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Shipment Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="font-medium">Order created</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.orderDate).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {order.shippedDate && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <div className="font-medium">Order shipped</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(order.shippedDate).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Enhanced Shipping Configuration */}
          <div className="space-y-6">
            <EnhancedShippingConfiguration
              selectedOrder={order}
              onUpdateOrder={onUpdateOrder}
              onRateSelected={handleSelectRate}
              selectedRate={selectedRate}
            />

            {/* Status Cards */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Deliver By</span>
                    <Button variant="ghost" size="sm">Set Date</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assigned To</span>
                    <Button variant="ghost" size="sm">None</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hold Until</span>
                    <Button variant="ghost" size="sm">Set Date</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Date Paid</span>
                    <Button variant="ghost" size="sm">Set Date</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <CarrierConfigurationDialog
          isOpen={showCarrierConfig}
          onClose={() => setShowCarrierConfig(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
