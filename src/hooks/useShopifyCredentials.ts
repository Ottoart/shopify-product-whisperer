import { useStores } from '@/contexts/StoreContext';
import { useSearchParams } from 'react-router-dom';

/**
 * Centralized hook to access active Shopify credentials from the database.
 * Optionally pass a storeId to target a specific connected store.
 * Also supports a `?store=` query param (store name or domain prefix).
 */
export const useShopifyCredentials = (storeId?: string) => {
  const { stores, loading, refreshStores, getStore } = useStores();
  const [searchParams] = useSearchParams();

  const shopifyStores = stores.filter((s: any) => s.platform === 'shopify' && s.is_active);

  // URL param selection (store name or domain prefix)
  const storeParam = searchParams.get('store')?.toLowerCase().trim();
  const fromQuery = storeParam
    ? shopifyStores.find((s: any) => {
        const name = (s.store_name || '').toLowerCase();
        const domain = (s.domain || '').toLowerCase();
        const domainPrefix = domain.replace(/^https?:\/\//, '').split('.')[0];
        return name === storeParam || domainPrefix === storeParam || domain.includes(storeParam);
      })
    : undefined;

  const targeted = storeId ? getStore(storeId) : undefined;
  const store = (targeted && targeted.platform === 'shopify' && targeted.is_active)
    ? targeted
    : (fromQuery || shopifyStores[0]);

  return {
    store,
    storeId: store?.id || null,
    storeUrl: store?.domain || null,
    accessToken: store?.access_token || null,
    loading,
    refreshStores,
  } as const;
};
