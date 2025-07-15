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
      ebayAuthUrl.searchParams.set('client_id', 'PrepFox-YourEbay-PRD-123456789'); // This should come from Supabase secrets
      ebayAuthUrl.searchParams.set('response_type', 'code');
      ebayAuthUrl.searchParams.set('redirect_uri', `https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/ebay-oauth-callback`);
      ebayAuthUrl.searchParams.set('scope', 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.marketing');
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
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <img 
              src={marketplace.logo} 
              alt={marketplace.name}
              className="w-12 h-12 object-contain filter brightness-0 invert"
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Connect Your eBay Store
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
          Connect your eBay seller account in seconds with our secure OAuth integration. No manual setup required!
        </p>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-3 text-sm bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-700 dark:text-green-400">eBay Verified Integration</span>
          <span className="text-green-600">•</span>
          <span className="text-green-600">Bank-level Security</span>
        </div>
      </div>

      {/* Store Name Input */}
      <div className="space-y-3 bg-muted/30 rounded-lg p-4">
        <Label htmlFor="store_name" className="text-base font-medium">
          Store Display Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="store_name"
          placeholder="e.g., My eBay Store, Electronics Plus, etc."
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          disabled={isConnecting}
          className="text-base"
        />
        <p className="text-sm text-muted-foreground">
          Choose a friendly name to identify this eBay store in your PrepFox dashboard
        </p>
      </div>

      {/* Quick Connect Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          ⚡ Quick Connect Process
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
            <p className="font-medium">Click Connect</p>
            <p className="text-sm text-muted-foreground">Opens eBay login in secure popup</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
            <p className="font-medium">Authorize Access</p>
            <p className="text-sm text-muted-foreground">Login with your eBay seller account</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
            <p className="font-medium">Start Selling</p>
            <p className="text-sm text-muted-foreground">Begin managing orders & listings</p>
          </div>
        </div>
      </div>

      {/* Features you'll get */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-primary flex items-center gap-2">
          🚀 What you'll get after connecting:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Real-time order synchronization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Automated inventory management</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Bulk listing management</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Performance analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Automated repricing tools</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Shipping label generation</span>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
          🔒 Security & Privacy
        </h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• Your login credentials are never stored by PrepFox</li>
          <li>• All data transfers are encrypted with bank-level security</li>
          <li>• You can disconnect anytime from your settings</li>
          <li>• Only authorized API access - no password storage</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={onBack} disabled={isConnecting} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Stores
        </Button>
        
        <Button
          onClick={initiateOAuthFlow}
          disabled={isConnecting || !storeName.trim()}
          size="lg"
          className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </>
          ) : (
            <>
              🚀 Connect eBay Store
              <ExternalLink className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Help and Support */}
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-4 text-sm">
          <a 
            href="https://developer.ebay.com/api-docs/static/oauth-authorization-code-grant.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            📚 Integration Guide
            <ExternalLink className="h-3 w-3" />
          </a>
          <a 
            href="https://developer.ebay.com/support"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            💬 Get Support
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Need help? Our integration guide has step-by-step instructions.
        </p>
      </div>
    </div>
  );
}