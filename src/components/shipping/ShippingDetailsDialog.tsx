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
import { Calendar, Package, Printer, Eye, Edit, MapPin, DollarSign, User, Truck, Clock, AlertTriangle, Settings } from "lucide-react";
import { Order } from "@/hooks/useOrders";
import { useShippingServices } from "@/hooks/useShippingServices";
import { CarrierConfigurationDialog } from "./CarrierConfigurationDialog";
interface ShippingDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
}

export function ShippingDetailsDialog({ isOpen, onClose, order, onUpdateOrder }: ShippingDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [showCarrierConfig, setShowCarrierConfig] = useState(false);
  const { services, carriers, loading: servicesLoading, refreshServices } = useShippingServices();
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
              <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                <Printer className="h-4 w-4 mr-2" />
                Create + Print Label
              </Button>
            </div>
          </div>
        </DialogHeader>

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
                      <SelectItem value="signature">Signature Required</SelectItem>
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
                      <SelectItem value="basic">Basic Coverage</SelectItem>
                      <SelectItem value="full">Full Coverage</SelectItem>
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

            {/* Estimated Arrival */}
            <Card className="bg-gray-900 text-white">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg font-medium">$—C</div>
                  <div className="text-sm opacity-80">Cost Review</div>
                  <div className="text-lg font-medium mt-2">Estimated Arrival</div>
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
