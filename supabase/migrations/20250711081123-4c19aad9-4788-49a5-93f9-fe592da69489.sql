-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_platform TEXT NOT NULL, -- 'shopify', 'amazon', 'ebay', etc.
  status TEXT NOT NULL DEFAULT 'awaiting' CHECK (status IN ('awaiting', 'processing', 'shipped', 'delivered', 'cancelled', 'error')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Shipping address
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'US',
  address_validated BOOLEAN DEFAULT false,
  
  -- Package details
  weight_lbs DECIMAL(8,2),
  length_inches DECIMAL(8,2),
  width_inches DECIMAL(8,2),
  height_inches DECIMAL(8,2),
  
  -- Shipping details
  shipping_method TEXT,
  shipping_cost DECIMAL(8,2),
  carrier TEXT,
  service_type TEXT,
  tracking_number TEXT,
  label_url TEXT,
  
  -- Metadata
  tags TEXT[],
  notes TEXT,
  priority_level INTEGER DEFAULT 1,
  
  -- Timestamps
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  shipped_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" 
ON public.orders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_handle TEXT,
  product_title TEXT NOT NULL,
  variant_title TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  weight_lbs DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for order items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items for their orders" 
ON public.order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can manage order items for their orders" 
ON public.order_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

-- Create shipping rules table
CREATE TABLE public.shipping_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  applied_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shipping_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shipping rules" 
ON public.shipping_rules 
FOR ALL 
USING (auth.uid() = user_id);

-- Create tracking events table
CREATE TABLE public.tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL,
  carrier TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking events for their orders" 
ON public.tracking_events 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = tracking_events.order_id 
  AND orders.user_id = auth.uid()
));

-- Create batch processing queue table
CREATE TABLE public.batch_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'paused')),
  total_items INTEGER NOT NULL,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  error_log TEXT[],
  metadata JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batch_operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own batch operations" 
ON public.batch_operations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create returns table
CREATE TABLE public.returns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  return_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'denied', 'in_transit', 'received', 'processed')),
  reason TEXT NOT NULL,
  customer_notes TEXT,
  admin_notes TEXT,
  return_label_url TEXT,
  return_tracking_number TEXT,
  refund_amount DECIMAL(10,2),
  restocking_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own returns" 
ON public.returns 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_tracking_events_order_id ON public.tracking_events(order_id);
CREATE INDEX idx_tracking_events_tracking_number ON public.tracking_events(tracking_number);

-- Create trigger for updating timestamps
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_rules_updated_at
BEFORE UPDATE ON public.shipping_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_returns_updated_at
BEFORE UPDATE ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();