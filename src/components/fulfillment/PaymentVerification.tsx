import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PaymentSuccessPage } from "./PaymentSuccessPage";
import { ShipmentDetailsForm } from "./ShipmentDetailsForm";

interface PaymentVerificationProps {
  onPaymentComplete?: () => void;
}

type FlowStep = 'verifying' | 'success' | 'shipping_details' | 'complete' | 'cancelled';

export function PaymentVerification({ onPaymentComplete }: PaymentVerificationProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<FlowStep>('verifying');
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
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

        if (error) {
          console.error('Verify payment error:', error);
          throw error;
        }

        console.log('Payment verification response:', data);

        if (data?.sessionStatus === "paid") {
          // Set submission data and show success page
          setSubmissionData(data.submission);
          setPaymentAmount((data.payment?.amount_cents || 0) / 100);
          setCurrentStep('success');
          
          toast({
            title: "Payment Successful!",
            description: "Please provide shipping details to complete your submission.",
          });
        } else {
          toast({
            title: "Payment Not Completed",
            description: "Your submission has been saved as a draft.",
            variant: "destructive",
          });
          onPaymentComplete?.();
          
          // Redirect after a short delay
          setTimeout(() => {
            navigate("/send-inventory");
          }, 3000);
        }

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
      setCurrentStep('cancelled');
    }
  }, [sessionId, paymentStatus, navigate, toast]);

  const handleContinueToShipping = () => {
    setCurrentStep('shipping_details');
  };

  const handleShippingSuccess = () => {
    setCurrentStep('complete');
    onPaymentComplete?.();
    
    toast({
      title: "Submission Complete!",
      description: "Your submission is now pending approval from our team.",
    });
    
    setTimeout(() => {
      navigate("/send-inventory");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/send-inventory");
  };

  // Show payment success page
  if (currentStep === 'success' && submissionData) {
    return (
      <PaymentSuccessPage
        submission={submissionData}
        paymentAmount={paymentAmount}
        onContinueToShipping={handleContinueToShipping}
      />
    );
  }

  // Show shipping details form
  if (currentStep === 'shipping_details' && submissionData) {
    return (
      <ShipmentDetailsForm
        submissionId={submissionData.id}
        onSuccess={handleShippingSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Show verifying state
  if (currentStep === 'verifying' && paymentStatus === "success" && sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-green-600 dark:text-green-400 animate-spin" />
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

  // Show cancelled state
  if (currentStep === 'cancelled' || paymentStatus === "canceled") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
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