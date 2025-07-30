import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Settings, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { MockDataBadge, LiveDataBadge } from "@/components/ui/mock-data-badge";
import { useToast } from "@/hooks/use-toast";

interface PrepFoxCarrier {
  id: string;
  name: string;
  label: string;
  description: string;
  isActive: boolean;
  isSystemEnabled: boolean;
  services: PrepFoxService[];
  status: 'active' | 'inactive' | 'error';
}

interface PrepFoxService {
  id: string;
  code: string;
  name: string;
  description: string;
  estimatedDays: string;
  isEnabled: boolean;
  isUserEnabled: boolean;
}

// Mock data for PrepFox managed carriers
const PREPFOX_CARRIERS: PrepFoxCarrier[] = [
  {
    id: 'ups-prepfox',
    name: 'ups',
    label: 'UPS',
    description: 'United Parcel Service - PrepFox managed account',
    isActive: true,
    isSystemEnabled: true,
    status: 'active',
    services: [
      { id: 'ups-ground', code: '03', name: 'UPS Ground', description: 'Standard ground delivery', estimatedDays: '1-5 business days', isEnabled: true, isUserEnabled: true },
      { id: 'ups-express', code: '01', name: 'UPS Next Day Air', description: 'Next business day delivery', estimatedDays: '1 business day', isEnabled: true, isUserEnabled: false },
      { id: 'ups-2day', code: '02', name: 'UPS 2nd Day Air', description: '2 business day delivery', estimatedDays: '2 business days', isEnabled: true, isUserEnabled: true },
    ]
  },
  {
    id: 'fedex-prepfox',
    name: 'fedex',
    label: 'FedEx',
    description: 'FedEx Corporation - PrepFox managed account',
    isActive: false,
    isSystemEnabled: false,
    status: 'inactive',
    services: [
      { id: 'fedex-ground', code: 'FEDEX_GROUND', name: 'FedEx Ground', description: 'Ground delivery service', estimatedDays: '1-5 business days', isEnabled: false, isUserEnabled: false },
      { id: 'fedex-overnight', code: 'FEDEX_OVERNIGHT', name: 'FedEx Overnight', description: 'Next business day delivery', estimatedDays: '1 business day', isEnabled: false, isUserEnabled: false },
    ]
  },
  {
    id: 'canadapost-prepfox',
    name: 'canada_post',
    label: 'Canada Post',
    description: 'Canada Post Corporation - PrepFox managed account',
    isActive: true,
    isSystemEnabled: true,
    status: 'active',
    services: [
      { id: 'cp-regular', code: 'DOM.RP', name: 'Regular Parcel', description: 'Standard parcel delivery within Canada', estimatedDays: '2-9 business days', isEnabled: true, isUserEnabled: true },
      { id: 'cp-expedited', code: 'DOM.EP', name: 'Expedited Parcel', description: 'Faster delivery within Canada', estimatedDays: '1-7 business days', isEnabled: true, isUserEnabled: false },
      { id: 'cp-xpresspost', code: 'DOM.XP', name: 'Xpresspost', description: 'Guaranteed delivery time', estimatedDays: '1-2 business days', isEnabled: true, isUserEnabled: true },
    ]
  },
  {
    id: 'usps-prepfox',
    name: 'usps',
    label: 'USPS',
    description: 'United States Postal Service - PrepFox managed account',
    isActive: true,
    isSystemEnabled: true,
    status: 'error',
    services: [
      { id: 'usps-ground', code: 'USPS_GROUND_ADVANTAGE', name: 'USPS Ground Advantage', description: 'Affordable ground delivery', estimatedDays: '2-5 business days', isEnabled: false, isUserEnabled: false },
      { id: 'usps-priority', code: 'PRIORITY_MAIL', name: 'Priority Mail', description: 'Fast, reliable service', estimatedDays: '1-3 business days', isEnabled: false, isUserEnabled: false },
    ]
  }
];

export function UserCarrierManagement() {
  const [carriers, setCarriers] = useState<PrepFoxCarrier[]>(PREPFOX_CARRIERS);
  const [loading, setLoading] = useState(false);
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);
  const { toast } = useToast();

  const handleToggleCarrier = async (carrierId: string, enabled: boolean) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCarriers(prev => 
      prev.map(carrier => 
        carrier.id === carrierId 
          ? { ...carrier, isActive: enabled }
          : carrier
      )
    );

    toast({
      title: enabled ? "✅ Carrier Activated" : "❌ Carrier Deactivated",
      description: `${carriers.find(c => c.id === carrierId)?.label} has been ${enabled ? 'activated' : 'deactivated'}`,
    });

    setLoading(false);
  };

  const handleToggleService = async (carrierId: string, serviceId: string, enabled: boolean) => {
    setCarriers(prev => 
      prev.map(carrier => 
        carrier.id === carrierId 
          ? {
              ...carrier,
              services: carrier.services.map(service =>
                service.id === serviceId
                  ? { ...service, isUserEnabled: enabled }
                  : service
              )
            }
          : carrier
      )
    );

    const carrier = carriers.find(c => c.id === carrierId);
    const service = carrier?.services.find(s => s.id === serviceId);

    toast({
      title: enabled ? "✅ Service Enabled" : "❌ Service Disabled", 
      description: `${service?.name} ${enabled ? 'enabled' : 'disabled'} for ${carrier?.label}`,
    });
  };

  const getStatusIcon = (status: 'active' | 'inactive' | 'error') => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (carrier: PrepFoxCarrier) => {
    if (!carrier.isSystemEnabled) {
      return <MockDataBadge><Badge variant="outline">System Disabled</Badge></MockDataBadge>;
    }
    if (carrier.status === 'error') {
      return <MockDataBadge><Badge variant="destructive">Connection Error</Badge></MockDataBadge>;
    }
    if (carrier.isActive) {
      return <LiveDataBadge><Badge variant="default">Active</Badge></LiveDataBadge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <div className="space-y-4">
      {carriers.map((carrier) => (
        <Card key={carrier.id} className="relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5" />
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {carrier.label}
                    {getStatusIcon(carrier.status)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{carrier.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(carrier)}
                <Switch
                  checked={carrier.isActive && carrier.isSystemEnabled}
                  onCheckedChange={(enabled) => handleToggleCarrier(carrier.id, enabled)}
                  disabled={!carrier.isSystemEnabled || loading}
                />
              </div>
            </div>
          </CardHeader>

          {carrier.isActive && carrier.isSystemEnabled && (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Available Services</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedCarrier(expandedCarrier === carrier.id ? null : carrier.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {expandedCarrier === carrier.id ? 'Hide' : 'Show'} Services
                </Button>
              </div>

              {expandedCarrier === carrier.id && (
                <div className="space-y-3">
                  <Separator />
                  {carrier.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{service.name}</span>
                          <Badge variant="outline" className="text-xs">{service.code}</Badge>
                          {service.isEnabled ? (
                            <LiveDataBadge><Badge variant="default" className="text-xs">Available</Badge></LiveDataBadge>
                          ) : (
                            <MockDataBadge><Badge variant="secondary" className="text-xs">Unavailable</Badge></MockDataBadge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <p className="text-xs text-muted-foreground">{service.estimatedDays}</p>
                      </div>
                      <Switch
                        checked={service.isUserEnabled && service.isEnabled}
                        onCheckedChange={(enabled) => handleToggleService(carrier.id, service.id, enabled)}
                        disabled={!service.isEnabled}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}

          {!carrier.isSystemEnabled && (
            <CardContent>
              <MockDataBadge>
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">This carrier is not available. Contact PrepFox support for activation.</p>
                </div>
              </MockDataBadge>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}