import { useAdminAuth } from './useAdminAuth';

export function useAdminAPI() {
  const { adminSession } = useAdminAuth();

  const callAdminFunction = async (functionName: string, payload: any) => {
    if (!adminSession?.jwt_token) {
      throw new Error('No admin session available');
    }

    // Use direct fetch instead of supabase.functions.invoke to control headers
    const response = await fetch(`https://rtaomiqsnctigleqjojt.supabase.co/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminSession.jwt_token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
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