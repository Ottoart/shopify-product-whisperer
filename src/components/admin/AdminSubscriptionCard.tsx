import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Settings, User } from 'lucide-react';
import { SubscriptionBadge } from '@/components/subscription/SubscriptionBadge';
import type { AdminUser, UpdateSubscriptionData } from '@/hooks/useAdminUsers';
import type { SubscriptionData } from '@/hooks/useSubscription';

interface AdminSubscriptionCardProps {
  user: AdminUser;
  subscription: SubscriptionData;
  onUpdate: (data: UpdateSubscriptionData) => void;
  isUpdating?: boolean;
}

const AVAILABLE_PLANS = [
  { id: 'free', name: 'Free', price: '$0' },
  { id: 'starter', name: 'Starter', price: '$29' },
  { id: 'pro', name: 'Pro', price: '$99' },
  { id: 'business', name: 'Business', price: '$299' },
];

export function AdminSubscriptionCard({ 
  user, 
  subscription, 
  onUpdate, 
  isUpdating = false 
}: AdminSubscriptionCardProps) {
  const [entitlements, setEntitlements] = useState(subscription.entitlements);
  const [selectedPlan, setSelectedPlan] = useState(subscription.planName.toLowerCase());
  const [hasChanges, setHasChanges] = useState(false);

  const handleEntitlementToggle = (module: keyof typeof entitlements) => {
    const newEntitlements = { ...entitlements, [module]: !entitlements[module] };
    setEntitlements(newEntitlements);
    setHasChanges(true);
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    const selectedPlanData = AVAILABLE_PLANS.find(p => p.id === selectedPlan);
    
    onUpdate({
      userId: user.id,
      planName: selectedPlanData?.name || subscription.planName,
      entitlements,
    });
    
    setHasChanges(false);
  };

  const handleReset = () => {
    setEntitlements(subscription.entitlements);
    setSelectedPlan(subscription.planName.toLowerCase());
    setHasChanges(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {user.display_name || user.email}
              <Badge variant="outline" className="ml-2">Admin Management</Badge>
            </CardTitle>
            <CardDescription>
              Manage subscription and module access for this user
            </CardDescription>
          </div>
          <SubscriptionBadge status={subscription.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Subscription Info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4" />
            <span>Current Plan: <strong>{subscription.planName}</strong></span>
          </div>
          {subscription.renewalDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                {subscription.isTrial ? 'Trial ends' : 'Renews'}: {subscription.renewalDate}
                {subscription.daysUntilRenewal !== undefined && (
                  <span className="ml-1 text-muted-foreground">
                    ({subscription.daysUntilRenewal} days)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Plan Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Plan Management
          </h4>
          <Select value={selectedPlan} onValueChange={handlePlanChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_PLANS.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{plan.name}</span>
                    <span className="text-muted-foreground">{plan.price}/month</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Module Entitlements */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Module Access Control</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(entitlements).map(([module, enabled]) => (
              <div key={module} className="flex items-center justify-between">
                <label htmlFor={`${module}-toggle`} className="text-sm font-medium cursor-pointer">
                  {module === 'productManagement' ? 'Product Management' : 
                   module.charAt(0).toUpperCase() + module.slice(1)}
                </label>
                <Switch
                  id={`${module}-toggle`}
                  checked={enabled}
                  onCheckedChange={() => handleEntitlementToggle(module as keyof typeof entitlements)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={handleSaveChanges} 
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              onClick={handleReset} 
              variant="outline" 
              disabled={isUpdating}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}