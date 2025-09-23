-- Create a table to store brand tone information for vendors
CREATE TABLE public.vendor_brand_tones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor_name TEXT NOT NULL,
  website_url TEXT,
  brand_tone_analysis JSONB NOT NULL,
  tone_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vendor_name)
);

-- Enable Row Level Security
ALTER TABLE public.vendor_brand_tones ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor brand tones
CREATE POLICY "Users can view their own brand tones" 
ON public.vendor_brand_tones 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brand tones" 
ON public.vendor_brand_tones 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand tones" 
ON public.vendor_brand_tones 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand tones" 
ON public.vendor_brand_tones 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendor_brand_tones_updated_at
BEFORE UPDATE ON public.vendor_brand_tones
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();