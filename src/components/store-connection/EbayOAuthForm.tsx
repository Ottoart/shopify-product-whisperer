import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Marketplace } from "./types";

interface EbayOAuthFormProps {
  marketplace: Marketplace;
  onBack: () => void;
  onSuccess: (data: any) => void;
}

export function EbayOAuthForm({ marketplace, onBack, onSuccess }: EbayOAuthFormProps) {
  const [storeName, setStoreName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const initiateOAuthFlow = async () => {
    if (!storeName.trim()) {
      toast({
        title: "Store Name Required",
        description: "Please enter a name for your eBay store",
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
          description: "You must be logged in to connect a store",
          variant: "destructive"
        });
        return;
      }

      // Generate a state parameter for security
      const state = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Store the state and store name in session storage for later retrieval
      sessionStorage.setItem('ebay_oauth_state', state);
      sessionStorage.setItem('ebay_store_name', storeName);
      
      // Construct eBay OAuth URL
      const ebayAuthUrl = new URL('https://auth.ebay.com/oauth2/authorize');
      ebayAuthUrl.searchParams.set('client_id', 'YOUR_EBAY_CLIENT_ID'); // This should come from Supabase secrets
      ebayAuthUrl.searchParams.set('response_type', 'code');
      ebayAuthUrl.searchParams.set('redirect_uri', `${window.location.origin}/auth/ebay/callback`);
      ebayAuthUrl.searchParams.set('scope', 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.account');
      ebayAuthUrl.searchParams.set('state', state);

      // Open OAuth flow in a popup window
      const popup = window.open(
        ebayAuthUrl.toString(),
        'ebay-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for the popup to close or for a message from the callback
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          
          // Check if we have a success indicator in session storage
          const authSuccess = sessionStorage.getItem('ebay_auth_success');
          const authError = sessionStorage.getItem('ebay_auth_error');
          
          if (authSuccess) {
            const connectionData = JSON.parse(authSuccess);
            sessionStorage.removeItem('ebay_auth_success');
            sessionStorage.removeItem('ebay_oauth_state');
            sessionStorage.removeItem('ebay_store_name');
            onSuccess(connectionData);
          } else if (authError) {
            const error = JSON.parse(authError);
            sessionStorage.removeItem('ebay_auth_error');
            sessionStorage.removeItem('ebay_oauth_state');
            sessionStorage.removeItem('ebay_store_name');
            toast({
              title: "eBay Connection Failed",
              description: error.message || "Failed to connect to eBay. Please try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Connection Cancelled",
              description: "eBay connection was cancelled or interrupted.",
              variant: "destructive"
            });
          }
        }
      }, 1000);

      // Cleanup if component unmounts
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
          setIsConnecting(false);
        }
      }, 300000); // 5 minutes timeout

    } catch (error: any) {
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to initiate eBay connection",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <img 
            src={marketplace.logo} 
            alt={marketplace.name}
            className="w-16 h-16 rounded-lg"
          />
        </div>
        <h2 className="text-2xl font-bold">🔗 Connect Your eBay Store</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          You'll be redirected to eBay to authorize your store connection. This is secure and only takes a few seconds.
        </p>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-green-600" />
          <span>eBay Verified Integration</span>
        </div>
      </div>

      {/* Store Name Input */}
      <div className="space-y-2">
        <Label htmlFor="store_name">
          Store Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="store_name"
          placeholder="My eBay Store"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          disabled={isConnecting}
        />
        <p className="text-xs text-muted-foreground">
          A friendly name to identify this eBay store in your dashboard
        </p>
      </div>

      {/* Information */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium">What happens next?</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• You'll be redirected to eBay's secure login page</li>
          <li>• Log in with your eBay seller account credentials</li>
          <li>• Authorize our app to access your store data</li>
          <li>• Return here to start syncing your orders and listings</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isConnecting} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <Button
          onClick={initiateOAuthFlow}
          disabled={isConnecting || !storeName.trim()}
          className="gap-2"
        >
          {isConnecting ? (
            "Connecting..."
          ) : (
            <>
              Connect eBay Store
              <ExternalLink className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Help link */}
      <div className="text-center">
        <a 
          href="https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Learn more about eBay integration
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}