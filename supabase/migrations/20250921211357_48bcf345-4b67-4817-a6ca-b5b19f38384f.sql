-- Phase 1: Database Cleanup - Drop all Shopify-related tables
DROP TABLE IF EXISTS public.shopify_analytics CASCADE;
DROP TABLE IF EXISTS public.shopify_sync_status CASCADE;
DROP TABLE IF EXISTS public.shopify_bulk_operations CASCADE;
DROP TABLE IF EXISTS public.shopify_orders CASCADE;
DROP TABLE IF EXISTS public.shopify_order_line_items CASCADE;
DROP TABLE IF EXISTS public.shopify_customers CASCADE;
DROP TABLE IF EXISTS public.shopify_inventory CASCADE;

-- Remove Shopify columns from existing tables
ALTER TABLE public.products 
DROP COLUMN IF EXISTS shopify_sync_status,
DROP COLUMN IF EXISTS shopify_synced_at;

-- Delete Shopify entries from configuration tables
DELETE FROM public.store_configurations WHERE platform = 'shopify';
DELETE FROM public.marketplace_configurations WHERE platform = 'shopify';
DELETE FROM public.marketplace_sync_status WHERE marketplace = 'shopify';