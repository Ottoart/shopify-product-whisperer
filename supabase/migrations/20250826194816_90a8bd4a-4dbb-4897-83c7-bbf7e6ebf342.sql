-- Create tables for enhanced Shopify data fetching

-- Orders table for comprehensive order data
CREATE TABLE IF NOT EXISTS public.shopify_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  customer_id TEXT,
  financial_status TEXT,
  fulfillment_status TEXT,
  total_price DECIMAL,
  subtotal_price DECIMAL,
  total_tax DECIMAL,
  total_discounts DECIMAL,
  currency TEXT DEFAULT 'USD',
  order_status_url TEXT,
  tags TEXT,
  note TEXT,
  gateway TEXT,
  test BOOLEAN DEFAULT false,
  total_line_items_price DECIMAL,
  taxes_included BOOLEAN,
  total_weight INTEGER,
  confirmed BOOLEAN,
  total_tip_received DECIMAL,
  checkout_id TEXT,
  source_name TEXT,
  referring_site TEXT,
  landing_site TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancel_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Billing address
  billing_first_name TEXT,
  billing_last_name TEXT,
  billing_company TEXT,
  billing_address1 TEXT,
  billing_address2 TEXT,
  billing_city TEXT,
  billing_province TEXT,
  billing_country TEXT,
  billing_zip TEXT,
  billing_phone TEXT,
  
  -- Shipping address
  shipping_first_name TEXT,
  shipping_last_name TEXT,
  shipping_company TEXT,
  shipping_address1 TEXT,
  shipping_address2 TEXT,
  shipping_city TEXT,
  shipping_province TEXT,
  shipping_country TEXT,
  shipping_zip TEXT,
  shipping_phone TEXT,
  
  UNIQUE(user_id, shopify_order_id)
);

-- Order line items
CREATE TABLE IF NOT EXISTS public.shopify_order_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.shopify_orders(id) ON DELETE CASCADE,
  shopify_line_item_id TEXT NOT NULL,
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  title TEXT NOT NULL,
  name TEXT,
  sku TEXT,
  vendor TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  total_discount DECIMAL DEFAULT 0,
  fulfillment_service TEXT,
  fulfillment_status TEXT,
  requires_shipping BOOLEAN DEFAULT true,
  taxable BOOLEAN DEFAULT true,
  gift_card BOOLEAN DEFAULT false,
  product_exists BOOLEAN DEFAULT true,
  variant_inventory_management TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, shopify_line_item_id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.shopify_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_customer_id TEXT NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  accepts_marketing BOOLEAN DEFAULT false,
  accepts_marketing_updated_at TIMESTAMP WITH TIME ZONE,
  marketing_opt_in_level TEXT,
  orders_count INTEGER DEFAULT 0,
  state TEXT,
  total_spent DECIMAL DEFAULT 0,
  last_order_id TEXT,
  last_order_name TEXT,
  note TEXT,
  verified_email BOOLEAN DEFAULT false,
  multipass_identifier TEXT,
  tax_exempt BOOLEAN DEFAULT false,
  tags TEXT,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Default address
  default_address_first_name TEXT,
  default_address_last_name TEXT,
  default_address_company TEXT,
  default_address_address1 TEXT,
  default_address_address2 TEXT,
  default_address_city TEXT,
  default_address_province TEXT,
  default_address_country TEXT,
  default_address_zip TEXT,
  default_address_phone TEXT,
  
  UNIQUE(user_id, shopify_customer_id)
);

-- Inventory levels
CREATE TABLE IF NOT EXISTS public.shopify_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_inventory_item_id TEXT NOT NULL,
  shopify_location_id TEXT NOT NULL,
  location_name TEXT,
  available INTEGER DEFAULT 0,
  committed INTEGER DEFAULT 0,
  incoming INTEGER DEFAULT 0,
  on_hand INTEGER DEFAULT 0,
  reserved INTEGER DEFAULT 0,
  damaged INTEGER DEFAULT 0,
  quality_control INTEGER DEFAULT 0,
  safety_stock INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, shopify_inventory_item_id, shopify_location_id)
);

-- Bulk operations tracking
CREATE TABLE IF NOT EXISTS public.shopify_bulk_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shopify_bulk_operation_id TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL,
  query TEXT NOT NULL,
  url TEXT,
  partial_data_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  object_count INTEGER,
  file_size INTEGER,
  error_code TEXT,
  
  UNIQUE(user_id, shopify_bulk_operation_id)
);

-- Enable RLS on all tables
ALTER TABLE public.shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopify_bulk_operations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own Shopify orders" ON public.shopify_orders
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can manage their own Shopify order line items" ON public.shopify_order_line_items
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can manage their own Shopify customers" ON public.shopify_customers
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can manage their own Shopify inventory" ON public.shopify_inventory
  FOR ALL USING (auth.uid() = user_id);
  
CREATE POLICY "Users can manage their own Shopify bulk operations" ON public.shopify_bulk_operations
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shopify_orders_user_id ON public.shopify_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_shopify_order_id ON public.shopify_orders(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_created_at ON public.shopify_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_financial_status ON public.shopify_orders(financial_status);

CREATE INDEX IF NOT EXISTS idx_shopify_order_line_items_user_id ON public.shopify_order_line_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_order_line_items_order_id ON public.shopify_order_line_items(order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_order_line_items_shopify_product_id ON public.shopify_order_line_items(shopify_product_id);

CREATE INDEX IF NOT EXISTS idx_shopify_customers_user_id ON public.shopify_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_email ON public.shopify_customers(email);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_total_spent ON public.shopify_customers(total_spent);

CREATE INDEX IF NOT EXISTS idx_shopify_inventory_user_id ON public.shopify_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_inventory_item_id ON public.shopify_inventory(shopify_inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_shopify_inventory_location_id ON public.shopify_inventory(shopify_location_id);

CREATE INDEX IF NOT EXISTS idx_shopify_bulk_operations_user_id ON public.shopify_bulk_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_shopify_bulk_operations_status ON public.shopify_bulk_operations(status);

-- Add updated_at triggers
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