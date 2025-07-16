-- Create store shipping configurations table
CREATE TABLE public.store_shipping_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Ship from address
  from_name TEXT NOT NULL,
  from_company TEXT,
  from_address_line1 TEXT NOT NULL,
  from_address_line2 TEXT,
  from_city TEXT NOT NULL,
  from_state TEXT NOT NULL,
  from_zip TEXT NOT NULL,
  from_country TEXT NOT NULL DEFAULT 'US',
  from_phone TEXT,
  
  -- Business settings
  business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "17:00"}, "tuesday": {"open": "09:00", "close": "17:00"}, "wednesday": {"open": "09:00", "close": "17:00"}, "thursday": {"open": "09:00", "close": "17:00"}, "friday": {"open": "09:00", "close": "17:00"}, "saturday": {"closed": true}, "sunday": {"closed": true}}',
  cutoff_time TIME DEFAULT '15:00:00',
  
  -- Default package settings
  default_package_type TEXT DEFAULT 'box',
  default_weight_lbs NUMERIC DEFAULT 1.0,
  default_length_inches NUMERIC DEFAULT 12,
  default_width_inches NUMERIC DEFAULT 12,
  default_height_inches NUMERIC DEFAULT 6,
  
  -- Shipping preferences
  preferred_carriers TEXT[] DEFAULT '{}',
  default_service_types TEXT[] DEFAULT '{"standard"}',
  auto_select_cheapest BOOLEAN DEFAULT true,
  require_signature_over_amount NUMERIC,
  insurance_threshold_amount NUMERIC DEFAULT 100,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, store_name)
);

-- Enable Row Level Security
ALTER TABLE public.store_shipping_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for store_shipping_configs
CREATE POLICY "Users can manage their own store shipping configs" 
ON public.store_shipping_configs 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for timestamps
CREATE TRIGGER update_store_shipping_configs_updated_at
BEFORE UPDATE ON public.store_shipping_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_store_shipping_configs_user_default ON public.store_shipping_configs(user_id, is_default);
CREATE INDEX idx_store_shipping_configs_store ON public.store_shipping_configs(user_id, store_name);