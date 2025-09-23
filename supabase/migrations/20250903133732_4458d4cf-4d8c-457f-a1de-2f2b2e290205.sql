-- Add missing columns to store_products table
ALTER TABLE public.store_products 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS supplier text,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS material text,
ADD COLUMN IF NOT EXISTS color text,
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS inventory_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS markup_percentage numeric DEFAULT 0;

-- Create store_categories table
CREATE TABLE IF NOT EXISTS public.store_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Enable RLS on store_categories
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for store_categories
CREATE POLICY "Users can manage their own categories" 
ON public.store_categories 
FOR ALL 
USING (auth.uid() = user_id);

-- Add missing columns to products table (if they don't exist)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS handle text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS supplier text,
ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create trigger for updated_at on store_categories
CREATE TRIGGER update_store_categories_updated_at
BEFORE UPDATE ON public.store_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();