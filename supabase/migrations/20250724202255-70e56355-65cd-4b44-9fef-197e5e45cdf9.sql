-- Clean up duplicate UPS services, keeping only numeric service codes
DELETE FROM shipping_services 
WHERE user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248' 
AND carrier_configuration_id = '3f3f589f-a38b-4ea8-8af4-bab0896c862f'
AND service_code IN ('UPS_GROUND', 'UPS_NEXT_DAY_AIR', 'UPS_2ND_DAY_AIR', 'UPS_3_DAY_SELECT');

-- Remove old domestic US service codes that don't work for Canada-to-US shipping
DELETE FROM shipping_services 
WHERE user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248' 
AND carrier_configuration_id = '3f3f589f-a38b-4ea8-8af4-bab0896c862f'
AND service_code IN ('01', '02', '03', '12', '13', '14', '59');

-- Insert correct international UPS service codes for Canada-to-US shipping
INSERT INTO shipping_services (
  user_id,
  carrier_configuration_id,
  service_code,
  service_name,
  service_type,
  estimated_days,
  max_weight_lbs,
  supports_tracking,
  supports_insurance,
  supports_signature,
  is_available
) VALUES 
(
  '3a393edd-271d-4d32-b18d-e10fce7ee248',
  '3f3f589f-a38b-4ea8-8af4-bab0896c862f',
  '07',
  'UPS Worldwide Express',
  'international',
  '1-3 business days',
  150,
  true,
  true,
  true,
  true
),
(
  '3a393edd-271d-4d32-b18d-e10fce7ee248',
  '3f3f589f-a38b-4ea8-8af4-bab0896c862f',
  '08',
  'UPS Worldwide Expedited',
  'international',
  '2-5 business days',
  150,
  true,
  true,
  true,
  true
),
(
  '3a393edd-271d-4d32-b18d-e10fce7ee248',
  '3f3f589f-a38b-4ea8-8af4-bab0896c862f',
  '11',
  'UPS Standard',
  'international',
  '1-5 business days',
  150,
  true,
  true,
  true,
  true
),
(
  '3a393edd-271d-4d32-b18d-e10fce7ee248',
  '3f3f589f-a38b-4ea8-8af4-bab0896c862f',
  '54',
  'UPS Worldwide Express Plus',
  'international',
  '1-2 business days',
  150,
  true,
  true,
  true,
  true
),
(
  '3a393edd-271d-4d32-b18d-e10fce7ee248',
  '3f3f589f-a38b-4ea8-8af4-bab0896c862f',
  '65',
  'UPS Worldwide Saver',
  'international',
  '1-3 business days',
  150,
  true,
  true,
  true,
  true
);