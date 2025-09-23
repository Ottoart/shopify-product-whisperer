-- Add phone field to store_shipping_configs table
ALTER TABLE store_shipping_configs 
ADD COLUMN IF NOT EXISTS from_phone text;

-- Update existing records with a default phone number if none exists
UPDATE store_shipping_configs 
SET from_phone = '514-555-0123' 
WHERE from_phone IS NULL OR from_phone = '';

-- Add comment to document the phone field requirement
COMMENT ON COLUMN store_shipping_configs.from_phone IS 'Phone number for shipper - required for UPS shipments';