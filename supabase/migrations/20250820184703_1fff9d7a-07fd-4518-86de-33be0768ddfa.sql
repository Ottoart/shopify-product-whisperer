-- Step 1: Reset stuck sync states
UPDATE marketplace_sync_status 
SET sync_status = 'completed', 
    updated_at = now(),
    error_message = NULL
WHERE sync_status = 'syncing' 
AND updated_at < now() - INTERVAL '30 minutes';

UPDATE shopify_sync_status 
SET sync_status = 'completed', 
    updated_at = now()
WHERE sync_status = 'in_progress' 
AND updated_at < now() - INTERVAL '30 minutes';