import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Clock, 
  Send, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface EmailAutomation {
  id: string;
  email_type: string;
  recipient_email: string;
  template_name: string;
  status: string;
  scheduled_for: string;
  sent_at?: string;
  metadata: any;
  retry_count: number;
}

export const EmailAutomationScheduler = () => {
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmailAutomations();
  }, []);

  const fetchEmailAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('email_automations')
        .select('*')
        .order('scheduled_for', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Error fetching email automations:', error);
      toast({
        title: "Error",
        description: "Failed to load email automations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleFollowUpEmail = async (quoteRequestId: string) => {
    try {
      // Schedule follow-up email for 3 days from now
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 3);

      const { error } = await supabase
        .from('email_automations')
        .insert({
          email_type: 'follow-up',
          recipient_email: 'customer@example.com', // This would come from quote data
          template_name: 'quote-follow-up',
          scheduled_for: scheduledFor.toISOString(),
          metadata: { quoteRequestId }
        });

      if (error) throw error;

      toast({
        title: "Follow-up Scheduled",
        description: "Email will be sent in 3 days",
      });

      fetchEmailAutomations();
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      toast({
        title: "Error",
        description: "Failed to schedule follow-up email",
        variant: "destructive"
      });
    }
  };

  const scheduleWelcomeSequence = async (customerEmail: string) => {
    try {
      const welcomeEmails = [
        { delay: 0, number: 1 },     // Immediate
        { delay: 1, number: 2 },     // Next day  
        { delay: 3, number: 3 }      // 3 days later
      ];

      for (const email of welcomeEmails) {
        const scheduledFor = new Date();
        scheduledFor.setDate(scheduledFor.getDate() + email.delay);

        await supabase
          .from('email_automations')
          .insert({
            email_type: 'welcome-sequence',
            recipient_email: customerEmail,
            template_name: `welcome-email-${email.number}`,
            scheduled_for: scheduledFor.toISOString(),
            metadata: { emailNumber: email.number }
          });
      }

      toast({
        title: "Welcome Sequence Scheduled",
        description: "3 emails scheduled over the next 3 days",
      });

      fetchEmailAutomations();
    } catch (error) {
      console.error('Error scheduling welcome sequence:', error);
      toast({
        title: "Error",
        description: "Failed to schedule welcome sequence",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'sent':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RotateCcw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading email automations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-6 w-6 mr-2" />
            Email Automation Center
          </CardTitle>
          <CardDescription>
            Manage and schedule automated email campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => scheduleFollowUpEmail('sample-quote-id')}
              variant="outline"
            >
              <Send className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
            
            <Button 
              onClick={() => scheduleWelcomeSequence('new-customer@example.com')}
              variant="outline"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Welcome Series
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Emails</CardTitle>
          <CardDescription>
            {automations.length} email automations in queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {automations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No email automations scheduled yet
            </div>
          ) : (
            <div className="space-y-4">
              {automations.map((automation) => (
                <div 
                  key={automation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(automation.status)}
                    <div>
                      <div className="font-medium">
                        {automation.template_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        To: {automation.recipient_email}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Scheduled: {formatDateTime(automation.scheduled_for)}
                      </div>
                      {automation.sent_at && (
                        <div className="text-xs text-muted-foreground">
                          Sent: {formatDateTime(automation.sent_at)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusVariant(automation.status)}>
                      {automation.status}
                    </Badge>
                    {automation.retry_count > 0 && (
                      <Badge variant="outline">
                        Retry {automation.retry_count}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};