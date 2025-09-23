-- Remove duplicate UPS services with string-based service codes
DELETE FROM shipping_services 
WHERE service_code IN ('UPS_GROUND', 'UPS_NEXT_DAY_AIR', 'UPS_2ND_DAY_AIR', 'UPS_3_DAY_SELECT')
AND carrier_configuration_id IN (
  SELECT id FROM carrier_configurations WHERE carrier_name = 'UPS'
);