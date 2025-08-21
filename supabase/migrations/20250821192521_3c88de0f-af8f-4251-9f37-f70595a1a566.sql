-- Create store_connections table for clean store management
CREATE TABLE public.store_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  platform text NOT NULL,
  store_name text NOT NULL,
  store_url text,
  api_credentials jsonb NOT NULL DEFAULT '{}',
  connection_status text NOT NULL DEFAULT 'disconnected',
  last_sync_at timestamp with time zone,
  sync_status text NOT NULL DEFAULT 'idle',
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on store_connections
ALTER TABLE public.store_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for store_connections
CREATE POLICY "Users can manage their own store connections"
ON public.store_connections
FOR ALL
USING (auth.uid() = user_id);

-- Create synced_products table for clean product management
CREATE TABLE public.synced_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  store_connection_id uuid NOT NULL REFERENCES public.store_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  title text NOT NULL,
  description text,
  price numeric,
  compare_at_price numeric,
  sku text,
  barcode text,
  inventory_quantity integer DEFAULT 0,
  product_type text,
  vendor text,
  tags text[],
  images jsonb DEFAULT '[]',
  variants jsonb DEFAULT '[]',
  seo_title text,
  seo_description text,
  handle text,
  status text NOT NULL DEFAULT 'active',
  optimization_score integer DEFAULT 0,
  last_optimized_at timestamp with time zone,
  sync_status text NOT NULL DEFAULT 'synced',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on synced_products
ALTER TABLE public.synced_products ENABLE ROW LEVEL SECURITY;

-- Create policies for synced_products
CREATE POLICY "Users can manage their own synced products"
ON public.synced_products
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_store_connections_user_id ON public.store_connections(user_id);
CREATE INDEX idx_store_connections_platform ON public.store_connections(platform);
CREATE INDEX idx_synced_products_user_id ON public.synced_products(user_id);
CREATE INDEX idx_synced_products_store_connection_id ON public.synced_products(store_connection_id);
CREATE INDEX idx_synced_products_external_id ON public.synced_products(external_id);
CREATE INDEX idx_synced_products_sku ON public.synced_products(sku);

-- Create trigger for updated_at
CREATE TRIGGER update_store_connections_updated_at
  BEFORE UPDATE ON public.store_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_synced_products_updated_at
  BEFORE UPDATE ON public.synced_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();