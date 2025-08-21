-- Update the cascade delete trigger function to bypass RLS during cleanup
CREATE OR REPLACE FUNCTION public.cascade_delete_store_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Temporarily disable RLS for cleanup operations
  PERFORM set_config('row_security', 'off', true);
  
  -- Delete all products from this store (using store_id foreign key)
  DELETE FROM public.products WHERE store_id = OLD.id;
  
  -- Delete all orders from this store (using store_name)
  DELETE FROM public.orders WHERE store_name = OLD.store_name AND user_id = OLD.user_id;
  
  -- Delete sync status for this store
  DELETE FROM public.marketplace_sync_status WHERE user_id = OLD.user_id AND marketplace_name = OLD.store_name;
  
  -- Delete any analytics data for this store
  DELETE FROM public.shopify_analytics WHERE user_id = OLD.user_id;
  
  -- Re-enable RLS
  PERFORM set_config('row_security', 'on', true);
  
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
$function$;