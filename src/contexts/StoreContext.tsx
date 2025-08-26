import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@supabase/auth-helpers-react';

interface StoreConfig {
  id: string;
  store_name: string;
  platform: string;
  domain: string;
  is_active: boolean;
  access_token: string;
}

interface StoreContextType {
  stores: StoreConfig[];
  loading: boolean;
  refreshStores: () => Promise<void>;
  getStore: (storeId: string) => StoreConfig | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStores = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const session = useSession();
  const [stores, setStores] = useState<StoreConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    if (!session?.user?.id) {
      setStores([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch from both store_configurations and marketplace_configurations
      const [storeConfigsResponse, marketplaceConfigsResponse] = await Promise.all([
        supabase
          .from('store_configurations')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .order('store_name'),
        supabase
          .from('marketplace_configurations')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .order('store_name')
      ]);

      if (storeConfigsResponse.error) throw storeConfigsResponse.error;
      if (marketplaceConfigsResponse.error) throw marketplaceConfigsResponse.error;

      // Combine and normalize the data
      const storeConfigs = (storeConfigsResponse.data || []).map(store => ({
        ...store,
        source: 'store_configurations'
      }));
      
      const marketplaceConfigs = (marketplaceConfigsResponse.data || []).map(marketplace => ({
        id: marketplace.id,
        store_name: marketplace.store_name,
        platform: marketplace.platform,
        domain: marketplace.store_url || marketplace.external_user_id,
        is_active: marketplace.is_active,
        access_token: marketplace.access_token,
        source: 'marketplace_configurations'
      }));

      // Combine both sources, preferring marketplace configs for OAuth-connected stores
      const allStores = [...storeConfigs, ...marketplaceConfigs];
      setStores(allStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshStores = async () => {
    await fetchStores();
  };

  const getStore = (storeId: string) => {
    return stores.find(store => store.id === storeId);
  };

  useEffect(() => {
    fetchStores();
  }, [session?.user?.id]);

  // Realtime updates and focus refresh to avoid stale store lists
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('store-config-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_configurations' },
        (payload) => {
          const userId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
          if (userId === session.user.id) {
            fetchStores();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'marketplace_configurations' },
        (payload) => {
          const userId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
          if (userId === session.user.id) {
            fetchStores();
          }
        }
      )
      .subscribe();

    const onFocus = () => fetchStores();
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  return (
    <StoreContext.Provider value={{ stores, loading, refreshStores, getStore }}>
      {children}
    </StoreContext.Provider>
  );
};