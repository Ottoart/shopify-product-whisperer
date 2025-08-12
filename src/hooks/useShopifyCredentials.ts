import { useStores } from '@/contexts/StoreContext';

/**
 * Centralized hook to access active Shopify credentials from the database.
 * Optionally pass a storeId to target a specific connected store.
 */
export const useShopifyCredentials = (storeId?: string) => {
  const { stores, loading, refreshStores, getStore } = useStores();

  const shopifyStores = stores.filter((s: any) => s.platform === 'shopify' && s.is_active);
  const targeted = storeId ? getStore(storeId) : undefined;
  const store = (targeted && targeted.platform === 'shopify' && targeted.is_active)
    ? targeted
    : shopifyStores[0];

  return {
    store,
    storeUrl: store?.domain || null,
    accessToken: store?.access_token || null,
    loading,
    refreshStores,
  } as const;
};
