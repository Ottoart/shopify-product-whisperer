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
import { Calendar, Package, Printer, Eye, Edit, MapPin, DollarSign, User, Truck, Clock, AlertTriangle, Settings, Loader2, RefreshCw, AlertCircle, Lock } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { useShippingServices } from "@/hooks/useShippingServices";
import { CarrierConfigurationDialog } from "./CarrierConfigurationDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

  const createShippingLabel = async () => {
    if (!selectedRate || !order) {
      toast({
        title: "No rate selected",
        description: "Please select a shipping rate first",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ups-shipment', {
        body: {
          orderId: order.id,
          serviceCode: selectedRate.service_code,
          shipFrom: {
            name: "Default Store",
            address: "123 Store Street",
            city: "Your City",
            state: "Your State",
            zip: "12345",
            country: "US"
          },
          shipTo: {
            name: order.customerName,
            address: order.shippingAddress.line1,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            zip: order.shippingAddress.zip,
            country: order.shippingAddress.country
          },
          package: {
            weight: formData.weight || 1,
            length: formData.length || 12,
            width: formData.width || 8,
            height: formData.height || 4,
            packageType: "02" // Customer Supplied Package
          },
          paymentInfo: {
            shipperAccountNumber: "YOUR_UPS_ACCOUNT", // This should come from carrier config
            paymentType: "prepaid"
          },
          additionalServices: {
            signatureRequired: formData.confirmation === "signature",
            insuranceValue: formData.insurance !== "none" ? order.totalAmount : undefined
          }
        }
      });

      if (error) {
        console.error('Label creation error:', error);
        toast({
          title: "Label creation failed",
          description: error.message || "Failed to create shipping label",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
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
                variant="default" 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={createShippingLabel}
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

          {/* Right Column - Configure Shipment */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Configure Shipment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Requested</Label>
                  <div className="text-sm text-muted-foreground">Not Specified</div>
                  <Button variant="outline" size="sm" className="mt-1">
                    Browse Rates
                  </Button>
                </div>

                <div>
                  <Label htmlFor="shipFrom">Ship From</Label>
                  <Select defaultValue="park-ave">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="park-ave">Park Ave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Weight</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      placeholder="0"
                      value={formData.weight}
                      onChange={(e) => handleUpdateField('weight', parseFloat(e.target.value) || 0)}
                      className="w-20"
                    />
                    <span className="text-sm">lbs</span>
                    <Input 
                      type="number" 
                      placeholder="0"
                      className="w-20"
                    />
                    <span className="text-sm">oz</span>
                    <Button variant="outline" size="sm">
                      Scale
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="service">Service</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCarrierConfig(true)}
                      disabled={servicesLoading}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage Carriers
                    </Button>
                  </div>
                  <Select value={formData.serviceType} onValueChange={(value) => handleUpdateField('serviceType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={services.length === 0 ? "No services available - configure carriers first" : "Select a service"} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.length === 0 ? (
                        <SelectItem value="no-services" disabled>
                          No services available
                        </SelectItem>
                      ) : (
                        Object.entries(servicesByCarrier).map(([carrierName, carrierServices]) => (
                          <div key={carrierName}>
                            <div className="px-2 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                              {carrierName.toUpperCase()}
                            </div>
                            {carrierServices.map(service => (
                              <SelectItem key={service.service_code} value={service.service_code}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{service.service_name}</span>
                                  {service.estimated_days && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {service.estimated_days}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="package">Package</Label>
                  <Select value={formData.packageType} onValueChange={(value) => handleUpdateField('packageType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12x6x4">12x6x4</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Size (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input 
                        placeholder="L"
                        type="number"
                        value={formData.length}
                        onChange={(e) => handleUpdateField('length', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Input 
                        placeholder="W"
                        type="number"
                        value={formData.width}
                        onChange={(e) => handleUpdateField('width', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Input 
                        placeholder="H"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleUpdateField('height', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmation">Confirmation</Label>
                  <Select value={formData.confirmation} onValueChange={(value) => handleUpdateField('confirmation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Authority to Leave" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Authority to Leave</SelectItem>
                      {(() => {
                        // Find the selected service to check if signature is supported
                        const selectedService = services.find(service => service.service_code === formData.serviceType);
                        const supportsSignature = selectedService?.supports_signature !== false; // Default to true if undefined
                        
                        return supportsSignature ? (
                          <SelectItem value="signature">Signature Required</SelectItem>
                        ) : null;
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="insurance">Insurance</Label>
                  <Select value={formData.insurance} onValueChange={(value) => handleUpdateField('insurance', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(() => {
                        // Find the selected service to check if insurance is supported
                        const selectedService = services.find(service => service.service_code === formData.serviceType);
                        const supportsInsurance = selectedService?.supports_insurance !== false; // Default to true if undefined
                        
                        return supportsInsurance ? (
                          <>
                            <SelectItem value="basic">Basic Coverage</SelectItem>
                            <SelectItem value="full">Full Coverage</SelectItem>
                          </>
                        ) : null;
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} size="sm">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

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

            {/* Shipping Rates */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg text-indigo-900">
                  <span className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Rates
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchShippingRates}
                    disabled={loadingRates}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  >
                    {loadingRates ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {loadingRates ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                    <span className="ml-2 text-indigo-700">Getting rates...</span>
                  </div>
                ) : rates.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {rates.map((rate, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedRate?.service_code === rate.service_code
                            ? 'border-indigo-400 bg-indigo-100 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-indigo-300'
                        }`}
                        onClick={() => handleSelectRate(rate)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{rate.service_name}</div>
                            <div className="text-sm text-gray-600">{rate.carrier}</div>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {rate.estimated_days} days
                              </Badge>
                              {rate.delivery_date && (
                                <span className="text-xs text-gray-500">
                                  Delivery: {new Date(rate.delivery_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-indigo-700">
                              {formatCurrency(rate.cost, rate.currency)}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                              {rate.service_type}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-lg font-medium text-indigo-900">No rates available</div>
                    <div className="text-sm text-indigo-700 mt-1">
                      Click refresh to get shipping rates
                    </div>
                  </div>
                )}
                
                {selectedRate && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Selected Service</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="font-medium">{selectedRate.service_name}</div>
                      <div className="text-green-700">
                        Cost: {formatCurrency(selectedRate.cost, selectedRate.currency)} • 
                        Delivery: {selectedRate.estimated_days} days
                      </div>
                    </div>
                  </div>
                )}
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
