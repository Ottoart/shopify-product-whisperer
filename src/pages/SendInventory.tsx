import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, FileText, CheckCircle, Clock } from "lucide-react";
import { useInventorySubmissions } from "@/hooks/useInventorySubmissions";
import { CreateSubmissionForm } from "@/components/fulfillment/CreateSubmissionForm";
import { SubmissionsList } from "@/components/fulfillment/SubmissionsList";
import { PaymentVerification } from "@/components/fulfillment/PaymentVerification";
import { ShipmentDetailsForm } from "@/components/fulfillment/ShipmentDetailsForm";

export default function SendInventory() {
  const [activeTab, setActiveTab] = useState("create");
  const [searchParams] = useSearchParams();
  
  const { submissions, isLoading, fetchSubmissions } = useInventorySubmissions();

  // Handle payment verification
  if (searchParams.get("payment") || searchParams.get("session_id")) {
    return <PaymentVerification onPaymentComplete={fetchSubmissions} />;
  }

  const draftSubmissions = submissions.filter(sub => sub.status === 'draft');
  const pendingSubmissions = submissions.filter(sub => 
    sub.status === 'pending_approval' || sub.status === 'payment_pending' || sub.status === 'paid'
  );
  const approvedSubmissions = submissions.filter(sub => sub.status === 'approved');

  // Check if we need to show shipping details form directly
  const shippingDetailsId = searchParams.get("shipping_details");
  if (shippingDetailsId) {
    const submission = submissions.find(sub => sub.id === shippingDetailsId);
    if (submission && submission.status === 'paid') {
      return (
        <div className="container mx-auto">
          <ShipmentDetailsForm
            submissionId={shippingDetailsId}
            onSuccess={() => {
              fetchSubmissions();
              window.history.replaceState({}, '', '/send-inventory');
            }}
            onCancel={() => {
              window.history.replaceState({}, '', '/send-inventory');
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Send Inventory</h1>
        <p className="text-muted-foreground">
          Create and manage inventory submissions for fulfillment processing
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubmissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedSubmissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create New Submission</TabsTrigger>
          <TabsTrigger value="drafts">Draft Submissions ({draftSubmissions.length})</TabsTrigger>
          <TabsTrigger value="submitted">Pending Approval ({pendingSubmissions.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedSubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Inventory Submission</CardTitle>
              <CardDescription>
                Enter your product details and select prep services for fulfillment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateSubmissionForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Draft Submissions</CardTitle>
              <CardDescription>
                Complete and submit your draft inventory submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsList 
                submissions={draftSubmissions} 
                loading={isLoading} 
                type="draft"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approval</CardTitle>
              <CardDescription>
                Submissions waiting for warehouse team approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsList 
                submissions={pendingSubmissions} 
                loading={isLoading} 
                type="submitted"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Submissions</CardTitle>
              <CardDescription>
                Submissions approved and ready for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubmissionsList 
                submissions={approvedSubmissions} 
                loading={isLoading} 
                type="approved"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}