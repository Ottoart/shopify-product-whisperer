-- Fix security issues with functions by adding SET search_path = '' to all functions
-- that currently don't have it

-- Fix auto_allocate_inventory function
CREATE OR REPLACE FUNCTION public.auto_allocate_inventory()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  -- This function will be called when a fulfillment order is created
  -- It will automatically allocate available inventory to the order
  -- Implementation can be enhanced based on business rules
  
  INSERT INTO public.inventory_allocations (
    user_id,
    fulfillment_order_id,
    submission_item_id,
    bin_id,
    quantity_allocated,
    allocation_priority,
    expires_at
  )
  SELECT 
    NEW.user_id,
    NEW.id,
    bi.submission_item_id,
    bi.bin_id,
    LEAST(oi.quantity, bi.quantity) as quantity_allocated,
    1 as allocation_priority,
    now() + INTERVAL '24 hours' as expires_at
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN bin_inventory bi ON bi.submission_item_id IN (
    SELECT si.id FROM submission_items si 
    WHERE si.sku = oi.sku
  )
  WHERE o.id = NEW.order_id
  AND bi.quantity > 0
  AND NEW.status = 'pending';
  
  RETURN NEW;
END;
$$;

-- Fix check_low_stock function
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  item_record RECORD;
  total_quantity INTEGER;
  threshold INTEGER;
BEGIN
  -- Check each unique submission item
  FOR item_record IN 
    SELECT DISTINCT submission_item_id 
    FROM bin_inventory 
  LOOP
    -- Calculate total quantity across all bins for this item
    SELECT COALESCE(SUM(quantity), 0) INTO total_quantity
    FROM bin_inventory 
    WHERE submission_item_id = item_record.submission_item_id;
    
    -- Set threshold (could be made configurable later)
    threshold := 10; -- Default threshold
    
    -- Create alert if below threshold and no existing unacknowledged alert
    IF total_quantity <= threshold AND NOT EXISTS (
      SELECT 1 FROM low_stock_alerts 
      WHERE submission_item_id = item_record.submission_item_id 
      AND is_acknowledged = false
    ) THEN
      INSERT INTO low_stock_alerts (
        submission_item_id,
        current_quantity,
        threshold_quantity,
        alert_level
      ) VALUES (
        item_record.submission_item_id,
        total_quantity,
        threshold,
        CASE 
          WHEN total_quantity = 0 THEN 'out_of_stock'
          WHEN total_quantity <= threshold / 2 THEN 'critical'
          ELSE 'warning'
        END
      );
    END IF;
  END LOOP;
END;
$$;

-- Fix generate_rma_number function
CREATE OR REPLACE FUNCTION public.generate_rma_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN 'RMA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Fix generate_ticket_number function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Fix handle_inventory_adjustment function
CREATE OR REPLACE FUNCTION public.handle_inventory_adjustment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update bin inventory with adjustment
  UPDATE public.bin_inventory 
  SET quantity = quantity + NEW.adjustment_quantity,
      last_updated_at = now()
  WHERE bin_id = NEW.bin_id 
  AND submission_item_id = NEW.submission_item_id;
  
  RETURN NEW;
END;
$$;

-- Fix handle_inventory_movement function
CREATE OR REPLACE FUNCTION public.handle_inventory_movement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Decrease quantity from source bin (if exists)
  IF NEW.from_bin_id IS NOT NULL THEN
    UPDATE public.bin_inventory 
    SET quantity = quantity - NEW.quantity,
        last_updated_at = now()
    WHERE bin_id = NEW.from_bin_id 
    AND submission_item_id = NEW.submission_item_id;
  END IF;
  
  -- Increase quantity in destination bin
  INSERT INTO public.bin_inventory (bin_id, submission_item_id, quantity, last_updated_at)
  VALUES (NEW.to_bin_id, NEW.submission_item_id, NEW.quantity, now())
  ON CONFLICT (bin_id, submission_item_id)
  DO UPDATE SET 
    quantity = bin_inventory.quantity + NEW.quantity,
    last_updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Fix handle_new_customer function
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.delivery_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- Fix update_shipping_analytics function
CREATE OR REPLACE FUNCTION public.update_shipping_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.shipping_analytics (
    user_id,
    date,
    total_packages,
    total_shipping_cost,
    avg_pack_time_minutes
  )
  SELECT 
    NEW.user_id,
    CURRENT_DATE,
    COUNT(*),
    COALESCE(SUM(shipping_cost), 0),
    COALESCE(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60), 0)
  FROM public.packages p
  JOIN public.pack_sessions ps ON ps.id = p.pack_session_id
  WHERE p.user_id = NEW.user_id 
  AND DATE(p.created_at) = CURRENT_DATE
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_packages = EXCLUDED.total_packages,
    total_shipping_cost = EXCLUDED.total_shipping_cost,
    avg_pack_time_minutes = EXCLUDED.avg_pack_time_minutes,
    updated_at = now();
    
  RETURN NEW;
END;
$$;