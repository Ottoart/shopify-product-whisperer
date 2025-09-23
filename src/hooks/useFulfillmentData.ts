import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FulfillmentOrder {
  id: string;
  user_id: string;
  order_id: string;
  priority_level: number;
  estimated_pick_time_minutes: number;
  special_instructions: string | null;
  status: 'pending' | 'allocated' | 'picking' | 'picked' | 'packed' | 'shipped' | 'cancelled';
  assigned_picker_id: string | null;
  pick_started_at: string | null;
  pick_completed_at: string | null;
  pack_started_at: string | null;
  pack_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickList {
  id: string;
  user_id: string;
  pick_session_id: string | null;
  total_items: number;
  estimated_time_minutes: number;
  optimized_path: any[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  list_name: string;
  notes: string | null;
  assigned_picker_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickItem {
  id: string;
  pick_list_id: string;
  fulfillment_order_id: string;
  submission_item_id: string;
  bin_id: string;
  quantity_requested: number;
  quantity_picked: number;
  pick_sequence: number;
  status: 'pending' | 'picking' | 'picked' | 'short_pick' | 'damaged';
  picked_at: string | null;
  picked_by_user_id: string | null;
  notes: string | null;
  location_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickSession {
  id: string;
  user_id: string;
  total_orders: number;
  total_items: number;
  total_pick_lists: number;
  efficiency_score: number;
  session_name: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  assigned_picker_id: string | null;
  notes: string | null;
  session_type: 'batch' | 'wave' | 'single';
  created_at: string;
  updated_at: string;
}

export interface InventoryAllocation {
  id: string;
  user_id: string;
  fulfillment_order_id: string;
  submission_item_id: string;
  bin_id: string;
  quantity_allocated: number;
  quantity_picked: number;
  allocated_at: string;
  expires_at: string | null;
  status: 'allocated' | 'picked' | 'released' | 'expired';
  allocation_priority: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useFulfillmentData = () => {
  const [fulfillmentOrders, setFulfillmentOrders] = useState<FulfillmentOrder[]>([]);
  const [pickLists, setPickLists] = useState<PickList[]>([]);
  const [pickItems, setPickItems] = useState<PickItem[]>([]);
  const [pickSessions, setPickSessions] = useState<PickSession[]>([]);
  const [inventoryAllocations, setInventoryAllocations] = useState<InventoryAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch fulfillment orders
  const fetchFulfillmentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('fulfillment_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFulfillmentOrders(data as FulfillmentOrder[] || []);
    } catch (error) {
      console.error('Error fetching fulfillment orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fulfillment orders",
        variant: "destructive",
      });
    }
  };

  // Fetch pick lists
  const fetchPickLists = async () => {
    try {
      const { data, error } = await supabase
        .from('pick_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPickLists(data as PickList[] || []);
    } catch (error) {
      console.error('Error fetching pick lists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pick lists",
        variant: "destructive",
      });
    }
  };

  // Fetch pick items
  const fetchPickItems = async () => {
    try {
      const { data, error } = await supabase
        .from('pick_items')
        .select('*')
        .order('pick_sequence', { ascending: true });

      if (error) throw error;
      setPickItems(data as PickItem[] || []);
    } catch (error) {
      console.error('Error fetching pick items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pick items",
        variant: "destructive",
      });
    }
  };

  // Fetch pick sessions
  const fetchPickSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('pick_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPickSessions(data as PickSession[] || []);
    } catch (error) {
      console.error('Error fetching pick sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pick sessions",
        variant: "destructive",
      });
    }
  };

  // Fetch inventory allocations
  const fetchInventoryAllocations = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_allocations')
        .select('*')
        .order('allocated_at', { ascending: false });

      if (error) throw error;
      setInventoryAllocations(data as InventoryAllocation[] || []);
    } catch (error) {
      console.error('Error fetching inventory allocations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory allocations",
        variant: "destructive",
      });
    }
  };

  // Create fulfillment order
  const createFulfillmentOrder = async (orderData: Omit<FulfillmentOrder, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('fulfillment_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchFulfillmentOrders();
      toast({
        title: "Success",
        description: "Fulfillment order created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating fulfillment order:', error);
      toast({
        title: "Error",
        description: "Failed to create fulfillment order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update fulfillment order status
  const updateFulfillmentOrderStatus = async (orderId: string, status: FulfillmentOrder['status']) => {
    setIsLoading(true);
    try {
      const updates: any = { status };
      
      // Set timestamps based on status
      if (status === 'picking') {
        updates.pick_started_at = new Date().toISOString();
      } else if (status === 'picked') {
        updates.pick_completed_at = new Date().toISOString();
      } else if (status === 'packed') {
        updates.pack_completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('fulfillment_orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;
      
      await fetchFulfillmentOrders();
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create pick list
  const createPickList = async (pickListData: Omit<PickList, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pick_lists')
        .insert([pickListData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchPickLists();
      toast({
        title: "Success",
        description: "Pick list created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating pick list:', error);
      toast({
        title: "Error",
        description: "Failed to create pick list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update pick item
  const updatePickItem = async (itemId: string, updates: Partial<PickItem>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pick_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
      
      await fetchPickItems();
      toast({
        title: "Success",
        description: "Pick item updated successfully",
      });
    } catch (error) {
      console.error('Error updating pick item:', error);
      toast({
        title: "Error",
        description: "Failed to update pick item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create pick session
  const createPickSession = async (sessionData: Omit<PickSession, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pick_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchPickSessions();
      toast({
        title: "Success",
        description: "Pick session created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error creating pick session:', error);
      toast({
        title: "Error",
        description: "Failed to create pick session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFulfillmentOrders();
    fetchPickLists();
    fetchPickItems();
    fetchPickSessions();
    fetchInventoryAllocations();
  }, []);

  return {
    fulfillmentOrders,
    pickLists,
    pickItems,
    pickSessions,
    inventoryAllocations,
    isLoading,
    createFulfillmentOrder,
    updateFulfillmentOrderStatus,
    createPickList,
    updatePickItem,
    createPickSession,
    fetchFulfillmentOrders,
    fetchPickLists,
    fetchPickItems,
    fetchPickSessions,
    fetchInventoryAllocations,
  };
};