import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './useAdminAuth';
import { useAdminAPI } from './useAdminAPI';
import { useToast } from './use-toast';

export interface AdminUser {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  subscription?: {
    id: string;
    plan_name: string;
    status: string;
    current_period_end?: string;
  };
  entitlements?: {
    shipping: boolean;
    repricing: boolean;
    fulfillment: boolean;
    productManagement: boolean;
  };
}

export interface UpdateSubscriptionData {
  userId: string;
  planName?: string;
  status?: string;
  entitlements?: {
    shipping: boolean;
    repricing: boolean;
    fulfillment: boolean;
    productManagement: boolean;
  };
}

export interface SubscriptionActionData {
  userId: string;
  action: 'upgrade' | 'downgrade' | 'cancel' | 'extend_trial';
  planId?: string;
}

export const useAdminUsers = () => {
  const { isAdmin } = useAdminAuth();
  const { getUsers } = useAdminAPI();
  const { toast } = useToast();
  
  const fetchAdminUsers = async (): Promise<AdminUser[]> => {
    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    const data = await getUsers();
    if (!data.success) throw new Error(data.error);

    return data.users;
  };

  return useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
    enabled: isAdmin,
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();

  return useMutation({
    mutationFn: async (data: UpdateSubscriptionData) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data: result, error } = await supabase.functions.invoke('billing-modify-subscription', {
        body: data
      });

      if (error) throw error;
      if (!result.success) throw new Error(result.error);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription",
        variant: "destructive",
      });
    },
  });
};

export const useSubscriptionAction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();

  return useMutation({
    mutationFn: async (data: SubscriptionActionData) => {
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data: result, error } = await supabase.functions.invoke('billing-modify-subscription', {
        body: { 
          ...data,
          action: data.action 
        }
      });

      if (error) throw error;
      if (!result.success) throw new Error(result.error);

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['subscription', variables.userId] });
      toast({
        title: "Success",
        description: `Subscription ${variables.action} completed successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to perform subscription action",
        variant: "destructive",
      });
    },
  });
};