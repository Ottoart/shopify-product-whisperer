import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  X,
  VolumeX,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RepricingAlert {
  id: string;
  alert_type: 'conflict' | 'below_cost' | 'buybox_lost' | 'stale_data';
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_resolved: boolean;
  created_at: string;
  product_pricing_id?: string;
  rule_id?: string;
  product_sku?: string;
  product_title?: string;
}

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState<RepricingAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<RepricingAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("unresolved");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const loadAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('repricing_alerts')
        .select(`
          *,
          product_pricing(sku, product_title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const alertsWithProduct = data?.map(alert => ({
        ...alert,
        product_sku: alert.product_pricing?.sku,
        product_title: alert.product_pricing?.product_title,
        alert_type: alert.alert_type as 'conflict' | 'below_cost' | 'buybox_lost' | 'stale_data',
        severity: alert.severity as 'low' | 'medium' | 'high'
      })) || [];

      setAlerts(alertsWithProduct);
    } catch (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.product_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.product_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by severity
    if (severityFilter !== "all") {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Filter by status
    if (statusFilter === "resolved") {
      filtered = filtered.filter(alert => alert.is_resolved);
    } else if (statusFilter === "unresolved") {
      filtered = filtered.filter(alert => !alert.is_resolved);
    }

    setFilteredAlerts(filtered);
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('repricing_alerts')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, is_resolved: true } : alert
      ));

      toast({
        title: "Success",
        description: "Alert marked as resolved",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const muteAlert = async (alertId: string) => {
    // In a real implementation, this might add the alert to a muted list
    // For now, we'll just resolve it
    await resolveAlert(alertId);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'conflict':
        return <AlertTriangle className="h-4 w-4" />;
      case 'below_cost':
        return <AlertCircle className="h-4 w-4" />;
      case 'buybox_lost':
        return <X className="h-4 w-4" />;
      case 'stale_data':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: "secondary",
      medium: "default",
      high: "destructive"
    } as const;
    
    return <Badge variant={variants[severity as keyof typeof variants]}>{severity}</Badge>;
  };

  const getAlertTypeLabel = (type: string) => {
    const labels = {
      conflict: "Rule Conflict",
      below_cost: "Below Cost",
      buybox_lost: "Buy Box Lost",
      stale_data: "Stale Data"
    };
    return labels[type as keyof typeof labels] || type;
  };

  if (loading) {
    return <div>Loading alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alerts & Conflicts</h2>
          <p className="text-muted-foreground">Monitor and resolve repricing issues</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {alerts.filter(a => !a.is_resolved).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.severity === 'high' && !a.is_resolved).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.is_resolved).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={severityFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("all")}
              >
                All
              </Button>
              <Button
                variant={severityFilter === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("high")}
              >
                High
              </Button>
              <Button
                variant={severityFilter === "medium" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("medium")}
              >
                Medium
              </Button>
              <Button
                variant={severityFilter === "low" ? "default" : "outline"}
                size="sm"
                onClick={() => setSeverityFilter("low")}
              >
                Low
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id} className={alert.is_resolved ? "opacity-60" : ""}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getAlertIcon(alert.alert_type)}
                      <span className="text-sm">{getAlertTypeLabel(alert.alert_type)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm">{alert.message}</p>
                  </TableCell>
                  <TableCell>
                    {alert.product_sku && (
                      <div className="text-sm">
                        <div className="font-medium">{alert.product_sku}</div>
                        <div className="text-muted-foreground truncate max-w-xs">
                          {alert.product_title}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                  <TableCell>
                    {alert.is_resolved ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Open
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {!alert.is_resolved && (
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => muteAlert(alert.id)}
                        >
                          <VolumeX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}