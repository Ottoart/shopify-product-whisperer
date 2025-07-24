-- Add listing status and variant tracking to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS listing_status text,
ADD COLUMN IF NOT EXISTS parent_listing_id text,
ADD COLUMN IF NOT EXISTS variant_sku text,
ADD COLUMN IF NOT EXISTS listing_type text DEFAULT 'single',
ADD COLUMN IF NOT EXISTS ebay_listing_id text,
ADD COLUMN IF NOT EXISTS quantity_available integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS quantity_sold integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS end_time timestamp with time zone;

-- Create index for better performance on eBay listing queries
CREATE INDEX IF NOT EXISTS idx_products_ebay_listing_id ON public.products(ebay_listing_id);
CREATE INDEX IF NOT EXISTS idx_products_parent_listing_id ON public.products(parent_listing_id);
CREATE INDEX IF NOT EXISTS idx_products_listing_status ON public.products(listing_status);

-- Update marketplace_sync_status to track listing types
ALTER TABLE public.marketplace_sync_status 
ADD COLUMN IF NOT EXISTS active_listings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ended_listings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS draft_listings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS unsold_listings integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_listings integer DEFAULT 0;