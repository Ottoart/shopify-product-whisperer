-- Reset stuck sync status to allow restart
UPDATE marketplace_sync_status 
SET is_syncing = false, 
    error_message = 'Reset due to stuck sync state - preparing for GraphQL migration',
    updated_at = now()
WHERE is_syncing = true;