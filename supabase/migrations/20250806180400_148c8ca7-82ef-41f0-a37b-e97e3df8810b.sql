-- Create trigger function for automated workflow execution
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automated workflows
CREATE TRIGGER performance_metrics_workflow_trigger
  AFTER UPDATE ON public.performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_automated_workflows();

CREATE TRIGGER ai_pricing_recommendations_workflow_trigger
  AFTER INSERT ON public.ai_pricing_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_automated_workflows();

CREATE TRIGGER batch_operations_workflow_trigger
  AFTER UPDATE ON public.batch_operations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_automated_workflows();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_id_created_at ON public.ai_insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type_priority ON public.ai_insights(insight_type, priority);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_date ON public.performance_metrics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_batch_operations_user_status ON public.batch_operations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_pricing_recommendations_user_created ON public.ai_pricing_recommendations(user_id, created_at DESC);

-- Create function for automated cleanup of old data
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable real-time for key tables
ALTER TABLE public.ai_insights REPLICA IDENTITY FULL;
ALTER TABLE public.batch_operations REPLICA IDENTITY FULL;
ALTER TABLE public.performance_metrics REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_operations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.performance_metrics;