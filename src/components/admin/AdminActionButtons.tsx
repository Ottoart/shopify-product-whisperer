import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUp, 
  ArrowDown, 
  X, 
  Clock, 
  CreditCard,
  ExternalLink
} from 'lucide-react';
import type { SubscriptionActionData } from '@/hooks/useAdminUsers';
import type { SubscriptionData } from '@/hooks/useSubscription';

interface AdminActionButtonsProps {
  userId: string;
  subscription: SubscriptionData;
  onAction: (data: SubscriptionActionData) => void;
  isProcessing?: boolean;
}

const UPGRADE_PLANS = [
  { id: 'starter', name: 'Starter', price: '$29' },
  { id: 'pro', name: 'Pro', price: '$99' },
  { id: 'business', name: 'Business', price: '$299' },
];

export function AdminActionButtons({ 
  userId, 
  subscription, 
  onAction, 
  isProcessing = false 
}: AdminActionButtonsProps) {
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState('');

  const actions = [
    {
      id: 'upgrade',
      label: 'Upgrade Plan',
      description: 'Upgrade user to a higher tier plan',
      icon: ArrowUp,
      variant: 'default' as const,
      requiresPlan: true,
      disabled: subscription.planName === 'Business',
    },
    {
      id: 'downgrade',
      label: 'Downgrade Plan',
      description: 'Downgrade user to a lower tier plan',
      icon: ArrowDown,
      variant: 'outline' as const,
      requiresPlan: false,
      disabled: subscription.planName === 'Free',
    },
    {
      id: 'extend_trial',
      label: 'Extend Trial',
      description: 'Extend trial period by 14 days',
      icon: Clock,
      variant: 'outline' as const,
      requiresPlan: false,
      disabled: !subscription.isTrial,
    },
    {
      id: 'cancel',
      label: 'Cancel Subscription',
      description: 'Cancel active subscription (user keeps access until period end)',
      icon: X,
      variant: 'destructive' as const,
      requiresPlan: false,
      disabled: !subscription.isActive,
    },
  ];

  const handleAction = (actionId: string) => {
    const actionData: SubscriptionActionData = {
      userId,
      action: actionId as SubscriptionActionData['action'],
    };

    if (actionId === 'upgrade' && selectedUpgradePlan) {
      actionData.planId = selectedUpgradePlan;
    }

    onAction(actionData);
  };

  const handleBillingPortal = async () => {
    try {
      const response = await fetch('/api/billing-create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Subscription Actions</h4>
        <Badge variant="outline">
          Current: {subscription.planName}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <AlertDialog key={action.id}>
            <AlertDialogTrigger asChild>
              <Button
                variant={action.variant}
                size="sm"
                className="w-full"
                disabled={action.disabled || isProcessing}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirm {action.label}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {action.description}
                  <br />
                  <br />
                  <strong>User:</strong> {subscription.planName} Plan
                  {subscription.renewalDate && (
                    <>
                      <br />
                      <strong>Current Period:</strong> Until {subscription.renewalDate}
                    </>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {action.requiresPlan && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select new plan:</label>
                  <Select value={selectedUpgradePlan} onValueChange={setSelectedUpgradePlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose upgrade plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {UPGRADE_PLANS.map((plan) => (
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
              )}

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAction(action.id)}
                  disabled={action.requiresPlan && !selectedUpgradePlan}
                >
                  Confirm {action.label}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>

      {/* Billing Portal Access */}
      <div className="pt-4 border-t">
        <Button
          onClick={handleBillingPortal}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Open Stripe Billing Portal
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}