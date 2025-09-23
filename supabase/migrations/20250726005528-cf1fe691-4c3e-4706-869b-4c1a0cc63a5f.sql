-- Add new fulfillment destinations
INSERT INTO public.fulfillment_destinations (code, name, description, is_active) VALUES
('FBA', 'Amazon FBA', 'Amazon Fulfillment by Amazon - items will be sent to Amazon warehouses for FBA fulfillment', true),
('WFS', 'Walmart WFS', 'Walmart Fulfillment Services - items will be sent to Walmart warehouses for WFS fulfillment', true),
('OMNI', 'Omni Fulfillment', 'Custom fulfillment channel - specify your preferred fulfillment provider', true)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Create prep services table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.prep_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on prep_services
ALTER TABLE public.prep_services ENABLE ROW LEVEL SECURITY;

-- Create policy for prep services - anyone can view active services
CREATE POLICY "Anyone can view active prep services" 
ON public.prep_services 
FOR SELECT 
USING (is_active = true);

-- Insert default prep services
INSERT INTO public.prep_services (name, description, price, category) VALUES
('Labeling', 'Apply FNSKU or other required labels', 0.25, 'labeling'),
('Poly Bagging', 'Individual poly bag packaging', 0.35, 'packaging'),
('Bubble Wrap', 'Bubble wrap protection for fragile items', 0.50, 'packaging'),
('Taping', 'Secure taping of loose packaging', 0.15, 'packaging'),
('Bundling', 'Bundle multiple items together', 0.75, 'bundling'),
('Inspection', 'Quality inspection and condition check', 0.30, 'inspection'),
('Removal/Disposal', 'Remove old labels or dispose of damaged packaging', 0.40, 'cleanup'),
('Repackaging', 'Complete repackaging in new materials', 1.25, 'packaging')
ON CONFLICT DO NOTHING;

-- Update prep_services updated_at trigger
CREATE TRIGGER update_prep_services_updated_at
BEFORE UPDATE ON public.prep_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();