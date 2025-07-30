import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useShippingServices } from "@/hooks/useShippingServices";

interface UserCarrierAccountsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_CARRIERS = [
  { value: 'ups', label: 'UPS', description: 'Connect your UPS account' },
  { value: 'fedex', label: 'FedEx', description: 'Connect your FedEx account' },
  { value: 'canada_post', label: 'Canada Post', description: 'Connect your Canada Post account' },
  { value: 'shipstation', label: 'ShipStation', description: 'Connect your ShipStation account' }
];

export function UserCarrierAccountsDialog({ isOpen, onClose }: UserCarrierAccountsDialogProps) {
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [upsConfig, setUpsConfig] = useState({
    account_number: '',
    client_id: '',
    client_secret: '',
    environment: 'sandbox'
  });
  const [canadaPostConfig, setCanadaPostConfig] = useState({
    api_key: '',
    api_secret: '',
    customer_number: '',
    contract_number: ''
  });

  const { addCarrierConfiguration } = useShippingServices();
  const { toast } = useToast();

  const getCarrierConfig = () => {
    switch (selectedCarrier) {
      case 'ups': return upsConfig;
      case 'canada_post': return canadaPostConfig;
      default: return {};
    }
  };

  const resetForms = () => {
    setSelectedCarrier('');
    setUpsConfig({ account_number: '', client_id: '', client_secret: '', environment: 'sandbox' });
    setCanadaPostConfig({ api_key: '', api_secret: '', customer_number: '', contract_number: '' });
  };

  const handleAddAccount = async () => {
    if (!selectedCarrier) {
      toast({
        title: "❌ Validation Error",
        description: "Please select a carrier",
        variant: "destructive"
      });
      return;
    }

    const config = getCarrierConfig();
    const requiredFields = selectedCarrier === 'ups' 
      ? ['client_id', 'client_secret', 'account_number']
      : ['api_key', 'api_secret', 'customer_number'];

    const missingFields = requiredFields.filter(field => !config[field]);
    if (missingFields.length > 0) {
      toast({
        title: "❌ Missing Required Fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addCarrierConfiguration({
        carrier_name: selectedCarrier,
        api_credentials: config,
        settings: {}
      });

      toast({
        title: "✅ Account Added",
        description: `Your ${selectedCarrier.toUpperCase()} account has been connected successfully`,
      });

      resetForms();
      onClose();
    } catch (error) {
      console.error('Error adding carrier account:', error);
      toast({
        title: "❌ Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect carrier account",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConfigForm = () => {
    switch (selectedCarrier) {
      case 'ups':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ups-client-id">Client ID</Label>
              <Input
                id="ups-client-id"
                value={upsConfig.client_id}
                onChange={(e) => setUpsConfig({...upsConfig, client_id: e.target.value})}
                placeholder="Your UPS Client ID"
              />
            </div>
            <div>
              <Label htmlFor="ups-client-secret">Client Secret</Label>
              <Input
                id="ups-client-secret"
                type="password"
                value={upsConfig.client_secret}
                onChange={(e) => setUpsConfig({...upsConfig, client_secret: e.target.value})}
                placeholder="Your UPS Client Secret"
              />
            </div>
            <div>
              <Label htmlFor="ups-account-number">Account Number</Label>
              <Input
                id="ups-account-number"
                value={upsConfig.account_number}
                onChange={(e) => setUpsConfig({...upsConfig, account_number: e.target.value})}
                placeholder="Your UPS Account Number"
              />
            </div>
            <div>
              <Label htmlFor="ups-environment">Environment</Label>
              <Select value={upsConfig.environment} onValueChange={(value) => setUpsConfig({...upsConfig, environment: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'canada_post':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cp-api-key">API Key</Label>
              <Input
                id="cp-api-key"
                value={canadaPostConfig.api_key}
                onChange={(e) => setCanadaPostConfig({...canadaPostConfig, api_key: e.target.value})}
                placeholder="Your Canada Post API Key"
              />
            </div>
            <div>
              <Label htmlFor="cp-api-secret">API Secret</Label>
              <Input
                id="cp-api-secret"
                type="password"
                value={canadaPostConfig.api_secret}
                onChange={(e) => setCanadaPostConfig({...canadaPostConfig, api_secret: e.target.value})}
                placeholder="Your Canada Post API Secret"
              />
            </div>
            <div>
              <Label htmlFor="cp-customer-number">Customer Number</Label>
              <Input
                id="cp-customer-number"
                value={canadaPostConfig.customer_number}
                onChange={(e) => setCanadaPostConfig({...canadaPostConfig, customer_number: e.target.value})}
                placeholder="Your Customer Number"
              />
            </div>
            <div>
              <Label htmlFor="cp-contract-number">Contract Number (Optional)</Label>
              <Input
                id="cp-contract-number"
                value={canadaPostConfig.contract_number}
                onChange={(e) => setCanadaPostConfig({...canadaPostConfig, contract_number: e.target.value})}
                placeholder="Your Contract Number"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Select a carrier to configure your account
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Add Your Carrier Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Connect Personal Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="carrier-select">Select Carrier</Label>
                <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a carrier to connect" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_CARRIERS.map((carrier) => (
                      <SelectItem key={carrier.value} value={carrier.value}>
                        <div>
                          <div className="font-medium">{carrier.label}</div>
                          <div className="text-xs text-muted-foreground">{carrier.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderConfigForm()}

              {selectedCarrier && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => { resetForms(); onClose(); }}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddAccount}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Connect Account
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}