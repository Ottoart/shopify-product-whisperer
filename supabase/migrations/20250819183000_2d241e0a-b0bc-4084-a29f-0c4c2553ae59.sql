-- Fix admin_data function with correct subscription_entitlements join
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
    -- Fixed join: subscription_entitlements uses plan_id, not user_id
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
            'shipping', EXISTS(SELECT 1 FROM public.subscription_entitlements se2 WHERE se2.plan_id = s.plan_id AND se2.module = 'shipping'),
            'repricing', EXISTS(SELECT 1 FROM public.subscription_entitlements se2 WHERE se2.plan_id = s.plan_id AND se2.module = 'repricing'),
            'fulfillment', EXISTS(SELECT 1 FROM public.subscription_entitlements se2 WHERE se2.plan_id = s.plan_id AND se2.module = 'fulfillment'),
            'productManagement', EXISTS(SELECT 1 FROM public.subscription_entitlements se2 WHERE se2.plan_id = s.plan_id AND se2.module = 'product_management')
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
    LEFT JOIN public.subscription_entitlements se ON se.plan_id = s.plan_id
    WHERE u.created_at > '2024-01-01'::timestamptz  -- Filter out system users
    GROUP BY u.id, u.email, u.created_at, p.display_name, s.id, s.plan_name, s.status, s.current_period_end, s.plan_id
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
          WHEN s.plan_id IS NOT NULL THEN jsonb_build_object(
            'shipping', EXISTS(SELECT 1 FROM public.subscription_entitlements se WHERE se.plan_id = s.plan_id AND se.module = 'shipping'),
            'repricing', EXISTS(SELECT 1 FROM public.subscription_entitlements se WHERE se.plan_id = s.plan_id AND se.module = 'repricing'),
            'fulfillment', EXISTS(SELECT 1 FROM public.subscription_entitlements se WHERE se.plan_id = s.plan_id AND se.module = 'fulfillment'),
            'productManagement', EXISTS(SELECT 1 FROM public.subscription_entitlements se WHERE se.plan_id = s.plan_id AND se.module = 'product_management')
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
    WHERE u.id = (user_data->>'userId')::uuid;
    
    RETURN COALESCE(result, '{}'::jsonb);
    
  ELSE
    RETURN jsonb_build_object('error', 'Invalid action type');
  END IF;
END;
$function$