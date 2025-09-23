-- Create Canada Post as a system-level carrier for all users
INSERT INTO carrier_configurations (
  id,
  user_id,
  carrier_name,
  is_active,
  api_credentials,
  settings,
  account_number
)
SELECT 
  gen_random_uuid(),
  profiles.user_id,
  'Canada Post',
  true,
  '{"system_carrier": true, "managed_by_prepfox": true}',
  '{"internal_service": true, "enabled_services": ["REG", "EXP", "PC"]}',
  'PREPFOX_INTERNAL'
FROM profiles
ON CONFLICT (user_id, carrier_name) DO NOTHING;

-- Create Canada Post shipping services for all users
INSERT INTO shipping_services (
  id,
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
)
SELECT
  gen_random_uuid(),
  cc.user_id,
  cc.id,
  service.code,
  service.name,
  service.type,
  service.days,
  66.0, -- Canada Post max weight in lbs
  true,
  true,
  CASE WHEN service.code = 'PC' THEN true ELSE false END,
  true
FROM carrier_configurations cc
CROSS JOIN (
  VALUES 
    ('REG', 'Regular Parcel', 'standard', '5-7 business days'),
    ('EXP', 'Expedited Parcel', 'expedited', '2-3 business days'),
    ('PC', 'Priority Courier', 'overnight', '1 business day')
) AS service(code, name, type, days)
WHERE cc.carrier_name = 'Canada Post'
ON CONFLICT (user_id, carrier_configuration_id, service_code) DO NOTHING;