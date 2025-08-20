-- Fix sync status with valid values and reset for proper continuation
UPDATE marketplace_sync_status 
SET sync_status = 'pending',
    products_synced = 251,
    total_products_found = 4897,
    error_message = NULL,
    updated_at = now()
WHERE user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248' 
AND marketplace = 'shopify';

-- Reset shopify_sync_status to allow continuation with proper page info
UPDATE shopify_sync_status 
SET sync_status = 'pending',
    total_synced = 251,
    updated_at = now()
WHERE user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248';