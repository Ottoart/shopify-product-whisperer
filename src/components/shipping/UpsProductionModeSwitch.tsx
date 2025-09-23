import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Settings, AlertTriangle, CheckCircle } from "lucide-react";

export function UpsProductionModeSwitch() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [environment, setEnvironment] = useState<"sandbox" | "production">("production");
  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "",
    accountNumber: ""
  });

  const fetchCurrentConfig = async () => {
    try {
      const { data: carriers, error } = await supabase
        .from('carrier_configurations')
        .select('*')
        .eq('carrier_name', 'UPS')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      setCurrentConfig(carriers);
      if (carriers?.api_credentials && typeof carriers.api_credentials === 'object') {
        const creds = carriers.api_credentials as any;
        setEnvironment(creds.environment || "sandbox");
        setCredentials({
          clientId: creds.client_id || "",
          clientSecret: "",
          accountNumber: carriers.account_number || ""
        });
      }
    } catch (error: any) {
      console.error('Error fetching UPS config:', error);
      toast({
        title: "Error",
        description: "Failed to fetch current UPS configuration",
        variant: "destructive"
      });
    }
  };

  const updateUpsEnvironment = async () => {
    if (!credentials.clientId || !credentials.clientSecret || !credentials.accountNumber) {
      toast({
        title: "Missing Credentials",
        description: "Please fill in all production credentials",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Update the carrier configuration with production settings
      const { error: updateError } = await supabase
        .from('carrier_configurations')
        .update({
          api_credentials: {
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            environment: environment
          },
          account_number: credentials.accountNumber,
          updated_at: new Date().toISOString()
        })
        .eq('carrier_name', 'UPS')
        .eq('is_active', true);

      if (updateError) throw updateError;

      // Clear any existing access tokens since we're switching environments
      const { error: tokenError } = await supabase.functions.invoke('clear-ups-token');
      if (tokenError) {
        console.warn('Failed to clear UPS token:', tokenError);
      }

      toast({
        title: "UPS Configuration Updated",
        description: `Successfully switched to ${environment} environment`,
      });

      // Refresh the current config
      await fetchCurrentConfig();

    } catch (error: any) {
      console.error('Error updating UPS config:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update UPS configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentConfig();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          UPS Production Mode Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        {currentConfig && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Current Environment:</span>
              <Badge variant={
                currentConfig.api_credentials && 
                typeof currentConfig.api_credentials === 'object' && 
                (currentConfig.api_credentials as any).environment === 'production' ? 'default' : 'secondary'
              }>
                {currentConfig.api_credentials && typeof currentConfig.api_credentials === 'object' 
                  ? (currentConfig.api_credentials as any).environment || 'sandbox'
                  : 'sandbox'
                }
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Account: {currentConfig.account_number || 'Not set'}
            </div>
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Production credentials are different from sandbox credentials. 
            Make sure you have your UPS production API credentials ready before switching.
          </AlertDescription>
        </Alert>

        {/* Environment Selection */}
        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Select value={environment} onValueChange={(value: "sandbox" | "production") => setEnvironment(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
              <SelectItem value="production">Production (Live)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Production Credentials Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Production Client ID</Label>
            <Input
              id="clientId"
              value={credentials.clientId}
              onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
              placeholder="Enter your UPS production client ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">Production Client Secret</Label>
            <Input
              id="clientSecret"
              type="password"
              value={credentials.clientSecret}
              onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
              placeholder="Enter your UPS production client secret"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">UPS Account Number</Label>
            <Input
              id="accountNumber"
              value={credentials.accountNumber}
              onChange={(e) => setCredentials(prev => ({ ...prev, accountNumber: e.target.value }))}
              placeholder="Enter your UPS account number"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={updateUpsEnvironment} disabled={loading}>
            {loading ? "Updating..." : `Switch to ${environment} Mode`}
          </Button>
          <Button variant="outline" onClick={fetchCurrentConfig}>
            Refresh Status
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Need production credentials?</strong></p>
          <p>• Log into your UPS Developer Portal</p>
          <p>• Create a production application</p>
          <p>• Get your production Client ID and Secret</p>
          <p>• Make sure your application has the required API permissions</p>
        </div>
      </CardContent>
    </Card>
  );
}