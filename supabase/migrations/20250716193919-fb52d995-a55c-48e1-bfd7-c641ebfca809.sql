-- Create table for carrier configurations
CREATE TABLE public.carrier_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  carrier_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_credentials JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, carrier_name)
);

-- Create table for available shipping services
CREATE TABLE public.shipping_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  carrier_configuration_id UUID NOT NULL REFERENCES carrier_configurations(id) ON DELETE CASCADE,
  service_code TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL, -- standard, expedited, overnight, etc.
  estimated_days TEXT,
  max_weight_lbs NUMERIC,
  supports_tracking BOOLEAN DEFAULT true,
  supports_insurance BOOLEAN DEFAULT false,
  supports_signature BOOLEAN DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, carrier_configuration_id, service_code)
);

-- Enable Row Level Security
ALTER TABLE public.carrier_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_services ENABLE ROW LEVEL SECURITY;

-- Create policies for carrier_configurations
CREATE POLICY "Users can manage their own carrier configurations" 
ON public.carrier_configurations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create policies for shipping_services
CREATE POLICY "Users can manage their own shipping services" 
ON public.shipping_services 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_carrier_configurations_updated_at
BEFORE UPDATE ON public.carrier_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_carrier_configurations_user_active ON public.carrier_configurations(user_id, is_active);
CREATE INDEX idx_shipping_services_user_available ON public.shipping_services(user_id, is_available);
CREATE INDEX idx_shipping_services_carrier ON public.shipping_services(carrier_configuration_id);