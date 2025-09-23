-- Phase 1 Complete Implementation: Data Integrity & Validation Foundation (Fixed)

-- Step 1: Create sync_logs table for comprehensive audit trail
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  sync_type text NOT NULL, -- 'shopify', 'ebay', etc.
  operation_type text NOT NULL, -- 'full_sync', 'batch_sync', 'validation', 'cleanup'
  batch_number integer,
  total_batches integer,
  products_processed integer DEFAULT 0,
  products_successful integer DEFAULT 0,
  products_failed integer DEFAULT 0,
  sync_duration_ms integer,
  api_calls_made integer DEFAULT 0,
  rate_limit_hits integer DEFAULT 0,
  memory_usage_mb numeric,
  cpu_usage_percent numeric,
  status text NOT NULL DEFAULT 'started', -- 'started', 'processing', 'completed', 'failed', 'cancelled'
  error_details jsonb DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  validation_results jsonb DEFAULT '{}',
  api_response_samples jsonb DEFAULT '[]',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for sync_logs
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sync logs"
ON public.sync_logs
FOR ALL
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_sync_type ON public.sync_logs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON public.sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_operation_type ON public.sync_logs(operation_type);

-- Step 2: Create comprehensive data validation function (fixed column names)
CREATE OR REPLACE FUNCTION public.validate_sync_data_consistency(target_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  validation_result jsonb := '{}';
  user_record RECORD;
  inconsistencies jsonb := '[]';
  total_issues integer := 0;
BEGIN
  -- If no user specified, validate all users
  FOR user_record IN 
    SELECT user_id FROM public.store_configurations 
    WHERE (target_user_id IS NULL OR user_id = target_user_id)
    AND platform = 'shopify'
  LOOP
    DECLARE
      products_count integer;
      shopify_status_count integer;
      marketplace_status_count integer;
      unsynced_products integer;
      orphaned_status integer;
      duplicate_products integer;
      missing_sync_settings integer;
      user_issues jsonb := '{}';
      user_issue_count integer := 0;
    BEGIN
      -- Count products for this user
      SELECT COUNT(*) INTO products_count
      FROM public.products 
      WHERE user_id = user_record.user_id;
      
      -- Count shopify sync status records (using correct column name)
      SELECT COALESCE(total_synced, 0) INTO shopify_status_count
      FROM public.shopify_sync_status 
      WHERE user_id = user_record.user_id;
      
      -- Count marketplace sync status records
      SELECT COALESCE(products_synced, 0) INTO marketplace_status_count
      FROM public.marketplace_sync_status 
      WHERE user_id = user_record.user_id AND marketplace = 'shopify';
      
      -- Count unsynced products
      SELECT COUNT(*) INTO unsynced_products
      FROM public.products 
      WHERE user_id = user_record.user_id 
      AND shopify_synced_at IS NULL;
      
      -- Count orphaned status records
      SELECT COUNT(*) INTO orphaned_status
      FROM public.shopify_sync_status 
      WHERE user_id = user_record.user_id
      AND NOT EXISTS (
        SELECT 1 FROM public.store_configurations 
        WHERE user_id = user_record.user_id AND platform = 'shopify'
      );
      
      -- Count duplicate products (same handle for same user)
      SELECT COUNT(*) - COUNT(DISTINCT handle) INTO duplicate_products
      FROM public.products 
      WHERE user_id = user_record.user_id;
      
      -- Count missing sync settings
      SELECT CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END INTO missing_sync_settings
      FROM public.sync_settings 
      WHERE user_id = user_record.user_id;
      
      -- Build user-specific issues
      user_issues := jsonb_build_object(
        'user_id', user_record.user_id,
        'products_count', products_count,
        'shopify_status_count', shopify_status_count,
        'marketplace_status_count', marketplace_status_count,
        'unsynced_products', unsynced_products,
        'orphaned_status', orphaned_status,
        'duplicate_products', duplicate_products,
        'missing_sync_settings', missing_sync_settings,
        'issues', '[]'::jsonb
      );
      
      -- Check for inconsistencies
      IF shopify_status_count != marketplace_status_count THEN
        user_issues := jsonb_set(user_issues, '{issues}', 
          (user_issues->'issues') || '["Status count mismatch between tables"]'::jsonb);
        user_issue_count := user_issue_count + 1;
      END IF;
      
      IF unsynced_products > 0 AND shopify_status_count > 0 THEN
        user_issues := jsonb_set(user_issues, '{issues}', 
          (user_issues->'issues') || jsonb_build_array('Unsynced products exist despite positive sync count'));
        user_issue_count := user_issue_count + 1;
      END IF;
      
      IF orphaned_status > 0 THEN
        user_issues := jsonb_set(user_issues, '{issues}', 
          (user_issues->'issues') || '["Orphaned sync status records"]'::jsonb);
        user_issue_count := user_issue_count + 1;
      END IF;
      
      IF duplicate_products > 0 THEN
        user_issues := jsonb_set(user_issues, '{issues}', 
          (user_issues->'issues') || '["Duplicate product handles"]'::jsonb);
        user_issue_count := user_issue_count + 1;
      END IF;
      
      IF missing_sync_settings > 0 THEN
        user_issues := jsonb_set(user_issues, '{issues}', 
          (user_issues->'issues') || '["Missing sync settings"]'::jsonb);
        user_issue_count := user_issue_count + 1;
      END IF;
      
      -- Add to inconsistencies if issues found
      IF user_issue_count > 0 THEN
        inconsistencies := inconsistencies || jsonb_build_array(user_issues);
        total_issues := total_issues + user_issue_count;
      END IF;
    END;
  END LOOP;
  
  -- Build final result
  validation_result := jsonb_build_object(
    'validation_timestamp', now(),
    'total_issues_found', total_issues,
    'total_users_checked', (SELECT COUNT(*) FROM public.store_configurations WHERE platform = 'shopify'),
    'inconsistencies', inconsistencies,
    'summary', jsonb_build_object(
      'critical_issues', total_issues,
      'requires_cleanup', CASE WHEN total_issues > 0 THEN true ELSE false END
    )
  );
  
  -- Log validation results
  INSERT INTO public.sync_logs (
    user_id, sync_type, operation_type, status, validation_results, completed_at
  ) VALUES (
    COALESCE(target_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'system', 'validation', 'completed', validation_result, now()
  );
  
  RETURN validation_result;
END;
$$;

-- Step 3: Create comprehensive cleanup function (fixed column references)
CREATE OR REPLACE FUNCTION public.cleanup_sync_inconsistencies(target_user_id uuid DEFAULT NULL, dry_run boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  cleanup_result jsonb := '{}';
  user_record RECORD;
  actions_taken jsonb := '[]';
  total_actions integer := 0;
BEGIN
  -- Log cleanup start
  INSERT INTO public.sync_logs (
    user_id, sync_type, operation_type, status, error_details
  ) VALUES (
    COALESCE(target_user_id, '00000000-0000-0000-0000-000000000000'::uuid),
    'system', 'cleanup', 'started', 
    jsonb_build_object('dry_run', dry_run, 'target_user', target_user_id)
  );
  
  FOR user_record IN 
    SELECT user_id FROM public.store_configurations 
    WHERE (target_user_id IS NULL OR user_id = target_user_id)
    AND platform = 'shopify'
  LOOP
    DECLARE
      user_actions jsonb := '[]';
      action_count integer := 0;
    BEGIN
      -- 1. Sync marketplace_sync_status with shopify_sync_status (using correct column names)
      IF NOT dry_run THEN
        INSERT INTO public.marketplace_sync_status (
          user_id, marketplace, sync_status, products_synced, last_sync_at
        )
        SELECT 
          sss.user_id, 'shopify', sss.sync_status, sss.total_synced, sss.last_sync_at
        FROM public.shopify_sync_status sss
        WHERE sss.user_id = user_record.user_id
        ON CONFLICT (user_id, marketplace) 
        DO UPDATE SET
          sync_status = EXCLUDED.sync_status,
          products_synced = EXCLUDED.products_synced,
          last_sync_at = EXCLUDED.last_sync_at,
          updated_at = now();
      END IF;
      
      user_actions := user_actions || '["Synced marketplace status with shopify status"]'::jsonb;
      action_count := action_count + 1;
      
      -- 2. Remove duplicate products (keep most recent)
      IF NOT dry_run THEN
        DELETE FROM public.products p1
        WHERE p1.user_id = user_record.user_id
        AND p1.id NOT IN (
          SELECT p2.id FROM public.products p2
          WHERE p2.user_id = user_record.user_id
          AND p2.handle = p1.handle
          ORDER BY p2.created_at DESC
          LIMIT 1
        );
      END IF;
      
      user_actions := user_actions || '["Removed duplicate products"]'::jsonb;
      action_count := action_count + 1;
      
      -- 3. Create missing sync_settings
      IF NOT dry_run THEN
        INSERT INTO public.sync_settings (user_id, marketplace, sync_active_only, batch_size)
        SELECT user_record.user_id, 'shopify', true, 250
        WHERE NOT EXISTS (
          SELECT 1 FROM public.sync_settings 
          WHERE user_id = user_record.user_id
        );
      END IF;
      
      user_actions := user_actions || '["Created missing sync settings"]'::jsonb;
      action_count := action_count + 1;
      
      -- 4. Update product sync timestamps based on sync status
      IF NOT dry_run THEN
        UPDATE public.products 
        SET shopify_synced_at = (
          SELECT last_sync_at FROM public.shopify_sync_status 
          WHERE user_id = user_record.user_id
        )
        WHERE user_id = user_record.user_id 
        AND shopify_synced_at IS NULL
        AND EXISTS (
          SELECT 1 FROM public.shopify_sync_status 
          WHERE user_id = user_record.user_id 
          AND total_synced > 0
        );
      END IF;
      
      user_actions := user_actions || '["Updated product sync timestamps"]'::jsonb;
      action_count := action_count + 1;
      
      -- Add user actions to total
      IF action_count > 0 THEN
        actions_taken := actions_taken || jsonb_build_array(jsonb_build_object(
          'user_id', user_record.user_id,
          'actions', user_actions,
          'action_count', action_count
        ));
        total_actions := total_actions + action_count;
      END IF;
    END;
  END LOOP;
  
  -- Build result
  cleanup_result := jsonb_build_object(
    'cleanup_timestamp', now(),
    'dry_run', dry_run,
    'total_actions', total_actions,
    'actions_taken', actions_taken
  );
  
  -- Update cleanup log
  UPDATE public.sync_logs 
  SET status = 'completed', completed_at = now(), validation_results = cleanup_result
  WHERE user_id = COALESCE(target_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
  AND operation_type = 'cleanup' 
  AND status = 'started'
  AND created_at = (
    SELECT MAX(created_at) FROM public.sync_logs 
    WHERE operation_type = 'cleanup' AND status = 'started'
  );
  
  RETURN cleanup_result;
END;
$$;

-- Step 4: Create sync health monitoring function
CREATE OR REPLACE FUNCTION public.get_sync_health_summary(target_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  health_summary jsonb := '{}';
  user_record RECORD;
  overall_health text := 'healthy';
  total_users integer := 0;
  healthy_users integer := 0;
  warning_users integer := 0;
  critical_users integer := 0;
  user_details jsonb := '[]';
BEGIN
  FOR user_record IN 
    SELECT user_id FROM public.store_configurations 
    WHERE (target_user_id IS NULL OR user_id = target_user_id)
    AND platform = 'shopify'
  LOOP
    DECLARE
      user_health text := 'healthy';
      user_summary jsonb;
      last_sync timestamp;
      products_count integer;
      sync_issues integer := 0;
      recent_errors integer;
    BEGIN
      total_users := total_users + 1;
      
      -- Get basic metrics
      SELECT COUNT(*) INTO products_count
      FROM public.products WHERE user_id = user_record.user_id;
      
      SELECT last_sync_at INTO last_sync
      FROM public.shopify_sync_status WHERE user_id = user_record.user_id;
      
      -- Count recent sync errors (last 24 hours)
      SELECT COUNT(*) INTO recent_errors
      FROM public.sync_logs 
      WHERE user_id = user_record.user_id 
      AND status = 'failed' 
      AND started_at > now() - interval '24 hours';
      
      -- Check for issues
      IF last_sync IS NULL OR last_sync < now() - interval '7 days' THEN
        sync_issues := sync_issues + 1;
        user_health := 'warning';
      END IF;
      
      IF recent_errors > 5 THEN
        sync_issues := sync_issues + 1;
        user_health := 'critical';
      ELSIF recent_errors > 2 THEN
        sync_issues := sync_issues + 1;
        IF user_health = 'healthy' THEN user_health := 'warning'; END IF;
      END IF;
      
      -- Count health status
      IF user_health = 'healthy' THEN
        healthy_users := healthy_users + 1;
      ELSIF user_health = 'warning' THEN
        warning_users := warning_users + 1;
      ELSE
        critical_users := critical_users + 1;
      END IF;
      
      -- Build user summary
      user_summary := jsonb_build_object(
        'user_id', user_record.user_id,
        'health_status', user_health,
        'products_count', products_count,
        'last_sync', last_sync,
        'recent_errors', recent_errors,
        'sync_issues', sync_issues
      );
      
      user_details := user_details || jsonb_build_array(user_summary);
    END;
  END LOOP;
  
  -- Determine overall health
  IF critical_users > 0 THEN
    overall_health := 'critical';
  ELSIF warning_users > 0 THEN
    overall_health := 'warning';
  END IF;
  
  health_summary := jsonb_build_object(
    'generated_at', now(),
    'overall_health', overall_health,
    'total_users', total_users,
    'healthy_users', healthy_users,
    'warning_users', warning_users,
    'critical_users', critical_users,
    'user_details', user_details
  );
  
  RETURN health_summary;
END;
$$;

-- Step 5: Create trigger for automatic sync log completion
CREATE OR REPLACE FUNCTION public.update_sync_log_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Calculate duration when sync completes
  IF NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
    NEW.sync_duration_ms := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_log_duration ON public.sync_logs;
CREATE TRIGGER trigger_sync_log_duration
  BEFORE UPDATE ON public.sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sync_log_duration();

-- Step 6: Add performance indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_products_user_handle ON public.products(user_id, handle);
CREATE INDEX IF NOT EXISTS idx_products_shopify_synced ON public.products(user_id, shopify_synced_at);
CREATE INDEX IF NOT EXISTS idx_shopify_sync_status_user ON public.shopify_sync_status(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_sync_status_user_marketplace ON public.marketplace_sync_status(user_id, marketplace);
CREATE INDEX IF NOT EXISTS idx_sync_settings_user ON public.sync_settings(user_id);

-- Step 7: Add constraints to prevent data corruption
DO $$ 
BEGIN
  -- Add unique constraints only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_handle') THEN
    ALTER TABLE public.products ADD CONSTRAINT unique_user_handle UNIQUE (user_id, handle);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_shopify_sync') THEN
    ALTER TABLE public.shopify_sync_status ADD CONSTRAINT unique_user_shopify_sync UNIQUE (user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_marketplace_sync') THEN
    ALTER TABLE public.marketplace_sync_status ADD CONSTRAINT unique_user_marketplace_sync UNIQUE (user_id, marketplace);
  END IF;
END $$;

-- Step 8: Run initial validation and cleanup
SELECT public.validate_sync_data_consistency();
SELECT public.cleanup_sync_inconsistencies(NULL, false); -- Run actual cleanup