import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAccountDeletion = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const deleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      // Call the edge function to delete the user account and all associated data
      const { data, error } = await supabase.functions.invoke('delete-user-account');

      if (error) {
        throw new Error(error.message || 'Failed to delete account');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Account deletion failed');
      }

      // Clear the session locally
      await supabase.auth.signOut();

      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted."
      });

      // Redirect to home page
      navigate('/');
      
      return { success: true };
    } catch (error: any) {
      console.error('Account deletion error:', error);
      
      toast({
        title: "Error deleting account",
        description: error.message || 'An unexpected error occurred',
        variant: "destructive"
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    isDeleting
  };
};