-- Reset stuck sync status to allow restart
UPDATE marketplace_sync_status 
SET status = 'idle', 
    is_syncing = false, 
    error_message = 'Reset due to stuck sync state',
    updated_at = now()
WHERE status = 'syncing' AND marketplace_name = 'shopify';