import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Plus, Settings, TestTube, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MockDataBadge, LiveDataBadge } from "@/components/ui/mock-data-badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const SUPPORTED_CARRIERS = [
  { value: 'ups', label: 'UPS', description: 'United Parcel Service' },
  { value: 'fedex', label: 'FedEx', description: 'FedEx Corporation' },
  { value: 'usps', label: 'USPS', description: 'United States Postal Service' },
  { value: 'dhl', label: 'DHL', description: 'DHL Express' },
  { value: 'canada_post', label: 'Canada Post', description: 'Canada Post Corporation' },
  { value: 'purolator', label: 'Purolator', description: 'Purolator Inc.' },
  { value: 'shipstation', label: 'ShipStation', description: 'Multi-carrier shipping software' }
];

export function CarrierConfigurationManagement() {
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingCarrier, setTestingCarrier] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [carrierConfigs, setCarrierConfigs] = useState<any[]>([]);

  const [upsConfig, setUpsConfig] = useState({
    account_number: '',
    client_id: '',
    client_secret: '',
    account_type: '',
    environment: 'sandbox',
    enable_negotiated_rates: false,
    enable_carbon_neutral: false
  });

  const [canadaPostConfig, setCanadaPostConfig] = useState({
    api_key: '',
    api_secret: '',
    customer_number: '',
    contract_number: '',
    account_type: 'commercial',
    is_production: false
  });

  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAdminAuth();

  // Load existing configurations on mount
  useEffect(() => {
    loadCarrierConfigurations();
  }, []);

  const loadCarrierConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('carrier_configurations')
        .select('*')
        .filter('api_credentials', 'cs', JSON.stringify({system_carrier: true}));

      if (error) {
        console.error('Error loading carrier configurations:', error);
        return;
      }

      // Update form states with saved configurations
      console.log("credentialssssssssss-------",data)
      if (data) {
        data.forEach((config: any) => {
          if (config.carrier_name === 'canada_post' && config.api_credentials) {
            setCanadaPostConfig({
              api_key: config.api_credentials.api_key || '',
              api_secret: config.api_credentials.api_secret || '',
              customer_number: config.api_credentials.customer_number || '',
              contract_number: config.api_credentials.contract_number || '',
              account_type: config.api_credentials.account_type || 'commercial',
              is_production: config.api_credentials.is_production || false
            });
          }
          // Add UPS config loading when implemented
        });
        setCarrierConfigs(data);
      }
    } catch (error) {
      console.error('Error in loadCarrierConfigurations:', error);
    }
  };

  const getCarrierConfig = () => {
    switch (selectedCarrier) {
      case 'ups': return upsConfig;
      case 'canada_post': return canadaPostConfig;
      default: return {};
    }
  };

  const handleConfigurePrepFoxCarrier = async () => {
    if (!selectedCarrier) {
      toast({
        title: "❌ Validation Error",
        description: "Please select a carrier",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const config = getCarrierConfig();
      let requestBody: any = {};

      // Map the config to the expected format for each carrier
      if (selectedCarrier === 'canada_post') {
        const cpConfig = config as typeof canadaPostConfig;
        requestBody = {
          api_key: cpConfig.api_key,
          api_secret: cpConfig.api_secret,
          customer_number: cpConfig.customer_number,
          contract_number: cpConfig.contract_number,
          account_type: cpConfig.account_type || 'commercial',
          is_production: cpConfig.is_production || false
        };
      } else {
        requestBody = config;
      }
      
      // For admin, we're configuring system-wide PrepFox carriers
      const functionName = selectedCarrier === 'canada_post' ? 'admin-configure-canada-post' : 'setup-ups-credentials';
      
      // Check admin authentication
      if (!isAuthenticated || !isAdmin) {
        console.error('❌ Authentication required - not admin or not authenticated');
        toast({
          title: "❌ Authentication Required",
          description: "Please log in as an admin first.",
          variant: "destructive",
        });
        return;
      }

      console.log('🔧 Configuring carrier with admin auth:', selectedCarrier);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) throw error;

      toast({
        title: "✅ System Carrier Configured",
        description: `${selectedCarrier.toUpperCase()} has been configured for all users`,
      });

      // Reload configurations to show updated data
      await loadCarrierConfigurations();
      setSelectedCarrier('');
    } catch (error) {
      console.error('Error configuring system carrier:', error);
      toast({
        title: "❌ Configuration Failed",
        description: error instanceof Error ? error.message : "Failed to configure carrier",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSystemCarrier = async (carrierName: string) => {
    setTestingCarrier(carrierName);
    
    try {
      const functionName = carrierName === 'canada_post' ? 'test-canada-post-auth' : 'test-ups-auth';
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {}
      });

      if (error) throw error;

      toast({
        title: data.valid ? "✅ System Carrier Active" : "❌ System Carrier Issue",
        description: data.message || "System carrier test completed",
        variant: data.valid ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "❌ Test Failed",
        description: "Failed to test system carrier",
        variant: "destructive"
      });
    } finally {
      setTestingCarrier(null);
    }
  };

  const renderCarrierConfigForm = () => {
    switch (selectedCarrier) {
      case 'ups':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ups-client-id">Client ID</Label>
                <Input
                  id="ups-client-id"
                  type="text"
                  value={upsConfig.client_id}
                  onChange={(e) => setUpsConfig({...upsConfig, client_id: e.target.value})}
                  placeholder="Enter UPS Client ID"
                />
              </div>
              <div>
                <Label htmlFor="ups-client-secret">Client Secret</Label>
                <Input
                  id="ups-client-secret"
                  type="password"
                  value={upsConfig.client_secret}
                  onChange={(e) => setUpsConfig({...upsConfig, client_secret: e.target.value})}
                  placeholder="Enter UPS Client Secret"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ups-account-number">Account Number</Label>
              <Input
                id="ups-account-number"
                type="text"
                value={upsConfig.account_number}
                onChange={(e) => setUpsConfig({...upsConfig, account_number: e.target.value})}
                placeholder="Enter UPS Account Number"
              />
            </div>
            <div>
              <Label htmlFor="ups-environment">Environment</Label>
              <Select value={upsConfig.environment} onValueChange={(value) => setUpsConfig({...upsConfig, environment: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ups-negotiated-rates"
                checked={upsConfig.enable_negotiated_rates}
                onCheckedChange={(checked) => setUpsConfig({...upsConfig, enable_negotiated_rates: checked})}
              />
              <Label htmlFor="ups-negotiated-rates">Enable Negotiated Rates</Label>
            </div>
          </div>
        );

      case 'canada_post':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cp-api-key">API Key</Label>
                <Input
                  id="cp-api-key"
                  type="text"
                  value={canadaPostConfig.api_key}
                  onChange={(e) => setCanadaPostConfig({...canadaPostConfig, api_key: e.target.value})}
                  placeholder="Enter API Key"
                />
              </div>
              <div>
                <Label htmlFor="cp-api-secret">API Secret</Label>
                <Input
                  id="cp-api-secret"
                  type="password"
                  value={canadaPostConfig.api_secret}
                  onChange={(e) => setCanadaPostConfig({...canadaPostConfig, api_secret: e.target.value})}
                  placeholder="Enter API Secret"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cp-customer-number">Customer Number</Label>
                <Input
                  id="cp-customer-number"
                  type="text"
                  value={canadaPostConfig.customer_number}
                  onChange={(e) => setCanadaPostConfig({...canadaPostConfig, customer_number: e.target.value})}
                  placeholder="e.g., 0008126390"
                />
              </div>
              <div>
                <Label htmlFor="cp-contract-number">Contract Number</Label>
                <Input
                  id="cp-contract-number"
                  type="text"
                  value={canadaPostConfig.contract_number}
                  onChange={(e) => setCanadaPostConfig({...canadaPostConfig, contract_number: e.target.value})}
                  placeholder="e.g., 0043880018"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="cp-production"
                checked={canadaPostConfig.is_production}
                onCheckedChange={(checked) => setCanadaPostConfig({...canadaPostConfig, is_production: checked})}
              />
              <Label htmlFor="cp-production">Production Environment</Label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Select a carrier to configure its system-wide settings
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">PrepFox Carrier Management</h2>
          <p className="text-muted-foreground">Configure system-wide carrier settings and credentials</p>
        </div>
      </div>

      {/* Configure PrepFox Carriers */}
      <Card>
        <CardHeader>
          <CardTitle>System Carrier Configuration</CardTitle>
          <CardDescription>
            Configure PrepFox managed carriers that will be available to all users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="carrier-select">Select Carrier</Label>
            <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a carrier to configure" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CARRIERS.map((carrier) => (
                  <SelectItem key={carrier.value} value={carrier.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{carrier.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{carrier.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {renderCarrierConfigForm()}

          {selectedCarrier && (
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={handleConfigurePrepFoxCarrier}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure System Carrier
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Carrier Status */}
      <Card>
        <CardHeader>
          <CardTitle>PrepFox Carrier Status</CardTitle>
          <CardDescription>
            Current status of system-wide carrier configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_CARRIERS.slice(0, 6).map((carrier) => (
              <LiveDataBadge key={carrier.value}>
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-medium">{carrier.label}</span>
                      </div>
                     <Badge variant="outline" className="text-xs">
                        {carrierConfigs.find(c => c.carrier_name === carrier.value) ? 'Configured' : 'Not Configured'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{carrier.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestSystemCarrier(carrier.value)}
                      disabled={testingCarrier === carrier.value}
                      className="w-full"
                    >
                      {testingCarrier === carrier.value ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-foreground border-t-transparent mr-1" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-3 w-3 mr-1" />
                          Test Connection
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </LiveDataBadge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}