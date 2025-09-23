import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PrepServicesEditDialog } from "./PrepServicesEditDialog";
import { 
  FileText, 
  Calendar, 
  Package, 
  DollarSign, 
  MapPin, 
  Ruler,
  Weight,
  Calendar as CalendarIcon,
  Hash,
  X,
  Edit3,
  Wrench
} from "lucide-react";
import { format } from "date-fns";

interface SubmissionItem {
  id: string;
  sku: string;
  product_title: string;
  quantity: number;
  unit_cost: number | null;
  weight_lbs: number | null;
  length_inches: number | null;
  width_inches: number | null;
  height_inches: number | null;
  expiration_date: string | null;
  lot_number: string | null;
  submission_prep_services: Array<{
    id: string;
    prep_service_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    prep_services: {
      id: string;
      name: string;
      code: string;
      description: string;
    };
  }>;
}

interface SubmissionDetailViewProps {
  submissionId: string;
  onClose: () => void;
}

export function SubmissionDetailView({ submissionId, onClose }: SubmissionDetailViewProps) {
  const [submission, setSubmission] = useState<any>(null);
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        // Fetch submission details
        const { data: submissionData, error: submissionError } = await supabase
          .from('inventory_submissions')
          .select(`
            *,
            fulfillment_destinations(name)
          `)
          .eq('id', submissionId)
          .single();

        if (submissionError) throw submissionError;

        // Fetch submission items with prep services
        const { data: itemsData, error: itemsError } = await supabase
          .from('submission_items')
          .select(`
            *,
            submission_prep_services(
              id,
              prep_service_id,
              quantity,
              unit_price,
              total_price,
              prep_services(
                id,
                name,
                code,
                description
              )
            )
          `)
          .eq('submission_id', submissionId);

        if (itemsError) throw itemsError;

        setSubmission(submissionData);
        setItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching submission details:', error);
        toast({
          title: "Error",
          description: "Failed to load submission details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmissionDetails();
    }
  }, [submissionId, toast]);

  const refreshSubmissionDetails = async () => {
    try {
      setLoading(true);
      // Fetch submission details
      const { data: submissionData, error: submissionError } = await supabase
        .from('inventory_submissions')
        .select(`
          *,
          fulfillment_destinations(name)
        `)
        .eq('id', submissionId)
        .single();

      if (submissionError) throw submissionError;

      // Fetch submission items with prep services
      const { data: itemsData, error: itemsError } = await supabase
        .from('submission_items')
        .select(`
          *,
          submission_prep_services(
            id,
            prep_service_id,
            quantity,
            unit_price,
            total_price,
            prep_services(
              id,
              name,
              code,
              description
            )
          )
        `)
        .eq('submission_id', submissionId);

      if (itemsError) throw itemsError;

      setSubmission(submissionData);
      setItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching submission details:', error);
      toast({
        title: "Error",
        description: "Failed to load submission details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canEditPrepServices = () => {
    return submission?.status === 'draft' || submission?.status === 'paid';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600";
      case "pending_approval":
        return "text-blue-600";
      case "payment_pending":
        return "text-yellow-600";
      case "paid":
        return "text-purple-600";
      case "submitted":
        return "text-blue-600";
      case "draft":
        return "text-orange-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "Pending Approval";
      case "payment_pending":
        return "Payment Pending";
      case "paid":
        return "Awaiting Shipping Details";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Submission not found</p>
              <Button onClick={onClose} className="mt-4">Close</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <CardTitle className="text-xl">
                  {submission.submission_number}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Submission Details
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary"
                className={getStatusColor(submission.status)}
              >
                {getStatusDisplayName(submission.status)}
              </Badge>
              {canEditPrepServices() && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Prep Services
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary Information */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Destination</div>
                <div className="text-sm text-muted-foreground">
                  {submission.fulfillment_destinations?.name || 'Unknown'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Total Items</div>
                <div className="text-sm text-muted-foreground">
                  {submission.total_items || 0} items
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Prep Cost</div>
                <div className="text-sm text-muted-foreground">
                  ${submission.total_prep_cost?.toFixed(2) || '0.00'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Created</div>
                <div className="text-sm text-muted-foreground">
                  {submission.created_at ? format(new Date(submission.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Special Instructions */}
          {submission.special_instructions && (
            <>
              <div>
                <h3 className="font-medium mb-2">Special Instructions</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{submission.special_instructions}</p>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Items Details */}
          <div>
            <h3 className="font-medium mb-4">Items ({items.length})</h3>
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Item Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product_title}</h4>
                          {item.sku && (
                            <div className="flex items-center gap-1 mt-1">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.sku}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">Qty: {item.quantity}</div>
                          {item.unit_cost && (
                            <div className="text-xs text-muted-foreground">
                              ${item.unit_cost.toFixed(2)} each
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Details Grid */}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Dimensions */}
                        {(item.length_inches || item.width_inches || item.height_inches) && (
                          <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs font-medium">Dimensions</div>
                              <div className="text-xs text-muted-foreground">
                                {[item.length_inches, item.width_inches, item.height_inches]
                                  .map(d => d ? `${d}"` : '?')
                                  .join(' × ')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Weight */}
                        {item.weight_lbs && (
                          <div className="flex items-center gap-2">
                            <Weight className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs font-medium">Weight</div>
                              <div className="text-xs text-muted-foreground">
                                {item.weight_lbs} lbs
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expiration Date */}
                        {item.expiration_date && (
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-xs font-medium">Expires</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(item.expiration_date), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lot Number */}
                         {item.lot_number && (
                           <div className="flex items-center gap-2">
                             <Hash className="h-4 w-4 text-muted-foreground" />
                             <div>
                               <div className="text-xs font-medium">Lot #</div>
                               <div className="text-xs text-muted-foreground">
                                 {item.lot_number}
                               </div>
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Prep Services */}
                       {item.submission_prep_services?.length > 0 && (
                         <>
                           <Separator className="my-3" />
                           <div>
                             <div className="flex items-center gap-2 mb-2">
                               <Wrench className="h-4 w-4 text-muted-foreground" />
                               <span className="text-sm font-medium">Prep Services</span>
                             </div>
                             <div className="space-y-2">
                               {item.submission_prep_services.map((sps) => (
                                 <div key={sps.id} className="flex items-center justify-between text-sm">
                                   <div className="flex items-center gap-2">
                                     <span>{sps.prep_services.name}</span>
                                     <Badge variant="outline" className="text-xs">
                                       {sps.quantity}x
                                     </Badge>
                                   </div>
                                   <div className="text-right">
                                     <div className="font-medium">${sps.total_price.toFixed(2)}</div>
                                     <div className="text-xs text-muted-foreground">
                                       ${sps.unit_price.toFixed(2)} each
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                         </>
                       )}
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {(submission.created_at || submission.submitted_at || submission.approved_at) && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-4">Timeline</h3>
                <div className="space-y-3">
                  {submission.created_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <span className="font-medium">Created</span> - {format(new Date(submission.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  )}
                  {submission.submitted_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <span className="font-medium">Submitted</span> - {format(new Date(submission.submitted_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  )}
                  {submission.approved_at && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <span className="font-medium">Approved</span> - {format(new Date(submission.approved_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Prep Services Dialog */}
      <PrepServicesEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        submissionId={submissionId}
        items={items}
        onSuccess={refreshSubmissionDetails}
      />
    </div>
  );
}