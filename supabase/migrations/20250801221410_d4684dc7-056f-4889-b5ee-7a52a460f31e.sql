-- Create email automation tracking table
CREATE TABLE IF NOT EXISTS public.email_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  template_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_automations ENABLE ROW LEVEL SECURITY;

-- Create policies for email automations
CREATE POLICY "Users can view their own email automations"
ON public.email_automations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email automations"
ON public.email_automations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email automations"
ON public.email_automations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all email automations"
ON public.email_automations
FOR ALL
USING (is_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_email_automations_updated_at
BEFORE UPDATE ON public.email_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_automations_user_id ON public.email_automations(user_id);
CREATE INDEX idx_email_automations_status ON public.email_automations(status);
CREATE INDEX idx_email_automations_scheduled_for ON public.email_automations(scheduled_for);
CREATE INDEX idx_email_automations_email_type ON public.email_automations(email_type);