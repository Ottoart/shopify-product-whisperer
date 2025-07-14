import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, XCircle, Settings, Key, Plus, Edit2, Trash2, Info, Copy, TestTube, Clock, MoreVertical, AlertCircle } from "lucide-react";

interface Carrier {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  internal?: boolean;
  apiKey?: string;
  username?: string;
  accountNumber?: string;
  customerId?: string;
  postalCode?: string;
  country?: string;
  pickupType?: string;
  services: string[];
  activeServices: number;
  totalServices: number;
  active: boolean;
  ratesEnabled: boolean;
  labelsEnabled: boolean;
  trackingEnabled: boolean;
  negotiatedRates?: boolean;
  lastUsed?: string;
  carrierId?: string;
  benefits: string[];
  description: string;
}

export function CarrierManagement() {
  const { toast } = useToast();
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'connect' | 'edit'>('connect');
  
  const [internalCarriers] = useState<Carrier[]>([
    {
      id: "canada-post",
      name: "Canada Post",
      logo: "🇨🇦",
      connected: true,
      internal: true,
      services: ["Regular Parcel", "Expedited Parcel", "Xpresspost", "Priority"],
      activeServices: 6,
      totalServices: 20,
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true,
      lastUsed: "2 hours ago",
      carrierId: "ss-337361",
      benefits: ["Save on Canada Post rates through ShipStation", "Over 16.2 million addresses"],
      description: "Save on Canada Post rates through ShipStation"
    },
    {
      id: "ups-internal",
      name: "UPS",
      logo: "🤎",
      connected: true,
      internal: true,
      services: ["UPS Ground", "UPS 2nd Day Air", "UPS Next Day Air", "UPS Worldwide Express"],
      activeServices: 5,
      totalServices: 11,
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true,
      lastUsed: "1 day ago",
      carrierId: "ss-1310534",
      benefits: ["Save up to 68% over UPS retail rates", "Up to 68% off down UPS Standard"],
      description: "Save up to 68% over UPS retail rates"
    },
    {
      id: "sendle",
      name: "Sendle",
      logo: "📮",
      connected: true,
      internal: true,
      services: ["Sendle Standard", "Sendle Express", "Sendle Pro"],
      activeServices: 2,
      totalServices: 4,
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true,
      lastUsed: "3 days ago",
      carrierId: "ss-1815121",
      benefits: ["Save up to 50% off your shipping", "Free pickup, including residential delivery"],
      description: "Save up to 50% off your shipping"
    },
    {
      id: "fedex-internal",
      name: "FedEx",
      logo: "🟣",
      connected: true,
      internal: true,
      services: ["FedEx Ground", "FedEx Express Saver", "FedEx Standard Overnight"],
      activeServices: 6,
      totalServices: 12,
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true,
      lastUsed: "5 days ago",
      carrierId: "ss-1712943",
      benefits: ["Save up to 68% on FedEx international shipping", "Save time on cross-border shipments"],
      description: "Save up to 68% on FedEx international shipping"
    },
    {
      id: "dhl-internal",
      name: "DHL Express",
      logo: "🟨",
      connected: true,
      internal: true,
      services: ["DHL Express", "DHL Ground"],
      activeServices: 2,
      totalServices: 8,
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true,
      lastUsed: "1 week ago",
      carrierId: "ss-1793911",
      benefits: ["Save up to 68% on DHL Express international shipments", "Fast, reliable delivery to over 220 countries"],
      description: "Save up to 68% on DHL Express international shipments"
    }
  ]);

  const [userCarriers, setUserCarriers] = useState<Carrier[]>([
    {
      id: "ups-custom",
      name: "UPS",
      logo: "🤎",
      connected: false,
      services: ["UPS Ground", "UPS 2nd Day Air", "UPS Next Day Air"],
      activeServices: 0,
      totalServices: 11,
      active: false,
      ratesEnabled: false,
      labelsEnabled: false,
      trackingEnabled: false,
      benefits: ["Access to negotiated rates", "Enhanced tracking capabilities"],
      description: "Connect your UPS account for negotiated rates"
    },
    {
      id: "fedex-custom",
      name: "FedEx",
      logo: "🟣",
      connected: false,
      services: ["FedEx Ground", "FedEx Express Saver", "FedEx Standard Overnight"],
      activeServices: 0,
      totalServices: 12,
      active: false,
      ratesEnabled: false,
      labelsEnabled: false,
      trackingEnabled: false,
      benefits: ["Custom account rates", "Additional service options"],
      description: "Connect your FedEx account for better rates"
    },
    {
      id: "usps-custom",
      name: "USPS",
      logo: "📮",
      connected: true,
      accountNumber: "****5678",
      services: ["Priority Mail", "Priority Mail Express", "First-Class Mail"],
      activeServices: 3,
      totalServices: 8,
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true,
      negotiatedRates: true,
      lastUsed: "6 hours ago",
      carrierId: "custom-001",
      benefits: ["Commercial pricing", "Enhanced delivery options"],
      description: "Your connected USPS account"
    }
  ]);

  const handleToggleCarrier = (carrierId: string, isInternal: boolean = false) => {
    if (isInternal) return; // Internal carriers can't be toggled off
    
    setUserCarriers(prev => prev.map(carrier => 
      carrier.id === carrierId 
        ? { ...carrier, active: !carrier.active }
        : carrier
    ));
    
    const carrier = userCarriers.find(c => c.id === carrierId);
    toast({
      title: carrier?.active ? "Carrier deactivated" : "Carrier activated",
      description: `${carrier?.name} has been ${carrier?.active ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleConnectCarrier = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setModalType('connect');
    setIsModalOpen(true);
  };

  const handleEditCarrier = (carrier: Carrier) => {
    setSelectedCarrier(carrier);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDisconnectCarrier = (carrierId: string) => {
    setUserCarriers(prev => prev.map(carrier => 
      carrier.id === carrierId 
        ? { 
            ...carrier, 
            connected: false, 
            active: false,
            apiKey: undefined,
            username: undefined,
            accountNumber: undefined,
            customerId: undefined,
            postalCode: undefined,
            country: undefined,
            pickupType: undefined,
            negotiatedRates: false,
            lastUsed: undefined,
            carrierId: undefined,
            activeServices: 0
          }
        : carrier
    ));
    
    const carrier = userCarriers.find(c => c.id === carrierId);
    toast({
      title: "Carrier disconnected",
      description: `${carrier?.name} has been disconnected successfully.`,
    });
  };

  const handleTestConnection = (carrierId: string) => {
    const allCarriers = [...internalCarriers, ...userCarriers];
    const carrier = allCarriers.find(c => c.id === carrierId);
    toast({
      title: "🧪 Testing connection...",
      description: `Verifying ${carrier?.name} API credentials.`,
    });

    setTimeout(() => {
      toast({
        title: "✅ Connection successful!",
        description: `${carrier?.name} API is working correctly.`,
      });
    }, 2000);
  };

  const handleSaveCarrier = (formData: any) => {
    if (!selectedCarrier) return;

    setUserCarriers(prev => prev.map(carrier => 
      carrier.id === selectedCarrier.id 
        ? { 
            ...carrier, 
            connected: true,
            active: true,
            accountNumber: formData.accountNumber,
            customerId: formData.customerId,
            postalCode: formData.postalCode,
            country: formData.country,
            pickupType: formData.pickupType,
            negotiatedRates: formData.negotiatedRates,
            lastUsed: "Just now",
            carrierId: `custom-${Date.now()}`,
            activeServices: Math.floor(carrier.totalServices * 0.6),
            ratesEnabled: true,
            labelsEnabled: true,
            trackingEnabled: true
          }
        : carrier
    ));

    setIsModalOpen(false);
    setSelectedCarrier(null);
    toast({
      title: "✅ Carrier connected successfully!",
      description: `${selectedCarrier.name} is now ready to use.`,
    });
  };

  const copyCarrierId = (carrierId?: string) => {
    if (carrierId) {
      navigator.clipboard.writeText(carrierId);
      toast({
        title: "Copied to clipboard",
        description: "Carrier ID has been copied to your clipboard.",
      });
    }
  };

  const getConnectionBadge = (carrier: Carrier) => {
    if (carrier.connected) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-red-600 border-red-300">
        <XCircle className="h-3 w-3 mr-1" />
        Not Connected
      </Badge>
    );
  };

  const CarrierConfigModal = () => {
    const [formData, setFormData] = useState({
      accountNumber: selectedCarrier?.accountNumber || '',
      customerId: selectedCarrier?.customerId || '',
      postalCode: selectedCarrier?.postalCode || '',
      country: selectedCarrier?.country || 'US',
      pickupType: selectedCarrier?.pickupType || 'Daily Pickup',
      negotiatedRates: selectedCarrier?.negotiatedRates || false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveCarrier(formData);
    };

    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedCarrier?.logo}</span>
              Configure your {selectedCarrier?.name} Account
            </DialogTitle>
            <DialogDescription>
              Enter your {selectedCarrier?.name} account information to connect and start shipping.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                {selectedCarrier?.name} Account # <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({...prev, accountNumber: e.target.value}))}
                placeholder="A90625"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupType">Account Type</Label>
                <Select value={formData.pickupType} onValueChange={(value) => setFormData(prev => ({...prev, pickupType: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily Pickup">Daily Pickup</SelectItem>
                    <SelectItem value="Customer Counter">Customer Counter</SelectItem>
                    <SelectItem value="One Time Pickup">One Time Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">MI Customer Id</Label>
                <Input
                  id="customerId"
                  value={formData.customerId}
                  onChange={(e) => setFormData(prev => ({...prev, customerId: e.target.value}))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>MI and Support Endorsement</Label>
              <Select defaultValue="Return Service Requested">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Return Service Requested">Return Service Requested</SelectItem>
                  <SelectItem value="Forwarding Service Requested">Forwarding Service Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Account Postal Code <span className="text-destructive">*</span></Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData(prev => ({...prev, postalCode: e.target.value}))}
                  placeholder="60124"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Account Country Code <span className="text-destructive">*</span></Label>
                <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({...prev, country: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="MX">Mexico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="negotiatedRates"
                  checked={formData.negotiatedRates}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, negotiatedRates: checked as boolean}))}
                />
                <Label htmlFor="negotiatedRates" className="text-sm font-medium">
                  Enable Negotiated Rates 
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 ml-1 inline-block text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use your negotiated shipping rates if available</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="carbonNeutral" />
                <Label htmlFor="carbonNeutral" className="text-sm">
                  Use the {selectedCarrier?.name} Carbon Neutral shipping program
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="groundFreight" />
                <Label htmlFor="groundFreight" className="text-sm">
                  Enable Ground Freight Pricing
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {modalType === 'connect' ? 'Connect Account' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Carrier Settings
            </CardTitle>
            <CardDescription>
              Save with ShipStation's carrier rates or bring your own carrier accounts.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Tabbed Interface */}
        <Tabs defaultValue="internal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal">PrepFox Carriers</TabsTrigger>
            <TabsTrigger value="custom">Your Carrier Accounts</TabsTrigger>
          </TabsList>

          {/* Internal Carriers Tab */}
          <TabsContent value="internal" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                     <TableHead>Prepfox Carriers</TableHead>
                    <TableHead>Features & Benefits</TableHead>
                    <TableHead>Carrier ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalCarriers.map((carrier) => (
                    <TableRow key={carrier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-2xl">{carrier.logo}</span>
                          </div>
                          <div>
                            <p className="font-medium">{carrier.name}</p>
                            {carrier.lastUsed && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {carrier.lastUsed}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium text-blue-600">{carrier.activeServices} of {carrier.totalServices} services</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {carrier.services.slice(0, 3).map((service, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {carrier.services.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{carrier.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{carrier.description}</p>
                          <ul className="text-muted-foreground mt-1">
                            {carrier.benefits.slice(0, 2).map((benefit, idx) => (
                              <li key={idx} className="text-xs">• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {carrier.carrierId}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyCarrierId(carrier.carrierId)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTestConnection(carrier.id)}
                            className="h-8"
                          >
                            <TestTube className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Custom Carriers Tab */}
          <TabsContent value="custom" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Your Carrier Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  You've activated the Your Carriers feature for an additional monthly fee. 
                  <span className="text-blue-600 ml-1">Go to the Payment & Subscription settings</span>
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Services</TableHead>
                    <TableHead>Features & Benefits</TableHead>
                    <TableHead>Carrier ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCarriers.map((carrier) => (
                    <TableRow key={carrier.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className={`h-2 w-2 rounded-full ${carrier.connected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-2xl">{carrier.logo}</span>
                          </div>
                          <div>
                            <p className="font-medium">{carrier.name}</p>
                            {carrier.lastUsed && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {carrier.lastUsed}
                              </div>
                            )}
                            {!carrier.connected && (
                              <div className="flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                No services selected
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {carrier.connected ? (
                            <>
                              <p className="font-medium text-blue-600">{carrier.activeServices} of {carrier.totalServices} services</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {carrier.services.slice(0, 2).map((service, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {service}
                                  </Badge>
                                ))}
                                {carrier.services.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{carrier.services.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-muted-foreground">{carrier.totalServices} services available</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{carrier.description}</p>
                          <ul className="text-muted-foreground mt-1">
                            {carrier.benefits.slice(0, 2).map((benefit, idx) => (
                              <li key={idx} className="text-xs">• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </TableCell>
                      <TableCell>
                        {carrier.carrierId ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {carrier.carrierId}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCarrierId(carrier.carrierId)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {carrier.connected ? (
                            <>
                              <Switch 
                                checked={carrier.active}
                                onCheckedChange={() => handleToggleCarrier(carrier.id)}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCarrier(carrier)}
                                className="h-8"
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDisconnectCarrier(carrier.id)}
                                className="h-8 text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleConnectCarrier(carrier)}
                            >
                              <Key className="h-3 w-3 mr-1" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <CarrierConfigModal />
      </div>
    </TooltipProvider>
  );
}