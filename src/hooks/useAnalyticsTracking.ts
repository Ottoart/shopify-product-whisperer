import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  event_type: string;
  product_id?: string;
  banner_id?: string;
  data?: Record<string, any>;
}

export interface UseAnalyticsTrackingReturn {
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  trackProductView: (productId: string, data?: Record<string, any>) => Promise<void>;
  trackProductClick: (productId: string, data?: Record<string, any>) => Promise<void>;
  trackCartAdd: (productId: string, data?: Record<string, any>) => Promise<void>;
  trackSearch: (query: string, data?: Record<string, any>) => Promise<void>;
  trackFilter: (filter: string, value: string, data?: Record<string, any>) => Promise<void>;
  trackSort: (sortBy: string, data?: Record<string, any>) => Promise<void>;
  trackBannerClick: (bannerId: string, data?: Record<string, any>) => Promise<void>;
}

export const useAnalyticsTracking = (): UseAnalyticsTrackingReturn => {
  const sessionId = Date.now().toString(); // Simple session ID

  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Track main event
      await supabase.from('analytics_events').insert({
        user_id: user?.id,
        session_id: sessionId,
        event_type: event.event_type,
        event_data: {
          ...event.data,
          timestamp: new Date().toISOString(),
          product_id: event.product_id,
          banner_id: event.banner_id
        }
      });

      // Special handling for product views
      if (event.event_type === 'product_view' && event.product_id) {
        await supabase.from('product_views').insert({
          user_id: user?.id,
          product_id: event.product_id,
          session_id: sessionId,
          view_type: 'view',
          viewed_at: new Date().toISOString()
        });
      }

      // Special handling for cart adds
      if (event.event_type === 'cart_add' && event.product_id) {
        await supabase.from('product_views').insert({
          user_id: user?.id,
          product_id: event.product_id,
          session_id: sessionId,
          view_type: 'cart_add',
          viewed_at: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [sessionId]);

  const trackProductView = useCallback(async (productId: string, data?: Record<string, any>) => {
    await trackEvent({
      event_type: 'product_view',
      product_id: productId,
      data
    });
  }, [trackEvent]);

  const trackProductClick = useCallback(async (productId: string, data?: Record<string, any>) => {
    await trackEvent({
      event_type: 'product_click',
      product_id: productId,
      data
    });
  }, [trackEvent]);

  const trackCartAdd = useCallback(async (productId: string, data?: Record<string, any>) => {
    await trackEvent({
      event_type: 'cart_add',
      product_id: productId,
      data
    });
  }, [trackEvent]);

  const trackSearch = useCallback(async (query: string, data?: Record<string, any>) => {
    await trackEvent({
      event_type: 'search',
      data: { query, ...data }
    });
  }, [trackEvent]);

  const trackFilter = useCallback(async (filter: string, value: string, data?: Record<string, any>) => {
    await trackEvent({
      event_type: 'filter',
      data: { filter, value, ...data }
    });
  }, [trackEvent]);

  const trackSort = useCallback(async (sortBy: string, data?: Record<string, any>) => {
    await trackEvent({
      event_type: 'sort',
      data: { sort_by: sortBy, ...data }
    });
  }, [trackEvent]);

  const trackBannerClick = useCallback(async (bannerId: string, data?: Record<string, any>) => {
    await trackEvent({
      event_type: 'banner_click',
      banner_id: bannerId,
      data
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackProductView,
    trackProductClick,
    trackCartAdd,
    trackSearch,
    trackFilter,
    trackSort,
    trackBannerClick
  };
};