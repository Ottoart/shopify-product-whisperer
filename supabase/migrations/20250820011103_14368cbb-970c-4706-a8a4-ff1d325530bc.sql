-- Reset the stuck sync status to allow resuming the sync
UPDATE marketplace_sync_status 
SET status = 'ready', 
    progress = 0,
    current_batch = 1,
    products_synced = 0,
    updated_at = now()
WHERE marketplace_name = 'Shopp' 
AND status = 'syncing';