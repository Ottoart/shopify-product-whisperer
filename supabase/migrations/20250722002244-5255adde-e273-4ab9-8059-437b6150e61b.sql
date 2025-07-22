-- Phase 2: Receiving & Inspection Tables

-- Create table for warehouse bin locations
CREATE TABLE public.warehouse_bins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bin_code TEXT NOT NULL UNIQUE,
  zone_name TEXT NOT NULL,
  aisle_number INTEGER,
  shelf_level INTEGER,
  bin_type TEXT NOT NULL DEFAULT 'storage', -- storage, staging, quarantine
  max_capacity INTEGER DEFAULT 100,
  current_capacity INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for receiving records
CREATE TABLE public.receiving_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL,
  received_by_user_id UUID NOT NULL,
  total_cartons INTEGER DEFAULT 0,
  total_items_expected INTEGER DEFAULT 0,
  total_items_received INTEGER DEFAULT 0,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, discrepant
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for carton tracking
CREATE TABLE public.received_cartons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receiving_record_id UUID NOT NULL,
  carton_barcode TEXT NOT NULL,
  weight_lbs NUMERIC,
  length_inches NUMERIC,
  width_inches NUMERIC,
  height_inches NUMERIC,
  condition_status TEXT NOT NULL DEFAULT 'good', -- good, damaged, wet, crushed
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scanned_by_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for item inspection
CREATE TABLE public.item_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_item_id UUID NOT NULL,
  received_carton_id UUID,
  quantity_expected INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL,
  condition_status TEXT NOT NULL DEFAULT 'good', -- good, damaged, expired, missing_labels
  quality_grade TEXT DEFAULT 'A', -- A, B, C, reject
  expiration_check_passed BOOLEAN DEFAULT true,
  label_check_passed BOOLEAN DEFAULT true,
  packaging_check_passed BOOLEAN DEFAULT true,
  assigned_bin_id UUID,
  inspected_by_user_id UUID NOT NULL,
  inspected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for discrepancies
CREATE TABLE public.receiving_discrepancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receiving_record_id UUID NOT NULL,
  submission_item_id UUID,
  discrepancy_type TEXT NOT NULL, -- quantity_short, quantity_over, condition_issue, wrong_item, missing_item
  expected_quantity INTEGER,
  actual_quantity INTEGER,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  resolution_status TEXT NOT NULL DEFAULT 'open', -- open, investigating, resolved, escalated
  resolution_notes TEXT,
  reported_by_user_id UUID NOT NULL,
  resolved_by_user_id UUID,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for bin inventory tracking
CREATE TABLE public.bin_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bin_id UUID NOT NULL,
  submission_item_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.receiving_records
ADD CONSTRAINT fk_receiving_submission 
FOREIGN KEY (submission_id) REFERENCES public.inventory_submissions(id) ON DELETE CASCADE;

ALTER TABLE public.received_cartons
ADD CONSTRAINT fk_carton_receiving 
FOREIGN KEY (receiving_record_id) REFERENCES public.receiving_records(id) ON DELETE CASCADE;

ALTER TABLE public.item_inspections
ADD CONSTRAINT fk_inspection_item 
FOREIGN KEY (submission_item_id) REFERENCES public.submission_items(id) ON DELETE CASCADE;

ALTER TABLE public.item_inspections
ADD CONSTRAINT fk_inspection_carton 
FOREIGN KEY (received_carton_id) REFERENCES public.received_cartons(id) ON DELETE SET NULL;

ALTER TABLE public.item_inspections
ADD CONSTRAINT fk_inspection_bin 
FOREIGN KEY (assigned_bin_id) REFERENCES public.warehouse_bins(id) ON DELETE SET NULL;

ALTER TABLE public.receiving_discrepancies
ADD CONSTRAINT fk_discrepancy_receiving 
FOREIGN KEY (receiving_record_id) REFERENCES public.receiving_records(id) ON DELETE CASCADE;

ALTER TABLE public.receiving_discrepancies
ADD CONSTRAINT fk_discrepancy_item 
FOREIGN KEY (submission_item_id) REFERENCES public.submission_items(id) ON DELETE SET NULL;

ALTER TABLE public.bin_inventory
ADD CONSTRAINT fk_bin_inventory_bin 
FOREIGN KEY (bin_id) REFERENCES public.warehouse_bins(id) ON DELETE CASCADE;

ALTER TABLE public.bin_inventory
ADD CONSTRAINT fk_bin_inventory_item 
FOREIGN KEY (submission_item_id) REFERENCES public.submission_items(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.warehouse_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.received_cartons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bin_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for warehouse_bins (public read, admin manage)
CREATE POLICY "Anyone can view active bins" 
ON public.warehouse_bins 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for receiving_records
CREATE POLICY "Users can manage receiving for their submissions" 
ON public.receiving_records 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM inventory_submissions 
    WHERE inventory_submissions.id = receiving_records.submission_id 
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- Create RLS policies for received_cartons
CREATE POLICY "Users can manage cartons for their submissions" 
ON public.received_cartons 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM receiving_records 
    JOIN inventory_submissions ON inventory_submissions.id = receiving_records.submission_id
    WHERE receiving_records.id = received_cartons.receiving_record_id 
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- Create RLS policies for item_inspections
CREATE POLICY "Users can manage inspections for their items" 
ON public.item_inspections 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM submission_items 
    JOIN inventory_submissions ON inventory_submissions.id = submission_items.submission_id
    WHERE submission_items.id = item_inspections.submission_item_id 
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- Create RLS policies for receiving_discrepancies
CREATE POLICY "Users can manage discrepancies for their submissions" 
ON public.receiving_discrepancies 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM receiving_records 
    JOIN inventory_submissions ON inventory_submissions.id = receiving_records.submission_id
    WHERE receiving_records.id = receiving_discrepancies.receiving_record_id 
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- Create RLS policies for bin_inventory
CREATE POLICY "Users can view inventory for their items" 
ON public.bin_inventory 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM submission_items 
    JOIN inventory_submissions ON inventory_submissions.id = submission_items.submission_id
    WHERE submission_items.id = bin_inventory.submission_item_id 
    AND inventory_submissions.user_id = auth.uid()
  )
);

-- Create updated_at triggers
CREATE TRIGGER update_warehouse_bins_updated_at
BEFORE UPDATE ON public.warehouse_bins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receiving_records_updated_at
BEFORE UPDATE ON public.receiving_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample warehouse bins
INSERT INTO public.warehouse_bins (bin_code, zone_name, aisle_number, shelf_level, bin_type) VALUES
('A01-001', 'Receiving', 1, 1, 'staging'),
('A01-002', 'Receiving', 1, 1, 'staging'),
('A01-003', 'Receiving', 1, 1, 'staging'),
('B01-001', 'Storage', 1, 1, 'storage'),
('B01-002', 'Storage', 1, 2, 'storage'),
('B01-003', 'Storage', 1, 3, 'storage'),
('B02-001', 'Storage', 2, 1, 'storage'),
('B02-002', 'Storage', 2, 2, 'storage'),
('C01-001', 'Prep', 1, 1, 'storage'),
('C01-002', 'Prep', 1, 2, 'storage'),
('Q01-001', 'Quarantine', 1, 1, 'quarantine'),
('Q01-002', 'Quarantine', 1, 2, 'quarantine');

-- Update submission status options to include receiving status
COMMENT ON COLUMN public.inventory_submissions.status IS 'Status: draft, submitted, receiving, received, prep_in_progress, prep_completed, shipped, cancelled';