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
      const { data, error } = await supabase
        .from('marketplace_configurations')
        .select('id, store_name, platform, store_url, is_active, access_token')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('store_name');

      if (error) throw error;
      // Map store_url to domain for compatibility
      const mappedData = (data || []).map(store => ({
        ...store,
        domain: store.store_url
      }));
      setStores(mappedData);
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