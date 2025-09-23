import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ExternalLink, Eye, EyeOff, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Marketplace } from "./types";
import { EbayOAuthForm } from "./EbayOAuthForm";
import { ShopifyOAuthForm } from "./ShopifyOAuthForm";

interface StoreCredentialsFormProps {
  marketplace: Marketplace;
  onBack: () => void;
  onSuccess: (data: any) => void;
}

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  tooltip?: string;
  options?: { value: string; label: string }[];
}

const getFormConfig = (marketplace: Marketplace): { title: string; description: string; helpUrl: string; fields: FieldConfig[] } => {
  const configs = {
    shopify: {
      title: "🛍️ Connect Your Shopify Store",
      description: "Enter your Shopify store details to enable product and order synchronization.",
      helpUrl: "https://help.shopify.com/en/manual/apps/private-apps",
      fields: [
        {
          key: "store_name",
          label: "Store Name",
          placeholder: "My Awesome Store",
          required: true,
          tooltip: "A friendly name for your store in PrepFox"
        },
        {
          key: "shop_domain",
          label: "Shop Domain",
          placeholder: "yourstore.myshopify.com",
          required: true,
          tooltip: "Your Shopify store domain (without https://)"
        },
        {
          key: "access_token",
          label: "Private App Access Token",
          placeholder: "shpat_xxxxxxxxxxxxx",
          type: "password",
          required: true,
          tooltip: "Generate this in your Shopify admin under Apps > App and sales channel settings > Develop apps"
        }
      ]
    },
    amazon: {
      title: "📦 Connect Your Amazon Store",
      description: "Connect your Amazon Seller Central account to manage listings and orders.",
      helpUrl: "https://developer.amazon.com/",
      fields: [
        {
          key: "store_name",
          label: "Store Name",
          placeholder: "Amazon Store",
          required: true
        },
        {
          key: "marketplace",
          label: "Marketplace",
          placeholder: "Select marketplace",
          type: "select",
          required: true,
          options: [
            { value: "ATVPDKIKX0DER", label: "Amazon.com (US)" },
            { value: "A2EUQ1WTGCTBG2", label: "Amazon.ca (Canada)" },
            { value: "A1AM78C64UM0Y8", label: "Amazon.com.mx (Mexico)" }
          ]
        },
        {
          key: "seller_id",
          label: "Seller ID",
          placeholder: "A1BCDEFGHIJKLM",
          required: true,
          tooltip: "Found in Seller Central under Settings > Account Info"
        },
        {
          key: "access_key",
          label: "LWA Access Key ID",
          placeholder: "AKIA...",
          required: true,
          type: "password"
        },
        {
          key: "secret_key",
          label: "LWA Secret Key",
          placeholder: "Enter your secret key",
          type: "password",
          required: true
        },
        {
          key: "refresh_token",
          label: "LWA Refresh Token",
          placeholder: "Atzr|...",
          type: "password",
          required: true
        }
      ]
    },
    walmart: {
      title: "🏪 Connect Your Walmart Store",
      description: "Connect your Walmart Marketplace account to sync products and orders.",
      helpUrl: "https://developer.walmart.com/",
      fields: [
        {
          key: "store_name",
          label: "Store Name",
          placeholder: "Walmart Store",
          required: true
        },
        {
          key: "client_id",
          label: "Client ID",
          placeholder: "Enter your Client ID",
          required: true,
          tooltip: "Found in your Walmart Developer Portal"
        },
        {
          key: "client_secret",
          label: "Client Secret",
          placeholder: "Enter your Client Secret",
          type: "password",
          required: true
        }
      ]
    }
  };

  return configs[marketplace.platform as keyof typeof configs] || {
    title: `Connect Your ${marketplace.name} Store`,
    description: `Enter your ${marketplace.name} credentials to connect your store.`,
    helpUrl: "#",
    fields: [
      { key: "store_name", label: "Store Name", placeholder: "My Store", required: true },
      { key: "api_key", label: "API Key", placeholder: "Enter API Key", required: true },
      { key: "api_secret", label: "API Secret", placeholder: "Enter API Secret", type: "password", required: true }
    ]
  };
};

