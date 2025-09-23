import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  RotateCcw, 
  Package, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Plus,
  Edit,
  Eye,
  Download,
  Mail,
  Search,
  Filter,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  MapPin,
  FileText
} from "lucide-react";

interface Return {
  id: string;
  return_number: string;
  order_id: string;
  status: string;
  reason: string;
  customer_notes: string | null;
  admin_notes: string | null;
  refund_amount: number | null;
  restocking_fee: number | null;
  return_label_url: string | null;
  return_tracking_number: string | null;
  created_at: string;
  updated_at: string;
  // Related order data
  order?: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    total_amount: number;
  };
}

interface NewReturn {
  order_id: string;
  reason: string;
  customer_notes: string;
  refund_amount: number;
  restocking_fee: number;
}

const RETURN_STATUSES = [
  'requested',
  'approved',
  'rejected', 
  'label_sent',
  'in_transit',
  'received',
  'inspected',
  'refunded',
  'completed'
];

const RETURN_REASONS = [
  'defective',
  'wrong_item',
  'not_as_described',
  'damaged_in_shipping',
  'changed_mind',
  'too_small',
  'too_large',
  'other'
];

export function ComprehensiveReturnsManagement() {
  const [returns, setReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [newReturn, setNewReturn] = useState<NewReturn>({
    order_id: '',
    reason: '',
    customer_notes: '',
    refund_amount: 0,
    restocking_fee: 0
  });
  const [isNewReturnDialogOpen, setIsNewReturnDialogOpen] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('returns')
        .select(`
          *,
          order:orders(
            order_number,
            customer_name,
            customer_email,
            total_amount
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReturns(data || []);
      setFilteredReturns(data || []);
    } catch (error) {
      console.error('Error fetching returns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch returns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReturn = async () => {
    if (!newReturn.order_id || !newReturn.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to create a return",
          variant: "destructive",
        });
        return;
      }

      const returnNumber = `RET-${Date.now()}`;
      
      const { data, error } = await supabase
        .from('returns')
        .insert({
          return_number: returnNumber,
          order_id: newReturn.order_id,
          reason: newReturn.reason,
          customer_notes: newReturn.customer_notes,
          refund_amount: newReturn.refund_amount,
          restocking_fee: newReturn.restocking_fee,
          status: 'requested',
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Return Created",
        description: `Return ${returnNumber} has been created successfully`,
      });

      setIsNewReturnDialogOpen(false);
      setNewReturn({
        order_id: '',
        reason: '',
        customer_notes: '',
        refund_amount: 0,
        restocking_fee: 0
      });
      fetchReturns();
    } catch (error) {
      console.error('Error creating return:', error);
      toast({
        title: "Error",
        description: "Failed to create return",
        variant: "destructive",
      });
    }
  };

  const updateReturnStatus = async (returnId: string, status: string, adminNotes?: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('returns')
        .update(updateData)
        .eq('id', returnId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Return status changed to ${status}`,
      });

      fetchReturns();
    } catch (error) {
      console.error('Error updating return status:', error);
      toast({
        title: "Error",
        description: "Failed to update return status",
        variant: "destructive",
      });
    }
  };

  const generateReturnLabel = async (returnItem: Return) => {
    try {
      // In a real implementation, this would integrate with shipping APIs
      const trackingNumber = `RET${Date.now()}`;
      
      const { error } = await supabase
        .from('returns')
        .update({
          return_tracking_number: trackingNumber,
          status: 'label_sent',
          updated_at: new Date().toISOString()
        })
        .eq('id', returnItem.id);

      if (error) throw error;

      toast({
        title: "Return Label Generated",
        description: `Return label created with tracking: ${trackingNumber}`,
      });

      fetchReturns();
    } catch (error) {
      console.error('Error generating return label:', error);
      toast({
        title: "Error",
        description: "Failed to generate return label",
        variant: "destructive",
      });
    }
  };

  const filterReturns = () => {
    let filtered = returns;

    if (searchTerm) {
      filtered = filtered.filter(ret => 
        ret.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.order?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ret.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ret => ret.status === statusFilter);
    }

    setFilteredReturns(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'refunded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_transit':
      case 'received':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'requested':
      case 'approved':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'refunded':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_transit':
      case 'received':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    filterReturns();
  }, [searchTerm, statusFilter, returns]);

  const getStatusCounts = () => {
    const counts = RETURN_STATUSES.reduce((acc, status) => {
      acc[status] = returns.filter(ret => ret.status === status).length;
      return acc;
    }, {} as Record<string, number>);
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Returns Management</h2>
          <p className="text-muted-foreground">
            Manage return requests and process refunds efficiently
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReturns} disabled={loading} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isNewReturnDialogOpen} onOpenChange={setIsNewReturnDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Return
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Return</DialogTitle>
                <DialogDescription>
                  Process a new return request for a customer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={newReturn.order_id}
                    onChange={(e) => setNewReturn({...newReturn, order_id: e.target.value})}
                    placeholder="Enter order ID"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Return Reason</Label>
                  <Select value={newReturn.reason} onValueChange={(value) => setNewReturn({...newReturn, reason: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {RETURN_REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>
                          {reason.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerNotes">Customer Notes</Label>
                  <Textarea
                    id="customerNotes"
                    value={newReturn.customer_notes}
                    onChange={(e) => setNewReturn({...newReturn, customer_notes: e.target.value})}
                    placeholder="Customer's explanation..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="refundAmount">Refund Amount</Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      step="0.01"
                      value={newReturn.refund_amount}
                      onChange={(e) => setNewReturn({...newReturn, refund_amount: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="restockingFee">Restocking Fee</Label>
                    <Input
                      id="restockingFee"
                      type="number"
                      step="0.01"
                      value={newReturn.restocking_fee}
                      onChange={(e) => setNewReturn({...newReturn, restocking_fee: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <Button onClick={createReturn} className="w-full">
                  Create Return
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{statusCounts.requested + statusCounts.approved}</div>
            <div className="text-sm text-muted-foreground">Pending Returns</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{statusCounts.in_transit + statusCounts.received}</div>
            <div className="text-sm text-muted-foreground">In Process</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{statusCounts.completed + statusCounts.refunded}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">
              {formatCurrency(returns.reduce((sum, ret) => sum + (ret.refund_amount || 0), 0))}
            </div>
            <div className="text-sm text-muted-foreground">Total Refunds</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search returns, orders, or customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {RETURN_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()} ({statusCounts[status] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <Card>
        <CardHeader>
          <CardTitle>Return Requests</CardTitle>
          <CardDescription>
            {filteredReturns.length} of {returns.length} returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {returns.length === 0 ? 'No returns found' : 'No returns match your filters'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns.map((returnItem) => (
                <div key={returnItem.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(returnItem.status)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{returnItem.return_number}</span>
                          <Badge variant={getStatusColor(returnItem.status)}>
                            {returnItem.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Order: {returnItem.order?.order_number} • Customer: {returnItem.order?.customer_name}
                        </div>
                        <div className="text-sm">
                          Reason: <span className="font-medium">{returnItem.reason.replace('_', ' ')}</span>
                        </div>
                        {returnItem.refund_amount && (
                          <div className="text-sm">
                            Refund: <span className="font-medium">{formatCurrency(returnItem.refund_amount)}</span>
                            {returnItem.restocking_fee && returnItem.restocking_fee > 0 && (
                              <span className="text-muted-foreground ml-2">
                                (Restocking: {formatCurrency(returnItem.restocking_fee)})
                              </span>
                            )}
                          </div>
                        )}
                        {returnItem.return_tracking_number && (
                          <div className="text-sm text-muted-foreground">
                            Tracking: {returnItem.return_tracking_number}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {returnItem.status === 'approved' && !returnItem.return_tracking_number && (
                        <Button
                          size="sm"
                          onClick={() => generateReturnLabel(returnItem)}
                        >
                          Generate Label
                        </Button>
                      )}
                      <Select
                        value={returnItem.status}
                        onValueChange={(status) => updateReturnStatus(returnItem.id, status)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RETURN_STATUSES.map(status => (
                            <SelectItem key={status} value={status}>
                              {status.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {returnItem.customer_notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      <strong>Customer Notes:</strong> {returnItem.customer_notes}
                    </div>
                  )}
                  {returnItem.admin_notes && (
                    <div className="mt-2 p-3 bg-blue-50 rounded text-sm">
                      <strong>Admin Notes:</strong> {returnItem.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}