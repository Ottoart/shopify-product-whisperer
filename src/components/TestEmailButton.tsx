import { useState } from 'react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

export const TestEmailButton = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendTestEmail = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        method: 'POST'
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Email Sent!",
        description: "Check ottman1@gmail.com for the test email",
      });
      
      console.log('Test email response:', data);
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={sendTestEmail} 
      disabled={loading}
      className="bg-primary hover:bg-primary/90"
    >
      {loading ? 'Sending...' : 'Send Test Email'}
    </Button>
  );
};