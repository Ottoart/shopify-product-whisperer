-- Create fulfillment_orders table for orders ready for fulfillment
CREATE TABLE public.fulfillment_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL,
  priority_level INTEGER NOT NULL DEFAULT 1,
  estimated_pick_time_minutes INTEGER DEFAULT 15,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'allocated', 'picking', 'picked', 'packed', 'shipped', 'cancelled')),
  assigned_picker_id UUID,
  pick_started_at TIMESTAMP WITH TIME ZONE,
  pick_completed_at TIMESTAMP WITH TIME ZONE,
  pack_started_at TIMESTAMP WITH TIME ZONE,
  pack_completed_at TIMESTAMP WITH TIME ZONE
);

-- Create pick_lists table for organizing picking operations
CREATE TABLE public.pick_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pick_session_id UUID,
  total_items INTEGER NOT NULL DEFAULT 0,
  estimated_time_minutes INTEGER DEFAULT 30,
  optimized_path JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  list_name TEXT NOT NULL,
  notes TEXT,
  assigned_picker_id UUID,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create pick_items table for individual items to be picked
CREATE TABLE public.pick_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pick_list_id UUID NOT NULL,
  fulfillment_order_id UUID NOT NULL,
  submission_item_id UUID NOT NULL,
  bin_id UUID NOT NULL,
  quantity_requested INTEGER NOT NULL,
  quantity_picked INTEGER DEFAULT 0,
  pick_sequence INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picking', 'picked', 'short_pick', 'damaged')),
  picked_at TIMESTAMP WITH TIME ZONE,
  picked_by_user_id UUID,
  notes TEXT,
  location_path TEXT
);

-- Create pick_sessions table for batch picking operations
CREATE TABLE public.pick_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_items INTEGER NOT NULL DEFAULT 0,
  total_pick_lists INTEGER NOT NULL DEFAULT 0,
  efficiency_score NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_picker_id UUID,
  notes TEXT,
  session_type TEXT NOT NULL DEFAULT 'batch' CHECK (session_type IN ('batch', 'wave', 'single'))
);

-- Create inventory_allocations table for reserving inventory for orders
CREATE TABLE public.inventory_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fulfillment_order_id UUID NOT NULL,
  submission_item_id UUID NOT NULL,
  bin_id UUID NOT NULL,
  quantity_allocated INTEGER NOT NULL,
  quantity_picked INTEGER DEFAULT 0,
  allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'allocated' CHECK (status IN ('allocated', 'picked', 'released', 'expired')),
  allocation_priority INTEGER DEFAULT 1,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.fulfillment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pick_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for fulfillment_orders
CREATE POLICY "Users can manage their own fulfillment orders" 
ON public.fulfillment_orders 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for pick_lists
CREATE POLICY "Users can manage their own pick lists" 
ON public.pick_lists 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for pick_items
CREATE POLICY "Users can manage pick items for their pick lists" 
ON public.pick_items 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM pick_lists 
  WHERE pick_lists.id = pick_items.pick_list_id 
  AND pick_lists.user_id = auth.uid()
));

-- Create policies for pick_sessions
CREATE POLICY "Users can manage their own pick sessions" 
ON public.pick_sessions 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for inventory_allocations
CREATE POLICY "Users can manage their own inventory allocations" 
ON public.inventory_allocations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_fulfillment_orders_updated_at
BEFORE UPDATE ON public.fulfillment_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pick_lists_updated_at
BEFORE UPDATE ON public.pick_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pick_items_updated_at
BEFORE UPDATE ON public.pick_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pick_sessions_updated_at
BEFORE UPDATE ON public.pick_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_allocations_updated_at
BEFORE UPDATE ON public.inventory_allocations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_fulfillment_orders_user_status ON public.fulfillment_orders(user_id, status);
CREATE INDEX idx_fulfillment_orders_order_id ON public.fulfillment_orders(order_id);
CREATE INDEX idx_pick_lists_user_status ON public.pick_lists(user_id, status);
CREATE INDEX idx_pick_lists_session ON public.pick_lists(pick_session_id);
CREATE INDEX idx_pick_items_list_sequence ON public.pick_items(pick_list_id, pick_sequence);
CREATE INDEX idx_pick_items_fulfillment_order ON public.pick_items(fulfillment_order_id);
CREATE INDEX idx_pick_sessions_user_status ON public.pick_sessions(user_id, status);
CREATE INDEX idx_inventory_allocations_user_status ON public.inventory_allocations(user_id, status);
CREATE INDEX idx_inventory_allocations_order ON public.inventory_allocations(fulfillment_order_id);

-- Create function to automatically allocate inventory when fulfillment order is created
CREATE OR REPLACE FUNCTION public.auto_allocate_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called when a fulfillment order is created
  -- It will automatically allocate available inventory to the order
  -- Implementation can be enhanced based on business rules
  
  INSERT INTO public.inventory_allocations (
    user_id,
    fulfillment_order_id,
    submission_item_id,
    bin_id,
    quantity_allocated,
    allocation_priority,
    expires_at
  )
  SELECT 
    NEW.user_id,
    NEW.id,
    bi.submission_item_id,
    bi.bin_id,
    LEAST(oi.quantity, bi.quantity) as quantity_allocated,
    1 as allocation_priority,
    now() + INTERVAL '24 hours' as expires_at
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN bin_inventory bi ON bi.submission_item_id IN (
    SELECT si.id FROM submission_items si 
    WHERE si.sku = oi.sku
  )
  WHERE o.id = NEW.order_id
  AND bi.quantity > 0
  AND NEW.status = 'pending';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto allocation
CREATE TRIGGER trigger_auto_allocate_inventory
AFTER INSERT ON public.fulfillment_orders
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION public.auto_allocate_inventory();