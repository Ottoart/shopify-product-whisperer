import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  type: 'product_view' | 'product_click' | 'cart_add' | 'search' | 'filter' | 'sort' | 'banner_click';
  productId?: string;
  bannerId?: string;
  data?: Record<string, any>;
}

interface UseAnalyticsTrackingReturn {
  trackEvent: (event: AnalyticsEvent) => void;
  trackProductView: (productId: string, metadata?: Record<string, any>) => void;
  trackProductClick: (productId: string, metadata?: Record<string, any>) => void;
  trackCartAdd: (productId: string, metadata?: Record<string, any>) => void;
  trackSearch: (query: string, resultsCount: number, metadata?: Record<string, any>) => void;
  trackFilter: (filterType: string, filterValue: string, metadata?: Record<string, any>) => void;
  trackSort: (sortBy: string, metadata?: Record<string, any>) => void;
  trackBannerClick: (bannerId: string, metadata?: Record<string, any>) => void;
}

export const useAnalyticsTracking = (): UseAnalyticsTrackingReturn => {
  const sessionId = useRef(crypto.randomUUID());

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      const user = await getCurrentUser();
      
      // Track user interaction
      await supabase.from('user_interactions').insert({
        user_id: user?.id || null,
        interaction_type: event.type,
        target_id: event.productId || event.bannerId || null,
        data: event.data || {},
        session_id: sessionId.current
      });

      // Track product view specifically for popularity
      if (event.type === 'product_view' && event.productId) {
        await supabase.from('product_views').insert({
          user_id: user?.id || null,
          product_id: event.productId,
          view_type: 'view',
          session_id: sessionId.current,
          metadata: event.data || {}
        });
      }

      // Track cart add for popularity
      if (event.type === 'cart_add' && event.productId) {
        await supabase.from('product_views').insert({
          user_id: user?.id || null,
          product_id: event.productId,
          view_type: 'cart_add',
          session_id: sessionId.current,
          metadata: event.data || {}
        });
      }

      // Track search queries
      if (event.type === 'search' && event.data?.query) {
        await supabase.from('search_queries').insert({
          user_id: user?.id || null,
          query: event.data.query,
          results_count: event.data.resultsCount || 0,
          session_id: sessionId.current
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, []);

  const trackProductView = useCallback((productId: string, metadata?: Record<string, any>) => {
    trackEvent({ type: 'product_view', productId, data: metadata });
  }, [trackEvent]);

  const trackProductClick = useCallback((productId: string, metadata?: Record<string, any>) => {
    trackEvent({ type: 'product_click', productId, data: metadata });
  }, [trackEvent]);

  const trackCartAdd = useCallback((productId: string, metadata?: Record<string, any>) => {
    trackEvent({ type: 'cart_add', productId, data: metadata });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number, metadata?: Record<string, any>) => {
    trackEvent({ 
      type: 'search', 
      data: { query, resultsCount, ...metadata } 
    });
  }, [trackEvent]);

  const trackFilter = useCallback((filterType: string, filterValue: string, metadata?: Record<string, any>) => {
    trackEvent({ 
      type: 'filter', 
      data: { filterType, filterValue, ...metadata } 
    });
  }, [trackEvent]);

  const trackSort = useCallback((sortBy: string, metadata?: Record<string, any>) => {
    trackEvent({ 
      type: 'sort', 
      data: { sortBy, ...metadata } 
    });
  }, [trackEvent]);

  const trackBannerClick = useCallback((bannerId: string, metadata?: Record<string, any>) => {
    trackEvent({ type: 'banner_click', bannerId, data: metadata });
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