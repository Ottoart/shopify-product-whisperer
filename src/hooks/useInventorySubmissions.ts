import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventorySubmission {
  id: string;
  user_id: string;
  destination_id: string;
  submission_number: string;
  status: 'draft' | 'payment_pending' | 'paid' | 'pending_approval' | 'approved' | 'rejected';
  payment_status: 'pending' | 'paid' | 'failed' | null;
  total_items: number | null;
  total_prep_cost: number | null;
  special_instructions: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by_user_id: string | null;
  rejection_reason: string | null;
  shipment_details: any;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  fulfillment_destinations?: {
    id: string;
    name: string;
    code: string;
    description: string | null;
  };
  submission_items?: SubmissionItem[];
}

export interface SubmissionItem {
  id: string;
  submission_id: string;
  sku: string;
  product_title: string;  // Updated to match actual DB column
  quantity: number;
  unit_cost: number;
  weight_lbs: number | null;
  length_inches: number | null;  // Added actual DB columns
  width_inches: number | null;
  height_inches: number | null;
  expiration_date: string | null;
  lot_number: string | null;
  created_at: string;
}

export const useInventorySubmissions = () => {
  const [submissions, setSubmissions] = useState<InventorySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      console.log('[useInventorySubmissions] Fetching submissions...');
      
      const { data, error } = await supabase
        .from('inventory_submissions')
        .select(`
          *,
          fulfillment_destinations!inner(id, name, code, description),
          submission_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useInventorySubmissions] Error fetching submissions:', error);
        throw error;
      }

      console.log('[useInventorySubmissions] Fetched submissions:', data);
      setSubmissions((data as any[])?.map(item => ({
        ...item,
        fulfillment_destinations: item.fulfillment_destinations
      })) || []);
    } catch (error) {
      console.error('Error fetching inventory submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inventory submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createSubmission = async (submissionData: Omit<InventorySubmission, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      console.log('[useInventorySubmissions] Creating submission:', submissionData);
      
      const { data, error } = await supabase
        .from('inventory_submissions')
        .insert([submissionData])
        .select(`
          *,
          fulfillment_destinations!inner(id, name, code, description)
        `)
        .single();

      if (error) {
        console.error('[useInventorySubmissions] Error creating submission:', error);
        throw error;
      }

      console.log('[useInventorySubmissions] Created submission:', data);
      await fetchSubmissions(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Inventory submission created successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating inventory submission:', error);
      toast({
        title: "Error",
        description: "Failed to create inventory submission",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubmission = async (submissionId: string, updates: Partial<InventorySubmission>) => {
    setIsLoading(true);
    try {
      console.log('[useInventorySubmissions] Updating submission:', submissionId, updates);
      
      const { data, error } = await supabase
        .from('inventory_submissions')
        .update(updates)
        .eq('id', submissionId)
        .select(`
          *,
          fulfillment_destinations!inner(id, name, code, description)
        `)
        .single();

      if (error) {
        console.error('[useInventorySubmissions] Error updating submission:', error);
        throw error;
      }

      console.log('[useInventorySubmissions] Updated submission:', data);
      await fetchSubmissions(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating inventory submission:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory submission",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    setIsLoading(true);
    try {
      console.log('[useInventorySubmissions] Deleting submission:', submissionId);
      
      const { error } = await supabase
        .from('inventory_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) {
        console.error('[useInventorySubmissions] Error deleting submission:', error);
        throw error;
      }

      console.log('[useInventorySubmissions] Deleted submission:', submissionId);
      await fetchSubmissions(); // Refresh the list
      
      toast({
        title: "Success",
        description: "Submission deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting inventory submission:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory submission",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for submissions
  useEffect(() => {
    console.log('[useInventorySubmissions] Setting up real-time subscription');
    
    const channel = supabase
      .channel('inventory_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_submissions'
        },
        (payload) => {
          console.log('[useInventorySubmissions] Real-time update received:', payload);
          // Refresh submissions when any change occurs
          fetchSubmissions();
        }
      )
      .subscribe();

    return () => {
      console.log('[useInventorySubmissions] Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    submissions,
    isLoading,
    fetchSubmissions,
    createSubmission,
    updateSubmission,
    deleteSubmission,
  };
};