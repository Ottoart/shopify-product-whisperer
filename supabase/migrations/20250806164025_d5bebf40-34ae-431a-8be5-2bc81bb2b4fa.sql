-- Create AI recommendation tables for Phase 3

-- AI Pricing Recommendations
CREATE TABLE IF NOT EXISTS public.ai_pricing_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  recommendation_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Categorization Suggestions
CREATE TABLE IF NOT EXISTS public.ai_categorization_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  suggestion_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Competitive Analysis
CREATE TABLE IF NOT EXISTS public.ai_competitive_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  analysis_data JSONB NOT NULL DEFAULT '{}',
  confidence_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Learning Patterns (for improving recommendations over time)
CREATE TABLE IF NOT EXISTS public.ai_learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL DEFAULT '{}',
  effectiveness_score NUMERIC DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all AI tables
ALTER TABLE public.ai_pricing_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_categorization_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_competitive_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI Pricing Recommendations
CREATE POLICY "Users can manage their own pricing recommendations"
ON public.ai_pricing_recommendations
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for AI Categorization Suggestions
CREATE POLICY "Users can manage their own categorization suggestions"
ON public.ai_categorization_suggestions
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for AI Competitive Analysis
CREATE POLICY "Users can manage their own competitive analysis"
ON public.ai_competitive_analysis
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for AI Learning Patterns
CREATE POLICY "Users can manage their own learning patterns"
ON public.ai_learning_patterns
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_pricing_recommendations_user_product 
ON public.ai_pricing_recommendations(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_ai_pricing_recommendations_status 
ON public.ai_pricing_recommendations(status);

CREATE INDEX IF NOT EXISTS idx_ai_categorization_suggestions_user_product 
ON public.ai_categorization_suggestions(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_ai_categorization_suggestions_status 
ON public.ai_categorization_suggestions(status);

CREATE INDEX IF NOT EXISTS idx_ai_competitive_analysis_user_product 
ON public.ai_competitive_analysis(user_id, product_id);

CREATE INDEX IF NOT EXISTS idx_ai_learning_patterns_user_type 
ON public.ai_learning_patterns(user_id, pattern_type);

-- Add trigger for updated_at columns
CREATE TRIGGER update_ai_pricing_recommendations_updated_at
  BEFORE UPDATE ON public.ai_pricing_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_categorization_suggestions_updated_at
  BEFORE UPDATE ON public.ai_categorization_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_competitive_analysis_updated_at
  BEFORE UPDATE ON public.ai_competitive_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_learning_patterns_updated_at
  BEFORE UPDATE ON public.ai_learning_patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();