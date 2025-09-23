import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Printer, 
  Download, 
  Search, 
  FileText, 
  Truck,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface ShippingLabel {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  service_code: string;
  service_name: string;
  shipping_cost: number;
  currency: string;
  label_format: string;
  label_image_data: string;
  status: string;
  created_at: string;
  voided_at?: string;
  void_reason?: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  currency: string;
}

export function ShippingLabelManager() {
  const [labels, setLabels] = useState<ShippingLabel[]>([]);
  const [orders, setOrders] = useState<{ [key: string]: Order }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      
      // Fetch labels
      const { data: labelsData, error: labelsError } = await supabase
        .from('shipping_labels')
        .select('*')
        .order('created_at', { ascending: false });

      if (labelsError) throw labelsError;

      // Fetch associated orders
      const orderIds = labelsData?.map(label => label.order_id) || [];
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, total_amount, currency')
        .in('id', orderIds);

      if (ordersError) throw ordersError;

      // Create orders map
      const ordersMap = ordersData?.reduce((acc, order) => {
        acc[order.id] = order;
        return acc;
      }, {} as { [key: string]: Order }) || {};

      setLabels(labelsData || []);
      setOrders(ordersMap);
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast({
        title: "Error loading labels",
        description: "Failed to load shipping labels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintLabel = (label: ShippingLabel) => {
    const order = orders[label.order_id];
    const printWindow = window.open('', '_blank');
    
    if (printWindow && label.label_image_data) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shipping Label - ${label.tracking_number}</title>
            <style>
              body { margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; }
              .header { margin-bottom: 20px; }
              .info { margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Shipping Label</h2>
              <div class="info">Tracking: ${label.tracking_number}</div>
              <div class="info">Order: ${order?.order_number || 'N/A'}</div>
              <div class="info">Service: ${label.service_name}</div>
            </div>
            <img src="data:image/${label.label_format.toLowerCase()};base64,${label.label_image_data}" alt="Shipping Label" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadLabel = (label: ShippingLabel) => {
    if (label.label_image_data) {
      const link = document.createElement('a');
      link.href = `data:image/${label.label_format.toLowerCase()};base64,${label.label_image_data}`;
      link.download = `label-${label.tracking_number}.${label.label_format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVoidLabel = async (labelId: string) => {
    try {
      const { error } = await supabase
        .from('shipping_labels')
        .update({
          status: 'voided',
          voided_at: new Date().toISOString(),
          void_reason: 'Manual void'
        })
        .eq('id', labelId);

      if (error) throw error;

      toast({
        title: "Label voided",
        description: "Shipping label has been voided successfully",
      });

      fetchLabels(); // Refresh the list
    } catch (error) {
      console.error('Error voiding label:', error);
      toast({
        title: "Void failed",
        description: "Failed to void shipping label",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLabels = labels.filter(label => {
    const order = orders[label.order_id];
    const searchLower = searchTerm.toLowerCase();
    
    return (
      label.tracking_number.toLowerCase().includes(searchLower) ||
      order?.order_number.toLowerCase().includes(searchLower) ||
      order?.customer_name.toLowerCase().includes(searchLower) ||
      label.carrier.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (label: ShippingLabel) => {
    if (label.status === 'voided') {
      return <Badge variant="destructive">Voided</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const totalCost = filteredLabels
    .filter(label => label.status === 'active')
    .reduce((sum, label) => sum + (label.shipping_cost || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="h-8 w-8 animate-pulse mx-auto mb-2" />
          <p>Loading shipping labels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shipping Labels</h2>
          <p className="text-muted-foreground">Manage and print shipping labels</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Active Labels</div>
            <div className="text-lg font-semibold">{filteredLabels.filter(l => l.status === 'active').length}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Shipping Cost</div>
            <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tracking, order, customer, or carrier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={fetchLabels}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Labels Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking Number</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Carrier & Service</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLabels.map((label) => {
                const order = orders[label.order_id];
                return (
                  <TableRow key={label.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono font-medium">{label.tracking_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order?.order_number || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {order ? formatCurrency(order.total_amount, order.currency) : '-'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order?.customer_name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{label.carrier}</div>
                        <div className="text-sm text-muted-foreground">{label.service_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {label.shipping_cost ? formatCurrency(label.shipping_cost, label.currency) : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(label)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(label.created_at)}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintLabel(label)}
                          className="flex items-center gap-1"
                        >
                          <Printer className="h-3 w-3" />
                          Print
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadLabel(label)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                        {label.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVoidLabel(label.id)}
                            className="flex items-center gap-1 text-destructive hover:text-destructive"
                          >
                            <XCircle className="h-3 w-3" />
                            Void
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredLabels.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No shipping labels found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create shipping labels from your orders to see them here.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}