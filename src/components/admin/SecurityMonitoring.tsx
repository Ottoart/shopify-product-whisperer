import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  Lock, 
  Unlock,
  Globe,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Database,
  Server,
  Wifi,
  Settings,
  Bell,
  RefreshCw
} from "lucide-react";

interface SecurityThreat {
  id: string;
  type: 'malware' | 'phishing' | 'brute_force' | 'ddos' | 'data_breach' | 'insider_threat';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'investigating' | 'mitigated' | 'resolved';
  source_ip: string;
  target: string;
  detected_at: string;
  description: string;
  impact_score: number;
  auto_blocked: boolean;
}

interface SecurityMetric {
  timestamp: string;
  threats_detected: number;
  threats_blocked: number;
  login_attempts: number;
  failed_logins: number;
  data_access_requests: number;
  suspicious_activities: number;
}

interface SecurityRule {
  id: string;
  name: string;
  type: 'firewall' | 'rate_limit' | 'geo_block' | 'behavior' | 'content';
  is_active: boolean;
  priority: number;
  conditions: string;
  action: 'block' | 'alert' | 'monitor';
  created_at: string;
}

interface VulnerabilityAssessment {
  id: string;
  target: string;
  scan_type: 'network' | 'web_app' | 'database' | 'infrastructure';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  vulnerabilities_found: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  last_scan: string;
  next_scan: string;
}

