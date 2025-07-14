import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, XCircle, Settings, Plus, RefreshCw, AlertCircle, CreditCard, Crown, Zap, TestTube } from "lucide-react";

interface Carrier {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error';
  servicesEnabled: number;
  lastSync?: string;
  plan?: 'free' | 'premium';
  trialDaysLeft?: number;
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

interface AvailableCarrier {
  id: string;
  name: string;
  logo: string;
  description: string;
  popular?: boolean;
}

export function CarrierManagement() {
  const { toast } = useToast();
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [selectedAvailableCarrier, setSelectedAvailableCarrier] = useState<AvailableCarrier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCarrierSelectorOpen, setIsCarrierSelectorOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'connect' | 'edit'>('connect');
  
  // PrepFox Carriers (Free for trial, paid after)
  const [prepfoxCarriers] = useState<Carrier[]>([
    {
      id: "canada-post",
      name: "Canada Post",
      logo: "🇨🇦",
      connected: true,
      status: 'connected',
      servicesEnabled: 6,
      lastSync: "2 hours ago",
      plan: 'free',
      trialDaysLeft: 23,
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
      benefits: ["Save on Canada Post rates through PrepFox", "Over 16.2 million addresses"],
      description: "Save on Canada Post rates through PrepFox"
    },
    {
      id: "ups-internal",
      name: "UPS",
      logo: "🤎",
      connected: true,
      status: 'connected',
      servicesEnabled: 5,
      lastSync: "1 day ago",
      plan: 'free',
      trialDaysLeft: 23,
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
      benefits: ["Save up to 68% over UPS retail rates", "Up to 68% off UPS Standard"],
      description: "Save up to 68% over UPS retail rates"
    },
    {
      id: "sendle",
      name: "Sendle",
      logo: "📮",
      connected: true,
      status: 'connected',
      servicesEnabled: 2,
      lastSync: "3 days ago",
      plan: 'free',
      trialDaysLeft: 23,
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
      status: 'connected',
      servicesEnabled: 6,
      lastSync: "5 days ago",
      plan: 'free',
      trialDaysLeft: 23,
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
      status: 'connected',
      servicesEnabled: 2,
      lastSync: "1 week ago",
      plan: 'free',
      trialDaysLeft: 23,
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

  // Available carriers to connect
  const [availableCarriers] = useState<AvailableCarrier[]>([
    { id: "ups", name: "UPS", logo: "🤎", description: "United Parcel Service", popular: true },
    { id: "fedex", name: "FedEx", logo: "🟣", description: "Federal Express", popular: true },
    { id: "canada-post", name: "Canada Post", logo: "🇨🇦", description: "Canada's postal service", popular: true },
    { id: "dhl", name: "DHL Express", logo: "🟨", description: "International express", popular: true },
    { id: "purolator", name: "Purolator", logo: "🟦", description: "Canadian courier" },
    { id: "usps", name: "USPS", logo: "📮", description: "United States Postal Service" },
    { id: "aramex", name: "Aramex", logo: "🟧", description: "Middle East courier" },
    { id: "gls", name: "GLS", logo: "🟩", description: "European parcel service" },
    { id: "sendle", name: "Sendle", logo: "📮", description: "Australian courier" },
    { id: "royal-mail", name: "Royal Mail", logo: "🇬🇧", description: "UK postal service" }
  ]);

  const [userCarriers, setUserCarriers] = useState<Carrier[]>([
    {
      id: "usps-custom",
      name: "USPS",
      logo: "📮",
      connected: true,
      status: 'connected',
      servicesEnabled: 3,
      lastSync: "6 hours ago",
      plan: 'premium',
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

  const handleConnectCarrier = (availableCarrier: AvailableCarrier) => {
    setSelectedAvailableCarrier(availableCarrier);
    setIsCarrierSelectorOpen(false);
    setIsModalOpen(true);
    setModalType('connect');
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
            status: 'disconnected' as const,
            active: false,
            servicesEnabled: 0,
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
    const allCarriers = [...prepfoxCarriers, ...userCarriers];
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

  const handleResync = (carrierId: string) => {
    const allCarriers = [...prepfoxCarriers, ...userCarriers];
    const carrier = allCarriers.find(c => c.id === carrierId);
    toast({
      title: "🔄 Syncing services...",
      description: `Updating ${carrier?.name} services and rates.`,
    });

    setTimeout(() => {
      toast({
        title: "✅ Sync completed!",
        description: `${carrier?.name} services updated successfully.`,
      });
    }, 2000);
  };

  const handleSaveCarrier = (formData: any) => {
    if (!selectedAvailableCarrier) return;

    const newCarrier: Carrier = {
      id: `${selectedAvailableCarrier.id}-custom`,
      name: selectedAvailableCarrier.name,
      logo: selectedAvailableCarrier.logo,
      connected: true,
      status: 'connected',
      servicesEnabled: 3,
      lastSync: "Just now",
      plan: 'premium',
      services: ["Standard", "Express", "Priority"],
      activeServices: 3,
      totalServices: 8,
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true,
      accountNumber: formData.accountNumber,
      customerId: formData.customerId,
      postalCode: formData.postalCode,
      country: formData.country,
      pickupType: formData.pickupType,
      negotiatedRates: formData.negotiatedRates,
      lastUsed: "Just now",
      carrierId: `custom-${Date.now()}`,
      benefits: ["Custom account rates", "Enhanced service options"],
      description: `Your connected ${selectedAvailableCarrier.name} account`
    };

    setUserCarriers(prev => [...prev, newCarrier]);
    setIsModalOpen(false);
    setSelectedAvailableCarrier(null);
    toast({
      title: "✅ Carrier connected successfully!",
      description: `${selectedAvailableCarrier.name} is now ready to use.`,
    });
  };

  const getStatusBadge = (status: Carrier['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-300">
            <XCircle className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  // Carrier Selector Modal
  const CarrierSelectorModal = () => (
    <Dialog open={isCarrierSelectorOpen} onOpenChange={setIsCarrierSelectorOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select a Carrier to Connect</DialogTitle>
          <DialogDescription>
            Choose from our supported carriers to connect your shipping account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {availableCarriers.map((carrier) => (
            <button
              key={carrier.id}
              onClick={() => handleConnectCarrier(carrier)}
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center space-y-2 group"
            >
              <div className="text-3xl mb-2">{carrier.logo}</div>
              <div className="font-medium">{carrier.name}</div>
              <div className="text-sm text-muted-foreground">{carrier.description}</div>
              {carrier.popular && (
                <Badge variant="secondary" className="mt-2">Popular</Badge>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  // Subscription Modal
  const SubscriptionModal = () => (
    <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade Your Shipping
          </DialogTitle>
          <DialogDescription>
            Choose a plan to unlock premium carrier integrations and advanced features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Basic PrepFox Shipping</h3>
              <Badge variant="secondary">Free Trial</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Access to PrepFox carriers with discounted rates
            </p>
            <div className="text-2xl font-bold">$19.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <p className="text-xs text-muted-foreground">Free for 30 days, then $19.99/month</p>
          </div>
          
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Premium Carrier Access</h3>
              <Badge variant="default">Recommended</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Connect your own carrier accounts + PrepFox rates
            </p>
            <div className="text-2xl font-bold">$39.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSubscriptionModalOpen(false)}>
            Maybe Later
          </Button>
          <Button onClick={() => setIsSubscriptionModalOpen(false)}>
            Start Free Trial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Carrier Configuration Modal
  const CarrierConfigModal = () => {
    const [formData, setFormData] = useState({
      accountNumber: '',
      customerId: '',
      postalCode: '',
      country: 'US',
      pickupType: 'Daily Pickup',
      negotiatedRates: false
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
              <span className="text-2xl">{selectedAvailableCarrier?.logo}</span>
              Configure your {selectedAvailableCarrier?.name} Account
            </DialogTitle>
            <DialogDescription>
              Enter your {selectedAvailableCarrier?.name} account information to connect and start shipping.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                {selectedAvailableCarrier?.name} Account # <span className="text-destructive">*</span>
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
                <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
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

            <div className="space-y-2">
              <Label htmlFor="pickupType">Pickup Type</Label>
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

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="negotiatedRates"
                checked={formData.negotiatedRates}
                onCheckedChange={(checked) => setFormData(prev => ({...prev, negotiatedRates: checked as boolean}))}
              />
              <Label htmlFor="negotiatedRates" className="text-sm font-medium">
                Enable Negotiated Rates
              </Label>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TestTube className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Test Connection</span>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => handleTestConnection('test')}>
                Test
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Connect Account
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Carrier Management</h1>
            <p className="text-muted-foreground">Manage your shipping carriers and connections</p>
          </div>
          <Button onClick={() => setIsCarrierSelectorOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Carrier
          </Button>
        </div>

        {/* Subscription CTA */}
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900">Premium Carrier Access</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    You need a valid subscription to connect your own carrier accounts. 
                    PrepFox carriers are free for 30 days, then $19.99/month.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setIsSubscriptionModalOpen(true)}
                variant="outline"
                className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Interface */}
        <Tabs defaultValue="prepfox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prepfox">PrepFox Carriers</TabsTrigger>
            <TabsTrigger value="custom">Your Carrier Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="prepfox">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  PrepFox Carriers
                  <Badge variant="secondary" className="ml-2">Free Trial - 23 days left</Badge>
                </CardTitle>
                <CardDescription>
                  Access discounted shipping rates through our carrier partnerships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prepfoxCarriers.map((carrier) => (
                    <div key={carrier.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{carrier.logo}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{carrier.name}</h3>
                            {getStatusBadge(carrier.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{carrier.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{carrier.servicesEnabled}</div>
                          <div className="text-muted-foreground">Services</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{carrier.lastSync}</div>
                          <div className="text-muted-foreground">Last Sync</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCarrier(carrier)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResync(carrier.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Your Carrier Accounts
                </CardTitle>
                <CardDescription>
                  Connect your own carrier accounts for negotiated rates and additional services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userCarriers.length === 0 ? (
                    <div className="text-center py-8">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No carrier accounts connected</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Connect your carrier accounts to access negotiated rates and additional services
                      </p>
                      <Button onClick={() => setIsCarrierSelectorOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Carrier
                      </Button>
                    </div>
                  ) : (
                    userCarriers.map((carrier) => (
                      <div key={carrier.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{carrier.logo}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{carrier.name}</h3>
                              {getStatusBadge(carrier.status)}
                              {carrier.plan === 'premium' && (
                                <Badge variant="default" className="ml-2">Premium</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Account: {carrier.accountNumber}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-medium">{carrier.servicesEnabled}</div>
                            <div className="text-muted-foreground">Services</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">{carrier.lastSync}</div>
                            <div className="text-muted-foreground">Last Sync</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCarrier(carrier)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResync(carrier.id)}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnectCarrier(carrier.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CarrierSelectorModal />
        <SubscriptionModal />
        <CarrierConfigModal />
      </div>
    </TooltipProvider>
  );
}