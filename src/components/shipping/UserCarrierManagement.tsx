import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Settings, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { MockDataBadge, LiveDataBadge } from "@/components/ui/mock-data-badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

// System carriers that can be configured
const SYSTEM_CARRIERS = [
  { name: 'ups', label: 'UPS', description: 'United Parcel Service - PrepFox managed account' },
  { name: 'canada_post', label: 'Canada Post', description: 'Canada Post Corporation - PrepFox managed account' },
  { name: 'fedex', label: 'FedEx', description: 'FedEx Corporation - PrepFox managed account' },
  { name: 'usps', label: 'USPS', description: 'United States Postal Service - PrepFox managed account' },
  { name: 'dhl', label: 'DHL', description: 'DHL Express - PrepFox managed account' },
  { name: 'purolator', label: 'Purolator', description: 'Purolator Inc. - PrepFox managed account' }
];

export function UserCarrierManagement() {
  const [carriers, setCarriers] = useState<PrepFoxCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSystemCarriers();
  }, []);

  const loadSystemCarriers = async () => {
    try {
      // Check which carriers are configured by admin
      const { data: { user } } = await supabase.auth.getUser();
       console.log("Logged in user:", user?.id);
      const { data: configs, error } = await supabase
        .from('carrier_configurations')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error loading carrier configs:', error);
      }

      console.log('Loaded carrier configs:', configs);

      const systemCarriers: PrepFoxCarrier[] = SYSTEM_CARRIERS.map(carrier => {
        const config = configs?.find(c => c.carrier_name === carrier.label);
        const isConfigured = !!config && config.is_active;
        
        return {
          id: `${carrier.name}-prepfox`,
          name: carrier.name,
          label: carrier.label,
          description: carrier.description,
          isActive: false,
          isSystemEnabled: isConfigured,
          status: isConfigured ? 'active' : 'inactive',
          services: []
        };
      });

      setCarriers(systemCarriers);
    } catch (error) {
      console.error('Failed to load system carriers:', error);
      toast({
        title: "❌ Failed to Load Carriers",
        description: "Could not load system carrier configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-20 animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

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
                  <h4 className="font-medium mb-1">Coming Soon</h4>
                  <p className="text-sm">This carrier is being configured by PrepFox and will be available soon.</p>
                </div>
              </MockDataBadge>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}