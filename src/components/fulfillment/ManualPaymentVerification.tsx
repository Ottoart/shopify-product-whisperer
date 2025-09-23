import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw } from "lucide-react";

interface ManualPaymentVerificationProps {
  submissionId: string;
  onVerificationComplete: () => void;
}

export function ManualPaymentVerification({ submissionId, onVerificationComplete }: ManualPaymentVerificationProps) {
  const [sessionId, setSessionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleManualVerification = async () => {
    if (!sessionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Stripe session ID",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-submission-payment', {
        body: { sessionId: sessionId.trim() }
      });

      if (error) throw error;

      if (data?.sessionStatus === "paid") {
        toast({
          title: "Payment Verified!",
          description: "The payment has been successfully verified and the submission updated.",
        });
        onVerificationComplete();
      } else {
        toast({
          title: "Payment Not Found",
          description: "The payment could not be verified. Please check the session ID.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Manual verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Manual Payment Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sessionId">Stripe Session ID</Label>
          <Input
            id="sessionId"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="cs_test_..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the Stripe checkout session ID from the payment URL
          </p>
        </div>
        
        <Button 
          onClick={handleManualVerification}
          disabled={isVerifying || !sessionId.trim()}
          className="w-full"
        >
          {isVerifying ? "Verifying..." : "Verify Payment"}
        </Button>
      </CardContent>
    </Card>
  );
}