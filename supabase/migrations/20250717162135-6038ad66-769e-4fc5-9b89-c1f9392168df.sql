-- Add account_number field to carrier_configurations table
ALTER TABLE carrier_configurations 
ADD COLUMN account_number text;

-- Update the existing UPS configuration with the account number
UPDATE carrier_configurations 
SET account_number = 'A906G5' 
WHERE carrier_name = 'UPS' AND is_active = true;