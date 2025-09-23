-- Create recently viewed products table (if not exists)
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security for recently viewed
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recently_viewed
DROP POLICY IF EXISTS "Users can manage their own recently viewed" ON public.recently_viewed;
CREATE POLICY "Users can manage their own recently viewed" ON public.recently_viewed
  FOR ALL USING (auth.uid() = user_id);

-- Create function to manage recently viewed (limit to 20 items per user)
CREATE OR REPLACE FUNCTION public.manage_recently_viewed()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the viewed timestamp
  INSERT INTO public.recently_viewed (user_id, product_id, viewed_at)
  VALUES (NEW.user_id, NEW.product_id, NEW.viewed_at)
  ON CONFLICT (user_id, product_id)
  DO UPDATE SET viewed_at = NEW.viewed_at;
  
  -- Keep only the most recent 20 items per user
  DELETE FROM public.recently_viewed
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM public.recently_viewed
    WHERE user_id = NEW.user_id
    ORDER BY viewed_at DESC
    LIMIT 20
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger for managing recently viewed
DROP TRIGGER IF EXISTS manage_recently_viewed_trigger ON public.recently_viewed;
CREATE TRIGGER manage_recently_viewed_trigger
  BEFORE INSERT ON public.recently_viewed
  FOR EACH ROW
  EXECUTE FUNCTION public.manage_recently_viewed();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON public.recently_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON public.recently_viewed(viewed_at DESC);