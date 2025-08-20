-- Reset the stuck sync status to 'idle' which should be valid
UPDATE marketplace_sync_status 
SET sync_status = 'idle',
    updated_at = now()
WHERE marketplace = 'shopify' 
AND sync_status = 'syncing';