-- Create customer profiles table for user account data
CREATE TABLE public.customer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create customer addresses table
CREATE TABLE public.customer_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'order', 'shipping', 'return', 'technical')),
  assigned_to UUID,
  customer_email TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket messages table for conversation history
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order feedback table
CREATE TABLE public.order_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  feedback_text TEXT,
  delivery_experience TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery preferences table
CREATE TABLE public.delivery_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_delivery_time TEXT DEFAULT 'anytime' CHECK (preferred_delivery_time IN ('morning', 'afternoon', 'evening', 'anytime')),
  signature_required BOOLEAN DEFAULT false,
  delivery_instructions TEXT,
  safe_place_instructions TEXT,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create public order tracking table (no auth required)
CREATE TABLE public.public_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  order_number TEXT,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  estimated_delivery DATE,
  tracking_events JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_profiles
CREATE POLICY "Users can view their own profile"
ON public.customer_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.customer_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.customer_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for customer_addresses
CREATE POLICY "Users can manage their own addresses"
ON public.customer_addresses
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for support_tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own tickets"
ON public.support_tickets
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for ticket_messages
CREATE POLICY "Users can view messages for their tickets"
ON public.ticket_messages
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM support_tickets 
  WHERE support_tickets.id = ticket_messages.ticket_id 
  AND (support_tickets.user_id = auth.uid() OR support_tickets.user_id IS NULL)
));

CREATE POLICY "Users can create messages for their tickets"
ON public.ticket_messages
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM support_tickets 
  WHERE support_tickets.id = ticket_messages.ticket_id 
  AND (support_tickets.user_id = auth.uid() OR support_tickets.user_id IS NULL)
));

-- RLS Policies for order_feedback
CREATE POLICY "Users can manage their own feedback"
ON public.order_feedback
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for delivery_preferences
CREATE POLICY "Users can manage their own delivery preferences"
ON public.delivery_preferences
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for public_tracking (public access)
CREATE POLICY "Anyone can view tracking information"
ON public.public_tracking
FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_customer_profiles_user_id ON public.customer_profiles(user_id);
CREATE INDEX idx_customer_addresses_user_id ON public.customer_addresses(user_id);
CREATE INDEX idx_customer_addresses_default ON public.customer_addresses(user_id, is_default);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_number ON public.support_tickets(ticket_number);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_order_feedback_user_id ON public.order_feedback(user_id);
CREATE INDEX idx_order_feedback_order_id ON public.order_feedback(order_id);
CREATE INDEX idx_delivery_preferences_user_id ON public.delivery_preferences(user_id);
CREATE INDEX idx_public_tracking_number ON public.public_tracking(tracking_number);
CREATE INDEX idx_public_tracking_order_number ON public.public_tracking(order_number);

-- Create triggers for updated_at columns
CREATE TRIGGER update_customer_profiles_updated_at
BEFORE UPDATE ON public.customer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_addresses_updated_at
BEFORE UPDATE ON public.customer_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_preferences_updated_at
BEFORE UPDATE ON public.delivery_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_public_tracking_updated_at
BEFORE UPDATE ON public.public_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_customer()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customer_profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  INSERT INTO public.delivery_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created_customer
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_customer();