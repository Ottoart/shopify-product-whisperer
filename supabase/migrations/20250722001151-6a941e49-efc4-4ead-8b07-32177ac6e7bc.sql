-- Create fulfillment destinations lookup table
CREATE TABLE public.fulfillment_destinations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create prep services lookup table
CREATE TABLE public.prep_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  base_price numeric(10,2) DEFAULT 0.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create inventory submissions table
CREATE TABLE public.inventory_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  submission_number text NOT NULL UNIQUE,
  destination_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  total_items integer DEFAULT 0,
  total_prep_cost numeric(10,2) DEFAULT 0.00,
  special_instructions text,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create submission items table (individual SKUs in a submission)
CREATE TABLE public.submission_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL,
  sku text NOT NULL,
  product_title text NOT NULL,
  quantity integer NOT NULL,
  unit_cost numeric(10,2),
  weight_lbs numeric(8,2),
  length_inches numeric(8,2),
  width_inches numeric(8,2),
  height_inches numeric(8,2),
  expiration_date date,
  lot_number text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create junction table for submission prep services
CREATE TABLE public.submission_prep_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid NOT NULL,
  item_id uuid,
  prep_service_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) DEFAULT 0.00,
  total_price numeric(10,2) DEFAULT 0.00,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.inventory_submissions
ADD CONSTRAINT fk_inventory_submissions_destination
FOREIGN KEY (destination_id) REFERENCES public.fulfillment_destinations(id);

ALTER TABLE public.submission_items
ADD CONSTRAINT fk_submission_items_submission
FOREIGN KEY (submission_id) REFERENCES public.inventory_submissions(id) ON DELETE CASCADE;

ALTER TABLE public.submission_prep_services
ADD CONSTRAINT fk_submission_prep_services_submission
FOREIGN KEY (submission_id) REFERENCES public.inventory_submissions(id) ON DELETE CASCADE;

ALTER TABLE public.submission_prep_services
ADD CONSTRAINT fk_submission_prep_services_item
FOREIGN KEY (item_id) REFERENCES public.submission_items(id) ON DELETE CASCADE;

ALTER TABLE public.submission_prep_services
ADD CONSTRAINT fk_submission_prep_services_service
FOREIGN KEY (prep_service_id) REFERENCES public.prep_services(id);

-- Enable Row Level Security
ALTER TABLE public.fulfillment_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prep_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_prep_services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fulfillment_destinations (public read)
CREATE POLICY "Anyone can view active destinations"
ON public.fulfillment_destinations
FOR SELECT
USING (is_active = true);

-- Create RLS policies for prep_services (public read)
CREATE POLICY "Anyone can view active prep services"
ON public.prep_services
FOR SELECT
USING (is_active = true);

-- Create RLS policies for inventory_submissions
CREATE POLICY "Users can manage their own submissions"
ON public.inventory_submissions
FOR ALL
USING (auth.uid() = user_id);

-- Create RLS policies for submission_items
CREATE POLICY "Users can manage items for their submissions"
ON public.submission_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.inventory_submissions
  WHERE id = submission_items.submission_id
  AND user_id = auth.uid()
));

-- Create RLS policies for submission_prep_services
CREATE POLICY "Users can manage prep services for their submissions"
ON public.submission_prep_services
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.inventory_submissions
  WHERE id = submission_prep_services.submission_id
  AND user_id = auth.uid()
));

-- Insert default fulfillment destinations
INSERT INTO public.fulfillment_destinations (name, code, description) VALUES
('Amazon FBA (Case Packed)', 'FBA_CASE', 'Amazon FBA shipments that are case-packed'),
('Amazon FBA (Individual)', 'FBA_INDIVIDUAL', 'Amazon FBA shipments with individual units'),
('Direct-to-Consumer', 'DTC', 'Direct-to-consumer fulfillment'),
('Walmart Fulfillment', 'WALMART', 'Walmart marketplace fulfillment'),
('Multi-Channel Fulfillment', 'MCF', 'Amazon MCF for other sales channels');

-- Insert default prep services
INSERT INTO public.prep_services (name, code, description, base_price) VALUES
('FNSKU Labeling', 'FNSKU_LABEL', 'Apply FNSKU labels to products', 0.25),
('Polybagging', 'POLYBAG', 'Bag items in polybags for protection', 0.35),
('Bubble Wrap', 'BUBBLE_WRAP', 'Wrap items in bubble wrap for protection', 0.45),
('Kitting/Bundling', 'KITTING', 'Bundle multiple items together', 1.50),
('Expiration Date Labeling', 'EXPIRY_LABEL', 'Apply expiration date labels', 0.30),
('Sticker Removal', 'STICKER_REMOVAL', 'Remove existing stickers and labels', 0.40),
('Quality Inspection', 'QUALITY_CHECK', 'Inspect items for defects or damage', 0.50),
('Repackaging', 'REPACKAGE', 'Repackage items in new packaging', 0.75);

-- Create trigger for updated_at
CREATE TRIGGER update_inventory_submissions_updated_at
BEFORE UPDATE ON public.inventory_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();