-- Complete Shopify database cleanup
-- Remove all Shopify store configurations
DELETE FROM store_configurations WHERE platform = 'shopify';

-- Remove all Shopify orders and their items
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE store_platform = 'shopify'
);
DELETE FROM orders WHERE store_platform = 'shopify';

-- Clean marketplace sync status for Shopify
DELETE FROM marketplace_sync_status WHERE marketplace = 'shopify';

-- Clean any Shopify marketplace configurations
DELETE FROM marketplace_configurations WHERE platform = 'shopify';