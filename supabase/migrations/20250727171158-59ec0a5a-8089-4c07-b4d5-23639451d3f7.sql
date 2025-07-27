-- Update store shipping configurations to standardize address format
-- This fixes the inconsistency between "suite 301" and "301" format

UPDATE store_shipping_configs 
SET from_address_line1 = CASE 
  WHEN from_address_line1 ILIKE '%suite 301%' THEN REPLACE(from_address_line1, 'suite 301', '301')
  WHEN from_address_line1 ILIKE '%suite %' THEN REGEXP_REPLACE(from_address_line1, '\bsuite\s+(\d+)', '\1', 'gi')
  WHEN from_address_line1 ILIKE '%apt.%' THEN REGEXP_REPLACE(from_address_line1, '\bapt\.?\s+(\d+)', '\1', 'gi')
  WHEN from_address_line1 ILIKE '%#%' THEN REGEXP_REPLACE(from_address_line1, '#\s*(\d+)', '\1', 'g')
  ELSE from_address_line1
END,
from_zip = CASE 
  WHEN from_country = 'CA' AND from_zip IS NOT NULL THEN 
    UPPER(REPLACE(from_zip, ' ', ''))
  ELSE from_zip
END,
from_country = 'CA', -- Fix the incorrect US country code for Canadian addresses
updated_at = now()
WHERE from_country IN ('CA', 'US') AND (from_address_line1 ILIKE '%suite%' OR from_address_line1 ILIKE '%apt%' OR from_address_line1 ILIKE '%#%' OR from_zip LIKE '% %');

-- Log the changes made
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % store shipping configuration records for address standardization', updated_count;
END $$;