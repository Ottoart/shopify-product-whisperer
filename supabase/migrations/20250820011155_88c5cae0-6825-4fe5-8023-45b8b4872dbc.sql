-- Reset the stuck sync status to allow resuming the sync
UPDATE marketplace_sync_status 
SET sync_status = 'ready',
    updated_at = now()
WHERE marketplace = 'shopify' 
AND sync_status = 'syncing';