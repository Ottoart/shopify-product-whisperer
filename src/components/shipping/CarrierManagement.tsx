import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, CheckCircle, XCircle, Settings, Plus, RefreshCw, AlertCircle, 
  CreditCard, Crown, Zap, TestTube, Shield, DollarSign, Eye, EyeOff, 
  Users, Package, Globe, Truck, Percent, Lock 
} from "lucide-react";

interface CarrierService {
  id: string;
  name: string;
  enabled: boolean;
  markup?: number;
}

interface Carrier {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error';
  services: CarrierService[];
  lastSync?: string;
  isInternal?: boolean;
  markup: number;
  adminControlled: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  shipments: number;
  users: number;
  labelType: string;
  support: string;
  carrierAddOn: number;
  carrierAccess: number;
  features: string[];
  popular?: boolean;
}

export function CarrierManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.email === 'ottman1@gmail.com';
  
  // Debug logging
  console.log('Current user:', user?.email);
  console.log('Is Admin:', isAdmin);
  
  // Show admin status in UI for debugging
  const [showAdminInfo, setShowAdminInfo] = useState(true);
  
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [showMarkupSettings, setShowMarkupSettings] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isPlanComparisonOpen, setIsPlanComparisonOpen] = useState(false);
  const [isAddCarrierOpen, setIsAddCarrierOpen] = useState(false);
  const [connectedUserCarriers, setConnectedUserCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real carrier configurations from database
  useEffect(() => {
    const fetchCarrierConfigurations = async () => {
      if (!user) return;
      
      try {
        const { data: carrierConfigs, error } = await supabase
          .from('carrier_configurations')
          .select(`
            *,
            shipping_services(*)
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching carrier configurations:', error);
          return;
        }

        const formattedCarriers = carrierConfigs.map(config => {
          const getCarrierLogo = (name: string) => {
            switch (name.toLowerCase()) {
              case 'ups': return '📦';
              case 'fedex': return '🚚';
              case 'usps': return '📮';
              case 'dhl': return '✈️';
              default: return '🚛';
            }
          };

          return {
            id: config.id,
            name: config.carrier_name,
            logo: getCarrierLogo(config.carrier_name),
            connected: true,
            status: 'connected' as const,
            services: config.shipping_services.map((service: any) => ({
              id: service.id,
              name: service.service_name,
              enabled: service.is_available,
              markup: 0
            })),
            lastSync: new Date(config.updated_at).toLocaleDateString(),
            isInternal: false,
            markup: 0,
            adminControlled: false,
            credentials: config.api_credentials,
            settings: config.settings
          };
        });

        // Filter out UPS from user carriers since it goes in PrepFox tab
        const nonUpsCarriers = formattedCarriers.filter(carrier => carrier.name.toLowerCase() !== 'ups');
        setConnectedUserCarriers(nonUpsCarriers);
      } catch (error) {
        console.error('Error fetching carriers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrierConfigurations();
  }, [user]);

  // Available PrepFox carriers (admin controlled)
  const [prepfoxCarriers, setPrepfoxCarriers] = useState<Carrier[]>([]);
  const [upsCarrier, setUpsCarrier] = useState<any>(null);
  const [upsServices, setUpsServices] = useState<any[]>([]);

  // Update PrepFox carriers with real UPS data when available
  useEffect(() => {
    // Get UPS data from the full carrier list before filtering
    const fetchUpsData = async () => {
      if (!user) return;
      
        try {
        const { data: carrierConfigs, error } = await supabase
          .from('carrier_configurations')
          .select(`
            *,
            shipping_services(*)
          `)
          .eq('carrier_name', 'UPS')
          .order('created_at', { ascending: false })
          .limit(1);

        const upsCarrier = carrierConfigs?.[0] ? {
          id: carrierConfigs[0].id,
          name: carrierConfigs[0].carrier_name,
          logo: '📦',
          connected: true,
          status: 'connected' as const,
          services: carrierConfigs[0].shipping_services.map((service: any) => ({
            id: service.id,
            name: service.service_name,
            enabled: service.is_available, // This should be true from DB
            markup: 0
          })),
          lastSync: new Date(carrierConfigs[0].updated_at).toLocaleDateString(),
          isInternal: true, // Changed to true for PrepFox tab
          markup: 15,
          adminControlled: true, // Changed to true for admin control
          credentials: carrierConfigs[0].api_credentials,
          settings: carrierConfigs[0].settings
        } : null;

        console.log('UPS carrier object:', upsCarrier);
        console.log('UPS services:', upsCarrier?.services);

        if (error) {
          console.error('Error fetching UPS configuration:', error);
        }

        console.log('UPS carrier configs found:', carrierConfigs);
        console.log('Number of UPS configs:', carrierConfigs?.length || 0);
        console.log('UPS carrier object:', upsCarrier);

        const defaultCarriers = [
          {
            id: "canada-post-internal",
            name: "Canada Post",
            logo: "🇨🇦",
            connected: true,
            status: 'connected' as const,
            services: [
              { id: "cp-regular", name: "Regular Parcel", enabled: true },
              { id: "cp-expedited", name: "Expedited Parcel", enabled: true },
              { id: "cp-xpress", name: "Xpresspost", enabled: false },
              { id: "cp-priority", name: "Priority", enabled: true }
            ],
            lastSync: "1 hour ago",
            isInternal: true,
            markup: 15,
            adminControlled: true
          },
          {
            id: "shipstation-internal",
            name: "PrepFox Express",
            logo: "🚚",
            connected: true,
            status: 'connected' as const,
            services: [
              { id: "ss-standard", name: "Standard Delivery", enabled: true },
              { id: "ss-express", name: "Express Delivery", enabled: true },
              { id: "ss-overnight", name: "Overnight", enabled: false }
            ],
            lastSync: "30 minutes ago",
            isInternal: true,
            markup: 12,
            adminControlled: true
          }
        ];

        console.log('UPS carrier configs found:', carrierConfigs);
        console.log('Number of UPS configs:', carrierConfigs.length);
        
        if (carrierConfigs.length > 0) {
          const realUpsCarrier = carrierConfigs[0];
          console.log('Using UPS carrier:', realUpsCarrier);
          
          // Set the UPS carrier data for display in configuration
          setUpsCarrier(realUpsCarrier);
          setUpsServices(realUpsCarrier.shipping_services || []);
          
          // Create services array in the expected format
          const upsServices = (realUpsCarrier.shipping_services || []).map((service: any) => ({
            id: service.service_code,
            name: service.service_name,
            enabled: service.is_available
          }));
          
          // Use real UPS data from database
          const upsConfig = {
            id: "ups-internal",
            name: "UPS (Native)",
            logo: "🤎",
            connected: true,
            status: 'connected' as const,
            services: upsServices,
            lastSync: realUpsCarrier.updated_at ? new Date(realUpsCarrier.updated_at).toLocaleDateString() : 'Never',
            isInternal: true,
            markup: 15,
            adminControlled: true
          };
          setPrepfoxCarriers([upsConfig, ...defaultCarriers]);
          console.log('Set PrepFox carriers with real UPS config:', [upsConfig, ...defaultCarriers]);
        } else {
          // Show default UPS placeholder
          const defaultUps = {
            id: "ups-internal",
            name: "UPS (Native)",
            logo: "🤎",
            connected: false,
            status: 'disconnected' as const,
            services: [
              { id: "ups-ground", name: "UPS Ground", enabled: false },
              { id: "ups-2day", name: "UPS 2nd Day Air", enabled: false },
              { id: "ups-next", name: "UPS Next Day Air", enabled: false },
              { id: "ups-worldwide", name: "UPS Worldwide Express", enabled: false }
            ],
            lastSync: "Never",
            isInternal: true,
            markup: 15,
            adminControlled: true
          };
          setPrepfoxCarriers([defaultUps, ...defaultCarriers]);
        }
      } catch (error) {
        console.error('Error fetching UPS configuration:', error);
      }
    };

    fetchUpsData();
  }, [user]);

  // Subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: "parcel-lite",
      name: "Parcel Lite",
      price: 8.99,
      shipments: 50,
      users: 1,
      labelType: "Branded",
      support: "Live Chat",
      carrierAddOn: 4.50,
      carrierAccess: 1,
      features: ["Inventory", "Receiving"]
    },
    {
      id: "parcel-pro",
      name: "Parcel Pro",
      price: 26.99,
      shipments: 500,
      users: 1,
      labelType: "Branded",
      support: "Live Chat",
      carrierAddOn: 18.00,
      carrierAccess: 2,
      features: ["Inventory", "Receiving"],
      popular: true
    },
    {
      id: "cargo-core",
      name: "Cargo Core",
      price: 53.99,
      shipments: 1000,
      users: 2,
      labelType: "Customized",
      support: "Live Chat",
      carrierAddOn: 27.00,
      carrierAccess: 3,
      features: ["Inventory", "Receiving"]
    },
    {
      id: "cargo-prime",
      name: "Cargo Prime",
      price: 89.99,
      shipments: 2000,
      users: 3,
      labelType: "Customized",
      support: "Live Chat",
      carrierAddOn: 36.00,
      carrierAccess: 4,
      features: ["All Premium Features"]
    },
    {
      id: "freight-elite",
      name: "Freight Elite",
      price: 134.99,
      shipments: 5000,
      users: 5,
      labelType: "Customized",
      support: "Phone + Chat",
      carrierAddOn: 54.00,
      carrierAccess: 6,
      features: ["All Premium Features"]
    },
    {
      id: "freight-command",
      name: "Freight Command",
      price: 206.10,
      shipments: 7500,
      users: 10,
      labelType: "Customized",
      support: "Priority Phone",
      carrierAddOn: 86.40,
      carrierAccess: 999,
      features: ["All Premium Features"]
    }
  ];

  const availableCarriers = [
    { id: "ups", name: "UPS", logo: "🤎", description: "United Parcel Service" },
    { id: "fedex", name: "FedEx", logo: "🟣", description: "Federal Express" },
    { id: "canada-post", name: "Canada Post", logo: "🇨🇦", description: "Canada's postal service" },
    { id: "dhl", name: "DHL Express", logo: "🟨", description: "International express" },
    { id: "usps", name: "USPS", logo: "📮", description: "United States Postal Service" },
    { id: "purolator", name: "Purolator", logo: "🟦", description: "Canadian courier" }
  ];

  const handleServiceToggle = (carrierId: string, serviceId: string) => {
    if (isAdmin) {
      setPrepfoxCarriers(prev => prev.map(carrier => 
        carrier.id === carrierId 
          ? {
              ...carrier,
              services: carrier.services.map(service =>
                service.id === serviceId 
                  ? { ...service, enabled: !service.enabled }
                  : service
              )
            }
          : carrier
      ));
    }
  };

  const handleMarkupChange = (carrierId: string, newMarkup: number) => {
    if (isAdmin) {
      setPrepfoxCarriers(prev => prev.map(carrier => 
        carrier.id === carrierId 
          ? { ...carrier, markup: newMarkup }
          : carrier
      ));
      toast({
        title: "Markup Updated",
        description: `Carrier markup set to ${newMarkup}%`,
      });
    }
  };

  const ServiceManagementModal = () => {
    if (!selectedCarrier) return null;

    return (
      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedCarrier.logo}</span>
              {selectedCarrier.name} Services
              {isAdmin && (
                <Badge variant="destructive" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {isAdmin 
                ? "Manage services and markup for this carrier (admin only)"
                : "View available services for this carrier"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Admin Markup Control */}
            {isAdmin && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Rate Markup Control
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMarkupSettings(!showMarkupSettings)}
                    >
                      {showMarkupSettings ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {showMarkupSettings && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4">
                      <Label>Hidden Markup %:</Label>
                      <Input
                        type="number"
                        value={selectedCarrier.markup}
                        onChange={(e) => handleMarkupChange(selectedCarrier.id, Number(e.target.value))}
                        className="w-24"
                        min="0"
                        max="50"
                      />
                      <span className="text-sm text-muted-foreground">
                        All rates shown to users include this markup
                      </span>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Services List */}
            <div className="space-y-3">
              <h3 className="font-medium">Available Services</h3>
              {selectedCarrier.services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={service.enabled}
                      onCheckedChange={() => isAdmin && handleServiceToggle(selectedCarrier.id, service.id)}
                      disabled={!isAdmin}
                    />
                    <div>
                      <div className="font-medium">{service.name}</div>
                      {service.enabled && (
                        <div className="text-sm text-green-600">
                          ✓ Available to users
                        </div>
                      )}
                    </div>
                  </div>
                  {service.enabled && (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
              ))}
            </div>

            {!isAdmin && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Service configuration is managed by your administrator
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsServiceModalOpen(false)}>
              {isAdmin ? "Save Changes" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const SubscriptionModal = () => (
    <Dialog open={isSubscriptionModalOpen} onOpenChange={setIsSubscriptionModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Unlock More Shipping Tools
          </DialogTitle>
          <DialogDescription>
            Choose a PrepFox subscription plan to access more carriers and features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Parcel Pro</h3>
              <Badge variant="default">Most Popular</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              500 shipments, 2 carriers, all features
            </p>
            <div className="text-2xl font-bold">$26.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            <p className="text-xs text-muted-foreground">10% cheaper than ShipStation</p>
          </div>
          
          <Button 
            className="w-full" 
            onClick={() => setIsPlanComparisonOpen(true)}
            variant="outline"
          >
            Compare All Plans
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsSubscriptionModalOpen(false)}>
            Maybe Later
          </Button>
          <Button onClick={() => window.open('/billing', '_blank')}>
            Go to Billing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const PlanComparisonModal = () => (
    <Dialog open={isPlanComparisonOpen} onOpenChange={setIsPlanComparisonOpen}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>PrepFox Shipping Plans</DialogTitle>
          <DialogDescription>
            Choose the plan that fits your shipping volume. All plans include premium carrier access.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Shipments</span>
                    <span className="font-medium">{plan.shipments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Users</span>
                    <span className="font-medium">{plan.users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carrier Access</span>
                    <span className="font-medium">
                      {plan.carrierAccess === 999 ? 'Unlimited' : plan.carrierAccess}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Support</span>
                    <span className="font-medium">{plan.support}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-2">Features:</div>
                  <div className="space-y-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.popular ? "Start Free Trial" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Add-On Features</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Product Bundles - $9.99/mo</div>
            <div>Auto-Split - $7.99/mo</div>
            <div>Branded Domains - $4.99/mo</div>
            <div>Branded Tracking - $5.99/mo</div>
            <div>Lot Tracking - $6.99/mo</div>
            <div>Extra Users - $2.99/user/mo</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const AddCarrierModal = () => (
    <Dialog open={isAddCarrierOpen} onOpenChange={setIsAddCarrierOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Available Carriers</DialogTitle>
          <DialogDescription>
            Select a carrier to connect. Only UPS, Canada Post, and PrepFox Express are available.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 py-4">
          {availableCarriers.slice(0, 3).map((carrier) => (
            <button
              key={carrier.id}
              className="p-4 border rounded-lg hover:bg-muted transition-colors text-center space-y-2 disabled:opacity-50"
              disabled={!isAdmin}
              onClick={() => {
                if (isAdmin) {
                  // Check if there's an internal version of this carrier
                  const internalCarrier = prepfoxCarriers.find(c => 
                    c.name.toLowerCase().includes(carrier.name.toLowerCase()) || 
                    c.id.includes(carrier.id)
                  );
                  
                  if (internalCarrier) {
                    // Connect to internal system
                    toast({
                      title: "Connecting to Internal System",
                      description: `Connecting to ${carrier.name} internal system...`,
                    });
                    
                    setTimeout(() => {
                      // Enable the internal carrier if it's not already enabled
                      setPrepfoxCarriers(prev => prev.map(c => 
                        c.id === internalCarrier.id 
                          ? { ...c, connected: true, status: 'connected' as const }
                          : c
                      ));
                      
                      toast({
                        title: "Connected to Internal System",
                        description: `${carrier.name} is now connected to the internal PrepFox system with discounted rates.`,
                      });
                      setIsAddCarrierOpen(false);
                    }, 2000);
                  } else {
                    // Check if carrier is already connected as personal account
                    const isAlreadyConnected = connectedUserCarriers.some(c => c.id === carrier.id);
                    
                    if (isAlreadyConnected) {
                      toast({
                        title: "Carrier Already Connected",
                        description: `${carrier.name} is already connected to your account.`,
                      });
                      return;
                    }
                    
                    // Add as personal account if no internal version exists
                    toast({
                      title: "Carrier Connection Started",
                      description: `Setting up ${carrier.name} connection...`,
                    });
                    
                    setTimeout(() => {
                      const newConnectedCarrier = {
                        id: carrier.id,
                        name: carrier.name,
                        logo: carrier.logo,
                        connected: true,
                        status: 'connected',
                        services: [
                          { id: `${carrier.id}-standard`, name: "Standard Service", enabled: true },
                          { id: `${carrier.id}-express`, name: "Express Service", enabled: true }
                        ],
                        lastSync: "Just now",
                        isInternal: false,
                        markup: 0,
                        adminControlled: false
                      };
                      
                      setConnectedUserCarriers(prev => [...prev, newConnectedCarrier]);
                      
                      toast({
                        title: "Carrier Connected",
                        description: `${carrier.name} has been successfully connected to your account.`,
                      });
                      setIsAddCarrierOpen(false);
                    }, 2000);
                  }
                }
              }}
            >
              <div className="text-3xl mb-2">{carrier.logo}</div>
              <div className="font-medium">{carrier.name}</div>
              <div className="text-sm text-muted-foreground">{carrier.description}</div>
              {!isAdmin && (
                <Badge variant="outline" className="mt-2">Admin Only</Badge>
              )}
            </button>
          ))}
        </div>

        {!isAdmin && (
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Only administrators can connect new carriers
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">PrepFox Shipping & Carriers</h1>
            <p className="text-muted-foreground">
              Multi-tiered shipping carrier management {isAdmin && "(Administrator View)"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsSubscriptionModalOpen(true)} variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              View Plans
            </Button>
            <Button onClick={() => setIsAddCarrierOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Carrier
            </Button>
          </div>
        </div>

        {/* Admin Controls Banner */}
        {isAdmin && showAdminInfo && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900">🔐 Administrator Access Active</h3>
                    <div className="text-sm text-red-800 space-y-1 mt-2">
                      <p><strong>✅ What you can see/do as admin:</strong></p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>Manage carrier accounts & adjust hidden markup (default 15%)</li>
                        <li>Enable/disable shipping services for users</li>
                        <li>View real UPS configuration with OAuth status</li>
                        <li>Access rate markup controls (click eye icon in service modals)</li>
                        <li>Connect new carriers to the system</li>
                        <li>View admin badges and controls throughout the interface</li>
                      </ul>
                      <p className="mt-2"><strong>🎯 Try this:</strong> Click "Manage Services" on UPS (Native) to see admin markup controls!</p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAdminInfo(false)}
                  className="text-red-700 hover:bg-red-100"
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription CTA for Non-Admin */}
        {!isAdmin && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">🚀 Unlock more shipping tools with a PrepFox subscription</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      Access more carriers, higher shipping volumes, and premium features. 10% cheaper than ShipStation.
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.open('/billing', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Payment & Subscription Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Carrier Tabs */}
        <Tabs defaultValue="prepfox" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prepfox">PrepFox Carriers</TabsTrigger>
            <TabsTrigger value="user-carriers">Your Carrier Accounts</TabsTrigger>
          </TabsList>

          <TabsContent value="prepfox" className="space-y-4">
            <div className="grid gap-4">
              <h2 className="text-xl font-semibold">PrepFox Managed Carriers</h2>
              {prepfoxCarriers.map((carrier) => (
                <Card key={carrier.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{carrier.logo}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{carrier.name}</h3>
                            {/* Check if carrier is actually active in database */}
                            {carrier.name === 'UPS' && upsCarrier ? (
                              upsCarrier.is_active ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </Badge>
                              )
                            ) : (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                            {carrier.isInternal && (
                              <Badge variant="secondary">
                                PrepFox {carrier.name.includes("PrepFox") ? "" : "Partner"}
                              </Badge>
                            )}
                            {isAdmin && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-xs">
                                    <Percent className="h-3 w-3 mr-1" />
                                    +{carrier.markup}%
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Hidden markup applied to all rates
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {carrier.services.filter(s => s.enabled).length} of {carrier.services.length} services enabled
                            • Last sync: {carrier.lastSync}
                          </p>
                          
                          {/* Show UPS configuration details if this is UPS */}
                          {carrier.name === 'UPS' && upsCarrier && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                              <div className="font-medium text-gray-900 mb-2 text-sm">Account Configuration:</div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>Account: <span className="font-mono">{upsCarrier.api_credentials?.account_number || 'Not set'}</span></div>
                                <div>Country: <span className="font-mono">{upsCarrier.api_credentials?.country_code || 'Not set'}</span></div>
                                <div>Postal Code: <span className="font-mono">{upsCarrier.api_credentials?.postal_code || 'Not set'}</span></div>
                                <div>Negotiated Rates: <span className={upsCarrier.api_credentials?.enable_negotiated_rates ? 'text-green-600' : 'text-red-600'}>{upsCarrier.api_credentials?.enable_negotiated_rates ? 'Enabled' : 'Disabled'}</span></div>
                                <div>Services: <span className="font-semibold">{upsServices?.length || 0}</span></div>
                                <div>Last Updated: <span className="font-mono">{upsCarrier.updated_at ? new Date(upsCarrier.updated_at).toLocaleDateString() : 'Never'}</span></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Add activation button for inactive UPS */}
                        {carrier.name === 'UPS' && upsCarrier && !upsCarrier.is_active && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={async () => {
                              try {
                                const { data, error } = await supabase.functions.invoke('activate-carrier', {
                                  body: { 
                                    user_id: user?.id, 
                                    carrier_id: upsCarrier.id 
                                  }
                                });
                                
                                if (error) throw error;
                                
                                // Update local state
                                setUpsCarrier(prev => ({ ...prev, is_active: true }));
                                
                                toast({
                                  title: "UPS Activated",
                                  description: "UPS carrier is now active and ready to use.",
                                });
                                
                                // Refresh the page to reflect changes
                                window.location.reload();
                              } catch (error) {
                                console.error('Activation error:', error);
                                toast({
                                  title: "Activation Failed",
                                  description: "Failed to activate UPS carrier.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Zap className="h-4 w-4 mr-1" />
                            Activate UPS
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCarrier(carrier);
                            setIsServiceModalOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage Services
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Re-Sync
                        </Button>
                      </div>
                    </div>

                    {/* Service Preview */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {carrier.services.filter((s: any) => s.enabled).slice(0, 4).map((service: any) => (
                        <Badge key={service.id} variant="secondary" className="text-xs">
                          {service.name}
                        </Badge>
                      ))}
                      {carrier.services.filter((s: any) => s.enabled).length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{carrier.services.filter((s: any) => s.enabled).length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="user-carriers" className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your Connected Carrier Accounts</h2>
                <Button onClick={() => setIsAddCarrierOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your Carrier Account
                </Button>
              </div>
              
              {loading ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your carrier accounts...</p>
                  </CardContent>
                </Card>
              ) : connectedUserCarriers.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Personal Carriers Connected</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your own carrier accounts for custom rates and services
                    </p>
                    <Button onClick={() => setIsAddCarrierOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your Carrier Account
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                connectedUserCarriers.map((carrier) => (
                  <Card key={carrier.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{carrier.logo}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{carrier.name}</h3>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                              <Badge variant="outline">
                                Personal Account
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {carrier.services.filter((s: any) => s.enabled).length} of {carrier.services.length} services enabled
                              • Last sync: {carrier.lastSync}
                            </p>
                            {carrier.credentials && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Account: {carrier.credentials.account_number || 'API Connected'} 
                                {carrier.credentials.access_token ? ' • OAuth Active' : ' • OAuth Needed'}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!carrier.credentials?.access_token && carrier.name === 'UPS' && (
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
                                      description: "Complete UPS authorization in the new window to enable real rates.",
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
                              Authorize OAuth
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCarrier(carrier);
                              setIsServiceModalOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Manage Services
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Re-Sync
                          </Button>
                        </div>
                      </div>

                      {/* Service Preview */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {carrier.services.filter((s: any) => s.enabled).slice(0, 4).map((service: any) => (
                          <Badge key={service.id} variant="secondary" className="text-xs">
                            {service.name}
                          </Badge>
                        ))}
                        {carrier.services.filter((s: any) => s.enabled).length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{carrier.services.filter((s: any) => s.enabled).length - 4} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ServiceManagementModal />
        <SubscriptionModal />
        <PlanComparisonModal />
        <AddCarrierModal />
      </div>
    </TooltipProvider>
  );
}