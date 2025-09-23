import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PackingStation {
  id: string;
  station_name: string;
  station_code: string;
  is_active: boolean;
  assigned_user_id?: string;
  current_session_id?: string;
  location_zone?: string;
  equipment_available: any;
  performance_metrics: any;
}

export interface PackSession {
  id: string;
  user_id: string;
  packing_station_id: string;
  fulfillment_order_id: string;
  total_items: number;
  packed_items: number;
  estimated_time_minutes: number;
  actual_time_minutes?: number;
  started_at?: string;
  completed_at?: string;
  status: string;
  session_notes?: string;
}

export interface Package {
  id: string;
  user_id: string;
  pack_session_id: string;
  package_number: string;
  package_type: string;
  weight_lbs?: number;
  length_inches?: number;
  width_inches?: number;
  height_inches?: number;
  shipping_label_id?: string;
  tracking_number?: string;
  carrier?: string;
  service_type?: string;
  shipping_cost?: number;
  status: string;
  packed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface ReturnAuthorization {
  id: string;
  user_id: string;
  order_id: string;
  package_id?: string;
  rma_number: string;
  return_reason: string;
  return_type: string;
  status: string;
  requested_at: string;
  approved_at?: string;
  customer_notes?: string;
  internal_notes?: string;
}

export interface ShippingAnalytics {
  id: string;
  user_id: string;
  date: string;
  total_packages: number;
  total_shipping_cost: number;
  avg_pack_time_minutes: number;
  on_time_delivery_rate: number;
  return_rate: number;
  cost_per_package: number;
  carrier_performance: any;
  service_type_breakdown: any;
}

export function usePackingData() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [packingStations, setPackingStations] = useState<PackingStation[]>([]);
  const [packSessions, setPackSessions] = useState<PackSession[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [returnAuthorizations, setReturnAuthorizations] = useState<ReturnAuthorization[]>([]);
  const [shippingAnalytics, setShippingAnalytics] = useState<ShippingAnalytics[]>([]);

  const fetchPackingStations = async () => {
    try {
      const { data, error } = await supabase
        .from('packing_stations')
        .select('*')
        .eq('is_active', true)
        .order('station_code');

      if (error) throw error;
      setPackingStations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching packing stations',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchPackSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('pack_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackSessions(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching pack sessions',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching packages',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchReturnAuthorizations = async () => {
    try {
      const { data, error } = await supabase
        .from('return_authorizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturnAuthorizations(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching return authorizations',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchShippingAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setShippingAnalytics(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching shipping analytics',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createPackSession = async (sessionData: { packing_station_id: string; fulfillment_order_id: string; [key: string]: any }) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('pack_sessions')
        .insert({
          ...sessionData,
          user_id: session.session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPackSessions();
      toast({
        title: 'Pack session created',
        description: 'New packing session has been started successfully.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating pack session',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePackSession = async (sessionId: string, updates: Partial<PackSession>) => {
    try {
      const { error } = await supabase
        .from('pack_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (error) throw error;

      await fetchPackSessions();
      toast({
        title: 'Pack session updated',
        description: 'Session has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating pack session',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const createPackage = async (packageData: { pack_session_id: string; [key: string]: any }) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('packages')
        .insert({
          ...packageData,
          user_id: session.session.user.id,
          package_number: `PKG-${Date.now()}`,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPackages();
      toast({
        title: 'Package created',
        description: 'Package has been created successfully.',
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating package',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createReturnAuthorization = async (returnData: { order_id: string; return_reason: string; [key: string]: any }) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Generate RMA number using the database function
      const { data: rmaNumber, error: rmaError } = await supabase
        .rpc('generate_rma_number');

      if (rmaError) throw rmaError;

      const { data, error } = await supabase
        .from('return_authorizations')
        .insert({
          ...returnData,
          user_id: session.session.user.id,
          rma_number: rmaNumber,
          requested_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      await fetchReturnAuthorizations();
      toast({
        title: 'Return authorization created',
        description: `RMA ${rmaNumber} has been created successfully.`,
      });

      return data;
    } catch (error: any) {
      toast({
        title: 'Error creating return authorization',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPackingStations(),
          fetchPackSessions(),
          fetchPackages(),
          fetchReturnAuthorizations(),
          fetchShippingAnalytics(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    loading,
    packingStations,
    packSessions,
    packages,
    returnAuthorizations,
    shippingAnalytics,
    createPackSession,
    updatePackSession,
    createPackage,
    createReturnAuthorization,
    refreshData: () => {
      fetchPackSessions();
      fetchPackages();
      fetchReturnAuthorizations();
      fetchShippingAnalytics();
    },
  };
}