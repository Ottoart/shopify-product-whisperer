-- Clean up orphaned Shopify store configurations and associated data
-- First, let's delete the orders from these orphaned stores
DELETE FROM orders WHERE vendor IN ('Shopi', 'Prohair S');

-- Delete any products from these stores
DELETE FROM products WHERE vendor IN ('Shopi', 'Prohair S');

-- Delete the orphaned store configurations
DELETE FROM store_configurations WHERE store_name IN ('Shopi', 'Prohair S') AND platform = 'shopify';

-- Create a function to properly handle cascade deletion when stores are deleted
CREATE OR REPLACE FUNCTION public.cascade_delete_store_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all orders from this store
  DELETE FROM public.orders WHERE vendor = OLD.store_name AND user_id = OLD.user_id;
  
  -- Delete all products from this store
  DELETE FROM public.products WHERE vendor = OLD.store_name AND user_id = OLD.user_id;
  
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for cascade deletion
DROP TRIGGER IF EXISTS trigger_cascade_delete_store_data ON public.store_configurations;
CREATE TRIGGER trigger_cascade_delete_store_data
  BEFORE DELETE ON public.store_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_delete_store_data();

-- Create a function to handle complete user account deletion
CREATE OR REPLACE FUNCTION public.cascade_delete_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all user's store configurations (this will trigger cascade deletion)
  DELETE FROM public.store_configurations WHERE user_id = OLD.id;
  
  -- Delete all remaining user data
  DELETE FROM public.marketplace_configurations WHERE user_id = OLD.id;
  DELETE FROM public.orders WHERE user_id = OLD.id;
  DELETE FROM public.products WHERE user_id = OLD.id;
  DELETE FROM public.profiles WHERE user_id = OLD.id;
  DELETE FROM public.subscriptions WHERE user_id = OLD.id;
  DELETE FROM public.subscription_entitlements WHERE user_id = OLD.id;
  DELETE FROM public.shopify_analytics WHERE user_id = OLD.id;
  DELETE FROM public.marketplace_sync_status WHERE user_id = OLD.id;
  DELETE FROM public.performance_metrics WHERE user_id = OLD.id;
  DELETE FROM public.ai_insights WHERE user_id = OLD.id;
  DELETE FROM public.ai_pricing_recommendations WHERE user_id = OLD.id;
  DELETE FROM public.batch_operations WHERE user_id = OLD.id;
  DELETE FROM public.user_edit_patterns WHERE user_id = OLD.id;
  DELETE FROM public.product_edit_history WHERE user_id = OLD.id;
  DELETE FROM public.recently_viewed WHERE user_id = OLD.id;
  DELETE FROM public.wishlists WHERE user_id = OLD.id;
  DELETE FROM public.email_automations WHERE user_id = OLD.id;
  DELETE FROM public.carrier_configurations WHERE user_id = OLD.id;
  DELETE FROM public.shipping_labels WHERE user_id = OLD.id;
  DELETE FROM public.shipment_labels WHERE user_id = OLD.id;
  DELETE FROM public.quote_requests WHERE user_id = OLD.id;
  DELETE FROM public.support_tickets WHERE user_id = OLD.id;
  DELETE FROM public.order_feedback WHERE user_id = OLD.id;
  DELETE FROM public.inventory_submissions WHERE user_id = OLD.id;
  DELETE FROM public.pick_sessions WHERE user_id = OLD.id;
  DELETE FROM public.pack_sessions WHERE user_id = OLD.id;
  DELETE FROM public.admin_users WHERE user_id = OLD.id;
  DELETE FROM public.user_permissions WHERE user_id = OLD.id;
  DELETE FROM public.audit_logs WHERE user_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user account deletion
DROP TRIGGER IF EXISTS trigger_cascade_delete_user_data ON auth.users;
CREATE TRIGGER trigger_cascade_delete_user_data
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_delete_user_data();