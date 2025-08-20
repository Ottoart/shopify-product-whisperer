-- Reset sync status to allow restart
UPDATE public.marketplace_sync_status 
SET sync_status = 'pending', 
    updated_at = now()
WHERE marketplace_name = 'shopify' 
AND sync_status = 'syncing';