-- Fix admin_data function to match actual subscription_entitlements schema
CREATE OR REPLACE FUNCTION public.admin_data(action_type text, user_data jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  result jsonb;
  user_record record;
BEGIN
  -- Check if user is admin (this should be called from edge function with proper auth)
  
  IF action_type = 'get_users' THEN
    -- Get all users with their subscription data
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', u.id,
        'email', u.email,
        'display_name', p.display_name,
        'created_at', u.created_at,
        'subscription', CASE 
          WHEN s.id IS NOT NULL THEN jsonb_build_object(
            'id', s.id,
            'plan_name', s.plan_name,
            'status', s.status,
            'current_period_end', s.current_period_end
          )
          ELSE NULL
        END,
        'entitlements', CASE 
          WHEN se.id IS NOT NULL THEN jsonb_build_object(
            'shipping', CASE WHEN se.module = 'shipping' THEN true ELSE false END,
            'repricing', CASE WHEN se.module = 'repricing' THEN true ELSE false END,
            'fulfillment', CASE WHEN se.module = 'fulfillment' THEN true ELSE false END,
            'productManagement', CASE WHEN se.module = 'product_management' THEN true ELSE false END
          )
          ELSE jsonb_build_object(
            'shipping', false,
            'repricing', false,
            'fulfillment', false,
            'productManagement', false
          )
        END
      )
    ) INTO result
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    LEFT JOIN public.subscriptions s ON s.user_id = u.id
    LEFT JOIN public.subscription_entitlements se ON se.user_id = u.id
    WHERE u.created_at > '2024-01-01'::timestamptz  -- Filter out system users
    ORDER BY u.created_at DESC
    LIMIT 100;
    
    RETURN jsonb_build_object('users', COALESCE(result, '[]'::jsonb));
    
  ELSIF action_type = 'get_user_subscription' THEN
    -- Get specific user subscription details
    SELECT 
      jsonb_build_object(
        'user_id', u.id,
        'email', u.email,
        'display_name', p.display_name,
        'subscription', CASE 
          WHEN s.id IS NOT NULL THEN jsonb_build_object(
            'id', s.id,
            'plan_name', s.plan_name,
            'status', s.status,
            'current_period_start', s.current_period_start,
            'current_period_end', s.current_period_end,
            'cancel_at_period_end', s.cancel_at_period_end
          )
          ELSE NULL
        END,
        'entitlements', CASE 
          WHEN se.id IS NOT NULL THEN jsonb_build_object(
            'shipping', CASE WHEN se.module = 'shipping' THEN true ELSE false END,
            'repricing', CASE WHEN se.module = 'repricing' THEN true ELSE false END,
            'fulfillment', CASE WHEN se.module = 'fulfillment' THEN true ELSE false END,
            'productManagement', CASE WHEN se.module = 'product_management' THEN true ELSE false END
          )
          ELSE jsonb_build_object(
            'shipping', false,
            'repricing', false,
            'fulfillment', false,
            'productManagement', false
          )
        END
      ) INTO result
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    LEFT JOIN public.subscriptions s ON s.user_id = u.id
    LEFT JOIN public.subscription_entitlements se ON se.user_id = u.id
    WHERE u.id = (user_data->>'userId')::uuid;
    
    RETURN COALESCE(result, '{}'::jsonb);
    
  ELSE
    RETURN jsonb_build_object('error', 'Invalid action type');
  END IF;
END;
$function$