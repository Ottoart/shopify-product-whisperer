-- Create tables for repricing module

-- Repricing rules table
CREATE TABLE public.repricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('competitive', 'velocity', 'inventory', 'time', 'manual')),
  marketplaces TEXT[] NOT NULL DEFAULT '{}',
  conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Product pricing data table
CREATE TABLE public.product_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sku TEXT NOT NULL,
  product_title TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  current_price DECIMAL(10,2),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  cost_of_goods DECIMAL(10,2),
  competitor_price DECIMAL(10,2),
  rule_id UUID REFERENCES public.repricing_rules(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_repriced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sku, marketplace)
);

-- Price change history table
CREATE TABLE public.price_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_pricing_id UUID NOT NULL REFERENCES public.product_pricing(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.repricing_rules(id) ON DELETE SET NULL,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  reason TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('automatic', 'manual', 'rule_triggered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Repricing alerts table
CREATE TABLE public.repricing_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('conflict', 'below_cost', 'buybox_lost', 'stale_data')),
  product_pricing_id UUID REFERENCES public.product_pricing(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.repricing_rules(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Marketplace sync status table
CREATE TABLE public.marketplace_sync_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  marketplace TEXT NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'error')),
  error_message TEXT,
  products_synced INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, marketplace)
);

-- Enable RLS on all tables
ALTER TABLE public.repricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repricing_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sync_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own repricing rules"
ON public.repricing_rules
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own product pricing"
ON public.product_pricing
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own price changes"
ON public.price_changes
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts"
ON public.repricing_alerts
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own marketplace sync status"
ON public.marketplace_sync_status
FOR ALL
USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_repricing_rules_updated_at
  BEFORE UPDATE ON public.repricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_pricing_updated_at
  BEFORE UPDATE ON public.product_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketplace_sync_status_updated_at
  BEFORE UPDATE ON public.marketplace_sync_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();