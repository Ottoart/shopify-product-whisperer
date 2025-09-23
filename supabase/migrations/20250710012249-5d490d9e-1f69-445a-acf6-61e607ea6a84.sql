-- Create table to track manual product edits
CREATE TABLE public.product_edit_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_handle TEXT NOT NULL,
  field_name TEXT NOT NULL, -- title, description, tags, type, etc.
  before_value TEXT,
  after_value TEXT,
  edit_type TEXT NOT NULL, -- 'manual', 'ai_suggestion', 'bulk_edit'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_edit_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own edit history" 
ON public.product_edit_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own edit history" 
ON public.product_edit_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create table for learned patterns and user preferences
CREATE TABLE public.user_edit_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL, -- 'title_style', 'description_format', 'tag_preference', etc.
  pattern_data JSONB NOT NULL, -- flexible storage for pattern details
  confidence_score DECIMAL DEFAULT 0.0, -- how confident we are in this pattern
  usage_count INTEGER DEFAULT 0, -- how often this pattern was detected
  is_approved BOOLEAN DEFAULT NULL, -- user can approve/reject patterns
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_edit_patterns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own patterns" 
ON public.user_edit_patterns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patterns" 
ON public.user_edit_patterns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns" 
ON public.user_edit_patterns 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_edit_patterns_updated_at
BEFORE UPDATE ON public.user_edit_patterns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_product_edit_history_user_id ON public.product_edit_history(user_id);
CREATE INDEX idx_product_edit_history_product_handle ON public.product_edit_history(product_handle);
CREATE INDEX idx_product_edit_history_field_name ON public.product_edit_history(field_name);
CREATE INDEX idx_user_edit_patterns_user_id ON public.user_edit_patterns(user_id);
CREATE INDEX idx_user_edit_patterns_type ON public.user_edit_patterns(pattern_type);