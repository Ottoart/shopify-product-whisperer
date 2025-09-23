-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION public.trigger_automated_workflows()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger performance metric workflows
  IF TG_TABLE_NAME = 'performance_metrics' THEN
    -- Check for significant changes in metrics
    IF NEW.total_revenue > OLD.total_revenue * 1.2 THEN
      INSERT INTO public.ai_insights (
        user_id,
        insight_type,
        title,
        description,
        action_items,
        priority,
        confidence_score
      ) VALUES (
        NEW.user_id,
        'performance',
        'Significant Revenue Increase Detected',
        'Your revenue has increased by more than 20% since the last metric update. This presents an opportunity to scale operations.',
        ARRAY['Review current inventory levels', 'Consider expanding product lines', 'Analyze traffic sources'],
        'high',
        0.9
      );
    END IF;
  END IF;

  -- Trigger AI recommendation workflows
  IF TG_TABLE_NAME = 'ai_pricing_recommendations' AND NEW.confidence_score > 0.8 THEN
    INSERT INTO public.ai_insights (
      user_id,
      insight_type,
      title,
      description,
      action_items,
      priority,
      confidence_score
    ) VALUES (
      NEW.user_id,
      'pricing',
      'High-Confidence Pricing Recommendation Available',
      'A new pricing recommendation with high confidence score is ready for review.',
      ARRAY['Review pricing recommendation', 'Analyze market conditions', 'Implement price changes'],
      'medium',
      NEW.confidence_score
    );
  END IF;

  -- Trigger batch operation monitoring
  IF TG_TABLE_NAME = 'batch_operations' AND NEW.status = 'failed' THEN
    INSERT INTO public.ai_insights (
      user_id,
      insight_type,
      title,
      description,
      action_items,
      priority,
      confidence_score
    ) VALUES (
      NEW.user_id,
      'operations',
      'Batch Operation Failed',
      'A batch operation has failed and requires attention to prevent data inconsistencies.',
      ARRAY['Review error logs', 'Check data integrity', 'Retry failed operations'],
      'high',
      1.0
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void AS $$
BEGIN
  -- Clean up old AI insights (older than 6 months)
  DELETE FROM public.ai_insights 
  WHERE created_at < NOW() - INTERVAL '6 months' 
  AND is_read = true;

  -- Clean up old batch operations (older than 3 months)
  DELETE FROM public.batch_operations 
  WHERE created_at < NOW() - INTERVAL '3 months' 
  AND status IN ('completed', 'failed');

  -- Clean up old audit logs (older than 1 year)
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';

  RAISE NOTICE 'Data cleanup completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';