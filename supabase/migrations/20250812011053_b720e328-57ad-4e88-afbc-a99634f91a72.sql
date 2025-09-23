-- Phase A6: Guardrails and normalization for store_configurations
-- 1) Normalize domains (lowercase, remove protocol, trim trailing slashes)
UPDATE public.store_configurations
SET domain = regexp_replace(
  replace(replace(lower(domain), 'https://', ''), 'http://', ''),
  '/+$', ''
)
WHERE domain IS NOT NULL;

-- 2) Normalize access_token values
UPDATE public.store_configurations
SET access_token = CASE
  WHEN access_token ~ '"access_token"\s*:\s*"([^"]+)"' THEN regexp_replace(access_token, '.*"access_token"\s*:\s*"([^"]+)".*', '\1')
  WHEN access_token ~ '"accessToken"\s*:\s*"([^"]+)"' THEN regexp_replace(access_token, '.*"accessToken"\s*:\s*"([^"]+)".*', '\1')
  ELSE regexp_replace(access_token, '\\s+', '', 'g')
END
WHERE access_token IS NOT NULL;

-- 3) Deduplicate rows per (user_id, platform, domain) keeping the most recent
WITH ranked AS (
  SELECT id, user_id, platform, domain, updated_at, created_at,
         row_number() OVER (PARTITION BY user_id, platform, domain ORDER BY updated_at DESC, created_at DESC, id DESC) AS rn
  FROM public.store_configurations
)
DELETE FROM public.store_configurations
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 4) Unique guardrail to prevent duplicates going forward
CREATE UNIQUE INDEX IF NOT EXISTS idx_store_configurations_user_platform_domain
ON public.store_configurations (user_id, platform, domain);

-- 5) Normalization trigger for future inserts/updates
CREATE OR REPLACE FUNCTION public.normalize_store_configurations()
RETURNS trigger AS $$
BEGIN
  IF NEW.domain IS NOT NULL THEN
    NEW.domain := regexp_replace(replace(replace(lower(NEW.domain), 'https://', ''), 'http://', ''), '/+$', '');
  END IF;
  IF NEW.access_token IS NOT NULL THEN
    NEW.access_token := regexp_replace(NEW.access_token, '\\s+', '', 'g');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_normalize_store_configurations'
  ) THEN
    CREATE TRIGGER trg_normalize_store_configurations
    BEFORE INSERT OR UPDATE ON public.store_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_store_configurations();
  END IF;
END$$;