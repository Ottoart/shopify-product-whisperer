-- Create packing stations table
CREATE TABLE public.packing_stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  station_name TEXT NOT NULL,
  station_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_user_id UUID,
  current_session_id UUID,
  location_zone TEXT,
  equipment_available JSONB DEFAULT '[]'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pack sessions table
CREATE TABLE public.pack_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  packing_station_id UUID NOT NULL,
  fulfillment_order_id UUID NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  packed_items INTEGER DEFAULT 0,
  estimated_time_minutes INTEGER DEFAULT 30,
  actual_time_minutes INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'preparing',
  session_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pack items table (items being packed in each session)
CREATE TABLE public.pack_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_session_id UUID NOT NULL,
  submission_item_id UUID NOT NULL,
  quantity_requested INTEGER NOT NULL,
  quantity_packed INTEGER DEFAULT 0,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by_user_id UUID,
  item_condition TEXT DEFAULT 'good',
  packing_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create packages table (completed packages ready for shipping)
CREATE TABLE public.packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_session_id UUID NOT NULL,
  package_number TEXT NOT NULL,
  package_type TEXT NOT NULL DEFAULT 'box',
  weight_lbs NUMERIC,
  length_inches NUMERIC,
  width_inches NUMERIC,
  height_inches NUMERIC,
  shipping_label_id UUID,
  tracking_number TEXT,
  carrier TEXT,
  service_type TEXT,
  shipping_cost NUMERIC,
  status TEXT NOT NULL DEFAULT 'packed',
  packed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_confirmation JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create return authorizations table
CREATE TABLE public.return_authorizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL,
  package_id UUID,
  rma_number TEXT NOT NULL UNIQUE,
  return_reason TEXT NOT NULL,
  return_type TEXT NOT NULL DEFAULT 'refund',
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by_user_id UUID,
  received_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE,
  refund_amount NUMERIC,
  restocking_fee NUMERIC DEFAULT 0,
  return_shipping_cost NUMERIC,
  customer_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shipping analytics table
CREATE TABLE public.shipping_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_packages INTEGER DEFAULT 0,
  total_shipping_cost NUMERIC DEFAULT 0,
  avg_pack_time_minutes NUMERIC DEFAULT 0,
  on_time_delivery_rate NUMERIC DEFAULT 0,
  return_rate NUMERIC DEFAULT 0,
  cost_per_package NUMERIC DEFAULT 0,
  carrier_performance JSONB DEFAULT '{}'::jsonb,
  service_type_breakdown JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.packing_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for packing_stations
CREATE POLICY "Anyone can view active packing stations"
ON public.packing_stations
FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can update station assignments"
ON public.packing_stations
FOR UPDATE
USING (true);

-- Create RLS policies for pack_sessions
CREATE POLICY "Users can manage their own pack sessions"
ON public.pack_sessions
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for pack_items
CREATE POLICY "Users can manage pack items for their sessions"
ON public.pack_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM pack_sessions 
  WHERE pack_sessions.id = pack_items.pack_session_id 
  AND pack_sessions.user_id = auth.uid()
));

-- Create RLS policies for packages
CREATE POLICY "Users can manage their own packages"
ON public.packages
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for return_authorizations
CREATE POLICY "Users can manage their own return authorizations"
ON public.return_authorizations
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for shipping_analytics
CREATE POLICY "Users can manage their own shipping analytics"
ON public.shipping_analytics
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_packing_stations_active ON public.packing_stations(is_active);
CREATE INDEX idx_pack_sessions_user_status ON public.pack_sessions(user_id, status);
CREATE INDEX idx_pack_sessions_station ON public.pack_sessions(packing_station_id);
CREATE INDEX idx_pack_items_session ON public.pack_items(pack_session_id);
CREATE INDEX idx_packages_user_status ON public.packages(user_id, status);
CREATE INDEX idx_packages_tracking ON public.packages(tracking_number);
CREATE INDEX idx_return_authorizations_user_status ON public.return_authorizations(user_id, status);
CREATE INDEX idx_return_authorizations_rma ON public.return_authorizations(rma_number);
CREATE INDEX idx_shipping_analytics_user_date ON public.shipping_analytics(user_id, date);

-- Create triggers for updated_at columns
CREATE TRIGGER update_packing_stations_updated_at
BEFORE UPDATE ON public.packing_stations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pack_sessions_updated_at
BEFORE UPDATE ON public.pack_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pack_items_updated_at
BEFORE UPDATE ON public.pack_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_return_authorizations_updated_at
BEFORE UPDATE ON public.return_authorizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shipping_analytics_updated_at
BEFORE UPDATE ON public.shipping_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default packing stations
INSERT INTO public.packing_stations (station_name, station_code, location_zone, equipment_available) VALUES
('Station A1', 'PACK-A1', 'Zone A', '["scale", "tape_dispenser", "scanner", "printer"]'),
('Station A2', 'PACK-A2', 'Zone A', '["scale", "tape_dispenser", "scanner", "printer"]'),
('Station B1', 'PACK-B1', 'Zone B', '["scale", "tape_dispenser", "scanner", "printer", "bubble_wrap"]'),
('Station B2', 'PACK-B2', 'Zone B', '["scale", "tape_dispenser", "scanner", "printer", "bubble_wrap"]');

-- Function to generate RMA numbers
CREATE OR REPLACE FUNCTION public.generate_rma_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'RMA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update shipping analytics
CREATE OR REPLACE FUNCTION public.update_shipping_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.shipping_analytics (
    user_id,
    date,
    total_packages,
    total_shipping_cost,
    avg_pack_time_minutes
  )
  SELECT 
    NEW.user_id,
    CURRENT_DATE,
    COUNT(*),
    COALESCE(SUM(shipping_cost), 0),
    COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60), 0)
  FROM public.packages p
  JOIN public.pack_sessions ps ON ps.id = p.pack_session_id
  WHERE p.user_id = NEW.user_id 
  AND DATE(p.created_at) = CURRENT_DATE
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_packages = EXCLUDED.total_packages,
    total_shipping_cost = EXCLUDED.total_shipping_cost,
    avg_pack_time_minutes = EXCLUDED.avg_pack_time_minutes,
    updated_at = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when packages are created/updated
CREATE TRIGGER update_shipping_analytics_on_package_change
AFTER INSERT OR UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_shipping_analytics();