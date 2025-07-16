import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface ShopifyConnectionTestProps {
  storeId: string;
  storeName: string;
}

export const ShopifyConnectionTest = ({ storeId, storeName }: ShopifyConnectionTestProps) => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
    suggestion?: string;
  } | null>(null);
  const { toast } = useToast();

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-shopify-connection', {
        body: { storeId }
      });

      if (error) {
        throw error;
      }

      setResult(data);
      
      if (data.success) {
        toast({
          title: "Connection Successful",
          description: `Successfully connected to ${data.shopName || storeName}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Connection test error:', error);
      setResult({
        success: false,
        message: 'Failed to test connection',
        details: error.message
      });
      
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Test Shopify Connection</span>
          {result && (
            result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Test if we can connect to your Shopify store: <strong>{storeName}</strong>
        </p>
        
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {testing ? 'Testing Connection...' : 'Test Connection'}
        </Button>
        
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.message}
            </p>
            
            {result.suggestion && (
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Suggestion:</strong> {result.suggestion}
              </p>
            )}
            
            {result.details && typeof result.details === 'string' && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details
                </summary>
                <pre className="text-xs mt-1 p-2 bg-background rounded overflow-auto">
                  {result.details}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};