export const SecurityMonitoring: React.FC = () => {
  const { toast } = useToast();
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [securityRules, setSecurityRules] = useState<SecurityRule[]>([]);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  const mockThreats: SecurityThreat[] = [
    {
      id: '1',
      type: 'brute_force',
      severity: 'high',
      status: 'active',
      source_ip: '203.0.113.45',
      target: '/api/auth/login',
      detected_at: '2024-01-15T14:30:00Z',
      description: 'Multiple failed login attempts detected from suspicious IP',
      impact_score: 8.5,
      auto_blocked: true
    },
    {
      id: '2',
      type: 'ddos',
      severity: 'critical',
      status: 'mitigated',
      source_ip: '198.51.100.0/24',
      target: 'api.company.com',
      detected_at: '2024-01-15T13:45:00Z',
      description: 'Distributed denial of service attack detected',
      impact_score: 9.2,
      auto_blocked: true
    },
    {
      id: '3',
      type: 'data_breach',
      severity: 'critical',
      status: 'investigating',
      source_ip: '192.0.2.100',
      target: '/api/users/export',
      detected_at: '2024-01-15T12:15:00Z',
      description: 'Unauthorized access to sensitive data endpoints',
      impact_score: 9.8,
      auto_blocked: false
    }
  ];

  const mockSecurityMetrics: SecurityMetric[] = [
    { timestamp: '00:00', threats_detected: 15, threats_blocked: 12, login_attempts: 450, failed_logins: 23, data_access_requests: 1200, suspicious_activities: 8 },
    { timestamp: '04:00', threats_detected: 8, threats_blocked: 6, login_attempts: 234, failed_logins: 12, data_access_requests: 800, suspicious_activities: 3 },
    { timestamp: '08:00', threats_detected: 22, threats_blocked: 18, login_attempts: 890, failed_logins: 45, data_access_requests: 2100, suspicious_activities: 12 },
    { timestamp: '12:00', threats_detected: 18, threats_blocked: 15, login_attempts: 1200, failed_logins: 67, data_access_requests: 2800, suspicious_activities: 15 },
    { timestamp: '16:00', threats_detected: 25, threats_blocked: 20, login_attempts: 1100, failed_logins: 89, data_access_requests: 2500, suspicious_activities: 18 },
    { timestamp: '20:00', threats_detected: 12, threats_blocked: 10, login_attempts: 567, failed_logins: 34, data_access_requests: 1800, suspicious_activities: 6 }
  ];

  const mockSecurityRules: SecurityRule[] = [
    {
      id: '1',
      name: 'Rate Limit API Endpoints',
      type: 'rate_limit',
      is_active: true,
      priority: 1,
      conditions: 'requests > 100/minute',
      action: 'block',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: 'Block Suspicious IPs',
      type: 'firewall',
      is_active: true,
      priority: 2,
      conditions: 'threat_score > 7.0',
      action: 'block',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'Geo-block High Risk Countries',
      type: 'geo_block',
      is_active: false,
      priority: 3,
      conditions: 'country in [CN, RU, NK]',
      action: 'monitor',
      created_at: '2024-01-01T00:00:00Z'
    }
  ];

  const mockVulnerabilities: VulnerabilityAssessment[] = [
    {
      id: '1',
      target: 'Web Application',
      scan_type: 'web_app',
      status: 'completed',
      vulnerabilities_found: 23,
      critical_count: 2,
      high_count: 5,
      medium_count: 8,
      low_count: 8,
      last_scan: '2024-01-14T02:00:00Z',
      next_scan: '2024-01-21T02:00:00Z'
    },
    {
      id: '2',
      target: 'Database Server',
      scan_type: 'database',
      status: 'completed',
      vulnerabilities_found: 12,
      critical_count: 1,
      high_count: 2,
      medium_count: 4,
      low_count: 5,
      last_scan: '2024-01-13T03:00:00Z',
      next_scan: '2024-01-20T03:00:00Z'
    },
    {
      id: '3',
      target: 'Network Infrastructure',
      scan_type: 'network',
      status: 'running',
      vulnerabilities_found: 0,
      critical_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
      last_scan: '2024-01-07T01:00:00Z',
      next_scan: '2024-01-15T01:00:00Z'
    }
  ];

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setThreats(mockThreats);
      setSecurityMetrics(mockSecurityMetrics);
      setSecurityRules(mockSecurityRules);
      setVulnerabilities(mockVulnerabilities);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const blockThreat = (threatId: string) => {
    setThreats(prev => prev.map(threat => 
      threat.id === threatId 
        ? { ...threat, status: 'mitigated' as const, auto_blocked: true }
        : threat
    ));
    
    toast({
      title: "Threat Blocked",
      description: "The security threat has been automatically blocked"
    });
  };

  const toggleSecurityRule = (ruleId: string) => {
    setSecurityRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, is_active: !rule.is_active }
        : rule
    ));
    
    toast({
      title: "Security Rule Updated",
      description: "The security rule status has been changed"
    });
  };

  const startVulnerabilityScan = (assessmentId: string) => {
    setVulnerabilities(prev => prev.map(vuln => 
      vuln.id === assessmentId 
        ? { ...vuln, status: 'running' as const }
        : vuln
    ));
    
    // Simulate scan completion
    setTimeout(() => {
      setVulnerabilities(prev => prev.map(vuln => 
        vuln.id === assessmentId 
          ? { 
              ...vuln, 
              status: 'completed' as const,
              vulnerabilities_found: Math.floor(Math.random() * 20) + 5,
              last_scan: new Date().toISOString()
            }
          : vuln
      ));
      
      toast({
        title: "Vulnerability Scan Completed",
        description: "Security scan has finished and results are available"
      });
    }, 5000);
    
    toast({
      title: "Vulnerability Scan Started",
      description: "Security vulnerability scan is now running"
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
      case 'active': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'investigating': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'mitigated': return <Shield className="h-4 w-4 text-green-500" />;
      case 'resolved': return <Lock className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getThreatTypeIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Lock className="h-4 w-4" />;
      case 'ddos': return <Wifi className="h-4 w-4" />;
      case 'data_breach': return <Database className="h-4 w-4" />;
      case 'malware': return <Ban className="h-4 w-4" />;
      case 'phishing': return <Globe className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Security Monitoring</h2>
          <p className="text-muted-foreground">Real-time security threat detection and response</p>
        </div>
        <Button onClick={loadSecurityData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium">Active Threats</span>
              </div>
              <Badge variant="destructive">
                {threats.filter(t => t.status === 'active').length}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{threats.length}</div>
              <p className="text-xs text-muted-foreground">Total detected today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Blocked</span>
              </div>
              <Badge variant="default">
                {threats.filter(t => t.auto_blocked).length}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {Math.round((threats.filter(t => t.auto_blocked).length / threats.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Auto-block rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Failed Logins</span>
              </div>
              <Badge variant="secondary">
                {securityMetrics.reduce((sum, m) => sum + m.failed_logins, 0)}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {Math.round((securityMetrics.reduce((sum, m) => sum + m.failed_logins, 0) / 
                  securityMetrics.reduce((sum, m) => sum + m.login_attempts, 0)) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Failure rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">Vulnerabilities</span>
              </div>
              <Badge variant="outline">
                {vulnerabilities.reduce((sum, v) => sum + v.vulnerabilities_found, 0)}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {vulnerabilities.reduce((sum, v) => sum + v.critical_count + v.high_count, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Critical + High</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="rules">Security Rules</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Threats</CardTitle>
              <CardDescription>Real-time threat detection and incident response</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {threats.map((threat) => (
                    <div key={threat.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          {getThreatTypeIcon(threat.type)}
                          <div>
                            <h4 className="font-medium capitalize">{threat.type.replace('_', ' ')}</h4>
                            <p className="text-sm text-muted-foreground">{threat.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          {getStatusIcon(threat.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <strong>Source IP:</strong> {threat.source_ip}
                        </div>
                        <div>
                          <strong>Target:</strong> {threat.target}
                        </div>
                        <div>
                          <strong>Impact Score:</strong> {threat.impact_score}/10
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Detected: {new Date(threat.detected_at).toLocaleString()}
                        </span>
                        <div className="flex space-x-2">
                          {threat.status === 'active' && (
                            <Button variant="destructive" size="sm" onClick={() => blockThreat(threat.id)}>
                              <Ban className="h-3 w-3 mr-1" />
                              Block
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Investigate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Rules Management</CardTitle>
              <CardDescription>Configure and manage automated security rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{rule.type.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={rule.action === 'block' ? 'destructive' : 'secondary'}>
                          {rule.action}
                        </Badge>
                        <Switch 
                          checked={rule.is_active} 
                          onCheckedChange={() => toggleSecurityRule(rule.id)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <strong>Conditions:</strong> {rule.conditions}
                      </div>
                      <div>
                        <strong>Priority:</strong> {rule.priority}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(rule.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Add New Security Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Assessments</CardTitle>
              <CardDescription>Security vulnerability scanning and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vulnerabilities.map((vuln) => (
                  <div key={vuln.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{vuln.target}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{vuln.scan_type.replace('_', ' ')} Scan</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={vuln.status === 'completed' ? 'default' : 'secondary'}>
                          {vuln.status}
                        </Badge>
                        {vuln.status === 'running' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                        )}
                      </div>
                    </div>
                    
                    {vuln.status === 'completed' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{vuln.critical_count}</div>
                          <div className="text-xs">Critical</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{vuln.high_count}</div>
                          <div className="text-xs">High</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">{vuln.medium_count}</div>
                          <div className="text-xs">Medium</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{vuln.low_count}</div>
                          <div className="text-xs">Low</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Last scan: {new Date(vuln.last_scan).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => startVulnerabilityScan(vuln.id)}
                          disabled={vuln.status === 'running'}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          {vuln.status === 'running' ? 'Scanning...' : 'Scan Now'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Threat Detection Trends</CardTitle>
                <CardDescription>24-hour threat detection activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={securityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="threats_detected" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="threats_blocked" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentication Security</CardTitle>
                <CardDescription>Login attempts and security events</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={securityMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="login_attempts" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed_logins" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};