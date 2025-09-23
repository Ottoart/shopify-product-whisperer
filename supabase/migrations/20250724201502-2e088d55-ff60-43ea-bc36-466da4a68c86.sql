-- Clean up duplicate UPS services, keeping only numeric service codes
DELETE FROM shipping_services 
WHERE user_id = '3a393edd-271d-4d32-b18d-e10fce7ee248' 
AND carrier_configuration_id = '3f3f589f-a38b-4ea8-8af4-bab0896c862f'
AND service_code IN ('UPS_GROUND', 'UPS_NEXT_DAY_AIR', 'UPS_2ND_DAY_AIR', 'UPS_3_DAY_SELECT');