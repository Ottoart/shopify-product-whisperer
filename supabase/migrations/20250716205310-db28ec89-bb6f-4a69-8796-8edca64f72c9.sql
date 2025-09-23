-- Create UPS carrier configuration for existing users
-- This will set up the basic UPS carrier with placeholder credentials
-- Users will need to complete OAuth to get real access tokens

DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users and create UPS carrier configuration if not exists
    FOR user_record IN 
        SELECT id FROM auth.users 
    LOOP
        INSERT INTO public.carrier_configurations (
            user_id, 
            carrier_name, 
            api_credentials, 
            settings, 
            is_active
        ) 
        VALUES (
            user_record.id,
            'UPS',
            '{"client_id": "", "client_secret": "", "access_token": null, "refresh_token": null, "token_expires_at": null}'::jsonb,
            '{"test_mode": true, "description": "UPS shipping services"}'::jsonb,
            true
        ) 
        ON CONFLICT (user_id, carrier_name) 
        DO UPDATE SET 
            updated_at = now();
    END LOOP;
END $$;

-- Also insert some basic UPS shipping services for users who have UPS configured
DO $$
DECLARE
    carrier_record RECORD;
BEGIN
    -- Loop through all UPS carrier configurations and add services
    FOR carrier_record IN 
        SELECT id, user_id FROM public.carrier_configurations WHERE carrier_name = 'UPS'
    LOOP
        -- Insert UPS Ground
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
        ) VALUES (
            carrier_record.user_id,
            carrier_record.id,
            '03',
            'UPS Ground',
            'standard',
            '1-5',
            150,
            true,
            true,
            true,
            true
        ) ON CONFLICT (user_id, carrier_configuration_id, service_code) DO NOTHING;

        -- Insert UPS 2nd Day Air
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
        ) VALUES (
            carrier_record.user_id,
            carrier_record.id,
            '02',
            'UPS 2nd Day Air',
            'expedited',
            '2',
            150,
            true,
            true,
            true,
            true
        ) ON CONFLICT (user_id, carrier_configuration_id, service_code) DO NOTHING;

        -- Insert UPS Next Day Air
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
        ) VALUES (
            carrier_record.user_id,
            carrier_record.id,
            '01',
            'UPS Next Day Air',
            'overnight',
            '1',
            150,
            true,
            true,
            true,
            true
        ) ON CONFLICT (user_id, carrier_configuration_id, service_code) DO NOTHING;
    END LOOP;
END $$;