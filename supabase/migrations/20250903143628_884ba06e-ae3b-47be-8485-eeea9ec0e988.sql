-- Add unique constraints to store_products table for data integrity
-- This ensures SKUs and handles are unique per user, enabling proper upsert operations

-- Add unique constraint on (user_id, sku) combination
ALTER TABLE public.store_products 
ADD CONSTRAINT store_products_user_sku_unique 
UNIQUE (user_id, sku);

-- Add unique constraint on (user_id, handle) combination  
ALTER TABLE public.store_products 
ADD CONSTRAINT store_products_user_handle_unique 
UNIQUE (user_id, handle);

-- Create index for better performance on handle lookups
CREATE INDEX IF NOT EXISTS idx_store_products_handle 
ON public.store_products (user_id, handle);

-- Create index for better performance on sku lookups
CREATE INDEX IF NOT EXISTS idx_store_products_sku 
ON public.store_products (user_id, sku);