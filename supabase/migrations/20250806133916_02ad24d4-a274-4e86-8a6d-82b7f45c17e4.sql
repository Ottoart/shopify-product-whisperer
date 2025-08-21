-- Create store_products table for shipping supplies and other store items
CREATE TABLE public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  compare_at_price NUMERIC(10,2),
  cost NUMERIC(10,2),
  currency TEXT DEFAULT 'CAD',
  sku TEXT UNIQUE,
  barcode TEXT,
  weight_lbs NUMERIC(8,2),
  dimensions JSONB DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  supplier TEXT NOT NULL DEFAULT 'staples',
  supplier_product_id TEXT,
  supplier_url TEXT,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy TEXT DEFAULT 'deny',
  track_quantity BOOLEAN DEFAULT true,
  requires_shipping BOOLEAN DEFAULT true,
  taxable BOOLEAN DEFAULT true,
  tax_code TEXT,
  weight_unit TEXT DEFAULT 'lbs',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  specifications JSONB DEFAULT '{}',
  shipping_info JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing and admin management
CREATE POLICY "Anyone can view active store products" 
ON public.store_products 
FOR SELECT 
USING (status = 'active' AND visibility = 'public');

CREATE POLICY "Admins can manage all store products" 
ON public.store_products 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_store_products_category ON public.store_products(category);
CREATE INDEX idx_store_products_supplier ON public.store_products(supplier);
CREATE INDEX idx_store_products_status ON public.store_products(status);
CREATE INDEX idx_store_products_featured ON public.store_products(featured);
CREATE INDEX idx_store_products_sku ON public.store_products(sku);

-- Create trigger for updated_at
CREATE TRIGGER update_store_products_updated_at
BEFORE UPDATE ON public.store_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create store_categories table for organization
CREATE TABLE public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.store_categories(id),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Anyone can view active store categories" 
ON public.store_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all store categories" 
ON public.store_categories 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create index for categories
CREATE INDEX idx_store_categories_parent ON public.store_categories(parent_id);
CREATE INDEX idx_store_categories_slug ON public.store_categories(slug);

-- Create trigger for categories updated_at
CREATE TRIGGER update_store_categories_updated_at
BEFORE UPDATE ON public.store_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial categories
INSERT INTO public.store_categories (name, slug, description, sort_order) VALUES
('Shipping Supplies', 'shipping-supplies', 'Boxes, envelopes, packaging materials for shipping', 1),
('Storage Solutions', 'storage-solutions', 'Storage boxes, bins, and organization supplies', 2),
('Packaging Materials', 'packaging-materials', 'Bubble wrap, tape, labels, and protective materials', 3),
('Office Supplies', 'office-supplies', 'General office and business supplies', 4);

-- Insert shipping supplies subcategories
INSERT INTO public.store_categories (name, slug, description, parent_id, sort_order) VALUES
('Cardboard Boxes', 'cardboard-boxes', 'Various sizes of cardboard shipping boxes', 
  (SELECT id FROM public.store_categories WHERE slug = 'shipping-supplies'), 1),
('Mailers & Envelopes', 'mailers-envelopes', 'Padded mailers, poly mailers, and envelopes', 
  (SELECT id FROM public.store_categories WHERE slug = 'shipping-supplies'), 2),
('Packing Tape', 'packing-tape', 'Clear, brown, and specialty packing tapes', 
  (SELECT id FROM public.store_categories WHERE slug = 'shipping-supplies'), 3),
('Protective Packaging', 'protective-packaging', 'Bubble wrap, foam, air pillows', 
  (SELECT id FROM public.store_categories WHERE slug = 'shipping-supplies'), 4);