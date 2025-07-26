-- Clean up any old Canada Post OAuth configurations
UPDATE carrier_configurations 
SET api_credentials = jsonb_build_object(
    'api_username', '', 
    'api_password', '', 
    'customer_number', '',
    'environment', 'development'
), 
is_active = false
WHERE carrier_name = 'Canada Post' 
AND (api_credentials ? 'oauth_token' OR api_credentials ? 'state');