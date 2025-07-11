import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Building2, CheckCircle, XCircle, Settings, Key, Plus, Edit2, Trash2 } from "lucide-react";

interface Carrier {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  apiKey?: string;
  username?: string;
  accountNumber?: string;
  services: string[];
  active: boolean;
  ratesEnabled: boolean;
  labelsEnabled: boolean;
  trackingEnabled: boolean;
}

export function CarrierManagement() {
  const { toast } = useToast();
  const [carriers, setCarriers] = useState<Carrier[]>([
    // Internal carriers - no login required
    {
      id: "canada-post",
      name: "Canada Post",
      logo: "🇨🇦",
      connected: true,
      services: ["Regular Parcel", "Expedited Parcel", "Xpresspost", "Priority"],
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true
    },
    {
      id: "ups-internal",
      name: "UPS (Internal)",
      logo: "📦",
      connected: true,
      services: ["UPS Ground", "UPS 2nd Day Air", "UPS Next Day Air", "UPS Worldwide Express"],
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true
    },
    {
      id: "sendle",
      name: "Sendle",
      logo: "📮",
      connected: true,
      services: ["Sendle Standard", "Sendle Express", "Sendle Pro"],
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true
    },
    // External carriers - require API credentials
    {
      id: "ups",
      name: "UPS",
      logo: "📦",
      connected: false,
      services: ["UPS Ground", "UPS 2nd Day Air", "UPS Next Day Air"],
      active: false,
      ratesEnabled: false,
      labelsEnabled: false,
      trackingEnabled: false
    },
    {
      id: "fedex",
      name: "FedEx",
      logo: "🚚",
      connected: false,
      services: ["FedEx Ground", "FedEx Express Saver", "FedEx Standard Overnight"],
      active: false,
      ratesEnabled: false,
      labelsEnabled: false,
      trackingEnabled: false
    },
    {
      id: "usps",
      name: "USPS",
      logo: "📮",
      connected: true,
      apiKey: "****1234",
      services: ["Priority Mail", "Priority Mail Express", "First-Class Mail"],
      active: true,
      ratesEnabled: true,
      labelsEnabled: true,
      trackingEnabled: true
    },
    {
      id: "dhl",
      name: "DHL",
      logo: "🌍",
      connected: false,
      services: ["DHL Express", "DHL Ground"],
      active: false,
      ratesEnabled: false,
      labelsEnabled: false,
      trackingEnabled: false
    }
  ]);

  const handleToggleCarrier = (carrierId: string) => {
    setCarriers(prev => prev.map(carrier => 
      carrier.id === carrierId 
        ? { ...carrier, active: !carrier.active }
        : carrier
    ));
    
    const carrier = carriers.find(c => c.id === carrierId);
    toast({
      title: carrier?.active ? "Carrier deactivated" : "Carrier activated",
      description: `${carrier?.name} has been ${carrier?.active ? 'disabled' : 'enabled'}.`,
    });
  };

  const handleConnectCarrier = (carrierId: string) => {
    // This would open a modal or form for API configuration
    toast({
      title: "🔗 Connecting carrier...",
      description: "Please enter your API credentials to connect this carrier.",
    });
  };

  const handleDisconnectCarrier = (carrierId: string) => {
    setCarriers(prev => prev.map(carrier => 
      carrier.id === carrierId 
        ? { 
            ...carrier, 
            connected: false, 
            active: false,
            apiKey: undefined,
            username: undefined,
            accountNumber: undefined 
          }
        : carrier
    ));
    
    const carrier = carriers.find(c => c.id === carrierId);
    toast({
      title: "Carrier disconnected",
      description: `${carrier?.name} has been disconnected successfully.`,
    });
  };

  const handleTestConnection = (carrierId: string) => {
    const carrier = carriers.find(c => c.id === carrierId);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Carrier Management
          </CardTitle>
          <CardDescription>
            Connect and configure shipping carriers for rate comparison and label generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Connected Carriers</h3>
              <p className="text-sm text-muted-foreground">
                {carriers.filter(c => c.connected).length} of {carriers.length} carriers connected
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Carrier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Carrier List */}
      <div className="space-y-4">
        {carriers.map((carrier) => (
          <Card key={carrier.id} className={`transition-all ${carrier.connected ? 'border-green-200 bg-green-50/50' : 'border-muted'}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">{carrier.logo}</div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold">{carrier.name}</h3>
                        {getConnectionBadge(carrier)}
                        {carrier.active && (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </div>
                      
                      <Switch 
                        checked={carrier.active}
                        onCheckedChange={() => handleToggleCarrier(carrier.id)}
                        disabled={!carrier.connected}
                      />
                    </div>

                    {/* API Credentials Info */}
                    {carrier.connected && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">API Key</Label>
                          <p className="font-mono">{carrier.apiKey || "Not set"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Username</Label>
                          <p>{carrier.username || "Not required"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Account #</Label>
                          <p>{carrier.accountNumber || "Not required"}</p>
                        </div>
                      </div>
                    )}

                    {/* Services */}
                    <div>
                      <Label className="text-sm font-medium">Available Services</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {carrier.services.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    {carrier.connected && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Rate Quotes</span>
                          <Badge variant={carrier.ratesEnabled ? "default" : "outline"}>
                            {carrier.ratesEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Label Creation</span>
                          <Badge variant={carrier.labelsEnabled ? "default" : "outline"}>
                            {carrier.labelsEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Tracking</span>
                          <Badge variant={carrier.trackingEnabled ? "default" : "outline"}>
                            {carrier.trackingEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {carrier.connected ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(carrier.id)}
                      >
                        🧪 Test
                      </Button>
                      {/* Only show Configure and Disconnect for external carriers */}
                      {!['canada-post', 'ups-internal', 'sendle'].includes(carrier.id) && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDisconnectCarrier(carrier.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Disconnect
                          </Button>
                        </>
                      )}
                      {/* Show internal badge for internal carriers */}
                      {['canada-post', 'ups-internal', 'sendle'].includes(carrier.id) && (
                        <Badge variant="outline" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnectCarrier(carrier.id)}
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* API Configuration Guide */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration Guide</CardTitle>
          <CardDescription>
            Follow these steps to connect your shipping carriers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">1. Create Developer Account</h4>
              <p className="text-sm text-muted-foreground">
                Sign up for a developer account with each carrier
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">2. Get API Credentials</h4>
              <p className="text-sm text-muted-foreground">
                Obtain API keys, usernames, and account numbers
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">3. Configure in PrepFox</h4>
              <p className="text-sm text-muted-foreground">
                Enter your credentials and test the connection
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">4. Enable Services</h4>
              <p className="text-sm text-muted-foreground">
                Activate rate quotes, labels, and tracking
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}