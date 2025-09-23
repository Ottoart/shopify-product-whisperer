import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Eye, 
  Download, 
  Filter, 
  Search, 
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Database,
  Lock
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string;
  user_email: string;
  event_type: string;
  resource_type: string;
  resource_id?: string;
  action: string;
  ip_address: string;
  user_agent: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  compliance_relevant: boolean;
}

interface ComplianceReport {
  id: string;
  type: string;
  period: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  entries_count: number;
  created_at: string;
  download_url?: string;
}

export const EnhancedAuditLogging: React.FC = () => {
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    severity: '',
    userId: '',
    searchTerm: ''
  });

  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00Z',
      user_id: 'user-1',
      user_email: 'admin@company.com',
      event_type: 'authentication',
      resource_type: 'user_session',
      action: 'login',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0...',
      details: { method: 'password', mfa_used: true },
      severity: 'low',
      compliance_relevant: true
    },
    {
      id: '2',
      timestamp: '2024-01-15T14:25:00Z',
      user_id: 'user-2',
      user_email: 'user@company.com',
      event_type: 'data_access',
      resource_type: 'customer_data',
      resource_id: 'customer-123',
      action: 'view',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0...',
      details: { fields_accessed: ['name', 'email', 'phone'] },
      severity: 'medium',
      compliance_relevant: true
    },
    {
      id: '3',
      timestamp: '2024-01-15T14:20:00Z',
      user_id: 'user-1',
      user_email: 'admin@company.com',
      event_type: 'system_configuration',
      resource_type: 'security_settings',
      action: 'update',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0...',
      details: { setting: 'password_policy', old_value: 'medium', new_value: 'strong' },
      severity: 'high',
      compliance_relevant: true
    },
    {
      id: '4',
      timestamp: '2024-01-15T14:15:00Z',
      user_id: 'system',
      user_email: 'system@company.com',
      event_type: 'data_breach_attempt',
      resource_type: 'api_endpoint',
      action: 'blocked',
      ip_address: '203.0.113.1',
      user_agent: 'Suspicious Bot',
      details: { attempts: 15, endpoint: '/api/users', reason: 'rate_limit_exceeded' },
      severity: 'critical',
      compliance_relevant: true
    }
  ];

  const mockComplianceReports: ComplianceReport[] = [
    {
      id: '1',
      type: 'GDPR Compliance',
      period: 'Q4 2024',
      status: 'completed',
      entries_count: 15420,
      created_at: '2024-01-01T00:00:00Z',
      download_url: '#gdpr-report-q4'
    },
    {
      id: '2',
      type: 'SOX Compliance',
      period: 'December 2024',
      status: 'completed',
      entries_count: 3240,
      created_at: '2024-01-01T00:00:00Z',
      download_url: '#sox-report-dec'
    },
    {
      id: '3',
      type: 'Security Audit',
      period: 'January 2024',
      status: 'generating',
      entries_count: 0,
      created_at: '2024-01-15T00:00:00Z'
    }
  ];

  useEffect(() => {
    loadAuditLogs();
    loadComplianceReports();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      // In real implementation, fetch from Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuditLogs(mockAuditLogs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComplianceReports = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setComplianceReports(mockComplianceReports);
    } catch (error) {
      console.error('Error loading compliance reports:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // In real implementation, apply filters and reload data
    toast({
      title: "Filters Applied",
      description: "Audit logs have been filtered according to your criteria"
    });
  };

  const exportAuditLogs = () => {
    const csv = [
      'Timestamp,User Email,Event Type,Action,Resource Type,IP Address,Severity,Compliance Relevant',
      ...auditLogs.map(log => 
        `${log.timestamp},${log.user_email},${log.event_type},${log.action},${log.resource_type},${log.ip_address},${log.severity},${log.compliance_relevant}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const generateComplianceReport = async (type: string) => {
    const newReport: ComplianceReport = {
      id: Date.now().toString(),
      type,
      period: 'Current Month',
      status: 'generating',
      entries_count: 0,
      created_at: new Date().toISOString()
    };

    setComplianceReports(prev => [newReport, ...prev]);

    // Simulate report generation
    setTimeout(() => {
      setComplianceReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: 'completed' as const, entries_count: Math.floor(Math.random() * 10000) + 1000, download_url: `#${type.toLowerCase()}-report` }
          : report
      ));
      toast({
        title: "Report Generated",
        description: `${type} compliance report has been generated successfully`
      });
    }, 3000);

    toast({
      title: "Report Generation Started",
      description: `Generating ${type} compliance report...`
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Enhanced Audit Logging</h2>
          <p className="text-muted-foreground">Comprehensive audit trails and compliance reporting</p>
        </div>
        <Button onClick={exportAuditLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <Tabs defaultValue="audit-logs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Audit Log Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={filters.eventType} onValueChange={(value) => handleFilterChange('eventType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All events" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="data_access">Data Access</SelectItem>
                      <SelectItem value="system_configuration">System Config</SelectItem>
                      <SelectItem value="data_breach_attempt">Security Incident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={filters.severity} onValueChange={(value) => handleFilterChange('severity', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>User</Label>
                  <Input
                    placeholder="User email"
                    value={filters.userId}
                    onChange={(e) => handleFilterChange('userId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search logs..."
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={applyFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>Detailed log of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {log.event_type.replace('_', ' ')}
                          </Badge>
                          {log.compliance_relevant && (
                            <Badge variant="secondary">
                              <Shield className="h-3 w-3 mr-1" />
                              Compliance
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>User:</strong> {log.user_email}
                        </div>
                        <div>
                          <strong>Action:</strong> {log.action}
                        </div>
                        <div>
                          <strong>Resource:</strong> {log.resource_type}
                          {log.resource_id && ` (${log.resource_id})`}
                        </div>
                        <div>
                          <strong>IP Address:</strong> {log.ip_address}
                        </div>
                      </div>
                      
                      {log.details && (
                        <div className="mt-2">
                          <strong className="text-sm">Details:</strong>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {/* Generate Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Compliance Reports</CardTitle>
              <CardDescription>Create compliance reports for various standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => generateComplianceReport('GDPR Compliance')}>
                  <FileText className="h-4 w-4 mr-2" />
                  GDPR Report
                </Button>
                <Button onClick={() => generateComplianceReport('SOX Compliance')}>
                  <FileText className="h-4 w-4 mr-2" />
                  SOX Report
                </Button>
                <Button onClick={() => generateComplianceReport('Security Audit')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Security Audit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generated compliance and audit reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {complianceReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(report.status)}
                      <div>
                        <h4 className="font-medium">{report.type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {report.period} • {report.entries_count.toLocaleString()} entries
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                      {report.download_url && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Audit Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Configuration</CardTitle>
                <CardDescription>Configure audit logging behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Log Retention Period</Label>
                  <Select defaultValue="365">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="2555">7 years (Compliance)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Minimum Severity Level</Label>
                  <Select defaultValue="low">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alert Notifications</Label>
                  <Textarea
                    placeholder="Email addresses for critical alerts (one per line)"
                    rows={3}
                  />
                </div>

                <Button>Save Configuration</Button>
              </CardContent>
            </Card>

            {/* Compliance Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Settings</CardTitle>
                <CardDescription>Configure compliance monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Active Compliance Standards</Label>
                  <div className="space-y-2">
                    {['GDPR', 'SOX', 'HIPAA', 'PCI DSS'].map((standard) => (
                      <div key={standard} className="flex items-center space-x-2">
                        <input type="checkbox" id={standard} defaultChecked={['GDPR', 'SOX'].includes(standard)} />
                        <Label htmlFor={standard}>{standard}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Auto-Report Generation</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button>Update Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};