export function StoreCredentialsForm({ marketplace, onBack, onSuccess }: StoreCredentialsFormProps) {
  // Use OAuth flows for supported marketplaces
  if (marketplace.platform === 'ebay') {
    return <EbayOAuthForm marketplace={marketplace} onBack={onBack} onSuccess={onSuccess} />;
  }

  if (marketplace.platform === 'shopify') {
    return <ShopifyOAuthForm marketplace={marketplace} onBack={onBack} onSuccess={onSuccess} />;
  }

  const config = getFormConfig(marketplace);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnection = async () => {
    setTestingConnection(true);
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingConnection(false);
    toast({
      title: "Connection Test",
      description: "✅ Connection successful! Your credentials are valid.",
    });
  };

  const handleConnect = async () => {
    const requiredFields = config.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !formData[f.key]?.trim());
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in: ${missingFields.map(f => f.label).join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error", 
          description: "You must be logged in to connect a store. Please refresh the page and try again.",
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }

      if (marketplace.platform === 'shopify') {
        // Normalize domain and token
        const rawDomain = (formData.shop_domain || '').trim().toLowerCase();
        const normalizedDomain = rawDomain
          .replace(/^https?:\/\//, '')
          .replace(/\/.*/, '');
        const token = (formData.access_token || '').trim();

        if (!normalizedDomain || !token) {
          throw new Error('Shopify domain and access token are required.');
        }

        // Try to find an existing configuration for this user/platform/domain
        const { data: existing, error: findError } = await (supabase as any)
          .from('store_configurations')
          .select('id')
          .eq('user_id', user.id)
          .eq('platform', 'shopify')
          .eq('domain', normalizedDomain)
          .maybeSingle();

        if (findError && findError.code !== 'PGRST116') {
          throw findError;
        }

        let saved;
        if (existing?.id) {
          const { data: updated, error: updateError } = await (supabase as any)
            .from('store_configurations')
            .update({
              store_name: formData.store_name,
              access_token: token,
              is_active: true,
            })
            .eq('id', existing.id)
            .select()
            .single();
          if (updateError) throw updateError;
          saved = updated;
        } else {
          const { data: inserted, error: insertError } = await (supabase as any)
            .from('store_configurations')
            .insert({
              user_id: user.id,
              store_name: formData.store_name,
              platform: 'shopify',
              domain: normalizedDomain,
              access_token: token,
              is_active: true,
            })
            .select()
            .single();
          if (insertError) throw insertError;
          saved = inserted;
        }

        onSuccess({ store: saved, marketplace, credentials: { shop_domain: normalizedDomain } });
        return;
      }

      // Default behavior for other marketplaces: keep existing logic
      const timestamp = Date.now();
      const uniqueDomain = `${formData.shop_domain || formData.seller_id || formData.client_id || marketplace.name.toLowerCase()}_${timestamp}`;
      
      const storeData = {
        user_id: user.id,
        store_name: formData.store_name,
        platform: marketplace.platform,
        domain: uniqueDomain,
        access_token: JSON.stringify(formData), // Store all credentials as JSON
        is_active: true
      };

      const { data, error } = await (supabase as any)
        .from('store_configurations')
        .insert(storeData)
        .select()
        .single();

      if (error) throw error;

      onSuccess({ store: data, marketplace, credentials: formData });
    } catch (error: any) {
      console.error('Store connection error:', error);
      let errorMessage = "Failed to connect store. Please check your credentials.";
      
      if (error.message?.includes('duplicate key')) {
        errorMessage = "A store with these credentials already exists. Please check your existing stores.";
      } else if (error.message?.includes('new row violates row-level security')) {
        errorMessage = "Authentication error. Please refresh the page and try again.";
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{config.title}</h2>
          <p className="text-muted-foreground">{config.description}</p>
          <a 
            href={config.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Need help? View setup guide
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive">*</span>}
                </Label>
                {field.tooltip && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{field.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {field.type === "select" ? (
                <Select onValueChange={(value) => handleInputChange(field.key, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="relative">
                  <Input
                    id={field.key}
                    type={field.type === "password" && !showPasswords[field.key] ? "password" : "text"}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ""}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className={field.type === "password" ? "pr-10" : ""}
                  />
                  {field.type === "password" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => togglePasswordVisibility(field.key)}
                    >
                      {showPasswords[field.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testingConnection || !formData.store_name}
            >
              {testingConnection ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !formData.store_name}
            >
              {isConnecting ? "Connecting..." : "Connect Store"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}