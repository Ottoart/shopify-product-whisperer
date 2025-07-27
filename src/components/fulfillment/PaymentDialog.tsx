import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Package, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
    id: string;
    submission_number: string;
    total_items: number;
    total_prep_cost: number;
    destination: { name: string };
    special_instructions?: string;
  };
  items: Array<{
    sku: string;
    quantity: number;
    prep_services: Array<{ name: string; cost_per_item: number }>;
  }>;
  onPaymentSuccess: () => void;
}

export function PaymentDialog({ 
  open, 
  onOpenChange, 
  submission, 
  items, 
  onPaymentSuccess 
}: PaymentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const calculateItemCost = (item: typeof items[0]) => {
    return item.prep_services.reduce((total, service) => 
      total + (service.cost_per_item * item.quantity), 0
    );
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-submission-payment', {
        body: { submissionId: submission.id }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error("No payment URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment for Submission #{submission.submission_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Submission Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Destination:</span>
                  <p className="text-muted-foreground">{submission.destination.name}</p>
                </div>
                <div>
                  <span className="font-medium">Total Items:</span>
                  <p className="text-muted-foreground">{submission.total_items}</p>
                </div>
              </div>
              
              {submission.special_instructions && (
                <div>
                  <span className="font-medium">Special Instructions:</span>
                  <p className="text-muted-foreground text-sm mt-1">
                    {submission.special_instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items & Prep Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{item.sku}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <Badge variant="outline">
                        ${calculateItemCost(item).toFixed(2)}
                      </Badge>
                    </div>
                    
                    {item.prep_services.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Prep Services:</p>
                        <div className="space-y-1">
                          {item.prep_services.map((service, serviceIndex) => (
                            <div key={serviceIndex} className="flex justify-between text-sm text-muted-foreground">
                              <span>{service.name}</span>
                              <span>${(service.cost_per_item * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Prep Services Subtotal:</span>
                  <span>${submission.total_prep_cost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>${submission.total_prep_cost.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Actions */}
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={isProcessing || submission.total_prep_cost <= 0}
              className="min-w-[120px]"
            >
              {isProcessing ? "Processing..." : `Pay $${submission.total_prep_cost.toFixed(2)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}