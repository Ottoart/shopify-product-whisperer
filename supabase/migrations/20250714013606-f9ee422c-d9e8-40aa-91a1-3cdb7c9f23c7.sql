-- Fix the profile issue by ensuring every user has a profile
INSERT INTO public.profiles (user_id, display_name)
SELECT u.id, COALESCE(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1))
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Create an AI insights table for storing AI-generated business insights
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'pricing', 'inventory', 'marketing', 'trends'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score NUMERIC DEFAULT 0.8,
  data_points JSONB DEFAULT '{}',
  action_items TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' -- 'low', 'medium', 'high', 'critical'
);

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own AI insights" 
ON public.ai_insights 
FOR ALL 
USING (auth.uid() = user_id);

-- Create performance metrics table
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_revenue NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  avg_order_value NUMERIC DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  profit_margin NUMERIC DEFAULT 0,
  cost_savings NUMERIC DEFAULT 0,
  products_optimized INTEGER DEFAULT 0,
  price_changes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own performance metrics" 
ON public.performance_metrics 
FOR ALL 
USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicate daily metrics
ALTER TABLE public.performance_metrics 
ADD CONSTRAINT unique_user_metric_date UNIQUE (user_id, metric_date);

-- Create function to update timestamps
CREATE TRIGGER update_performance_metrics_updated_at
BEFORE UPDATE ON public.performance_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ai_insights_user_type ON public.ai_insights (user_id, insight_type);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights (created_at DESC);
CREATE INDEX idx_performance_metrics_user_date ON public.performance_metrics (user_id, metric_date DESC);