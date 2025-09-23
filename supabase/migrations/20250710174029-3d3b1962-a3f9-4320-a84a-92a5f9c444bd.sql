-- Create table to track sync status
CREATE TABLE IF NOT EXISTS public.shopify_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  last_page_info TEXT,
  total_synced INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shopify_sync_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sync status" 
ON public.shopify_sync_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sync status" 
ON public.shopify_sync_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync status" 
ON public.shopify_sync_status 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_shopify_sync_status_updated_at
BEFORE UPDATE ON public.shopify_sync_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();