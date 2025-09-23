-- Remove the duplicate UPS configuration and its services
-- Keep the original lowercase "ups" configuration and update it

-- First, delete shipping services for the duplicate UPS configuration
DELETE FROM public.shipping_services 
WHERE carrier_configuration_id = 'd5203b46-d2bc-4e09-909a-7d15edda8106';

-- Delete the duplicate UPS carrier configuration
DELETE FROM public.carrier_configurations 
WHERE id = 'd5203b46-d2bc-4e09-909a-7d15edda8106';

-- Update the original "ups" configuration to standardize the name and add OAuth structure
UPDATE public.carrier_configurations 
SET 
  carrier_name = 'UPS',
  api_credentials = api_credentials || '{"access_token": null, "refresh_token": null, "token_expires_at": null}'::jsonb,
  updated_at = now()
WHERE id = '3f3f589f-a38b-4ea8-8af4-bab0896c862f';

-- Add UPS services to the original configuration if they don't exist
INSERT INTO public.shipping_services (
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
  ('3a393edd-271d-4d32-b18d-e10fce7ee248', '3f3f589f-a38b-4ea8-8af4-bab0896c862f', '03', 'UPS Ground', 'standard', '1-5', 150, true, true, true, true),
  ('3a393edd-271d-4d32-b18d-e10fce7ee248', '3f3f589f-a38b-4ea8-8af4-bab0896c862f', '02', 'UPS 2nd Day Air', 'expedited', '2', 150, true, true, true, true),
  ('3a393edd-271d-4d32-b18d-e10fce7ee248', '3f3f589f-a38b-4ea8-8af4-bab0896c862f', '01', 'UPS Next Day Air', 'overnight', '1', 150, true, true, true, true)
ON CONFLICT (user_id, carrier_configuration_id, service_code) DO NOTHING;