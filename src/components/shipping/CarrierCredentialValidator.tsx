import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Shield,
  RefreshCw,
  TestTube,
  Key,
  Truck,
  WifiOff,
  Wifi
} from "lucide-react";

interface CarrierConfig {
  id: string;
  carrier_name: string;
  account_number: string | null;
  api_credentials: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ValidationResult {
  carrier: string;
  status: 'validating' | 'valid' | 'invalid' | 'error';
  message: string;
  details?: any;
  lastChecked?: string;
}

export const CarrierCredentialValidator = () => {
  const [carriers, setCarriers] = useState<CarrierConfig[]>([]);
  const [validationResults, setValidationResults] = useState<{ [key: string]: ValidationResult }>({});
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState<{ [key: string]: boolean }>({});

  const fetchCarriers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('carrier_configurations')
        .select('*')
        .eq('is_active', true)
        .order('carrier_name');

      if (error) throw error;
      setCarriers(data || []);
    } catch (error) {
      console.error('Error fetching carriers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch carrier configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateUPSCredentials = async (config: CarrierConfig): Promise<ValidationResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-ups-credentials');
      
      if (error) {
        return {
          carrier: 'UPS',
          status: 'error',
          message: `API Error: ${error.message}`,
          lastChecked: new Date().toISOString()
        };
      }

      if (data?.success) {
        const message = data?.api?.success 
          ? `✅ Full validation successful. Account: ${data.accountNumber}. Environment: ${data.environment}`
          : `✅ OAuth validation successful. Account: ${data.accountNumber}. Environment: ${data.environment}. ${data?.api?.note || ''}`;
        
        return {
          carrier: 'UPS',
          status: 'valid',
          message,
          details: data,
          lastChecked: new Date().toISOString()
        };
      } else {
        // Handle specific UPS error codes
        let errorMessage = 'Authentication failed';
        let errorDetails = '';
        
        // Check OAuth errors
        if (data?.oauth?.success === false) {
          errorMessage = 'OAuth authentication failed';
          errorDetails = data?.oauth?.details?.error_description || data?.oauth?.details?.error || '';
        }
        // Check API errors
        else if (data?.api?.success === false) {
          errorMessage = 'API validation failed';
          const apiErrors = data?.api?.response?.response?.errors;
          if (apiErrors && apiErrors.length > 0) {
            const firstError = apiErrors[0];
            errorDetails = `${firstError.code}: ${firstError.message}`;
          }
        }
        // Generic error
        else {
          errorMessage = data?.error || 'UPS validation failed';
          errorDetails = data?.details || '';
        }
        
        const fullMessage = errorDetails ? `${errorMessage} - ${errorDetails}` : errorMessage;
        
        return {
          carrier: 'UPS',
          status: 'invalid',
          message: fullMessage,
          details: data,
          lastChecked: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        carrier: 'UPS',
        status: 'error',
        message: `Validation failed: ${(error as Error).message}`,
        lastChecked: new Date().toISOString()
      };
    }
  };

  const testOAuthFlow = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-ups-oauth-flow');
      
