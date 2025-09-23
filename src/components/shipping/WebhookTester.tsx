import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Webhook,
  RefreshCw,
  TestTube
} from "lucide-react";

interface WebhookEvent {
  id: string;
  platform: string;
  event_type: string;
  received_at: string;
  processed_at: string | null;
  processing_error: string | null;
}

interface WebhookTestResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const WebhookTester = () => {
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState<{ [key: string]: boolean }>({});
  const [testResults, setTestResults] = useState<{ [key: string]: WebhookTestResult }>({});

  // Available webhooks to test
  const webhookEndpoints = [
    {
      name: 'eBay Webhook Handler',
      endpoint: 'ebay-webhook-handler',
      description: 'Handles eBay marketplace notifications',
      testable: true
    },
    {
      name: 'Shopify Order Sync',
      endpoint: 'sync-orders',
      description: 'Syncs orders from Shopify',
      testable: true
    }
  ];

  const fetchWebhookEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setWebhookEvents(data || []);
    } catch (error) {
      console.error('Error fetching webhook events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch webhook events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testWebhookEndpoint = async (endpoint: string) => {
    setTestLoading(prev => ({ ...prev, [endpoint]: true }));
    
    try {
      const response = await supabase.functions.invoke(endpoint, {
        method: 'GET'
      });

      const result: WebhookTestResult = {
        success: !response.error,
        message: response.data?.status || response.data?.message || 'Test completed',
        error: response.error?.message
      };

      setTestResults(prev => ({ ...prev, [endpoint]: result }));
      
      toast({
        title: result.success ? "Test Passed" : "Test Failed", 
        description: result.message || result.error,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      const result: WebhookTestResult = {
        success: false,
        error: (error as Error).message
      };
      
      setTestResults(prev => ({ ...prev, [endpoint]: result }));
      
      toast({
        title: "Test Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setTestLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const getStatusIcon = (event: WebhookEvent) => {
    if (event.processing_error) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    } else if (event.processed_at) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTestResultIcon = (result: WebhookTestResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  React.useEffect(() => {
    fetchWebhookEvents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Configuration Testing</h2>
          <p className="text-muted-foreground">
            Test webhook endpoints and monitor recent webhook activity
          </p>
        </div>
        <Button onClick={fetchWebhookEvents} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList>
          <TabsTrigger value="test">Test Endpoints</TabsTrigger>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4">
          <div className="grid gap-4">
            {webhookEndpoints.map((webhook) => (
              <Card key={webhook.endpoint}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        {webhook.name}
                      </CardTitle>
                      <CardDescription>{webhook.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {testResults[webhook.endpoint] && getTestResultIcon(testResults[webhook.endpoint])}
                      <Button
                        onClick={() => testWebhookEndpoint(webhook.endpoint)}
                        disabled={testLoading[webhook.endpoint] || !webhook.testable}
                        size="sm"
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        {testLoading[webhook.endpoint] ? 'Testing...' : 'Test'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      <strong>Endpoint:</strong> /functions/v1/{webhook.endpoint}
                    </div>
                    {testResults[webhook.endpoint] && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Last Test Result:</strong> {testResults[webhook.endpoint].message || testResults[webhook.endpoint].error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
              <CardDescription>
                Last 20 webhook events received and processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                </div>
              ) : webhookEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No webhook events found
                </div>
              ) : (
                <div className="space-y-3">
                  {webhookEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(event)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{event.platform}</Badge>
                            <span className="font-medium">{event.event_type}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Received: {new Date(event.received_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {event.processing_error ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : event.processed_at ? (
                          <Badge variant="default">Processed</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};