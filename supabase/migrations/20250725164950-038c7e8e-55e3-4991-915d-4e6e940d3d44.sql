-- Create table for storing shipping labels
CREATE TABLE IF NOT EXISTS public.shipment_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID,
  carrier TEXT NOT NULL,
  service_code TEXT NOT NULL,
  service_name TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  label_url TEXT,
  label_data BYTEA,
  label_format TEXT DEFAULT 'PDF',
  cost NUMERIC,
  currency TEXT DEFAULT 'USD',
  shipment_id TEXT,
  status TEXT DEFAULT 'created',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.shipment_labels ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own shipping labels" 
ON public.shipment_labels 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shipping labels" 
ON public.shipment_labels 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shipping labels" 
ON public.shipment_labels 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shipping labels" 
ON public.shipment_labels 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shipment_labels_updated_at
BEFORE UPDATE ON public.shipment_labels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_shipment_labels_user_id ON public.shipment_labels(user_id);
CREATE INDEX idx_shipment_labels_tracking_number ON public.shipment_labels(tracking_number);
CREATE INDEX idx_shipment_labels_order_id ON public.shipment_labels(order_id);