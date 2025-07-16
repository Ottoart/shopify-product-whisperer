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
import { Truck, Plus, Settings, AlertCircle } from "lucide-react";
import { useShippingServices, CarrierConfiguration } from "@/hooks/useShippingServices";
import { useToast } from "@/hooks/use-toast";

interface CarrierConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_CARRIERS = [
  { value: 'ups', label: 'UPS', description: 'United Parcel Service' },
  { value: 'fedex', label: 'FedEx', description: 'Federal Express' },
  { value: 'usps', label: 'USPS', description: 'United States Postal Service' },
  { value: 'sendle', label: 'Sendle', description: 'Carbon-neutral shipping' },
  { value: 'dhl', label: 'DHL', description: 'DHL Express' }
];

export function CarrierConfigurationDialog({ isOpen, onClose }: CarrierConfigurationDialogProps) {
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [credentials, setCredentials] = useState({
    api_key: '',
    api_secret: '',
    account_number: '',
    access_key: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    carriers, 
    addCarrierConfiguration, 
    toggleCarrierStatus, 
    refreshServices,
    loading 
  } = useShippingServices();
  const { toast } = useToast();

  const handleAddCarrier = async () => {
    if (!selectedCarrier) {
      toast({
        title: "Error",
        description: "Please select a carrier",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty credentials
      const filteredCredentials = Object.fromEntries(
        Object.entries(credentials).filter(([_, value]) => value.trim() !== '')
      );

      await addCarrierConfiguration({
        carrier_name: selectedCarrier,
        api_credentials: filteredCredentials,
        settings: {}
      });

      toast({
        title: "Success",
        description: `${selectedCarrier.toUpperCase()} carrier has been added successfully`,
      });

      // Reset form
      setSelectedCarrier('');
      setCredentials({
        api_key: '',
        api_secret: '',
        account_number: '',
        access_key: '',
        password: ''
      });

    } catch (error) {
      console.error('Error adding carrier:', error);
      toast({
        title: "Error",
        description: "Failed to add carrier configuration",
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
        return ['api_key', 'api_secret', 'account_number'];
      case 'fedex':
        return ['api_key', 'api_secret', 'account_number'];
      case 'usps':
        return ['api_key', 'account_number'];
      case 'sendle':
        return ['api_key', 'api_secret'];
      case 'dhl':
        return ['api_key', 'api_secret', 'account_number'];
      default:
        return [];
    }
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'api_key': return 'API Key';
      case 'api_secret': return 'API Secret';
      case 'account_number': return 'Account Number';
      case 'access_key': return 'Access Key';
      case 'password': return 'Password';
      default: return field.replace('_', ' ').toUpperCase();
    }
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
                <Plus className="h-4 w-4" />
                Add New Carrier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {selectedCarrier && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">
                      API credentials for {selectedCarrier.toUpperCase()}
                    </span>
                  </div>
                  
                  {getCredentialFields(selectedCarrier).map(field => (
                    <div key={field}>
                      <Label htmlFor={field}>{getFieldLabel(field)}</Label>
                      <Input
                        id={field}
                        type={field.includes('secret') || field.includes('password') ? 'password' : 'text'}
                        value={credentials[field as keyof typeof credentials]}
                        onChange={(e) => setCredentials(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))}
                        placeholder={`Enter your ${getFieldLabel(field).toLowerCase()}`}
                      />
                    </div>
                  ))}

                  <Button 
                    onClick={handleAddCarrier} 
                    disabled={isSubmitting || loading}
                    className="w-full"
                  >
                    {isSubmitting ? 'Adding...' : `Add ${selectedCarrier.toUpperCase()} Carrier`}
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
                  <div key={carrier.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}