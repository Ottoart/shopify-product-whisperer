-- Clean up products from disconnected stores
-- First, let's remove products that don't have an associated active store configuration
DELETE FROM public.products 
WHERE user_id IN (
  SELECT DISTINCT p.user_id 
  FROM public.products p
  LEFT JOIN public.store_configurations sc ON (
    p.user_id = sc.user_id 
    AND p.vendor = sc.store_name 
    AND sc.is_active = true
    AND sc.platform = 'shopify'
  )
  WHERE sc.id IS NULL 
  AND p.vendor IS NOT NULL
  AND p.vendor != ''
);

-- Also clean up products where vendor doesn't match any active store
DELETE FROM public.products 
WHERE vendor = 'freaksofnature' -- This specific case from the query results
AND user_id NOT IN (
  SELECT user_id FROM public.store_configurations 
  WHERE is_active = true AND platform = 'shopify'
);

-- Create a function to clean up products when stores are disconnected
CREATE OR REPLACE FUNCTION cleanup_disconnected_store_products()
RETURNS TRIGGER AS $$
BEGIN
  -- When a store is deactivated, clean up its products
  IF OLD.is_active = true AND NEW.is_active = false THEN
    DELETE FROM public.products 
    WHERE user_id = NEW.user_id 
    AND (vendor = NEW.store_name OR vendor = OLD.store_name);
    
    -- Log the cleanup
    INSERT INTO public.audit_logs (event_type, user_id, details)
    VALUES (
      'store_products_cleanup',
      NEW.user_id,
      jsonb_build_object(
        'store_name', NEW.store_name,
        'store_id', NEW.id,
        'cleanup_trigger', 'store_deactivation'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for automatic cleanup
DROP TRIGGER IF EXISTS trigger_cleanup_store_products ON public.store_configurations;
CREATE TRIGGER trigger_cleanup_store_products
  AFTER UPDATE ON public.store_configurations
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_disconnected_store_products();