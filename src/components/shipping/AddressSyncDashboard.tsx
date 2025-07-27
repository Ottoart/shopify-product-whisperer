import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, CheckCircle2, AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StoreShippingConfig {
  id: string;
  from_address_line1: string;
  from_address_line2?: string;
  from_city: string;
  from_state: string;
  from_zip: string;
  from_country: string;
  updated_at: string;
}

const UPS_REGISTERED_ADDRESS = {
  address_line1: '9200 Park ave',
  address_line2: '301',
  city: 'MONTREAL',
  state: 'QC',
  zip: 'H2N1Z4',
  country: 'CA'
};

export function AddressSyncDashboard() {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [storeConfig, setStoreConfig] = useState<StoreShippingConfig | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStoreConfig();
  }, []);

  const loadStoreConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('store_shipping_configs')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setStoreConfig(data);
    } catch (error) {
      console.error('Error loading store config:', error);
      toast({
        title: "Error",
        description: "Failed to load store configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isAddressMatching = () => {
    if (!storeConfig) return false;
    
    return (
      storeConfig.from_address_line1 === UPS_REGISTERED_ADDRESS.address_line1 &&
      storeConfig.from_address_line2 === UPS_REGISTERED_ADDRESS.address_line2 &&
      storeConfig.from_city === UPS_REGISTERED_ADDRESS.city &&
      storeConfig.from_state === UPS_REGISTERED_ADDRESS.state &&
      storeConfig.from_zip === UPS_REGISTERED_ADDRESS.zip &&
      storeConfig.from_country === UPS_REGISTERED_ADDRESS.country
    );
  };

  const syncToUPSAddress = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-store-shipping-address', {
        body: {
          address: UPS_REGISTERED_ADDRESS
        }
      });

      if (error) throw error;

      toast({
        title: "Address Synchronized",
        description: "Store shipping address now matches your UPS account exactly",
      });

      // Reload the configuration
      await loadStoreConfig();
      
    } catch (error) {
      console.error('Error syncing address:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to synchronize address",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatAddress = (config: StoreShippingConfig) => {
    return [
      config.from_address_line1,
      config.from_address_line2,
      `${config.from_city}, ${config.from_state} ${config.from_zip}`,
      config.from_country
    ].filter(Boolean).join('\n');
  };

  const formatUPSAddress = () => {
    return [
      UPS_REGISTERED_ADDRESS.address_line1,
      UPS_REGISTERED_ADDRESS.address_line2,
      `${UPS_REGISTERED_ADDRESS.city}, ${UPS_REGISTERED_ADDRESS.state} ${UPS_REGISTERED_ADDRESS.zip}`,
      UPS_REGISTERED_ADDRESS.country
    ].filter(Boolean).join('\n');
  };

  const getAddressDifferences = () => {
    if (!storeConfig) return [];
    
    const differences = [];
    
    if (storeConfig.from_address_line1 !== UPS_REGISTERED_ADDRESS.address_line1) {
      differences.push(`Street: "${storeConfig.from_address_line1}" → "${UPS_REGISTERED_ADDRESS.address_line1}"`);
    }
    if (storeConfig.from_address_line2 !== UPS_REGISTERED_ADDRESS.address_line2) {
      differences.push(`Unit: "${storeConfig.from_address_line2 || ''}" → "${UPS_REGISTERED_ADDRESS.address_line2}"`);
    }
    if (storeConfig.from_city !== UPS_REGISTERED_ADDRESS.city) {
      differences.push(`City: "${storeConfig.from_city}" → "${UPS_REGISTERED_ADDRESS.city}"`);
    }
    if (storeConfig.from_state !== UPS_REGISTERED_ADDRESS.state) {
      differences.push(`State: "${storeConfig.from_state}" → "${UPS_REGISTERED_ADDRESS.state}"`);
    }
    if (storeConfig.from_zip !== UPS_REGISTERED_ADDRESS.zip) {
      differences.push(`Postal: "${storeConfig.from_zip}" → "${UPS_REGISTERED_ADDRESS.zip}"`);
    }
    if (storeConfig.from_country !== UPS_REGISTERED_ADDRESS.country) {
      differences.push(`Country: "${storeConfig.from_country}" → "${UPS_REGISTERED_ADDRESS.country}"`);
    }
    
    return differences;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Address Configuration...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const isMatching = isAddressMatching();
  const differences = getAddressDifferences();

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            UPS Address Synchronization
          </CardTitle>
          <CardDescription>
            Ensure your store shipping address exactly matches your UPS account registration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {isMatching ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Address Synchronized
                </Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <Badge variant="destructive">
                  Address Mismatch Detected
                </Badge>
              </>
            )}
          </div>

          {!isMatching && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                UPS requires your ship-from address to exactly match your account registration. 
                Address mismatches are the most common cause of "Invalid Weight" and other UPS API errors.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Address Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Store Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Store Address</CardTitle>
            <CardDescription>
              {storeConfig ? `Last updated: ${new Date(storeConfig.updated_at).toLocaleDateString()}` : 'Not configured'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {storeConfig ? (
              <pre className="text-sm bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                {formatAddress(storeConfig)}
              </pre>
            ) : (
              <p className="text-gray-500 italic">No store address configured</p>
            )}
          </CardContent>
        </Card>

        {/* UPS Registered Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">UPS Registered Address</CardTitle>
            <CardDescription>Your UPS account registration address</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-blue-50 p-3 rounded border whitespace-pre-wrap">
              {formatUPSAddress()}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Differences */}
      {!isMatching && differences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-amber-700">Address Differences</CardTitle>
            <CardDescription>
              The following fields need to be updated to match your UPS account:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {differences.map((diff, index) => (
                <li key={index} className="text-sm">
                  <span className="font-mono bg-amber-50 px-2 py-1 rounded text-amber-800">
                    {diff}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isMatching && (
          <Button 
            onClick={syncToUPSAddress} 
            disabled={syncing}
            className="flex items-center gap-2"
          >
            {syncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            {syncing ? "Synchronizing..." : "Sync to UPS Address"}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={loadStoreConfig}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Why Address Synchronization Matters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>UPS API Validation:</strong> UPS validates that your ship-from address matches your account registration exactly, including capitalization and formatting.
          </div>
          <div>
            <strong>Common Issues:</strong> "Invalid Weight" errors are often caused by address mismatches, not actual weight problems.
          </div>
          <div>
            <strong>Canadian Addresses:</strong> Pay special attention to postal code format (H2N1Z4 vs H2N 1Z4) and province codes (QC vs Quebec).
          </div>
        </CardContent>
      </Card>
    </div>
  );
}