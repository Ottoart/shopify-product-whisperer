-- Add missing fields to order_items table for UPS rating requirements
ALTER TABLE public.order_items 
ADD COLUMN origin_country TEXT DEFAULT 'US',
ADD COLUMN commodity_code TEXT DEFAULT '999999';

-- Add ship_from_address fields to store_configurations for proper address sourcing
ALTER TABLE public.store_configurations
ADD COLUMN ship_from_address JSONB DEFAULT '{"name": "", "company": "", "address": "", "city": "", "state": "", "zip": "", "country": "US"}';

-- Update existing store configurations with default ship-from addresses
UPDATE public.store_configurations 
SET ship_from_address = jsonb_build_object(
  'name', 'Your Store',
  'company', store_name,
  'address', '123 Store Street',
  'city', 'Your City', 
  'state', 'Your State',
  'zip', '12345',
  'country', 'US'
)
WHERE ship_from_address IS NULL OR ship_from_address = '{"name": "", "company": "", "address": "", "city": "", "state": "", "zip": "", "country": "US"}';

COMMENT ON COLUMN order_items.origin_country IS 'Country of origin for the product, used for customs and shipping calculations';
COMMENT ON COLUMN order_items.commodity_code IS 'Harmonized System (HS) commodity code for customs declarations';
COMMENT ON COLUMN store_configurations.ship_from_address IS 'Ship-from address configuration for this store';