import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionBadge } from './SubscriptionBadge';
import { Calendar, CreditCard, Settings, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionData } from '@/hooks/useSubscription';

interface SubscriptionSummaryProps {
  subscription: SubscriptionData;
  userId?: string;
  isAdmin?: boolean;
}

export function SubscriptionSummary({ subscription, userId, isAdmin }: SubscriptionSummaryProps) {
  const { toast } = useToast();
  const { planName, renewalDate, entitlements, status, daysUntilRenewal } = subscription;

  const handleManageBilling = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('billing-create-portal', {
        body: userId && isAdmin ? { userId } : {}
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive"
      });
    }
  };

  const enabledModules = Object.entries(entitlements)
    .filter(([_, enabled]) => enabled)
    .map(([module, _]) => module);

  const disabledModules = Object.entries(entitlements)
    .filter(([_, enabled]) => !enabled)
    .map(([module, _]) => module);

  const formatModuleName = (module: string) => {
    switch (module) {
      case 'productManagement':
        return 'Product Management';
      default:
        return module.charAt(0).toUpperCase() + module.slice(1);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              {planName} Plan
              {isAdmin && userId && (
                <Badge variant="outline" className="ml-2">Admin View</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your current subscription and entitlements
            </CardDescription>
          </div>
          <SubscriptionBadge status={status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Renewal Information */}
        {renewalDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {status === 'trial' ? 'Trial ends' : 'Renews'}: {renewalDate}
              {daysUntilRenewal !== undefined && (
                <span className="ml-1">
                  ({daysUntilRenewal} days)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Module Entitlements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Module Access</h4>
          
          {enabledModules.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Included in your plan:</p>
              <div className="flex flex-wrap gap-2">
                {enabledModules.map(module => (
                  <Badge key={module} variant="secondary" className="text-xs">
                    ✅ {formatModuleName(module)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {disabledModules.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {status === 'upgrade' ? 'Upgrade to unlock:' : 'Not included:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {disabledModules.map(module => (
                  <Badge key={module} variant="outline" className="text-xs opacity-60">
                    ❌ {formatModuleName(module)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {!isAdmin && (
            <Button onClick={handleManageBilling} variant="outline" size="sm" className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
          )}
          
          {isAdmin && (
            <Button onClick={handleManageBilling} variant="outline" size="sm" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Admin: Manage User Billing
            </Button>
          )}

          {(status === 'upgrade' || status === 'trial') && !isAdmin && (
            <Button onClick={handleManageBilling} size="sm" className="flex-1">
              <Zap className="h-4 w-4 mr-2" />
              {status === 'trial' ? 'Upgrade Now' : 'Start Trial'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}