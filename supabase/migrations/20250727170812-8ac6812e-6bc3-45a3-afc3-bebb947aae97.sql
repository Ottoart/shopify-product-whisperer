-- Update store shipping configurations to standardize address format
-- This fixes the inconsistency between "suite 301" and "301" format

UPDATE store_shipping_configs 
SET address_line1 = CASE 
  WHEN address_line1 ILIKE '%suite 301%' THEN REPLACE(LOWER(address_line1), 'suite 301', '301')
  WHEN address_line1 ILIKE '%suite %' THEN REGEXP_REPLACE(address_line1, '\bsuite\s+(\d+)', '\1', 'gi')
  WHEN address_line1 ILIKE '%apt.%' THEN REGEXP_REPLACE(address_line1, '\bapt\.?\s+(\d+)', '\1', 'gi')
  WHEN address_line1 ILIKE '%#%' THEN REGEXP_REPLACE(address_line1, '#\s*(\d+)', '\1', 'g')
  ELSE address_line1
END,
postal_code = CASE 
  WHEN country_code = 'CA' AND postal_code IS NOT NULL THEN 
    UPPER(REPLACE(postal_code, ' ', ''))
  ELSE postal_code
END,
updated_at = now()
WHERE country_code = 'CA' OR address_line1 ILIKE '%suite%' OR address_line1 ILIKE '%apt%' OR address_line1 ILIKE '%#%';

-- Log the changes made
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % store shipping configuration records for address standardization', updated_count;
END $$;