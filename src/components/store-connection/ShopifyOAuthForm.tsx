import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Marketplace } from "./types";

interface ShopifyOAuthFormProps {
  marketplace: Marketplace;
  onBack: () => void;
  onSuccess: (data: any) => void;
}

export function ShopifyOAuthForm({ marketplace, onBack, onSuccess }: ShopifyOAuthFormProps) {
  const [storeName, setStoreName] = useState("");
  const [shopDomain, setShopDomain] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const initiateOAuthFlow = async () => {
    if (!storeName.trim()) {
      toast({
        title: "Store Name Required",
        description: "Please enter a name for your Shopify store",
        variant: "destructive"
      });
      return;
    }

    if (!shopDomain.trim()) {
      toast({
        title: "Shop Domain Required", 
        description: "Please enter your Shopify store domain",
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

      // Generate a state parameter for security
      const state = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Store the state and store info in session storage for later retrieval
      sessionStorage.setItem('shopify_oauth_state', state);
      sessionStorage.setItem('shopify_store_name', storeName);
      sessionStorage.setItem('shopify_shop_domain', shopDomain);
      
      // Get OAuth URL from backend
      const { data: oauthData, error: oauthError } = await supabase.functions.invoke('shopify-oauth-init', {
        body: { 
          state,
          shopDomain: shopDomain.trim()
        }
      });

      if (oauthError || !oauthData?.oauth_url) {
        throw new Error(oauthError?.message || 'Failed to generate OAuth URL');
      }

      console.log('Generated Shopify OAuth URL');
      console.log('Shop Domain:', oauthData.shop_domain);
      console.log('Redirect URI:', oauthData.redirect_uri);

      // Open OAuth flow in a popup window
      const popup = window.open(
        oauthData.oauth_url,
        'shopify-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for messages from the popup window
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SHOPIFY_AUTH_SUCCESS') {
          console.log('Received success message from popup');
          // Force check for session storage data
          setTimeout(() => {
            const authSuccess = sessionStorage.getItem('shopify_auth_success');
            if (authSuccess) {
              handleAuthSuccess();
            }
          }, 100);
        }
      };

      const handleAuthSuccess = () => {
        const authSuccess = sessionStorage.getItem('shopify_auth_success');
        if (authSuccess) {
          const connectionData = JSON.parse(authSuccess);
          sessionStorage.removeItem('shopify_auth_success');
          sessionStorage.removeItem('shopify_oauth_state');
          sessionStorage.removeItem('shopify_store_name');
          sessionStorage.removeItem('shopify_shop_domain');
          
          // Close popup if still open
          if (!popup.closed) {
            popup.close();
          }
          
          setIsConnecting(false);
          
          toast({
            title: "Shopify Store Connected!",
            description: `Successfully connected ${connectionData.store?.store_name || 'Shopify store'}`,
          });
          
          onSuccess(connectionData);
          return true;
        }
        return false;
      };

      const handleAuthError = () => {
        const authError = sessionStorage.getItem('shopify_auth_error');
        if (authError) {
          const error = JSON.parse(authError);
          sessionStorage.removeItem('shopify_auth_error');
          sessionStorage.removeItem('shopify_oauth_state');
          sessionStorage.removeItem('shopify_store_name');
          sessionStorage.removeItem('shopify_shop_domain');
          
          // Close popup if still open
          if (!popup.closed) {
            popup.close();
          }
          
          setIsConnecting(false);
          toast({
            title: "Shopify Connection Failed",
            description: error.message || "Failed to connect to Shopify. Please try again.",
            variant: "destructive"
          });
          return true;
        }
        return false;
      };

      // Add message listener
      window.addEventListener('message', handleMessage);

      // Listen for the popup to close or for a message from the callback
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          
          // Check if we already handled success/error
          if (handleAuthSuccess() || handleAuthError()) {
            return;
          }
          
          // If no success or error was found, it was cancelled
          setIsConnecting(false);
          // Don't show cancelled message as it's confusing for users
        }
      }, 1000);

      // Cleanup if component unmounts or timeout
      const timeout = setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setIsConnecting(false);
        toast({
          title: "Connection Timeout",
          description: "Shopify connection timed out. Please try again.",
          variant: "destructive"
        });
      }, 300000); // 5 minutes timeout

      // Return cleanup function
      return () => {
        clearInterval(checkClosed);
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        if (!popup.closed) {
          popup.close();
        }
      };

    } catch (error: any) {
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to initiate Shopify connection",
        variant: "destructive"
      });
    }
  };

  const normalizeShopDomain = (domain: string) => {
    let normalized = domain.toLowerCase().trim();
    // Remove protocol if present
    normalized = normalized.replace(/^https?:\/\//, '');
    // Remove trailing path
    normalized = normalized.split('/')[0];
    // Add .myshopify.com if not present
    if (!normalized.endsWith('.myshopify.com')) {
      normalized = `${normalized}.myshopify.com`;
    }
    return normalized;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <img 
              src={marketplace.logo} 
              alt={marketplace.name}
              className="w-12 h-12 object-contain filter brightness-0 invert"
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Connect Your Shopify Store
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto text-lg">
          Connect your Shopify store in seconds with our secure OAuth integration. No manual setup required!
        </p>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-3 text-sm bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-700 dark:text-green-400">Shopify Partner Integration</span>
          <span className="text-green-600">•</span>
          <span className="text-green-600">Bank-level Security</span>
        </div>
      </div>

      {/* Store Information Input */}
      <div className="space-y-4 bg-muted/30 rounded-lg p-4">
        <div className="space-y-3">
          <Label htmlFor="store_name" className="text-base font-medium">
            Store Display Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="store_name"
            placeholder="e.g., My Shopify Store, Fashion Boutique, etc."
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            disabled={isConnecting}
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            Choose a friendly name to identify this Shopify store in your PrepFox dashboard
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="shop_domain" className="text-base font-medium">
            Shop Domain <span className="text-destructive">*</span>
          </Label>
          <Input
            id="shop_domain"
            placeholder="yourstore.myshopify.com"
            value={shopDomain}
            onChange={(e) => setShopDomain(normalizeShopDomain(e.target.value))}
            disabled={isConnecting}
            className="text-base"
          />
          <p className="text-sm text-muted-foreground">
            Your Shopify store domain (we'll add .myshopify.com if needed)
          </p>
        </div>
      </div>

      {/* Quick Connect Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-6 space-y-4">
        <h4 className="font-semibold text-lg flex items-center gap-2">
          ⚡ Quick Connect Process
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
            <p className="font-medium">Click Connect</p>
            <p className="text-sm text-muted-foreground">Opens Shopify login in secure popup</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
            <p className="font-medium">Authorize Access</p>
            <p className="text-sm text-muted-foreground">Login with your Shopify account</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
            <p className="font-medium">Start Managing</p>
            <p className="text-sm text-muted-foreground">Begin syncing products & orders</p>
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
            <span>Product synchronization by brand/type</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Automated inventory management</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Order import and tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Performance analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Bulk product updates</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>AI-powered optimization</span>
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
          disabled={isConnecting || !storeName.trim() || !shopDomain.trim()}
          size="lg"
          className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Connecting...
            </>
          ) : (
            <>
              🚀 Connect Shopify Store
              <ExternalLink className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Help and Support */}
      <div className="text-center space-y-2">
        <div className="flex justify-center gap-4 text-sm">
          <a 
            href="https://help.shopify.com/en/api/getting-started/app-authentication"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            📚 Integration Guide
            <ExternalLink className="h-3 w-3" />
          </a>
          <a 
            href="https://help.shopify.com/"
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