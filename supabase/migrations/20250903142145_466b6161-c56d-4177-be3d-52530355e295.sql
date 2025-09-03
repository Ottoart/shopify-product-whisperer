-- Add missing Shopify columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS handle text,
ADD COLUMN IF NOT EXISTS vendor text,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS published boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS option1_name text DEFAULT 'Title',
ADD COLUMN IF NOT EXISTS option1_value text DEFAULT 'Default Title',
ADD COLUMN IF NOT EXISTS variant_sku text,
ADD COLUMN IF NOT EXISTS variant_grams integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_inventory_tracker text DEFAULT 'shopify',
ADD COLUMN IF NOT EXISTS variant_inventory_qty integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS variant_inventory_policy text DEFAULT 'deny',
ADD COLUMN IF NOT EXISTS variant_fulfillment_service text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS variant_price numeric(10,2),
ADD COLUMN IF NOT EXISTS variant_compare_at_price numeric(10,2),
ADD COLUMN IF NOT EXISTS variant_requires_shipping boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS variant_taxable boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS variant_barcode text,
ADD COLUMN IF NOT EXISTS image_position integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS image_src text,
ADD COLUMN IF NOT EXISTS body_html text,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS google_shopping_condition text DEFAULT 'new',
ADD COLUMN IF NOT EXISTS google_shopping_gender text DEFAULT 'unisex',
ADD COLUMN IF NOT EXISTS google_shopping_age_group text DEFAULT 'adult',
ADD COLUMN IF NOT EXISTS shopify_sync_status text,
ADD COLUMN IF NOT EXISTS shopify_synced_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS listing_status text DEFAULT 'active';

-- Add compatibility columns to store_products table
ALTER TABLE public.store_products 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS handle text;

-- Migrate existing data from name/description to new Shopify columns
UPDATE public.products 
SET 
  title = COALESCE(title, name),
  body_html = COALESCE(body_html, description),
  variant_price = COALESCE(variant_price, price),
  variant_compare_at_price = COALESCE(variant_compare_at_price, sale_price),
  image_src = COALESCE(image_src, image_url)
WHERE title IS NULL OR body_html IS NULL OR variant_price IS NULL OR image_src IS NULL;

-- Migrate data for store_products
UPDATE public.store_products 
SET 
  title = COALESCE(title, name)
WHERE title IS NULL;

-- Generate handles for products that don't have them
UPDATE public.products 
SET handle = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(title, name, 'product'), '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE handle IS NULL;

UPDATE public.store_products 
SET handle = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(title, name, 'product'), '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'))
WHERE handle IS NULL;

-- Add indexes for better performance on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_products_handle ON public.products(handle);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_store_products_handle ON public.store_products(handle);