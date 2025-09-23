import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WarehouseBin {
  id: string;
  bin_code: string;
  zone_name: string;
  aisle_number: number | null;
  shelf_level: number | null;
  bin_type: string;
  max_capacity: number;
  current_capacity: number;
  is_active: boolean;
}

export interface ReceivingRecord {
  id: string;
  submission_id: string;
  received_by_user_id: string;
  total_cartons: number;
  total_items_expected: number;
  total_items_received: number;
  received_at: string;
  status: string;
  notes: string | null;
  inventory_submissions?: {
    submission_number: string;
    status: string;
  };
}

export interface ReceivedCarton {
  id: string;
  receiving_record_id: string;
  carton_barcode: string;
  weight_lbs: number | null;
  length_inches: number | null;
  width_inches: number | null;
  height_inches: number | null;
  condition_status: string;
  scanned_at: string;
  scanned_by_user_id: string;
}

export interface ItemInspection {
  id: string;
  submission_item_id: string;
  received_carton_id: string | null;
  quantity_expected: number;
  quantity_received: number;
  condition_status: string;
  quality_grade: string;
  expiration_check_passed: boolean;
  label_check_passed: boolean;
  packaging_check_passed: boolean;
  assigned_bin_id: string | null;
  inspected_by_user_id: string;
  inspected_at: string;
  notes: string | null;
  submission_items?: {
    sku: string;
    product_title: string;
  };
  warehouse_bins?: {
    bin_code: string;
    zone_name: string;
  };
}

export interface ReceivingDiscrepancy {
  id: string;
  receiving_record_id: string;
  submission_item_id: string | null;
  discrepancy_type: string;
  expected_quantity: number | null;
  actual_quantity: number | null;
  description: string;
  severity: string;
  resolution_status: string;
  resolution_notes: string | null;
  reported_by_user_id: string;
  resolved_by_user_id: string | null;
  reported_at: string;
  resolved_at: string | null;
}

export function useReceivingData() {
  const [bins, setBins] = useState<WarehouseBin[]>([]);
  const [receivingRecords, setReceivingRecords] = useState<ReceivingRecord[]>([]);
  const [cartons, setCartons] = useState<ReceivedCarton[]>([]);
  const [inspections, setInspections] = useState<ItemInspection[]>([]);
  const [discrepancies, setDiscrepancies] = useState<ReceivingDiscrepancy[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchBins = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouse_bins')
        .select('*')
        .eq('is_active', true)
        .order('zone_name', { ascending: true })
        .order('bin_code', { ascending: true });

      if (error) throw error;
      setBins(data || []);
    } catch (error) {
      console.error('Error fetching bins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch warehouse bins",
        variant: "destructive",
      });
    }
  };

  const fetchReceivingRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('receiving_records')
        .select(`
          *,
          inventory_submissions (
            submission_number,
            status
          )
        `)
        .order('received_at', { ascending: false });

      if (error) throw error;
      setReceivingRecords(data || []);
    } catch (error) {
      console.error('Error fetching receiving records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch receiving records",
        variant: "destructive",
      });
    }
  };

  const fetchInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('item_inspections')
        .select(`
          *,
          submission_items (
            sku,
            product_title
          ),
          warehouse_bins (
            bin_code,
            zone_name
          )
        `)
        .order('inspected_at', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inspections",
        variant: "destructive",
      });
    }
  };

  const createReceivingRecord = async (submissionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('receiving_records')
        .insert({
          submission_id: submissionId,
          received_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;

      // Update submission status to receiving
      await supabase
        .from('inventory_submissions')
        .update({ status: 'receiving' })
        .eq('id', submissionId);

      await fetchReceivingRecords();
      toast({
        title: "Success",
        description: "Receiving record created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating receiving record:', error);
      toast({
        title: "Error",
        description: "Failed to create receiving record",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const scanCarton = async (receivingRecordId: string, cartonData: Partial<ReceivedCarton>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('received_cartons')
        .insert({
          receiving_record_id: receivingRecordId,
          carton_barcode: cartonData.carton_barcode!,
          weight_lbs: cartonData.weight_lbs,
          length_inches: cartonData.length_inches,
          width_inches: cartonData.width_inches,
          height_inches: cartonData.height_inches,
          condition_status: cartonData.condition_status || 'good',
          scanned_by_user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCartons(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Carton scanned successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error scanning carton:', error);
      toast({
        title: "Error",
        description: "Failed to scan carton",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createInspection = async (inspectionData: Omit<ItemInspection, 'id' | 'inspected_by_user_id' | 'inspected_at' | 'submission_items' | 'warehouse_bins'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('item_inspections')
        .insert({
          submission_item_id: inspectionData.submission_item_id,
          received_carton_id: inspectionData.received_carton_id,
          quantity_expected: inspectionData.quantity_expected,
          quantity_received: inspectionData.quantity_received,
          condition_status: inspectionData.condition_status,
          quality_grade: inspectionData.quality_grade,
          expiration_check_passed: inspectionData.expiration_check_passed,
          label_check_passed: inspectionData.label_check_passed,
          packaging_check_passed: inspectionData.packaging_check_passed,
          assigned_bin_id: inspectionData.assigned_bin_id,
          notes: inspectionData.notes,
          inspected_by_user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchInspections();
      toast({
        title: "Success",
        description: "Inspection recorded successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast({
        title: "Error",
        description: "Failed to record inspection",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reportDiscrepancy = async (discrepancyData: Omit<ReceivingDiscrepancy, 'id' | 'reported_by_user_id' | 'resolved_by_user_id' | 'reported_at' | 'resolved_at'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('receiving_discrepancies')
        .insert({
          receiving_record_id: discrepancyData.receiving_record_id,
          submission_item_id: discrepancyData.submission_item_id,
          discrepancy_type: discrepancyData.discrepancy_type,
          expected_quantity: discrepancyData.expected_quantity,
          actual_quantity: discrepancyData.actual_quantity,
          description: discrepancyData.description,
          severity: discrepancyData.severity,
          resolution_status: discrepancyData.resolution_status,
          resolution_notes: discrepancyData.resolution_notes,
          reported_by_user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setDiscrepancies(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Discrepancy reported successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error reporting discrepancy:', error);
      toast({
        title: "Error",
        description: "Failed to report discrepancy",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBins();
    fetchReceivingRecords();
    fetchInspections();
  }, []);

  return {
    bins,
    receivingRecords,
    cartons,
    inspections,
    discrepancies,
    loading,
    createReceivingRecord,
    scanCarton,
    createInspection,
    reportDiscrepancy,
    fetchReceivingRecords,
    fetchInspections,
  };
}