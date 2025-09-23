import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './useAdminAuth';

export interface SubscriptionData {
  isTrial: boolean;
  isActive: boolean;
  planName: string;
  renewalDate: string | null;
  entitlements: {
    shipping: boolean;
    repricing: boolean;
    fulfillment: boolean;
    productManagement: boolean;
  };
  status: 'active' | 'trial' | 'expired' | 'upgrade';
  daysUntilRenewal?: number;
}

export const useSubscription = (targetUserId?: string) => {
  const { isAdmin } = useAdminAuth();

  const fetchSubscription = async (): Promise<SubscriptionData> => {
    console.log('🔍 Fetching subscription data for user:', targetUserId || 'current user');

    try {
      const { data, error } = await supabase.functions.invoke('billing-get-subscription', {
        body: targetUserId && isAdmin ? { userId: targetUserId } : {}
      });

      if (error) {
        console.error('Error fetching subscription:', error);
        throw error;
      }

      console.log('📊 Subscription data received:', data);

      // Extract subscription info from response
      const subscription = data.subscription;
      const customer = data.customer;

      // Determine status and entitlements
      const isActive = subscription?.status === 'active';
      const isTrial = customer?.metadata?.is_trial === 'true';
      const planName = subscription?.plan_name || 'Free';
      
      // Calculate renewal date
      const renewalDate = subscription?.current_period_end ? 
        new Date(subscription.current_period_end).toLocaleDateString() : null;
      
      // Calculate days until renewal
      const daysUntilRenewal = subscription?.current_period_end ? 
        Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : undefined;

      // Determine entitlements based on plan
      const getEntitlements = (plan: string) => {
        switch (plan.toLowerCase()) {
          case 'starter':
            return { shipping: true, repricing: false, fulfillment: false, productManagement: false };
          case 'pro':
            return { shipping: true, repricing: true, fulfillment: true, productManagement: false };
          case 'business':
            return { shipping: true, repricing: true, fulfillment: true, productManagement: true };
          default:
            return { shipping: false, repricing: false, fulfillment: false, productManagement: false };
        }
      };

      const entitlements = getEntitlements(planName);

      // Determine overall status
      let status: 'active' | 'trial' | 'expired' | 'upgrade';
      if (isTrial) {
        status = 'trial';
      } else if (isActive) {
        status = 'active';
      } else if (planName === 'Free') {
        status = 'upgrade';
      } else {
        status = 'expired';
      }

      return {
        isTrial,
        isActive,
        planName,
        renewalDate,
        entitlements,
        status,
        daysUntilRenewal
      };
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      
      // Return default free plan data on error
      return {
        isTrial: false,
        isActive: false,
        planName: 'Free',
        renewalDate: null,
        entitlements: {
          shipping: false,
          repricing: false,
          fulfillment: false,
          productManagement: false
        },
        status: 'upgrade'
      };
    }
  };

  return useQuery<SubscriptionData>({
    queryKey: ['subscription', targetUserId],
    queryFn: fetchSubscription,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
    retry: 2
  });
};