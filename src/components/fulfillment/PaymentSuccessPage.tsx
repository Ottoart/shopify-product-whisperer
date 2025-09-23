import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PaymentSuccessPageProps {
  submission: {
    id: string;
    submission_number: string;
    total_items: number;
    total_prep_cost: number;
    fulfillment_destinations?: { name: string };
  };
  paymentAmount: number;
  onContinueToShipping: () => void;
}

export function PaymentSuccessPage({ 
  submission, 
  paymentAmount, 
  onContinueToShipping 
}: PaymentSuccessPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            Payment Successful!
          </CardTitle>
          <p className="text-muted-foreground">
            Your submission has been paid and is ready for shipment details
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-medium">Payment Confirmed</span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ${paymentAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Submission Details</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{submission.submission_number}</div>
                  <div className="text-sm text-muted-foreground">Submission ID</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  Awaiting Shipping Details
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Total Items</div>
                <div className="font-medium">{submission.total_items} items</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Destination</div>
                <div className="font-medium">
                  {submission.fulfillment_destinations?.name || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Next Steps
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              To complete your submission, please provide shipping details for your inventory.
              This includes pickup address, delivery preferences, and any special handling instructions.
            </p>
            
            <Button 
              onClick={onContinueToShipping}
              className="w-full"
              size="lg"
            >
              Continue to Shipping Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Support Note */}
          <div className="text-center text-sm text-muted-foreground">
            Need help? Contact our support team for assistance with your submission.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}