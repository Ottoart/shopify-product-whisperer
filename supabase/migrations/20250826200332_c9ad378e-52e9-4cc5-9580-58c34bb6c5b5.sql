-- Phase 1: Create missing core tables that are causing TypeScript errors

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  handle TEXT,
  product_type TEXT,
  vendor TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  meta_fields JSONB DEFAULT '{}'::jsonb,
  shopify_product_id TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store_configurations table
CREATE TABLE IF NOT EXISTS public.store_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  store_name TEXT,
  domain TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_edit_history table
CREATE TABLE IF NOT EXISTS public.product_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_type TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_edit_patterns table
CREATE TABLE IF NOT EXISTS public.user_edit_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  usage_count INTEGER DEFAULT 0,
  effectiveness_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recently_viewed table
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Wishlist',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wishlist_id UUID NOT NULL,
  product_id UUID NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);

-- Create shopify_orders table
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_order_id TEXT NOT NULL,
  order_number TEXT,
  email TEXT,
  total_price NUMERIC,
  subtotal_price NUMERIC,
  total_tax NUMERIC,
  currency TEXT DEFAULT 'USD',
  financial_status TEXT,
  fulfillment_status TEXT,
  order_date TIMESTAMP WITH TIME ZONE,
  customer_data JSONB DEFAULT '{}'::jsonb,
  line_items JSONB DEFAULT '[]'::jsonb,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  billing_address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopify_order_id)
);

-- Create shopify_customers table
CREATE TABLE IF NOT EXISTS public.shopify_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_customer_id TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  total_spent NUMERIC DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  state TEXT,
  verified_email BOOLEAN DEFAULT false,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopify_customer_id)
);

-- Create shopify_inventory table
CREATE TABLE IF NOT EXISTS public.shopify_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_inventory_item_id TEXT NOT NULL,
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  sku TEXT,
  quantity INTEGER DEFAULT 0,
  location_id TEXT,
  location_name TEXT,
  tracked BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, shopify_inventory_item_id, location_id)
);

-- Create shopify_bulk_operations table
CREATE TABLE IF NOT EXISTS public.shopify_bulk_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_bulk_operation_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  query TEXT,
  url TEXT,
  partial_data_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_code TEXT,
  object_count INTEGER,
  file_size INTEGER,
  UNIQUE(user_id, shopify_bulk_operation_id)
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_edit_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_bulk_operations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own products" ON public.products
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own store configurations" ON public.store_configurations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own product edit history" ON public.product_edit_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own edit patterns" ON public.user_edit_patterns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recently viewed" ON public.recently_viewed
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlists" ON public.wishlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own wishlist items" ON public.wishlist_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.wishlists 
    WHERE wishlists.id = wishlist_items.wishlist_id 
    AND wishlists.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own shopify orders" ON public.shopify_orders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shopify customers" ON public.shopify_customers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shopify inventory" ON public.shopify_inventory
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own shopify bulk operations" ON public.shopify_bulk_operations
  FOR ALL USING (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.product_edit_history 
  ADD CONSTRAINT fk_product_edit_history_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.recently_viewed 
  ADD CONSTRAINT fk_recently_viewed_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.wishlist_items 
  ADD CONSTRAINT fk_wishlist_items_wishlist 
  FOREIGN KEY (wishlist_id) REFERENCES public.wishlists(id) ON DELETE CASCADE;

ALTER TABLE public.wishlist_items 
  ADD CONSTRAINT fk_wishlist_items_product 
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON public.products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_shopify_id ON public.products(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_store_configurations_user_id ON public.store_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_product_edit_history_product_id ON public.product_edit_history(product_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_user_id ON public.shopify_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_user_id ON public.shopify_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_inventory_user_id ON public.shopify_inventory(user_id);

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_configurations_updated_at
  BEFORE UPDATE ON public.store_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_edit_patterns_updated_at
  BEFORE UPDATE ON public.user_edit_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wishlists_updated_at
  BEFORE UPDATE ON public.wishlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopify_orders_updated_at
  BEFORE UPDATE ON public.shopify_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopify_customers_updated_at
  BEFORE UPDATE ON public.shopify_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shopify_inventory_updated_at
  BEFORE UPDATE ON public.shopify_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();