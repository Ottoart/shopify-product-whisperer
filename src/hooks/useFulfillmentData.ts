import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FulfillmentDestination {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface PrepService {
  id: string;
  name: string;
  code: string;
  description: string;
  base_price: number;
}

interface InventorySubmission {
  id?: string;
  submission_number?: string;
  destination_id: string;
  status?: string;
  total_items?: number;
  total_prep_cost?: number;
  special_instructions?: string;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
  destination?: { name: string };
}

interface SubmissionItem {
  id?: string;
  submission_id?: string;
  sku: string;
  product_title: string;
  quantity: number;
  unit_cost?: number;
  weight_lbs?: number;
  length_inches?: number;
  width_inches?: number;
  height_inches?: number;
  expiration_date?: string;
  lot_number?: string;
}

interface SubmissionPrepService {
  submission_id?: string;
  item_id?: string;
  prep_service_id: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
}

export function useFulfillmentData() {
  const [destinations, setDestinations] = useState<FulfillmentDestination[]>([]);
  const [prepServices, setPrepServices] = useState<PrepService[]>([]);
  const [submissions, setSubmissions] = useState<InventorySubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch fulfillment destinations
  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('fulfillment_destinations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fulfillment destinations",
        variant: "destructive",
      });
    }
  };

  // Fetch prep services
  const fetchPrepServices = async () => {
    try {
      const { data, error } = await supabase
        .from('prep_services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPrepServices(data || []);
    } catch (error) {
      console.error('Error fetching prep services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch prep services",
        variant: "destructive",
      });
    }
  };

  // Fetch user's submissions
  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_submissions')
        .select(`
          *,
          destination:fulfillment_destinations!fk_inventory_submissions_destination(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    }
  };

  // Create new submission
  const createSubmission = async (submission: InventorySubmission): Promise<string | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate submission number
      const submissionNumber = `SUB-${Date.now()}`;

      const { data, error } = await supabase
        .from('inventory_submissions')
        .insert({
          ...submission,
          user_id: user.id,
          submission_number: submissionNumber,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory submission created successfully",
      });

      await fetchSubmissions(); // Refresh list
      return data.id;
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({
        title: "Error",
        description: "Failed to create submission",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add items to submission
  const addSubmissionItems = async (submissionId: string, items: SubmissionItem[]) => {
    setLoading(true);
    try {
      const itemsWithSubmissionId = items.map(item => ({
        ...item,
        submission_id: submissionId,
      }));

      const { error } = await supabase
        .from('submission_items')
        .insert(itemsWithSubmissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${items.length} items to submission`,
      });
    } catch (error) {
      console.error('Error adding items:', error);
      toast({
        title: "Error",
        description: "Failed to add items to submission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add prep services to submission
  const addPrepServices = async (submissionId: string, prepServices: SubmissionPrepService[]) => {
    setLoading(true);
    try {
      const servicesWithSubmissionId = prepServices.map(service => ({
        ...service,
        submission_id: submissionId,
      }));

      const { error } = await supabase
        .from('submission_prep_services')
        .insert(servicesWithSubmissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prep services added successfully",
      });
    } catch (error) {
      console.error('Error adding prep services:', error);
      toast({
        title: "Error",
        description: "Failed to add prep services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Submit for approval
  const submitForApproval = async (submissionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('inventory_submissions')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission sent for approval",
      });

      await fetchSubmissions(); // Refresh list
    } catch (error) {
      console.error('Error submitting for approval:', error);
      toast({
        title: "Error",
        description: "Failed to submit for approval",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
    fetchPrepServices();
    fetchSubmissions();
  }, []);

  return {
    destinations,
    prepServices,
    submissions,
    loading,
    createSubmission,
    addSubmissionItems,
    addPrepServices,
    submitForApproval,
    fetchSubmissions,
  };
}