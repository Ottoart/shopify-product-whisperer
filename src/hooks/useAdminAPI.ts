import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from './useAdminAuth';

export function useAdminAPI() {
  const { adminSession } = useAdminAuth();

  const callAdminFunction = async (functionName: string, payload: any) => {
    if (!adminSession?.jwt_token) {
      throw new Error('No admin session available');
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
      headers: {
        Authorization: `Bearer ${adminSession.jwt_token}`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const getUsers = async () => {
    return callAdminFunction('admin-data', { action: 'get_users' });
  };

  const getUserSubscription = async (userId: string) => {
    return callAdminFunction('admin-data', { action: 'get_user_subscription', userId });
  };

  return {
    getUsers,
    getUserSubscription,
    callAdminFunction,
  };
}