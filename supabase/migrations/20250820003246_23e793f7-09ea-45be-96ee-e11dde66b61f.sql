-- Reset any stuck sync statuses to allow fresh sync attempts with new limits
UPDATE shopify_sync_status 
SET sync_status = 'pending',
    updated_at = now(),
    last_page_info = NULL
WHERE sync_status IN ('in_progress', 'error');

UPDATE marketplace_sync_status 
SET sync_status = 'pending',
    updated_at = now(),
    error_message = NULL
WHERE sync_status IN ('in_progress', 'failed');

-- Add index for better sync status performance
CREATE INDEX IF NOT EXISTS idx_shopify_sync_status_user_status 
ON shopify_sync_status(user_id, sync_status);

CREATE INDEX IF NOT EXISTS idx_marketplace_sync_status_user_marketplace 
ON marketplace_sync_status(user_id, marketplace, sync_status);