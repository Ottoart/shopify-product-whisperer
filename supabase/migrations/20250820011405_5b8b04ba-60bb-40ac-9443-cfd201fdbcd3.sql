-- Reset the stuck sync status to 'pending' to allow resuming
UPDATE marketplace_sync_status 
SET sync_status = 'pending',
    updated_at = now()
WHERE marketplace = 'shopify' 
AND sync_status = 'syncing';