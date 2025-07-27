import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function PaymentVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const sessionId = searchParams.get("session_id");
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        navigate("/send-inventory");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-submission-payment', {
          body: { sessionId }
        });

        if (error) throw error;

        if (data?.sessionStatus === "paid") {
          toast({
            title: "Payment Successful!",
            description: "Your submission has been sent for approval.",
          });
        } else {
          toast({
            title: "Payment Not Completed",
            description: "Your submission has been saved as a draft.",
            variant: "destructive",
          });
        }

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/send-inventory");
        }, 3000);

      } catch (error) {
        console.error("Payment verification error:", error);
        toast({
          title: "Payment Verification Error",
          description: "There was an issue verifying your payment. Please contact support.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate("/send-inventory");
        }, 3000);
      }
    };

    if (sessionId) {
      verifyPayment();
    } else if (paymentStatus === "canceled") {
      toast({
        title: "Payment Canceled",
        description: "Your submission has been saved as a draft.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/send-inventory");
      }, 2000);
    }
  }, [sessionId, paymentStatus, navigate, toast]);

  if (paymentStatus === "success" && sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Verifying Payment...</h2>
                <p className="text-muted-foreground text-sm">
                  Please wait while we confirm your payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === "canceled") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Payment Canceled</h2>
                <p className="text-muted-foreground text-sm">
                  Your submission has been saved as a draft. You can complete payment later.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}