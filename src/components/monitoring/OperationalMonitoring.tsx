import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Server,
  Wifi,
  Zap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Monitor,
  HardDrive,
  Cpu,
  BarChart3
} from "lucide-react";

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface OperationLog {
  id: string;
  operation: string;
  status: 'success' | 'warning' | 'error';
  duration: number;
  timestamp: string;
  details: string;
  user_id?: string;
}

interface Alert {
  id: string;
  type: 'system' | 'operation' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const OperationalMonitoring = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [operations, setOperations] = useState<OperationLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Load system metrics
      const metricsData = generateMockMetrics();
      setMetrics(metricsData);

      // Load recent operations from audit logs
      const { data: auditData, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (auditError) {
        console.error('Error loading audit logs:', auditError);
      } else {
        const operationLogs = auditData?.map(log => ({
          id: log.id,
          operation: log.event_type,
          status: determineStatus(log.event_type),
          duration: Math.random() * 1000 + 100, // Mock duration
          timestamp: log.created_at,
          details: typeof log.details === 'object' && log.details && 'description' in log.details 
            ? (log.details as any).description 
            : 'No details available',
          user_id: log.user_id
        })) || [];
        
        setOperations(operationLogs);
      }

      // Generate alerts based on metrics and operations
      const systemAlerts = generateSystemAlerts(metricsData, auditData || []);
      setAlerts(systemAlerts);

    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast({
        title: "Monitoring Error",
        description: "Failed to load monitoring data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockMetrics = (): SystemMetric[] => {
    return [
      {
        id: '1',
        name: 'CPU Usage',
        value: Math.random() * 100,
        unit: '%',
        status: 'healthy',
        threshold: 80,
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Memory Usage',
        value: Math.random() * 100,
        unit: '%',
        status: 'healthy',
        threshold: 85,
        trend: 'up',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Database Connections',
        value: Math.floor(Math.random() * 100) + 50,
        unit: 'connections',
        status: 'healthy',
        threshold: 200,
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '4',
        name: 'API Response Time',
        value: Math.random() * 500 + 100,
        unit: 'ms',
        status: Math.random() > 0.8 ? 'warning' : 'healthy',
        threshold: 1000,
        trend: 'down',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Storage Usage',
        value: Math.random() * 100,
        unit: '%',
        status: 'healthy',
        threshold: 90,
        trend: 'up',
        lastUpdated: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Active Sessions',
        value: Math.floor(Math.random() * 500) + 100,
        unit: 'sessions',
        status: 'healthy',
        threshold: 1000,
        trend: 'stable',
        lastUpdated: new Date().toISOString()
      }
    ];
  };

  const determineStatus = (eventType: string): 'success' | 'warning' | 'error' => {
    if (eventType.includes('error') || eventType.includes('failed')) return 'error';
    if (eventType.includes('warning') || eventType.includes('timeout')) return 'warning';
    return 'success';
  };

  const generateSystemAlerts = (metrics: SystemMetric[], auditLogs: any[]): Alert[] => {
    const alerts: Alert[] = [];
    
    // Check metrics for issues
    metrics.forEach(metric => {
      if (metric.status === 'critical') {
        alerts.push({
          id: `metric-${metric.id}`,
          type: 'system',
          severity: 'critical',
          message: `${metric.name} is at critical level: ${metric.value.toFixed(1)}${metric.unit}`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      } else if (metric.status === 'warning') {
        alerts.push({
          id: `metric-${metric.id}`,
          type: 'system',
          severity: 'medium',
          message: `${metric.name} is approaching threshold: ${metric.value.toFixed(1)}${metric.unit}`,
          timestamp: new Date().toISOString(),
          resolved: false
        });
      }
    });

    // Check for operation errors
    const errorCount = auditLogs.filter(log => 
      log.event_type.includes('error') || log.event_type.includes('failed')
    ).length;

    if (errorCount > 5) {
      alerts.push({
        id: 'high-error-rate',
        type: 'operation',
        severity: 'high',
        message: `High error rate detected: ${errorCount} errors in recent operations`,
        timestamp: new Date().toISOString(),
        resolved: false
      });
    }

    return alerts;
  };

  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'cpu usage':
        return <Cpu className="h-4 w-4" />;
      case 'memory usage':
        return <HardDrive className="h-4 w-4" />;
      case 'database connections':
        return <Database className="h-4 w-4" />;
      case 'api response time':
        return <Zap className="h-4 w-4" />;
      case 'storage usage':
        return <HardDrive className="h-4 w-4" />;
      case 'active sessions':
        return <Activity className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <BarChart3 className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading monitoring data...</p>
          </div>
        </div>
      </div>
    );
  }

  const healthyMetrics = metrics.filter(m => m.status === 'healthy').length;
  const warningMetrics = metrics.filter(m => m.status === 'warning').length;
  const criticalMetrics = metrics.filter(m => m.status === 'critical').length;
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time system health and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadMonitoringData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Systems</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyMetrics}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((healthyMetrics / metrics.length) * 100)}% of systems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningMetrics}</div>
            <p className="text-xs text-muted-foreground">Systems need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalMetrics}</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{unresolvedAlerts}</div>
            <p className="text-xs text-muted-foreground">Unresolved alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Monitoring Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="operations">Operations Log</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getMetricIcon(metric.name)}
                    {metric.name}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(metric.trend)}
                    {getStatusIcon(metric.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value.toFixed(1)}{metric.unit}
                    </div>
                    <Progress 
                      value={(metric.value / metric.threshold) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Threshold: {metric.threshold}{metric.unit}</span>
                      <span>{new Date(metric.lastUpdated).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Operations</CardTitle>
              <CardDescription>System operations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {operations.slice(0, 20).map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(operation.status)}
                      <div>
                        <div className="font-medium">{operation.operation}</div>
                        <div className="text-sm text-muted-foreground">{operation.details}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{operation.duration.toFixed(0)}ms</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(operation.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                  <p className="text-muted-foreground">All systems are operating normally</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id} className={alert.resolved ? 'opacity-50' : ''}>
                  <AlertCircle className="h-4 w-4" />
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <AlertDescription className="font-medium">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'outline'}>
                          {alert.severity}
                        </Badge>
                        <Badge variant="outline">{alert.type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveAlert(alert.id)}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};