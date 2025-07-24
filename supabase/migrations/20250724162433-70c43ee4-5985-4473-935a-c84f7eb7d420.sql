-- Add missing shopify_product_id column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_shopify_product_id 
ON public.products(shopify_product_id);

-- Add marketplace column to better track product sources
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS marketplace TEXT DEFAULT 'shopify';

-- Add index for marketplace filtering
CREATE INDEX IF NOT EXISTS idx_products_marketplace 
ON public.products(marketplace);