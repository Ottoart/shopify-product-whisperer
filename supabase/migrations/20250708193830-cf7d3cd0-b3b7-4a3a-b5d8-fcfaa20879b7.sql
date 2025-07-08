
-- Create products table to store uploaded products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  handle TEXT NOT NULL,
  title TEXT NOT NULL,
  vendor TEXT,
  type TEXT,
  tags TEXT,
  published BOOLEAN DEFAULT false,
  option1_name TEXT,
  option1_value TEXT,
  variant_sku TEXT,
  variant_grams NUMERIC DEFAULT 0,
  variant_inventory_tracker TEXT,
  variant_inventory_qty INTEGER DEFAULT 0,
  variant_inventory_policy TEXT,
  variant_fulfillment_service TEXT,
  variant_price NUMERIC DEFAULT 0,
  variant_compare_at_price NUMERIC DEFAULT 0,
  variant_requires_shipping BOOLEAN DEFAULT true,
  variant_taxable BOOLEAN DEFAULT true,
  variant_barcode TEXT,
  image_position INTEGER DEFAULT 0,
  image_src TEXT,
  body_html TEXT,
  seo_title TEXT,
  seo_description TEXT,
  google_shopping_condition TEXT,
  google_shopping_gender TEXT,
  google_shopping_age_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own products" 
ON public.products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own products" 
ON public.products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON public.products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON public.products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_handle ON public.products(handle);
