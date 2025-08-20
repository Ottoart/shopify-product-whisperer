-- Reset the stuck Shopify sync status to allow new sync attempts
UPDATE shopify_sync_status 
SET sync_status = 'pending',
    updated_at = now()
WHERE sync_status = 'in_progress';

-- Also update marketplace_sync_status to reset any stuck sync
UPDATE marketplace_sync_status 
SET sync_status = 'pending',
    updated_at = now() 
WHERE sync_status = 'in_progress';