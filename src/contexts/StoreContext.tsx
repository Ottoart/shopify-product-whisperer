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
        .from('store_configurations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('store_name');

      if (error) throw error;
      setStores(data || []);
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

  return (
    <StoreContext.Provider value={{ stores, loading, refreshStores, getStore }}>
      {children}
    </StoreContext.Provider>
  );
};