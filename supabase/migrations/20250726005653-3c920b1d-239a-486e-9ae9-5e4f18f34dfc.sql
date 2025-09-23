-- Add new fulfillment destinations (only if they don't exist)
INSERT INTO public.fulfillment_destinations (code, name, description, is_active) VALUES
('FBA', 'Amazon FBA', 'Amazon Fulfillment by Amazon - items will be sent to Amazon warehouses for FBA fulfillment', true),
('WFS', 'Walmart WFS', 'Walmart Fulfillment Services - items will be sent to Walmart warehouses for WFS fulfillment', true),
('OMNI', 'Omni Fulfillment', 'Custom fulfillment channel - specify your preferred fulfillment provider', true)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Insert default prep services (only if they don't exist)
INSERT INTO public.prep_services (name, description, price, category) VALUES
('Labeling', 'Apply FNSKU or other required labels', 0.25, 'labeling'),
('Poly Bagging', 'Individual poly bag packaging', 0.35, 'packaging'),
('Bubble Wrap', 'Bubble wrap protection for fragile items', 0.50, 'packaging'),
('Taping', 'Secure taping of loose packaging', 0.15, 'packaging'),
('Bundling', 'Bundle multiple items together', 0.75, 'bundling'),
('Inspection', 'Quality inspection and condition check', 0.30, 'inspection'),
('Removal/Disposal', 'Remove old labels or dispose of damaged packaging', 0.40, 'cleanup'),
('Repackaging', 'Complete repackaging in new materials', 1.25, 'packaging')
ON CONFLICT (name) DO NOTHING;