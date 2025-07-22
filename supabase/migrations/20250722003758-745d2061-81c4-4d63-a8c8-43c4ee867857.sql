-- Phase 3: Inventory Management & Storage Tables

-- Table for tracking inventory movements between bins
CREATE TABLE public.inventory_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_item_id UUID NOT NULL,
  from_bin_id UUID NULL,
  to_bin_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  movement_type TEXT NOT NULL DEFAULT 'transfer', -- 'transfer', 'adjustment', 'putaway', 'pick'
  reason TEXT NULL,
  moved_by_user_id UUID NOT NULL,
  moved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for inventory adjustments (manual corrections)
CREATE TABLE public.inventory_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_item_id UUID NOT NULL,
  bin_id UUID NOT NULL,
  adjustment_quantity INTEGER NOT NULL, -- positive or negative
  reason TEXT NOT NULL,
  adjusted_by_user_id UUID NOT NULL,
  adjusted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for low stock alerts
CREATE TABLE public.low_stock_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_item_id UUID NOT NULL,
  current_quantity INTEGER NOT NULL,
  threshold_quantity INTEGER NOT NULL,
  alert_level TEXT NOT NULL DEFAULT 'warning', -- 'warning', 'critical', 'out_of_stock'
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by_user_id UUID NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.low_stock_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_movements
CREATE POLICY "Users can manage movements for their items" ON public.inventory_movements
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM submission_items
    JOIN inventory_submissions ON inventory_submissions.id = submission_items.submission_id
    WHERE submission_items.id = inventory_movements.submission_item_id
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- RLS Policies for inventory_adjustments
CREATE POLICY "Users can manage adjustments for their items" ON public.inventory_adjustments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM submission_items
    JOIN inventory_submissions ON inventory_submissions.id = submission_items.submission_id
    WHERE submission_items.id = inventory_adjustments.submission_item_id
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- RLS Policies for low_stock_alerts
CREATE POLICY "Users can manage alerts for their items" ON public.low_stock_alerts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM submission_items
    JOIN inventory_submissions ON inventory_submissions.id = submission_items.submission_id
    WHERE submission_items.id = low_stock_alerts.submission_item_id
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- Function to update bin inventory after movements
CREATE OR REPLACE FUNCTION public.handle_inventory_movement()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Function to handle inventory adjustments
CREATE OR REPLACE FUNCTION public.handle_inventory_adjustment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update bin inventory with adjustment
  UPDATE public.bin_inventory 
  SET quantity = quantity + NEW.adjustment_quantity,
      last_updated_at = now()
  WHERE bin_id = NEW.bin_id 
  AND submission_item_id = NEW.submission_item_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_inventory_movement
  AFTER INSERT ON public.inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_inventory_movement();

CREATE TRIGGER trigger_inventory_adjustment
  AFTER INSERT ON public.inventory_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_inventory_adjustment();

-- Function to check for low stock and create alerts
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;