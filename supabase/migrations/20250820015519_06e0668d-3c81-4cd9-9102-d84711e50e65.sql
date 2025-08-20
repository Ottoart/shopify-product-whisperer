-- Reset stuck sync status to allow restart
UPDATE marketplace_sync_status 
SET sync_status = 'idle',
    error_message = 'Reset due to stuck sync state - preparing for GraphQL migration',
    updated_at = now()
WHERE sync_status = 'syncing' AND marketplace = 'shopify';