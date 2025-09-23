import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Server,
  Database,
  Cloud,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Globe,
  HardDrive,
  Cpu,
  MemoryStick,
  Clock,
  Bell,
  Settings,
  RefreshCw
} from "lucide-react";

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold_warning: number;
  threshold_critical: number;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
}

interface OperationalAlert {
  id: string;
  type: 'system' | 'business' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

interface BusinessProcess {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error' | 'maintenance';
  last_run: string;
  success_rate: number;
  avg_duration: number;
  total_runs: number;
}

export const OperationalMonitoring = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [operationalAlerts, setOperationalAlerts] = useState<OperationalAlert[]>([]);
  const [businessProcesses, setBusinessProcesses] = useState<BusinessProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'processes'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadOperationalData();
    
    // Set up auto-refresh
    const interval = setInterval(loadOperationalData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadOperationalData = async () => {
    try {
      setLoading(true);
      
      // Mock system metrics
      const mockMetrics: SystemMetric[] = [
        {
          id: '1',
          name: 'CPU Usage',
          value: 45.2,
          unit: '%',
          status: 'healthy',
          threshold_warning: 70,
          threshold_critical: 90,
          trend: 'stable',
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Memory Usage',
          value: 68.5,
          unit: '%',
          status: 'warning',
          threshold_warning: 65,
          threshold_critical: 85,
          trend: 'up',
          last_updated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Disk Usage',
          value: 34.8,
          unit: '%',
          status: 'healthy',
          threshold_warning: 80,
          threshold_critical: 95,
          trend: 'up',
          last_updated: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Response Time',
          value: 120,
          unit: 'ms',
          status: 'healthy',
          threshold_warning: 500,
          threshold_critical: 1000,
          trend: 'stable',
          last_updated: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Active Users',
          value: 347,
          unit: 'users',
          status: 'healthy',
          threshold_warning: 1000,
          threshold_critical: 1500,
          trend: 'up',
          last_updated: new Date().toISOString()
        },
        {
          id: '6',
          name: 'Error Rate',
          value: 0.8,
          unit: '%',
          status: 'healthy',
          threshold_warning: 2,
          threshold_critical: 5,
          trend: 'down',
          last_updated: new Date().toISOString()
        }
      ];

      // Mock alerts
      const mockAlerts: OperationalAlert[] = [
        {
          id: '1',
          type: 'system',
          severity: 'medium',
          title: 'High Memory Usage Detected',
          description: 'Server memory usage has exceeded 65% threshold',
          status: 'active',
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'business',
          severity: 'low',
          title: 'Slow Shopify Sync Process',
          description: 'Shopify product synchronization is taking longer than usual',
          status: 'acknowledged',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          acknowledged_at: new Date(Date.now() - 90 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'security',
          severity: 'high',
          title: 'Multiple Failed Login Attempts',
          description: 'Detected unusual login activity from IP 192.168.1.100',
          status: 'resolved',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Mock business processes
      const mockProcesses: BusinessProcess[] = [
        {
          id: '1',
          name: 'Shopify Product Sync',
          status: 'running',
          last_run: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          success_rate: 98.5,
          avg_duration: 45,
          total_runs: 2840
        },
        {
          id: '2',
          name: 'eBay Listing Updates',
          status: 'running',
          last_run: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          success_rate: 95.2,
          avg_duration: 32,
          total_runs: 1650
        },
        {
          id: '3',
          name: 'Inventory Reports',
          status: 'stopped',
          last_run: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          success_rate: 100,
          avg_duration: 15,
          total_runs: 720
        },
        {
          id: '4',
          name: 'Daily Backup',
          status: 'running',
          last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          success_rate: 99.8,
          avg_duration: 180,
          total_runs: 365
        }
      ];

      setSystemMetrics(mockMetrics);
      setOperationalAlerts(mockAlerts);
      setBusinessProcesses(mockProcesses);

    } catch (error) {
      console.error('Error loading operational data:', error);
      toast({
        title: "Error",
        description: "Failed to load operational monitoring data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'stopped':
      case 'maintenance':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
      case 'resolved':
        return 'default';
      case 'warning':
      case 'acknowledged':
        return 'secondary';
      case 'critical':
      case 'error':
      case 'active':
        return 'destructive';
      case 'stopped':
      case 'maintenance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      case 'stable': return <Activity className="h-3 w-3 text-blue-500" />;
      default: return null;
    }
  };

  const getMetricIcon = (name: string) => {
    if (name.toLowerCase().includes('cpu')) return <Cpu className="h-4 w-4" />;
    if (name.toLowerCase().includes('memory')) return <MemoryStick className="h-4 w-4" />;
    if (name.toLowerCase().includes('disk')) return <HardDrive className="h-4 w-4" />;
    if (name.toLowerCase().includes('response')) return <Zap className="h-4 w-4" />;
    if (name.toLowerCase().includes('user')) return <Users className="h-4 w-4" />;
    if (name.toLowerCase().includes('error')) return <AlertTriangle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const activeAlerts = operationalAlerts.filter(alert => alert.status === 'active');
  const criticalAlerts = operationalAlerts.filter(alert => alert.severity === 'critical' && alert.status === 'active');

  const TabButton = ({ value, children, icon: Icon }: { value: string; children: React.ReactNode; icon: any }) => (
    <button
      onClick={() => setActiveTab(value as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === value 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {systemMetrics.slice(0, 6).map((metric) => (
          <Card key={metric.id} className="gradient-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getMetricIcon(metric.name)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metric.value}{metric.unit}</div>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(metric.status)}
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(metric.last_updated).toLocaleTimeString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Operational Monitoring Dashboard</CardTitle>
              <CardDescription>Real-time system health, business processes, and performance analytics</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadOperationalData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            <TabButton value="overview" icon={Activity}>Overview</TabButton>
            <TabButton value="metrics" icon={Server}>Metrics</TabButton>
            <TabButton value="alerts" icon={Bell}>Alerts ({activeAlerts.length})</TabButton>
            <TabButton value="processes" icon={Settings}>Processes</TabButton>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Health Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Health Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Health metrics chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {operationalAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(alert.status)}
                          <div>
                            <div className="font-medium text-sm">{alert.title}</div>
                            <div className="text-xs text-muted-foreground">{alert.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                            {alert.severity}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(alert.status)} className="text-xs">
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeTab === 'metrics' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemMetrics.map((metric) => (
                <Card key={metric.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{metric.name}</CardTitle>
                      {getMetricIcon(metric.name)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-3xl font-bold">{metric.value}{metric.unit}</div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(metric.status)}
                          {getTrendIcon(metric.trend)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Warning: {metric.threshold_warning}{metric.unit}</span>
                          <span>Critical: {metric.threshold_critical}{metric.unit}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              metric.status === 'critical' ? 'bg-red-500' :
                              metric.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((metric.value / metric.threshold_critical) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated: {new Date(metric.last_updated).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeTab === 'alerts' ? (
            <div className="space-y-4">
              {operationalAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(alert.status)}
                        <div>
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <CardDescription>{alert.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(alert.status)}>
                          {alert.status}
                        </Badge>
                        {alert.status === 'active' && (
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Type:</strong> {alert.type}
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(alert.created_at).toLocaleString()}
                      </div>
                      {alert.acknowledged_at && (
                        <div>
                          <strong>Acknowledged:</strong> {new Date(alert.acknowledged_at).toLocaleString()}
                        </div>
                      )}
                      {alert.resolved_at && (
                        <div>
                          <strong>Resolved:</strong> {new Date(alert.resolved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessProcesses.map((process) => (
                <Card key={process.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{process.name}</CardTitle>
                      {getStatusIcon(process.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={getStatusBadgeVariant(process.status)}>
                          {process.status}
                        </Badge>
                        <div className="text-right">
                          <div className="text-sm font-medium">{process.success_rate}% Success Rate</div>
                          <div className="text-xs text-muted-foreground">{process.total_runs} total runs</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Last Run:</strong><br />
                          {new Date(process.last_run).toLocaleString()}
                        </div>
                        <div>
                          <strong>Avg Duration:</strong><br />
                          {process.avg_duration}s
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-2" />
                          View Logs
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};