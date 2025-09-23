-- Create submission payments table to track payment attempts
CREATE TABLE public.submission_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.inventory_submissions(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method_types TEXT[] DEFAULT '{"card"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT
);

-- Create submission invoices table for payment records  
CREATE TABLE public.submission_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.inventory_submissions(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.submission_payments(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  tax_amount_cents INTEGER DEFAULT 0,
  subtotal_cents INTEGER NOT NULL,
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add payment tracking fields to inventory_submissions
ALTER TABLE public.inventory_submissions 
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_id UUID REFERENCES public.submission_payments(id),
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN approved_by_user_id UUID,
ADD COLUMN rejection_reason TEXT,
ADD COLUMN shipment_details JSONB DEFAULT '{}'::jsonb;

-- Update status enum to include new workflow states
-- Note: We'll keep existing status values and add new ones
-- 'draft' - Payment failed or not attempted  
-- 'payment_pending' - Payment session created, awaiting payment
-- 'pending_approval' - Payment successful, awaiting admin approval
-- 'approved' - Admin approved, ready for shipment details
-- 'rejected' - Admin rejected the submission
-- 'in_progress' - Items being processed
-- 'completed' - Submission fulfilled

-- Enable RLS on new tables
ALTER TABLE public.submission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_invoices ENABLE ROW LEVEL SECURITY;

-- RLS policies for submission_payments
CREATE POLICY "Users can manage payments for their submissions" 
ON public.submission_payments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.inventory_submissions 
  WHERE inventory_submissions.id = submission_payments.submission_id 
  AND inventory_submissions.user_id = auth.uid()
));

-- RLS policies for submission_invoices  
CREATE POLICY "Users can view invoices for their submissions"
ON public.submission_invoices
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.inventory_submissions 
  WHERE inventory_submissions.id = submission_invoices.submission_id 
  AND inventory_submissions.user_id = auth.uid()
));

-- Admin policies for approval management
CREATE POLICY "Admins can update submission approvals"
ON public.inventory_submissions
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$;

-- Create trigger to update updated_at columns
CREATE TRIGGER update_submission_payments_updated_at
  BEFORE UPDATE ON public.submission_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submission_invoices_updated_at  
  BEFORE UPDATE ON public.submission_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();