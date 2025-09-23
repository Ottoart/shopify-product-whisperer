import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Data interfaces
interface InventoryItem {
  id: string;
  submission_item_id: string;
  bin_id: string;
  quantity: number;
  last_updated_at: string;
  submission_item: {
    sku: string;
    product_title: string;
    expiration_date?: string;
  };
  bin: {
    bin_code: string;
    zone_name: string;
    bin_type: string;
  };
}

interface InventoryMovement {
  id: string;
  submission_item_id: string;
  from_bin_id?: string;
  to_bin_id: string;
  quantity: number;
  movement_type: string;
  reason?: string;
  moved_by_user_id: string;
  moved_at: string;
  created_at: string;
}

interface InventoryAdjustment {
  id: string;
  submission_item_id: string;
  bin_id: string;
  adjustment_quantity: number;
  reason: string;
  adjusted_by_user_id: string;
  adjusted_at: string;
  created_at: string;
}

interface LowStockAlert {
  id: string;
  submission_item_id: string;
  current_quantity: number;
  threshold_quantity: number;
  alert_level: string;
  is_acknowledged: boolean;
  acknowledged_by_user_id?: string;
  acknowledged_at?: string;
  created_at: string;
  submission_item: {
    sku: string;
    product_title: string;
  };
}

interface WarehouseBin {
  id: string;
  bin_code: string;
  zone_name: string;
  bin_type: string;
  aisle_number?: number;
  shelf_level?: number;
  max_capacity: number;
  current_capacity: number;
  is_active: boolean;
}

export const useInventoryData = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [bins, setBins] = useState<WarehouseBin[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch inventory data
  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('bin_inventory')
        .select(`
          *,
          submission_item:submission_items(sku, product_title, expiration_date),
          bin:warehouse_bins(bin_code, zone_name, bin_type)
        `)
        .gt('quantity', 0);

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory data",
        variant: "destructive",
      });
    }
  };

  // Fetch movements history
  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*')
        .order('moved_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    }
  };

  // Fetch adjustments history
  const fetchAdjustments = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_adjustments')
        .select('*')
        .order('adjusted_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAdjustments(data || []);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
    }
  };

  // Fetch low stock alerts
  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('low_stock_alerts')
        .select(`
          *,
          submission_item:submission_items(sku, product_title)
        `)
        .eq('is_acknowledged', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts((data as any) || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  // Fetch warehouse bins
  const fetchBins = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_bins')
        .select('*')
        .eq('is_active', true)
        .order('zone_name', { ascending: true });

      if (error) throw error;
      setBins(data || []);
    } catch (error) {
      console.error('Error fetching bins:', error);
    }
  };

  // Create inventory movement
  const createMovement = async (movement: {
    submission_item_id: string;
    from_bin_id?: string;
    to_bin_id: string;
    quantity: number;
    movement_type: string;
    reason?: string;
  }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('inventory_movements')
        .insert([{
          ...movement,
          moved_by_user_id: user.user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory movement recorded",
      });

      // Refresh data
      await Promise.all([fetchInventory(), fetchMovements()]);
    } catch (error) {
      console.error('Error creating movement:', error);
      toast({
        title: "Error",
        description: "Failed to record inventory movement",
        variant: "destructive",
      });
    }
  };

  // Create inventory adjustment
  const createAdjustment = async (adjustment: {
    submission_item_id: string;
    bin_id: string;
    adjustment_quantity: number;
    reason: string;
  }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('inventory_adjustments')
        .insert([{
          ...adjustment,
          adjusted_by_user_id: user.user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory adjustment recorded",
      });

      // Refresh data
      await Promise.all([fetchInventory(), fetchAdjustments()]);
    } catch (error) {
      console.error('Error creating adjustment:', error);
      toast({
        title: "Error",
        description: "Failed to record inventory adjustment",
        variant: "destructive",
      });
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('low_stock_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_by_user_id: user.user.id,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert acknowledged",
      });

      await fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  };

  // Check for low stock
  const checkLowStock = async () => {
    try {
      const { error } = await supabase.rpc('check_low_stock');
      if (error) throw error;
      
      await fetchAlerts();
      
      toast({
        title: "Success",
        description: "Low stock check completed",
      });
    } catch (error) {
      console.error('Error checking low stock:', error);
      toast({
        title: "Error",
        description: "Failed to check low stock",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchInventory(),
        fetchMovements(),
        fetchAdjustments(),
        fetchAlerts(),
        fetchBins()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    inventory,
    movements,
    adjustments,
    alerts,
    bins,
    loading,
    createMovement,
    createAdjustment,
    acknowledgeAlert,
    checkLowStock,
    fetchInventory,
    fetchMovements,
    fetchAdjustments,
    fetchAlerts,
    fetchBins
  };
};