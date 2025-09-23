-- Create quote_requests table for service quote requests
CREATE TABLE public.quote_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service_type TEXT NOT NULL,
  contact_info JSONB NOT NULL DEFAULT '{}',
  business_details JSONB NOT NULL DEFAULT '{}',
  pain_points TEXT,
  additional_services TEXT[] DEFAULT '{}',
  message TEXT,
  estimated_savings TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_inquiries table for general contact form submissions
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
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS policies for quote_requests
CREATE POLICY "Users can view their own quote requests"
ON public.quote_requests
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create quote requests"
ON public.quote_requests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own quote requests"
ON public.quote_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for contact_inquiries
CREATE POLICY "Anyone can create contact inquiries"
ON public.contact_inquiries
FOR INSERT
WITH CHECK (true);

-- Admin policies (will be added when admin system is implemented)
CREATE POLICY "Admins can manage all quote requests"
ON public.quote_requests
FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all contact inquiries"
ON public.contact_inquiries
FOR ALL
USING (is_admin(auth.uid()));

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_inquiries_updated_at
  BEFORE UPDATE ON public.contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();