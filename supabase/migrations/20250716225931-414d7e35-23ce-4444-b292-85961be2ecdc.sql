-- Create shipping_labels table for storing generated shipping labels
CREATE TABLE public.shipping_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL,
  tracking_number TEXT NOT NULL,
  carrier TEXT NOT NULL,
  service_code TEXT NOT NULL,
  service_name TEXT NOT NULL,
  shipment_identification_number TEXT,
  label_image_data TEXT, -- Base64 encoded label image
  shipping_cost DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  label_format TEXT DEFAULT 'GIF',
  status TEXT DEFAULT 'active', -- active, voided
  voided_at TIMESTAMP WITH TIME ZONE,
  void_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shipping_labels ENABLE ROW LEVEL SECURITY;

-- Create policies for shipping_labels
CREATE POLICY "Users can view their own shipping labels" 
ON public.shipping_labels 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shipping labels" 
ON public.shipping_labels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipping labels" 
ON public.shipping_labels 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_shipping_labels_user_id ON public.shipping_labels(user_id);
CREATE INDEX idx_shipping_labels_order_id ON public.shipping_labels(order_id);
CREATE INDEX idx_shipping_labels_tracking_number ON public.shipping_labels(tracking_number);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_shipping_labels_updated_at
BEFORE UPDATE ON public.shipping_labels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add pickup_type_code and improve package type codes in carrier_configurations
ALTER TABLE public.carrier_configurations
ADD COLUMN pickup_type_code TEXT DEFAULT '01', -- 01 = Daily Pickup
ADD COLUMN default_package_type TEXT DEFAULT '02'; -- 02 = Customer Supplied Package