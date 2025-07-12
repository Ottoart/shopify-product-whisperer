import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Marketplace {
  id: string;
  name: string;
  platform: string;
  logo: string;
  description: string;
  isPopular?: boolean;
}

interface MarketplaceConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplace: Marketplace | null;
  onBack: () => void;
  onSuccess: () => void;
}

const getConnectionInstructions = (marketplace: Marketplace | null) => {
  if (!marketplace) return null;

  const baseInstructions = {
    "walmart-us": {
      title: "Connect to Walmart US",
      description: "Don't currently have a Walmart Marketplace store?",
      learnMoreUrl: "https://marketplace.walmart.com/apply",
      portalUrl: "https://developer.walmart.com/",
      credentialsUrl: "https://developer.walmart.com/account/api-keys",
      fields: [
        { key: "clientId", label: "Client ID", placeholder: "Enter your Walmart Client ID" },
        { key: "clientSecret", label: "Client Secret", placeholder: "Enter your Walmart Client Secret" }
      ]
    },
    "walmart-ca": {
      title: "Connect to Walmart Canada",
      description: "Don't currently have a Walmart Marketplace store?",
      learnMoreUrl: "https://marketplace.walmart.ca/apply",
      portalUrl: "https://developer.walmart.com/",
      credentialsUrl: "https://developer.walmart.com/account/api-keys",
      fields: [
        { key: "clientId", label: "Client ID", placeholder: "Enter your Walmart Client ID" },
        { key: "clientSecret", label: "Client Secret", placeholder: "Enter your Walmart Client Secret" }
      ]
    },
    "amazon-us": {
      title: "Connect to Amazon US",
      description: "Don't currently have an Amazon Seller account?",
      learnMoreUrl: "https://sellercentral.amazon.com/",
      portalUrl: "https://sellercentral.amazon.com/",
      credentialsUrl: "https://sellercentral.amazon.com/apps/manage",
      fields: [
        { key: "sellerId", label: "Seller ID", placeholder: "Enter your Amazon Seller ID" },
        { key: "accessKey", label: "Access Key", placeholder: "Enter your Amazon MWS Access Key" },
        { key: "secretKey", label: "Secret Key", placeholder: "Enter your Amazon MWS Secret Key" }
      ]
    },
    "amazon-ca": {
      title: "Connect to Amazon Canada",
      description: "Don't currently have an Amazon Seller account?",
      learnMoreUrl: "https://sellercentral.amazon.ca/",
      portalUrl: "https://sellercentral.amazon.ca/",
      credentialsUrl: "https://sellercentral.amazon.ca/apps/manage",
      fields: [
        { key: "sellerId", label: "Seller ID", placeholder: "Enter your Amazon Seller ID" },
        { key: "accessKey", label: "Access Key", placeholder: "Enter your Amazon MWS Access Key" },
        { key: "secretKey", label: "Secret Key", placeholder: "Enter your Amazon MWS Secret Key" }
      ]
    },
    "shopify": {
      title: "Connect to Shopify",
      description: "Don't currently have a Shopify store?",
      learnMoreUrl: "https://www.shopify.com/",
      portalUrl: "https://partners.shopify.com/",
      credentialsUrl: "https://partners.shopify.com/current/api_clients",
      fields: [
        { key: "shopDomain", label: "Shop Domain", placeholder: "yourstore.myshopify.com" },
        { key: "accessToken", label: "Access Token", placeholder: "Enter your Shopify Access Token" }
      ]
    }
  };

  return baseInstructions[marketplace.id as keyof typeof baseInstructions] || {
    title: `Connect to ${marketplace.name}`,
    description: `Set up your ${marketplace.name} integration`,
    learnMoreUrl: "#",
    portalUrl: "#",
    credentialsUrl: "#",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Enter your API Key" },
      { key: "apiSecret", label: "API Secret", placeholder: "Enter your API Secret" }
    ]
  };
};

export function MarketplaceConnectionDialog({ 
  open, 
  onOpenChange, 
  marketplace, 
  onBack, 
  onSuccess 
}: MarketplaceConnectionDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const instructions = getConnectionInstructions(marketplace);

  const handleConnect = async () => {
    if (!marketplace || !instructions) return;

    setIsConnecting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to connect a store",
          variant: "destructive"
        });
        return;
      }

      // Create store configuration
      const storeData = {
        user_id: user.id,
        store_name: credentials.storeName || `${marketplace.name} Store`,
        platform: marketplace.platform,
        domain: credentials.shopDomain || credentials.sellerId || marketplace.name.toLowerCase(),
        access_token: credentials.accessToken || credentials.clientSecret || credentials.secretKey || "",
        is_active: true
      };

      const { error } = await supabase
        .from('store_configurations')
        .insert(storeData);

      if (error) {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Connected Successfully",
        description: `Your ${marketplace.name} store has been connected`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (!marketplace || !instructions) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl">{marketplace.logo}</span>
            {instructions.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {instructions.description}{" "}
              <a 
                href={instructions.learnMoreUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Learn more and apply here
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>

            <div className="space-y-2">
              <p className="font-medium">How to Connect Your {marketplace.name} Store:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>
                  Login to your {marketplace.platform === 'walmart' ? 'Walmart Developer Portal' : 
                    marketplace.platform === 'amazon' ? 'Amazon Seller Central' : 
                    'Developer Portal'}{" "}
                  <a 
                    href={instructions.portalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    here
                  </a>.
                </li>
                <li>
                  Once logged in, you'll be directed to a page where you can generate your API credentials. 
                  If not, head{" "}
                  <a 
                    href={instructions.credentialsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    here
                  </a>.
                </li>
                <li>
                  Copy and paste the credentials from {marketplace.name} into the corresponding fields below then click Connect.
                </li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            {instructions.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.key.toLowerCase().includes('secret') || field.key.toLowerCase().includes('key') ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={credentials[field.key] || ''}
                  onChange={(e) => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !Object.values(credentials).some(v => v.trim())}
              className="gap-2"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}