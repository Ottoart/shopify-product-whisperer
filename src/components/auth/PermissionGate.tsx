import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap } from 'lucide-react';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';

interface PermissionGateProps {
  children: ReactNode;
  module: 'shipping' | 'repricing' | 'fulfillment' | 'productManagement';
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function PermissionGate({ 
  children, 
  module, 
  fallback, 
  showUpgrade = true 
}: PermissionGateProps) {
  const { isAdmin } = useAdminAuth();
  const { data: subscription, isLoading } = useSubscription();

  // Admins can access everything
  if (isAdmin) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Check if user has access to this module
  const hasAccess = subscription?.entitlements?.[module] === true;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Return custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgrade) {
    return <UpgradePrompt module={module} subscription={subscription} />;
  }

  // No access and no upgrade prompt
  return null;
}

interface UpgradePromptProps {
  module: string;
  subscription?: any;
}

function UpgradePrompt({ module, subscription }: UpgradePromptProps) {
  const moduleNames = {
    shipping: 'Shipping',
    repricing: 'Repricing',
    fulfillment: 'Fulfillment',
    productManagement: 'Product Management',
  };

  const moduleName = moduleNames[module as keyof typeof moduleNames] || module;

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/billing-create-portal');
      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Upgrade Required</CardTitle>
          <CardDescription>
            Access to {moduleName} requires a paid subscription
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {subscription && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Current plan:</span>
              <SubscriptionBadge status={subscription.status} />
              <span className="font-medium">{subscription.planName}</span>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Unlock {moduleName} and other powerful features with a subscription.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">What you'll get:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Full {moduleName} access</li>
                <li>✅ Advanced analytics and reporting</li>
                <li>✅ Priority customer support</li>
                <li>✅ API access and integrations</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleUpgrade} className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}