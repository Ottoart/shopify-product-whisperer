-- Add shopify_sync_status to products table
ALTER TABLE public.products 
ADD COLUMN shopify_sync_status TEXT DEFAULT 'pending',
ADD COLUMN shopify_synced_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance on sync status queries
CREATE INDEX idx_products_shopify_sync ON public.products(shopify_sync_status, shopify_synced_at);
CREATE INDEX idx_products_updated_at ON public.products(updated_at);