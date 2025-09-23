-- Enhanced Store Management System Tables

-- Store products table for scraped and manual products
CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  compare_at_price NUMERIC(10,2),
  cost NUMERIC(10,2),
  supplier TEXT NOT NULL,
  supplier_product_id TEXT,
  supplier_url TEXT,
  sku TEXT,
  barcode TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  inventory_quantity INTEGER DEFAULT 0,
  inventory_tracked BOOLEAN DEFAULT true,
  weight NUMERIC(10,3),
  weight_unit TEXT DEFAULT 'lb',
  dimensions JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'discontinued')),
  featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  currency TEXT DEFAULT 'USD',
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  last_price_change_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Price history tracking
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.store_products(id) ON DELETE CASCADE,
  old_price NUMERIC(10,2),
  new_price NUMERIC(10,2),
  change_type TEXT NOT NULL CHECK (change_type IN ('increase', 'decrease', 'initial')),
  change_amount NUMERIC(10,2),
  change_percentage NUMERIC(5,2),
  supplier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sync schedules for automated scraping
CREATE TABLE IF NOT EXISTS public.sync_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  suppliers TEXT[] NOT NULL DEFAULT '{}',
  collections TEXT[] NOT NULL DEFAULT '{}',
  frequency TEXT NOT NULL CHECK (frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  time_of_day TEXT DEFAULT '09:00',
  max_products INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  auto_approve BOOLEAN DEFAULT false,
  markup_percentage NUMERIC(5,2) DEFAULT 20.00,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Scraping session logs
CREATE TABLE IF NOT EXISTS public.scraping_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.sync_schedules(id) ON DELETE SET NULL,
  suppliers TEXT[] NOT NULL DEFAULT '{}',
  collections TEXT[] NOT NULL DEFAULT '{}',
  products_found INTEGER DEFAULT 0,
  products_inserted INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  errors_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_details JSONB DEFAULT '{}',
  summary JSONB DEFAULT '{}'
);

-- Sync notifications
CREATE TABLE IF NOT EXISTS public.sync_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES public.sync_schedules(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.scraping_sessions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('success', 'error', 'warning', 'price_change', 'low_stock')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supplier configurations
CREATE TABLE IF NOT EXISTS public.supplier_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  collections JSONB DEFAULT '{}',
  selectors JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_products
CREATE POLICY "Admins can manage all store products" ON public.store_products
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active store products" ON public.store_products
  FOR SELECT TO authenticated
  USING (status = 'active');

-- RLS Policies for price_history
CREATE POLICY "Admins can view all price history" ON public.price_history
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for sync_schedules
CREATE POLICY "Admins can manage sync schedules" ON public.sync_schedules
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for scraping_sessions
CREATE POLICY "Admins can view scraping sessions" ON public.scraping_sessions
  FOR SELECT TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for sync_notifications
CREATE POLICY "Admins can manage sync notifications" ON public.sync_notifications
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for supplier_configurations
CREATE POLICY "Admins can manage supplier configurations" ON public.supplier_configurations
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view active supplier configurations" ON public.supplier_configurations
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_products_supplier ON public.store_products(supplier);
CREATE INDEX IF NOT EXISTS idx_store_products_category ON public.store_products(category);
CREATE INDEX IF NOT EXISTS idx_store_products_status ON public.store_products(status);
CREATE INDEX IF NOT EXISTS idx_store_products_sku ON public.store_products(sku);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created_at ON public.price_history(created_at);
CREATE INDEX IF NOT EXISTS idx_sync_schedules_active ON public.sync_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_scraping_sessions_schedule_id ON public.scraping_sessions(schedule_id);

-- Triggers for updated_at
CREATE TRIGGER update_store_products_updated_at
  BEFORE UPDATE ON public.store_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sync_schedules_updated_at
  BEFORE UPDATE ON public.sync_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_configurations_updated_at
  BEFORE UPDATE ON public.supplier_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default supplier configurations
INSERT INTO public.supplier_configurations (name, base_url, collections, selectors, settings) VALUES
('staples', 'https://staples.com', 
 '{"office-supplies": "/browse/office-supplies", "technology": "/browse/technology", "furniture": "/browse/furniture"}',
 '{"product": ".product-item", "name": "h3.product-title", "price": ".price-current", "image": ".product-image img", "url": "a.product-link"}',
 '{"user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "delay": 2000, "max_products": 50}'),
('uline', 'https://uline.com', 
 '{"shipping": "/browse/shipping", "warehouse": "/browse/warehouse", "safety": "/browse/safety"}',
 '{"product": ".product-item", "name": ".product-name", "price": ".price", "image": ".product-image img", "url": ".product-link"}',
 '{"user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "delay": 3000, "max_products": 50}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample categories
INSERT INTO public.store_categories (name, slug, description, is_active) VALUES
('Office Supplies', 'office-supplies', 'Essential office supplies and stationery', true),
('Technology', 'technology', 'Computers, electronics and tech accessories', true),
('Furniture', 'furniture', 'Office and home furniture', true),
('Shipping Supplies', 'shipping-supplies', 'Packaging and shipping materials', true),
('Warehouse Equipment', 'warehouse-equipment', 'Material handling and warehouse solutions', true),
('Safety Equipment', 'safety-equipment', 'Personal protective equipment and safety gear', true)
ON CONFLICT (slug) DO NOTHING;