      if (error) {
        toast({
          title: "OAuth Test Failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('OAuth Flow Test Results:', data);
      
      // Check which environment worked
      const workingEnvironments = data.results?.filter((result: any) => result.success) || [];
      const failedEnvironments = data.results?.filter((result: any) => !result.success) || [];
      
      if (workingEnvironments.length > 0) {
        // Use sandbox as default if both work, otherwise use the working one
        const preferredEnvironment = workingEnvironments.find((env: any) => env.environment === 'sandbox') || workingEnvironments[0];
        
        toast({
          title: "OAuth Test Results",
          description: `✅ Working: ${workingEnvironments.map((e: any) => e.environment).join(', ')}. Using ${preferredEnvironment.environment}.`,
        });
        
        // Auto-update the carrier configuration with the working environment
        await updateCarrierEnvironment(preferredEnvironment.environment);
      } else {
        toast({
          title: "OAuth Test Failed",
          description: "Neither sandbox nor production environments worked. Check your credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('OAuth test error:', error);
      toast({
        title: "Test Failed",
        description: `OAuth test failed: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const updateCarrierEnvironment = async (environment: string) => {
    try {
      const upsCarrier = carriers.find(c => c.carrier_name === 'UPS');
      if (!upsCarrier) return;

      const updatedCredentials = {
        ...upsCarrier.api_credentials,
        environment: environment
      };

      const { error } = await supabase
        .from('carrier_configurations')
        .update({ 
          api_credentials: updatedCredentials,
          updated_at: new Date().toISOString()
        })
        .eq('id', upsCarrier.id);

      if (error) throw error;

      toast({
        title: "Environment Updated",
        description: `UPS carrier configuration updated to use ${environment} environment`,
      });

      // Refresh carriers list to show updated data
      await fetchCarriers();
      
      // Clear any existing validation results to force fresh test
      setValidationResults({});
      
    } catch (error) {
      console.error('Failed to update environment:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update carrier environment setting",
        variant: "destructive",
      });
    }
  };

  const clearUPSToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('clear-ups-token');
      
      if (error) {
        toast({
          title: "Clear Token Failed",
          description: `Error: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Token Cleared",
        description: "UPS token cleared. Test credentials again to get a fresh token.",
      });

      // Refresh carriers list and clear validation results
      await fetchCarriers();
      setValidationResults({});
      
    } catch (error) {
      console.error('Clear token error:', error);
      toast({
        title: "Clear Failed",
        description: `Failed to clear token: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const validateFedExCredentials = async (config: CarrierConfig): Promise<ValidationResult> => {
    // Placeholder for FedEx validation
    return {
      carrier: 'FedEx',
      status: 'error',
      message: 'FedEx validation not implemented yet',
      lastChecked: new Date().toISOString()
    };
  };

  const validateUSPSCredentials = async (config: CarrierConfig): Promise<ValidationResult> => {
    // Placeholder for USPS validation
    return {
      carrier: 'USPS',
      status: 'error',
      message: 'USPS validation not implemented yet',
      lastChecked: new Date().toISOString()
    };
  };

  const validateCredentials = async (config: CarrierConfig) => {
    const carrierId = config.id;
    setValidating(prev => ({ ...prev, [carrierId]: true }));
    
    // Set initial validating state
    setValidationResults(prev => ({
      ...prev,
      [carrierId]: {
        carrier: config.carrier_name,
        status: 'validating',
        message: 'Validating credentials...'
      }
    }));

    let result: ValidationResult;

    switch (config.carrier_name.toUpperCase()) {
      case 'UPS':
        result = await validateUPSCredentials(config);
        break;
      case 'FEDEX':
        result = await validateFedExCredentials(config);
        break;
      case 'USPS':
        result = await validateUSPSCredentials(config);
        break;
      default:
        result = {
          carrier: config.carrier_name,
          status: 'error',
          message: 'Unsupported carrier for validation',
          lastChecked: new Date().toISOString()
        };
    }

    setValidationResults(prev => ({ ...prev, [carrierId]: result }));
    setValidating(prev => ({ ...prev, [carrierId]: false }));

    // Show toast notification
    toast({
      title: `${config.carrier_name} Validation`,
      description: result.message,
      variant: result.status === 'valid' ? 'default' : 'destructive',
    });
  };

  const validateAllCredentials = async () => {
    for (const carrier of carriers) {
      await validateCredentials(carrier);
      // Small delay between validations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const getStatusIcon = (result?: ValidationResult, isValidating?: boolean) => {
    if (isValidating) {
      return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
    
    if (!result) {
      return <Shield className="h-4 w-4 text-gray-400" />;
    }

    switch (result.status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'validating':
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Shield className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (result?: ValidationResult, isValidating?: boolean) => {
    if (isValidating) {
      return <Badge variant="secondary">Validating...</Badge>;
    }
    
    if (!result) {
      return <Badge variant="outline">Not Tested</Badge>;
    }

    switch (result.status) {
      case 'valid':
        return <Badge variant="default" className="bg-green-500">Valid</Badge>;
      case 'invalid':
        return <Badge variant="destructive">Invalid</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-orange-500">Error</Badge>;
      case 'validating':
        return <Badge variant="secondary">Validating...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const hasCredentials = (config: CarrierConfig) => {
    const creds = config.api_credentials;
    if (!creds) return false;
    
    switch (config.carrier_name.toUpperCase()) {
      case 'UPS':
        return Boolean(creds.client_id && creds.client_secret && creds.access_token);
      case 'FEDEX':
        return Boolean(creds.client_id && creds.client_secret);
      case 'USPS':
        return Boolean(creds.user_id && creds.password);
      case 'CANADA POST':
        // For system/managed Canada Post, credentials are always available
        if (creds.system_carrier || creds.managed_by_prepfox) {
          return true;
        }
        // For user-provided Canada Post credentials
        return Boolean(creds.apiKey && creds.apiSecret);
      default:
        return false;
    }
  };

  const getOverallProgress = () => {
    const totalCarriers = carriers.length;
    const validatedCarriers = Object.values(validationResults).filter(r => r.status !== 'validating').length;
    return totalCarriers > 0 ? (validatedCarriers / totalCarriers) * 100 : 0;
  };

  const setupUPSCredentials = async () => {
    try {
      // Find UPS configuration if it exists
      let upsConfig = carriers.find(c => c.carrier_name === 'UPS');
      
      // Create a form instead of using window.prompt for better UX
      const form = document.createElement('form');
      form.innerHTML = `
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">UPS Client ID</label>
          <input type="text" id="upsClientId" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">UPS Client Secret</label>
          <input type="password" id="upsClientSecret" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: bold;">UPS Account Number</label>
          <input type="text" id="upsAccountNumber" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" required>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px;">
            <input type="checkbox" id="upsProduction" style="margin-right: 8px;"> 
            Use Production Environment (unchecked = sandbox)
          </label>
        </div>
      `;
      
      // Pre-fill with existing values if available
      if (upsConfig) {
        const creds = upsConfig.api_credentials;
        const clientIdInput = form.querySelector('#upsClientId') as HTMLInputElement;
        const clientSecretInput = form.querySelector('#upsClientSecret') as HTMLInputElement;
        const accountNumberInput = form.querySelector('#upsAccountNumber') as HTMLInputElement;
        const productionCheckbox = form.querySelector('#upsProduction') as HTMLInputElement;
        
        if (clientIdInput && creds.client_id) clientIdInput.value = creds.client_id;
        if (accountNumberInput && upsConfig.account_number) accountNumberInput.value = upsConfig.account_number;
        if (productionCheckbox && creds.environment) productionCheckbox.checked = creds.environment === 'production';
      }
      
      // Use a dialog or custom modal solution
      const result = await new Promise<{
        clientId: string; 
        clientSecret: string; 
        accountNumber: string;
        isProduction: boolean;
      } | null>((resolve) => {
        // Create custom modal
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '9999';
        
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = 'white';
        modalContent.style.padding = '24px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.width = '400px';
        modalContent.style.maxWidth = '90%';
        
        const title = document.createElement('h3');
        title.textContent = 'UPS Credentials';
        title.style.marginTop = '0';
        title.style.marginBottom = '16px';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '8px';
        buttonContainer.style.marginTop = '16px';
        
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '8px 16px';
        cancelButton.style.border = '1px solid #ccc';
        cancelButton.style.borderRadius = '4px';
        cancelButton.style.backgroundColor = '#f1f1f1';
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Credentials';
        saveButton.style.padding = '8px 16px';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '4px';
        saveButton.style.backgroundColor = '#0284c7';
        saveButton.style.color = 'white';
        
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(saveButton);
        
        modalContent.appendChild(title);
        modalContent.appendChild(form);
        modalContent.appendChild(buttonContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Handle button clicks
        cancelButton.addEventListener('click', () => {
          document.body.removeChild(modal);
          resolve(null);
        });
        
        saveButton.addEventListener('click', () => {
          const clientIdInput = form.querySelector('#upsClientId') as HTMLInputElement;
          const clientSecretInput = form.querySelector('#upsClientSecret') as HTMLInputElement;
          const accountNumberInput = form.querySelector('#upsAccountNumber') as HTMLInputElement;
          const productionCheckbox = form.querySelector('#upsProduction') as HTMLInputElement;
          
          const clientId = clientIdInput?.value;
          const clientSecret = clientSecretInput?.value;
          const accountNumber = accountNumberInput?.value;
          const isProduction = productionCheckbox?.checked || false;
          
          if (!clientId || !clientSecret || !accountNumber) {
            alert('All fields are required');
            return;
          }
          
          document.body.removeChild(modal);
          resolve({
            clientId,
            clientSecret,
            accountNumber,
            isProduction
          });
        });
      });
      
      if (!result) return; // User cancelled
      
      // Prepare credentials object
      const credentials = {
        client_id: result.clientId,
        client_secret: result.clientSecret,
        environment: result.isProduction ? 'production' : 'sandbox',
        access_token: null,
        token_expires_at: '2024-01-01T00:00:00.000Z' // Expired to force refresh
      };
      
      if (upsConfig) {
        // Update existing configuration
        const { error } = await supabase
          .from('carrier_configurations')
          .update({ 
            api_credentials: credentials,
            account_number: result.accountNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', upsConfig.id);
          
        if (error) throw error;
      } else {
        // Create new configuration
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          throw new Error('User not authenticated');
        }
        
        const { error } = await supabase
          .from('carrier_configurations')
          .insert({
            carrier_name: 'UPS',
            api_credentials: credentials,
            account_number: result.accountNumber,
            is_active: true,
            settings: {},
            pickup_type_code: '01',
            default_package_type: '02',
            user_id: userData.user.id
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "UPS Credentials Saved",
        description: "Your UPS credentials have been saved. Test them now to generate a token.",
      });
      
      // Refresh carriers to show the new configuration
      await fetchCarriers();
      
    } catch (error) {
      console.error('Error setting up UPS credentials:', error);
      toast({
        title: "Error",
        description: `Failed to save UPS credentials: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Carrier Credential Validation</h2>
          <p className="text-muted-foreground">
            Test and verify carrier API credentials and configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={setupUPSCredentials}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            <Key className="h-4 w-4" />
            Setup UPS Credentials
          </Button>
          <Button
            onClick={testOAuthFlow}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Test OAuth Flow
          </Button>
          <Button
            onClick={clearUPSToken}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Clear UPS Token
          </Button>
          <Button onClick={fetchCarriers} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={validateAllCredentials} 
            disabled={carriers.length === 0 || Object.values(validating).some(v => v)}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test All
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      {Object.keys(validationResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Validation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(getOverallProgress())}%</span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carrier Cards */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : carriers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No carrier configurations found</p>
            </CardContent>
          </Card>
        ) : (
          carriers.map((carrier) => {
            const result = validationResults[carrier.id];
            const isValidating = validating[carrier.id];
            const credentialsPresent = hasCredentials(carrier);
            
            return (
              <Card key={carrier.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-lg">{carrier.carrier_name}</CardTitle>
                        <CardDescription>
                          Account: {carrier.account_number || 'Not configured'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result, isValidating)}
                      {getStatusBadge(result, isValidating)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Credential Status */}
                  <div className="flex items-center gap-2 text-sm">
                    {credentialsPresent ? (
                      <>
                        <Wifi className="h-4 w-4 text-green-500" />
                        <span className="text-green-700">Credentials configured</span>
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 text-red-500" />
                        <span className="text-red-700">Missing credentials</span>
                      </>
                    )}
                  </div>

                  {/* Validation Result */}
                  {result && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Status:</strong> {result.message}
                        {result.lastChecked && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last checked: {new Date(result.lastChecked).toLocaleString()}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => validateCredentials(carrier)}
                    disabled={isValidating || !credentialsPresent}
                    size="sm"
                    className="w-full"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isValidating ? 'Validating...' : 'Test Credentials'}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};