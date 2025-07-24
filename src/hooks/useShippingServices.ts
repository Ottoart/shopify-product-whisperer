import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';


export interface ShippingService {
  id: string;
  carrier_configuration_id: string;
  service_code: string;
  service_name: string;
  service_type: string;
  estimated_days?: string;
  max_weight_lbs?: number;
  supports_tracking: boolean;
  supports_insurance: boolean;
  supports_signature: boolean;
  is_available: boolean;
  carrier_name?: string;
}

export interface CarrierConfiguration {
  id: string;
  carrier_name: string;
  is_active: boolean;
  api_credentials: any;
  settings: any;
  created_at: string;
  updated_at: string;
}

export const useShippingServices = () => {
  const [services, setServices] = useState<ShippingService[]>([]);
  const [carriers, setCarriers] = useState<CarrierConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } else {
        setUser(user);
      }
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchServices = async (forceRefresh = false) => {
    if (!user) {
      console.log('🔍 fetchServices - No user found');
      return;
    }
    
    console.log('🔍 fetchServices - Starting with user:', user.id, 'forceRefresh:', forceRefresh);
    setLoading(true);
    setError(null);

    try {
      // First, get services from database
      const { data: dbServices, error: dbError } = await supabase
        .from('shipping_services')
        .select(`
          *,
          carrier_configurations!inner(
            carrier_name,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('is_available', true)
        .eq('carrier_configurations.is_active', true);

      console.log('🔍 fetchServices - DB services:', dbServices);
      console.log('🔍 fetchServices - DB error:', dbError);

      if (dbError) {
        console.error('Error fetching services from database:', dbError);
        setError('Failed to fetch shipping services');
        return;
      }

      // If we have recent services and not forcing refresh, use cached data
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const hasRecentServices = dbServices?.some(service => 
        new Date(service.last_updated) > oneHourAgo
      );

      console.log('🔍 fetchServices - Has recent services:', hasRecentServices, 'Force refresh:', forceRefresh);

      if (hasRecentServices && !forceRefresh) {
        const formattedServices = dbServices.map(service => ({
          ...service,
          carrier_name: service.carrier_configurations.carrier_name
        }));
        console.log('🔍 fetchServices - Using cached services:', formattedServices.length);
        setServices(formattedServices);
        setLoading(false);
        return formattedServices;
      }

      // Fetch fresh services from carriers
      console.log('🔍 fetchServices - Fetching fresh services from carriers...');
      const { data: freshData, error: fetchError } = await supabase.functions.invoke(
        'fetch-shipping-services',
        {
          body: { 
            user_id: user.id, 
            force_refresh: forceRefresh 
          }
        }
      );

      console.log('🔍 fetchServices - Fresh data response:', freshData);
      console.log('🔍 fetchServices - Fetch error:', fetchError);

      if (fetchError) {
        console.error('Error fetching fresh services:', fetchError);
        setError('Failed to fetch services from carriers');
        return;
      }

      // Update local state with fresh data
      if (freshData?.services) {
        console.log('🔍 fetchServices - Setting services:', freshData.services.length);
        setServices(freshData.services);
      }
      
      if (freshData?.carriers) {
        console.log('🔍 fetchServices - Setting carriers:', freshData.carriers.length);
        setCarriers(freshData.carriers);
      }

      // Return the fresh data for immediate use
      return freshData?.services || [];

    } catch (err) {
      console.error('Error in fetchServices:', err);
      setError('Failed to fetch shipping services');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getServicesByType = (type: string) => {
    return services.filter(service => service.service_type === type);
  };

  const getServicesByCarrier = (carrierName: string) => {
    console.log('🔍 getServicesByCarrier called with:', carrierName);
    console.log('🔍 Available services:', services);
    
    const filteredServices = services.filter(service => {
      const serviceCarrier = service.carrier_name?.toLowerCase();
      const targetCarrier = carrierName.toLowerCase();
      console.log('🔍 Checking service:', serviceCarrier, 'against', targetCarrier);
      
      // Handle different carrier name formats
      if (targetCarrier === 'ups') {
        return serviceCarrier === 'ups' || serviceCarrier === 'united parcel service';
      }
      
      return serviceCarrier === targetCarrier;
    });
    
    console.log('🔍 Filtered services for', carrierName, ':', filteredServices);
    return filteredServices;
  };

  const addCarrierConfiguration = async (carrierData: {
    carrier_name: string;
    api_credentials: any;
    settings?: any;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('carrier_configurations')
      .insert({
        user_id: user.id,
        ...carrierData
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding carrier configuration:', error);
      throw error;
    }

    // Refresh carriers list immediately
    await fetchCarriers();
    
    // Try to refresh services, but don't fail if edge function has issues
    try {
      await fetchServices(true);
    } catch (serviceError) {
      console.log('Could not refresh services immediately, but carrier was added successfully:', serviceError);
    }
    
    return data;
  };

  const updateCarrierConfiguration = async (carrierId: string, updates: Partial<CarrierConfiguration>) => {
    const { error } = await supabase
      .from('carrier_configurations')
      .update(updates)
      .eq('id', carrierId)
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error updating carrier configuration:', error);
      throw error;
    }

    // Refresh services after updating carrier
    await fetchServices(true);
  };

  const toggleCarrierStatus = async (carrierId: string, isActive: boolean) => {
    await updateCarrierConfiguration(carrierId, { is_active: isActive });
  };

  const fetchCarriers = async () => {
    if (!user) {
      console.log('🔍 fetchCarriers - No user found');
      return;
    }
    
    console.log('🔍 fetchCarriers - User ID:', user.id);
    console.log('🔍 fetchCarriers - User email:', user.email);
    
    // Check current auth state
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 fetchCarriers - Current session:', session);
    console.log('🔍 fetchCarriers - Session error:', sessionError);
    console.log('🔍 fetchCarriers - Auth UID:', session?.user?.id);
    
    try {
      const { data, error } = await supabase
        .from('carrier_configurations')
        .select(`
          *,
          shipping_services (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('🔍 fetchCarriers - User-specific carriers:', data);
      console.log('🔍 fetchCarriers - Query error:', error);

      if (error) {
        console.error('Error fetching carriers:', error);
        setError('Failed to fetch carriers');
        return;
      }

      console.log('🔍 fetchCarriers - Setting carriers:', data || []);
      setCarriers(data || []);
    } catch (err) {
      console.error('Error in fetchCarriers:', err);
      setError('Failed to fetch carriers');
    }
  };

  useEffect(() => {
    if (user) {
      fetchCarriers();
      fetchServices();
    }
  }, [user]);

  return {
    services,
    carriers,
    loading,
    error,
    fetchServices,
    getServicesByType,
    getServicesByCarrier,
    addCarrierConfiguration,
    updateCarrierConfiguration,
    toggleCarrierStatus,
    refreshServices: async () => {
      console.log('🔍 refreshServices - Called');
      const result = await fetchServices(true);
      console.log('🔍 refreshServices - Result:', result?.length || 0, 'services');
      return result;
    }
  };
};