-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.cascade_delete_store_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Delete all products from this store (using store_id foreign key)
  DELETE FROM public.products WHERE store_id = OLD.id;
  
  -- Delete all orders from this store (using store_name)
  DELETE FROM public.orders WHERE store_name = OLD.store_name AND user_id = OLD.user_id;
  
  -- Delete sync status for this store
  DELETE FROM public.marketplace_sync_status WHERE user_id = OLD.user_id AND marketplace_name = OLD.store_name;
  
  -- Delete any analytics data for this store
  DELETE FROM public.shopify_analytics WHERE user_id = OLD.user_id;
  
  -- Log the cleanup
  INSERT INTO public.audit_logs (event_type, user_id, details)
  VALUES (
    'store_complete_deletion',
    OLD.user_id,
    jsonb_build_object(
      'store_name', OLD.store_name,
      'store_id', OLD.id,
      'platform', OLD.platform,
      'cleanup_trigger', 'cascade_delete_function'
    )
  );
  
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public.cascade_delete_user_data(user_uuid uuid)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- Delete all user's store configurations (this will trigger cascade deletion)
  DELETE FROM public.store_configurations WHERE user_id = user_uuid;
  
  -- Delete all remaining user data
  DELETE FROM public.marketplace_configurations WHERE user_id = user_uuid;
  DELETE FROM public.orders WHERE user_id = user_uuid;
  DELETE FROM public.products WHERE user_id = user_uuid;
  DELETE FROM public.profiles WHERE user_id = user_uuid;
  DELETE FROM public.subscriptions WHERE user_id = user_uuid;
  DELETE FROM public.shopify_analytics WHERE user_id = user_uuid;
  DELETE FROM public.marketplace_sync_status WHERE user_id = user_uuid;
  DELETE FROM public.performance_metrics WHERE user_id = user_uuid;
  DELETE FROM public.ai_insights WHERE user_id = user_uuid;
  DELETE FROM public.ai_pricing_recommendations WHERE user_id = user_uuid;
  DELETE FROM public.batch_operations WHERE user_id = user_uuid;
  DELETE FROM public.user_edit_patterns WHERE user_id = user_uuid;
  DELETE FROM public.product_edit_history WHERE user_id = user_uuid;
  DELETE FROM public.recently_viewed WHERE user_id = user_uuid;
  DELETE FROM public.wishlists WHERE user_id = user_uuid;
  DELETE FROM public.email_automations WHERE user_id = user_uuid;
  DELETE FROM public.carrier_configurations WHERE user_id = user_uuid;
  DELETE FROM public.shipping_labels WHERE user_id = user_uuid;
  DELETE FROM public.shipment_labels WHERE user_id = user_uuid;
  DELETE FROM public.quote_requests WHERE user_id = user_uuid;
  DELETE FROM public.support_tickets WHERE user_id = user_uuid;
  DELETE FROM public.order_feedback WHERE user_id = user_uuid;
  DELETE FROM public.inventory_submissions WHERE user_id = user_uuid;
  DELETE FROM public.pick_sessions WHERE user_id = user_uuid;
  DELETE FROM public.pack_sessions WHERE user_id = user_uuid;
  DELETE FROM public.admin_users WHERE user_id = user_uuid;
  DELETE FROM public.user_permissions WHERE user_id = user_uuid;
  DELETE FROM public.audit_logs WHERE user_id = user_uuid;
END;
$$;