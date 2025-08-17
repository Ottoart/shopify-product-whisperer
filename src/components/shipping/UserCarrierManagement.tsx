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
import { useShippingServices } from "@/hooks/useShippingServices";

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

export function UserCarrierManagement() {
  const [carriers, setCarriers] = useState<PrepFoxCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);
  const { toast } = useToast();
  const { carriers: carrierConfigs, services, fetchServices } = useShippingServices();

  useEffect(() => {
    loadUserCarriers();
  }, [carrierConfigs, services]);

  const loadUserCarriers = async () => {
    try {
      if (!carrierConfigs) return;

      const carrierMap = new Map([
        ['ups', { label: 'UPS', description: 'United Parcel Service - Your configured account' }],
        ['canada_post', { label: 'Canada Post', description: 'Canada Post Corporation - Your configured account' }],
        ['fedex', { label: 'FedEx', description: 'FedEx Corporation - Your configured account' }],
        ['usps', { label: 'USPS', description: 'United States Postal Service - Your configured account' }],
        ['dhl', { label: 'DHL', description: 'DHL Express - Your configured account' }],
        ['purolator', { label: 'Purolator', description: 'Purolator Inc. - Your configured account' }]
      ]);

      const userCarriers: PrepFoxCarrier[] = carrierConfigs.map(config => {
        const carrierInfo = carrierMap.get(config.carrier_name) || {
          label: config.carrier_name.toUpperCase(),
          description: `${config.carrier_name} - Your configured account`
        };

        // Get services for this carrier
        const carrierServices = services
          .filter(service => service.carrier_configuration_id === config.id)
          .map(service => ({
            id: service.id,
            code: service.service_code,
            name: service.service_name,
            description: `${service.service_type} service`,
            estimatedDays: service.estimated_days || 'Unknown',
            isEnabled: service.is_available,
            isUserEnabled: service.is_available // Default to available
          }));
        
        return {
          id: config.id,
          name: config.carrier_name,
          label: carrierInfo.label,
          description: carrierInfo.description,
          isActive: config.is_active,
          isSystemEnabled: true, // User configs are always system enabled
          status: config.is_active ? 'active' : 'inactive',
          services: carrierServices
        };
      });

      setCarriers(userCarriers);
    } catch (error) {
      console.error('Failed to load user carriers:', error);
      toast({
        title: "❌ Failed to Load Carriers",
        description: "Could not load your carrier configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCarrier = async (carrierId: string, enabled: boolean) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('activate-carrier', {
        body: {
          user_id: user.id,
          carrier_id: carrierId
        }
      });

      if (error) {
        console.error('Error toggling carrier:', error);
        throw new Error(error.message || 'Failed to update carrier status');
      }

      // Update local state
      setCarriers(prev => 
        prev.map(carrier => 
          carrier.id === carrierId 
            ? { ...carrier, isActive: enabled }
            : carrier
        )
      );

      // Refresh services after activation
      if (enabled) {
        await fetchServices(true);
      }

      toast({
        title: enabled ? "✅ Carrier Activated" : "❌ Carrier Deactivated",
        description: `${carriers.find(c => c.id === carrierId)?.label} has been ${enabled ? 'activated' : 'deactivated'}`,
      });

    } catch (error) {
      console.error('Failed to toggle carrier:', error);
      toast({
        title: "❌ Carrier Update Failed",
        description: error instanceof Error ? error.message : "Failed to update carrier status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = async (carrierId: string, serviceId: string, enabled: boolean) => {
    try {
      // Update service availability in database
      const { error } = await supabase
        .from('shipping_services')
        .update({ is_available: enabled })
        .eq('id', serviceId);

      if (error) {
        console.error('Error updating service:', error);
        throw new Error('Failed to update service');
      }

      // Update local state
      setCarriers(prev => 
        prev.map(carrier => 
          carrier.id === carrierId 
            ? {
                ...carrier,
                services: carrier.services.map(service =>
                  service.id === serviceId
                    ? { ...service, isUserEnabled: enabled, isEnabled: enabled }
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

    } catch (error) {
      console.error('Failed to toggle service:', error);
      toast({
        title: "❌ Service Update Failed",
        description: error instanceof Error ? error.message : "Failed to update service status",
        variant: "destructive"
      });
    }
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