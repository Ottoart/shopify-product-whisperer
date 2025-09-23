-- Add new fulfillment destinations using the correct structure
INSERT INTO public.fulfillment_destinations (code, name, description, is_active) VALUES
('FBA', 'Amazon FBA', 'Amazon Fulfillment by Amazon - items will be sent to Amazon warehouses for FBA fulfillment', true),
('WFS', 'Walmart WFS', 'Walmart Fulfillment Services - items will be sent to Walmart warehouses for WFS fulfillment', true),
('OMNI', 'Omni Fulfillment', 'Custom fulfillment channel - specify your preferred fulfillment provider', true)
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Insert prep services using the correct column name (base_price instead of price)
INSERT INTO public.prep_services (name, code, description, base_price, is_active) VALUES
('Labeling', 'LABEL', 'Apply FNSKU or other required labels', 0.25, true),
('Poly Bagging', 'POLY_BAG', 'Individual poly bag packaging', 0.35, true),
('Bubble Wrap', 'BUBBLE', 'Bubble wrap protection for fragile items', 0.50, true),
('Taping', 'TAPE', 'Secure taping of loose packaging', 0.15, true),
('Bundling', 'BUNDLE', 'Bundle multiple items together', 0.75, true),
('Inspection', 'INSPECT', 'Quality inspection and condition check', 0.30, true),
('Removal/Disposal', 'REMOVE', 'Remove old labels or dispose of damaged packaging', 0.40, true),
('Repackaging', 'REPACK', 'Complete repackaging in new materials', 1.25, true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_price = EXCLUDED.base_price,
  is_active = EXCLUDED.is_active;