-- Fix 1: Activate the UPS carrier
UPDATE carrier_configurations 
SET is_active = true 
WHERE carrier_name = 'UPS' 
AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248';

-- Fix 2: Correct country codes for Montreal addresses
UPDATE store_shipping_configs 
SET from_country = 'CA' 
WHERE from_city ILIKE '%montreal%' 
AND from_country = 'US' 
AND user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248';