-- Update marketplace sync status with correct data based on actual products using valid status
UPDATE public.marketplace_sync_status 
SET 
  products_synced = 673,
  total_products_found = 673,
  sync_status = 'syncing',
  last_sync_at = '2025-08-05 22:56:59+00'::timestamp with time zone,
  updated_at = now()
WHERE marketplace = 'ebay' 
AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248';

UPDATE public.marketplace_sync_status 
SET 
  products_synced = 35,
  total_products_found = 35,
  sync_status = 'syncing',
  last_sync_at = '2025-08-05 22:56:59+00'::timestamp with time zone,
  updated_at = now()
WHERE marketplace = 'shopify' 
AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248';