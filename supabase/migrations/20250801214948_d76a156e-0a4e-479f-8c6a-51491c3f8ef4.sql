-- Create quote_requests table for Phase 4B
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id),
  service_type TEXT NOT NULL,
  contact_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  business_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  pain_points TEXT,
  additional_services TEXT[] DEFAULT '{}',
  message TEXT,
  estimated_savings TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID NULL,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can create quote requests"
  ON public.quote_requests
  FOR INSERT
  WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "Users can view their own quote requests"
  ON public.quote_requests
  FOR SELECT
  USING (
    user_id IS NULL OR auth.uid() = user_id
  );

CREATE POLICY "Admins can manage all quote requests"
  ON public.quote_requests
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_quote_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quote_requests_updated_at();

-- Create contact_inquiries table for general contact forms
CREATE TABLE public.contact_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general',
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Anyone can create contact inquiries
CREATE POLICY "Anyone can create contact inquiries"
  ON public.contact_inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all contact inquiries"
  ON public.contact_inquiries
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create updated_at trigger for contact_inquiries
CREATE TRIGGER update_contact_inquiries_updated_at
  BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quote_requests_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_quote_requests_service_type ON public.quote_requests(service_type);
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON public.quote_requests(created_at);
CREATE INDEX idx_contact_inquiries_inquiry_type ON public.contact_inquiries(inquiry_type);
CREATE INDEX idx_contact_inquiries_status ON public.contact_inquiries(status);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at);