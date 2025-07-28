import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, Package, DollarSign, MapPin } from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id?: string;
  submission_number?: string;
  fulfillment_destinations?: { name: string };
  status?: string;
  total_items?: number | null;
  total_prep_cost?: number | null;
  special_instructions?: string;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface SubmissionsListProps {
  submissions: Submission[];
  loading: boolean;
  type: 'draft' | 'submitted' | 'approved';
}

export function SubmissionsList({ submissions, loading, type }: SubmissionsListProps) {
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'approved':
        return 'default';
      default:
        return 'secondary';
    }
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No submissions found</h3>
        <p className="text-muted-foreground">
          {type === 'draft' 
            ? "You don't have any draft submissions yet."
            : type === 'submitted'
            ? "No submissions are currently pending approval."
            : "No submissions have been approved yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="transition-all hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {submission.submission_number || 'N/A'}
              </CardTitle>
               <Badge 
                variant={getStatusBadgeVariant(submission.status || 'draft')}
                className={getStatusColor(submission.status || 'draft')}
              >
                {getStatusDisplayName(submission.status || 'draft')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Info */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Destination</div>
                  <div className="text-sm text-muted-foreground">
                    {submission.fulfillment_destinations?.name || 'Unknown'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Items</div>
                  <div className="text-sm text-muted-foreground">
                    {submission.total_items || 0} items
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Prep Cost</div>
                  <div className="text-sm text-muted-foreground">
                    ${submission.total_prep_cost?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Created</div>
                  <div className="text-sm text-muted-foreground">
                    {submission.created_at ? format(new Date(submission.created_at), 'MMM dd, yyyy') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Instructions */}
            {submission.special_instructions && (
              <div className="p-3 bg-muted rounded-md">
                <div className="text-sm font-medium mb-1">Special Instructions:</div>
                <div className="text-sm text-muted-foreground">
                  {submission.special_instructions}
                </div>
              </div>
            )}

            {/* Submitted Date */}
            {submission.submitted_at && (
              <div className="text-sm text-muted-foreground">
                Submitted: {format(new Date(submission.submitted_at), 'MMM dd, yyyy HH:mm')}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setExpandedSubmission(
                  expandedSubmission === submission.id ? null : submission.id
                )}
              >
                {expandedSubmission === submission.id ? 'Hide Details' : 'View Details'}
              </Button>
              
              {type === 'draft' && (
                <>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button size="sm">
                    Submit for Approval
                  </Button>
                </>
              )}
              
              {submission.status === 'paid' && (
                <Button 
                  size="sm"
                  onClick={() => window.location.href = `/send-inventory?shipping_details=${submission.id}`}
                >
                  Add Shipping Details
                </Button>
              )}
              
              {type === 'approved' && (
                <Button variant="outline" size="sm">
                  Track Progress
                </Button>
              )}
            </div>

            {/* Expanded Details */}
            {expandedSubmission === submission.id && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <div className="space-y-2">
                  <div><strong>ID:</strong> {submission.id || 'N/A'}</div>
                  <div><strong>Last Updated:</strong> {submission.updated_at ? format(new Date(submission.updated_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</div>
                  {/* Add more detailed information here as needed */}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}