-- Update marketplace sync status to reflect actual synced products with valid status
UPDATE marketplace_sync_status 
SET 
  products_synced = 250,
  total_products_found = 250,
  sync_status = 'success',
  last_sync_at = now(),
  updated_at = now()
WHERE marketplace = 'shopify' 
  AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248'
  AND products_synced = 35;