-- Add store identification columns to products table
ALTER TABLE public.products 
ADD COLUMN store_name TEXT,
ADD COLUMN store_id UUID REFERENCES public.store_configurations(id);

-- Create index for better performance when filtering by store
CREATE INDEX idx_products_store_name ON public.products(store_name);
CREATE INDEX idx_products_store_id ON public.products(store_id);

-- Update existing products to have store_name based on current logic
-- This is a one-time migration to fix existing data
UPDATE public.products 
SET store_name = CASE 
  WHEN vendor = 'Prohair' THEN 'Prohair'
  WHEN vendor ILIKE '%shopi%' THEN 'Shopi'
  ELSE vendor 
END
WHERE store_name IS NULL;