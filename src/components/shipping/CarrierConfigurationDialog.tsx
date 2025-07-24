import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck, Plus, Settings, AlertCircle, TestTube, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useShippingServices, CarrierConfiguration } from "@/hooks/useShippingServices";
import { useToast } from "@/hooks/use-toast";

interface CarrierConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_CARRIERS = [
  { value: 'ups', label: 'UPS', description: 'United Parcel Service' },
  { value: 'canada_post', label: 'Canada Post', description: 'Canada Post Corporation' },
  { value: 'sendle', label: 'Sendle', description: 'Carbon-neutral shipping' },
  { value: 'shipstation', label: 'ShipStation', description: 'Multi-carrier shipping software' }
];

const UPS_ACCOUNT_TYPES = [
  'Daily Pickup',
  'Customer Counter',
  'One Time Pickup',
  'On Call Air',
  'Letter Center',
  'Air Service Center'
];

const UPS_ENDORSEMENTS = [
  'Return Service Requested',
  'Forwarding Service Requested',
  'Address Service Requested',
  'Change Service Requested'
];

const COUNTRY_CODES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' }
];

export function CarrierConfigurationDialog({ isOpen, onClose }: CarrierConfigurationDialogProps) {
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [editingCarrier, setEditingCarrier] = useState<CarrierConfiguration | null>(null);
  const [upsConfig, setUpsConfig] = useState({
    account_number: '',
    client_id: '',
    client_secret: '',
    account_type: '',
    environment: 'sandbox', // default to sandbox for safety
    mi_endorsement: '',
    mi_cost_center: '',
    mi_customer_id: '',
    mi_customer_guid: '',
    postal_code: '',
    country_code: 'US',
    enable_negotiated_rates: false,
    enable_carbon_neutral: false,
    enable_ground_freight: false,
    enable_additional_services: false,
    enable_user_order_number: false
  });
  const [canadaPostConfig, setCanadaPostConfig] = useState({
    api_username: '',
    api_password: '',
    customer_number: '',
    contact_id: ''
  });
  const [sendleConfig, setSendleConfig] = useState({
    api_key: '',
    api_secret: '',
    sandbox: false
  });
  const [shipstationConfig, setShipstationConfig] = useState({
    api_key: '',
    api_secret: '',
    store_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testingCarrier, setTestingCarrier] = useState<string | null>(null);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [expandedCarrier, setExpandedCarrier] = useState<string | null>(null);
  
  const { 
    carriers, 
    addCarrierConfiguration,
    updateCarrierConfiguration,
    toggleCarrierStatus, 
    refreshServices,
    loading 
  } = useShippingServices();
  const { toast } = useToast();

  const getCarrierConfig = () => {
    switch (selectedCarrier) {
      case 'ups': return upsConfig;
      case 'canada_post': return canadaPostConfig;
      case 'sendle': return sendleConfig;
      case 'shipstation': return shipstationConfig;
      default: return {};
    }
  };

  const resetCarrierConfig = () => {
    setUpsConfig({
      account_number: '', client_id: '', client_secret: '', account_type: '',
      environment: 'sandbox', // Always reset to sandbox for safety
      mi_endorsement: '', mi_cost_center: '', mi_customer_id: '', mi_customer_guid: '',
      postal_code: '', country_code: 'US', enable_negotiated_rates: false,
      enable_carbon_neutral: false, enable_ground_freight: false,
      enable_additional_services: false, enable_user_order_number: false
    });
    setCanadaPostConfig({ api_username: '', api_password: '', customer_number: '', contact_id: '' });
    setSendleConfig({ api_key: '', api_secret: '', sandbox: false });
    setShipstationConfig({ api_key: '', api_secret: '', store_id: '' });
  };

  const handleAddOrUpdateCarrier = async () => {
    if (!selectedCarrier && !editingCarrier) {
      toast({
        title: "Error",
        description: "Please select a carrier",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const config = getCarrierConfig();
      
      if (editingCarrier) {
        // Update existing carrier
        await updateCarrierConfiguration(editingCarrier.id, {
          api_credentials: config,
          settings: editingCarrier.settings
        });

        toast({
          title: "Success",
          description: `${editingCarrier.carrier_name.toUpperCase()} carrier has been updated successfully`,
        });

        setEditingCarrier(null);
      } else {
        // Add new carrier
        await addCarrierConfiguration({
          carrier_name: selectedCarrier,
          api_credentials: config,
          settings: {}
        });

        toast({
          title: "Success",
          description: `${selectedCarrier.toUpperCase()} carrier has been added successfully`,
        });
      }

      setSelectedCarrier('');
      resetCarrierConfig();

    } catch (error) {
      console.error('Error saving carrier:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingCarrier ? 'update' : 'add'} carrier configuration`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCarrier = async (carrierId: string, isActive: boolean) => {
    try {
      await toggleCarrierStatus(carrierId, isActive);
      toast({
        title: "Success",
        description: `Carrier ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling carrier:', error);
      toast({
        title: "Error",
        description: "Failed to update carrier status",
        variant: "destructive"
      });
    }
  };

  const getCredentialFields = (carrier: string) => {
    switch (carrier) {
      case 'ups':
        return ['client_id', 'client_secret', 'account_number'];
      case 'canada_post':
        return ['api_username', 'api_password', 'customer_number', 'contact_id'];
      case 'sendle':
        return ['api_key', 'api_secret'];
      case 'shipstation':
        return ['api_key', 'api_secret'];
      default:
        return [];
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'api_key': return 'API Key';
      case 'api_secret': return 'API Secret';
      case 'api_username': return 'API Username';
      case 'api_password': return 'API Password';
      case 'customer_number': return 'Customer Number';
      case 'contact_id': return 'Contact ID';
      case 'account_number': return 'Account Number';
      case 'access_key': return 'Access Key';
      case 'password': return 'Password';
      case 'username': return 'Username';
      case 'client_id': return 'Client ID';
      case 'client_secret': return 'Client Secret';
      default: return field.replace('_', ' ').toUpperCase();
    }
  };

  const handleTestConnection = async (carrierId: string) => {
    setTestingCarrier(carrierId);
    try {
      // Here you would call your test connection API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "Success",
        description: "Connection test successful",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection test failed",
        variant: "destructive"
      });
    } finally {
      setTestingCarrier(null);
    }
  };

  const toggleCredentialVisibility = (carrierId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [carrierId]: !prev[carrierId]
    }));
  };

  const toggleCarrierExpansion = (carrierId: string) => {
    setExpandedCarrier(prev => prev === carrierId ? null : carrierId);
  };

  const handleEditCarrier = (carrier: CarrierConfiguration) => {
    setEditingCarrier(carrier);
    setSelectedCarrier(carrier.carrier_name);
    
    // Populate the form with existing data
    if (carrier.carrier_name === 'ups') {
      const creds = carrier.api_credentials as any;
      setUpsConfig({
        account_number: creds.account_number || '',
        client_id: creds.client_id || '',
        client_secret: creds.client_secret || '',
        account_type: creds.account_type || '',
        environment: creds.environment || 'sandbox',
        mi_endorsement: creds.mi_endorsement || '',
        mi_cost_center: creds.mi_cost_center || '',
        mi_customer_id: creds.mi_customer_id || '',
        mi_customer_guid: creds.mi_customer_guid || '',
        postal_code: creds.postal_code || '',
        country_code: creds.country_code || 'US',
        enable_negotiated_rates: creds.enable_negotiated_rates || false,
        enable_carbon_neutral: creds.enable_carbon_neutral || false,
        enable_ground_freight: creds.enable_ground_freight || false,
        enable_additional_services: creds.enable_additional_services || false,
        enable_user_order_number: creds.enable_user_order_number || false
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCarrier(null);
    setSelectedCarrier('');
    resetCarrierConfig();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Carrier Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add New Carrier */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingCarrier ? <Settings className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingCarrier ? `Edit ${editingCarrier.carrier_name.toUpperCase()}` : 'Add New Carrier'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!editingCarrier && (
                <div>
                  <Label htmlFor="carrier">Select Carrier</Label>
                  <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a carrier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CARRIERS.map(carrier => (
                        <SelectItem key={carrier.value} value={carrier.value}>
                          <div>
                            <div className="font-medium">{carrier.label}</div>
                            <div className="text-sm text-muted-foreground">{carrier.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(selectedCarrier === 'ups' || editingCarrier?.carrier_name === 'ups') && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">UPS Account Information</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="ups_account">UPS Account #</Label>
                      <Input
                        id="ups_account"
                        value={upsConfig.account_number}
                        onChange={(e) => setUpsConfig(prev => ({ ...prev, account_number: e.target.value }))}
                        placeholder="A90665"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account_type">Account Type</Label>
                      <Select value={upsConfig.account_type} onValueChange={(value) => setUpsConfig(prev => ({ ...prev, account_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Daily Pickup" />
                        </SelectTrigger>
                        <SelectContent>
                          {UPS_ACCOUNT_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select 
                      value={upsConfig.environment} 
                      onValueChange={(value) => setUpsConfig(prev => ({ ...prev, environment: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">
                          <div className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            <div>
                              <div>Sandbox (Test) Mode</div>
                              <div className="text-xs text-muted-foreground">Use for testing with fake data</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="production">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            <div>
                              <div>Production Mode</div>
                              <div className="text-xs text-muted-foreground">Use for live shipping labels</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="client_id">Client ID</Label>
                      <Input
                        id="client_id"
                        value={upsConfig.client_id}
                        onChange={(e) => setUpsConfig(prev => ({ ...prev, client_id: e.target.value }))}
                        placeholder="Your UPS Client ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_secret">Client Secret</Label>
                      <Input
                        id="client_secret"
                        type="password"
                        value={upsConfig.client_secret}
                        onChange={(e) => setUpsConfig(prev => ({ ...prev, client_secret: e.target.value }))}
                        placeholder="Your UPS Client Secret"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="postal_code">Account Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={upsConfig.postal_code}
                        onChange={(e) => setUpsConfig(prev => ({ ...prev, postal_code: e.target.value }))}
                        placeholder="h2n1z4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country_code">Account Country Code</Label>
                      <Select value={upsConfig.country_code} onValueChange={(value) => setUpsConfig(prev => ({ ...prev, country_code: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRY_CODES.map(country => (
                            <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="negotiated_rates" 
                        checked={upsConfig.enable_negotiated_rates}
                        onCheckedChange={(checked) => setUpsConfig(prev => ({ ...prev, enable_negotiated_rates: Boolean(checked) }))}
                      />
                      <Label htmlFor="negotiated_rates">Enable Negotiated Rates</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="carbon_neutral" 
                        checked={upsConfig.enable_carbon_neutral}
                        onCheckedChange={(checked) => setUpsConfig(prev => ({ ...prev, enable_carbon_neutral: Boolean(checked) }))}
                      />
                      <Label htmlFor="carbon_neutral">Use the UPS Carbon Neutral shipping program</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="ground_freight" 
                        checked={upsConfig.enable_ground_freight}
                        onCheckedChange={(checked) => setUpsConfig(prev => ({ ...prev, enable_ground_freight: Boolean(checked) }))}
                      />
                      <Label htmlFor="ground_freight">Enable Ground Freight Pricing</Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddOrUpdateCarrier} 
                      disabled={isSubmitting || loading}
                      className="flex-1"
                    >
                      {isSubmitting ? (editingCarrier ? 'Updating...' : 'Adding...') : (editingCarrier ? 'Update UPS' : 'Add UPS Carrier')}
                    </Button>
                    {editingCarrier && (
                      <Button 
                        variant="outline" 
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {selectedCarrier === 'canada_post' && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Canada Post Configuration</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                    <p className="text-sm text-blue-800 font-medium">Getting Canada Post API Credentials:</p>
                    <ol className="text-sm text-blue-700 space-y-1 ml-4">
                      <li>1. Visit the <a href="https://www.canadapost-postescanada.ca/information/app/drc/home" target="_blank" rel="noopener noreferrer" className="underline">Canada Post Developer Program</a></li>
                      <li>2. Sign in or create a free account</li>
                      <li>3. Accept the License Agreement</li>
                      <li>4. Navigate to "Developer program" → "API keys"</li>
                      <li>5. Copy your credentials for use below</li>
                    </ol>
                  </div>
                  
                  <div>
                    <Label htmlFor="cp_username">API Username</Label>
                    <Input
                      id="cp_username"
                      value={canadaPostConfig.api_username}
                      onChange={(e) => setCanadaPostConfig(prev => ({ ...prev, api_username: e.target.value }))}
                      placeholder="Your Canada Post API username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cp_password">API Password</Label>
                    <Input
                      id="cp_password"
                      type="password"
                      value={canadaPostConfig.api_password}
                      onChange={(e) => setCanadaPostConfig(prev => ({ ...prev, api_password: e.target.value }))}
                      placeholder="Your Canada Post API password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cp_customer_number">Customer Number</Label>
                    <Input
                      id="cp_customer_number"
                      value={canadaPostConfig.customer_number}
                      onChange={(e) => setCanadaPostConfig(prev => ({ ...prev, customer_number: e.target.value }))}
                      placeholder="Your customer number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cp_contact_id">Contact ID</Label>
                    <Input
                      id="cp_contact_id"
                      value={canadaPostConfig.contact_id}
                      onChange={(e) => setCanadaPostConfig(prev => ({ ...prev, contact_id: e.target.value }))}
                      placeholder="Your contact ID"
                    />
                  </div>

                  <Button 
                    onClick={handleAddOrUpdateCarrier} 
                    disabled={isSubmitting || loading}
                    className="w-full"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Canada Post'}
                  </Button>
                </div>
              )}

              {selectedCarrier === 'sendle' && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Sendle Configuration</span>
                  </div>
                  
                  <div>
                    <Label htmlFor="sendle_api_key">API Key</Label>
                    <Input
                      id="sendle_api_key"
                      value={sendleConfig.api_key}
                      onChange={(e) => setSendleConfig(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="Your Sendle API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sendle_api_secret">API Secret</Label>
                    <Input
                      id="sendle_api_secret"
                      type="password"
                      value={sendleConfig.api_secret}
                      onChange={(e) => setSendleConfig(prev => ({ ...prev, api_secret: e.target.value }))}
                      placeholder="Your Sendle API secret"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sendle_sandbox" 
                      checked={sendleConfig.sandbox}
                      onCheckedChange={(checked) => setSendleConfig(prev => ({ ...prev, sandbox: Boolean(checked) }))}
                    />
                    <Label htmlFor="sendle_sandbox">Use Sandbox Environment</Label>
                  </div>

                  <Button 
                    onClick={handleAddOrUpdateCarrier} 
                    disabled={isSubmitting || loading}
                    className="w-full"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Sendle'}
                  </Button>
                </div>
              )}

              {selectedCarrier === 'shipstation' && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">ShipStation Configuration</span>
                  </div>
                  
                  <div>
                    <Label htmlFor="ss_api_key">API Key</Label>
                    <Input
                      id="ss_api_key"
                      value={shipstationConfig.api_key}
                      onChange={(e) => setShipstationConfig(prev => ({ ...prev, api_key: e.target.value }))}
                      placeholder="Your ShipStation API key"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ss_api_secret">API Secret</Label>
                    <Input
                      id="ss_api_secret"
                      type="password"
                      value={shipstationConfig.api_secret}
                      onChange={(e) => setShipstationConfig(prev => ({ ...prev, api_secret: e.target.value }))}
                      placeholder="Your ShipStation API secret"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ss_store_id">Store ID (Optional)</Label>
                    <Input
                      id="ss_store_id"
                      value={shipstationConfig.store_id}
                      onChange={(e) => setShipstationConfig(prev => ({ ...prev, store_id: e.target.value }))}
                      placeholder="Your store ID"
                    />
                  </div>

                  <Button 
                    onClick={handleAddOrUpdateCarrier} 
                    disabled={isSubmitting || loading}
                    className="w-full"
                  >
                    {isSubmitting ? 'Adding...' : 'Add ShipStation'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Carriers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Active Carriers
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshServices}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Services'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carriers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No carriers configured yet</p>
                  <p className="text-sm">Add a carrier to get started with shipping services</p>
                </div>
               ) : (
                carriers.map(carrier => (
                  <div key={carrier.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Truck className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{carrier.carrier_name.toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            Added {new Date(carrier.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={carrier.is_active ? "default" : "secondary"}>
                          {carrier.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Switch
                          checked={carrier.is_active}
                          onCheckedChange={(checked) => handleToggleCarrier(carrier.id, checked)}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCredentialVisibility(carrier.id)}
                      >
                        {showCredentials[carrier.id] ? (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Hide Credentials
                          </>
                        ) : (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            View Credentials
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestConnection(carrier.id)}
                        disabled={testingCarrier === carrier.id}
                      >
                        {testingCarrier === carrier.id ? (
                          <>Testing...</>
                        ) : (
                          <>
                            <TestTube className="h-3 w-3 mr-1" />
                            Test
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCarrier(carrier)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleCarrierExpansion(carrier.id)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        {expandedCarrier === carrier.id ? 'Hide Services' : 'Manage Services'}
                      </Button>
                    </div>

                    {/* Credentials display */}
                    {showCredentials[carrier.id] && (
                      <div className="bg-muted/50 p-3 rounded space-y-2">
                        <h4 className="text-sm font-medium">API Credentials</h4>
                        {Object.entries(carrier.api_credentials as Record<string, any>).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{getFieldLabel(key)}:</span>
                            <span className="font-mono">
                              {key.includes('secret') || key.includes('password') ? '••••••••' : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Service management */}
                    {expandedCarrier === carrier.id && (
                      <div className="bg-muted/50 p-3 rounded space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Available Services
                        </h4>
                        <div className="space-y-2">
                          {/* Mock services - replace with actual services from the API */}
                          {['Ground', 'Express', 'Overnight'].map(service => (
                            <div key={service} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Checkbox 
                                  id={`${carrier.id}-${service}`}
                                  defaultChecked={true}
                                />
                                <Label htmlFor={`${carrier.id}-${service}`} className="text-sm">
                                  {service}
                                </Label>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                1-3 days
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}