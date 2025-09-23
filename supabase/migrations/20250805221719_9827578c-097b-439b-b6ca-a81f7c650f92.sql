-- Add a cleanup and fix for eBay sync issue
-- First, ensure marketplace sync status data is properly linked to stores

-- Update any existing eBay sync status to use consistent marketplace naming
UPDATE marketplace_sync_status 
SET marketplace = 'ebay' 
WHERE marketplace IN ('eBay Store', 'eBay', 'ebay');

-- Update any existing Shopify sync status to use consistent marketplace naming  
UPDATE marketplace_sync_status 
SET marketplace = 'shopify'
WHERE marketplace IN ('Shopify', 'shopify', 'Prohair');

-- Clean up any orphaned sync statuses that don't have corresponding store configurations
DELETE FROM marketplace_sync_status 
WHERE user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM store_configurations 
  WHERE is_active = true
);

-- Ensure all active store configurations have corresponding sync status entries
INSERT INTO marketplace_sync_status (user_id, marketplace, sync_status, products_synced, created_at, updated_at)
SELECT DISTINCT 
  sc.user_id,
  sc.platform as marketplace,
  'pending' as sync_status,
  0 as products_synced,
  now() as created_at,
  now() as updated_at
FROM store_configurations sc
WHERE sc.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM marketplace_sync_status mss 
    WHERE mss.user_id = sc.user_id 
    AND mss.marketplace = sc.platform
  )
ON CONFLICT (user_id, marketplace) DO NOTHING;