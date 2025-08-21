-- Complete ProductWhisper System Removal

-- Drop all ProductWhisper related tables
DROP TABLE IF EXISTS public.product_reviews CASCADE;
DROP TABLE IF EXISTS public.product_drafts CASCADE;
DROP TABLE IF EXISTS public.product_views CASCADE;
DROP TABLE IF EXISTS public.store_products CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.store_categories CASCADE;
DROP TABLE IF EXISTS public.store_configurations CASCADE;
DROP TABLE IF EXISTS public.product_edit_history CASCADE;
DROP TABLE IF EXISTS public.user_edit_patterns CASCADE;
DROP TABLE IF EXISTS public.ai_pricing_recommendations CASCADE;
DROP TABLE IF EXISTS public.recently_viewed CASCADE;

-- Drop ProductWhisper related functions and triggers
DROP FUNCTION IF EXISTS public.cascade_delete_store_data() CASCADE;
DROP FUNCTION IF EXISTS public.normalize_store_configurations() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_disconnected_store_products() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_ratings() CASCADE;
DROP FUNCTION IF EXISTS public.manage_recently_viewed() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_popularity() CASCADE;

-- Clean up any ProductWhisper related data from remaining tables
DELETE FROM public.marketplace_sync_status WHERE marketplace_name LIKE '%productwhisper%' OR marketplace_name LIKE '%product-whisper%';
DELETE FROM public.ai_insights WHERE insight_type IN ('product_optimization', 'pricing', 'pattern_analysis');
DELETE FROM public.batch_operations WHERE operation_type IN ('product_sync', 'product_optimization', 'bulk_product_update');
DELETE FROM public.performance_metrics WHERE products_optimized > 0 OR price_changes > 0;