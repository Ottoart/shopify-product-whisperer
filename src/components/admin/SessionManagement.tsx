import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Clock, 
  Search, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Globe, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Ban
} from "lucide-react";

interface UserSession {
  id: string;
  user_id: string;
  user_name: string;
  ip_address: string;
  user_agent: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location: {
    country: string;
    city: string;
    timezone: string;
  };
  is_active: boolean;
  last_activity: string;
  login_time: string;
  session_duration: number;
  security_score: number;
  is_suspicious: boolean;
  logout_reason?: string;
}

export const SessionManagement = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [securityFilter, setSecurityFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
    
    // Set up real-time updates for sessions
    const interval = setInterval(loadSessions, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // Mock session data (in real implementation, this would come from database)
      const mockSessions: UserSession[] = [
        {
          id: '1',
          user_id: 'user-123',
          user_name: 'John Admin',
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0.4472.124',
          device_type: 'desktop',
          browser: 'Chrome 91',
          os: 'Windows 10',
          location: {
            country: 'United States',
            city: 'New York',
            timezone: 'America/New_York'
          },
          is_active: true,
          last_activity: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          login_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          session_duration: 120,
          security_score: 95,
          is_suspicious: false
        },
        {
          id: '2',
          user_id: 'user-456',
          user_name: 'Sarah Manager',
          ip_address: '10.0.0.45',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
          device_type: 'mobile',
          browser: 'Safari iOS',
          os: 'iOS 14',
          location: {
            country: 'United States',
            city: 'Los Angeles',
            timezone: 'America/Los_Angeles'
          },
          is_active: true,
          last_activity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          login_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          session_duration: 45,
          security_score: 88,
          is_suspicious: false
        },
        {
          id: '3',
          user_id: 'user-789',
          user_name: 'Mike Support',
          ip_address: '203.0.113.42',
          user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/91.0.4472.124',
          device_type: 'desktop',
          browser: 'Chrome 91',
          os: 'Linux',
          location: {
            country: 'Canada',
            city: 'Toronto',
            timezone: 'America/Toronto'
          },
          is_active: false,
          last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          login_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          session_duration: 210,
          security_score: 72,
          is_suspicious: true,
          logout_reason: 'Timeout'
        },
        {
          id: '4',
          user_id: 'user-321',
          user_name: 'Emma Editor',
          ip_address: '198.51.100.15',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          device_type: 'desktop',
          browser: 'Chrome 91',
          os: 'macOS',
          location: {
            country: 'United Kingdom',
            city: 'London',
            timezone: 'Europe/London'
          },
          is_active: true,
          last_activity: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          login_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          session_duration: 180,
          security_score: 91,
          is_suspicious: false
        }
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load session data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      // In real implementation, this would call an API to terminate the session
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, is_active: false, logout_reason: 'Admin terminated' }
          : session
      ));

      toast({
        title: "Success",
        description: "Session terminated successfully!",
      });
    } catch (error) {
      console.error('Error terminating session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session.",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Monitor className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getSecurityBadge = (score: number, isSuspicious: boolean) => {
    if (isSuspicious) {
      return <Badge variant="destructive">Suspicious</Badge>;
    }
    if (score >= 90) {
      return <Badge variant="default">High</Badge>;
    }
    if (score >= 70) {
      return <Badge variant="secondary">Medium</Badge>;
    }
    return <Badge variant="outline">Low</Badge>;
  };

  const getStatusIcon = (isActive: boolean, isSuspicious: boolean) => {
    if (isSuspicious) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-gray-500" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ip_address.includes(searchTerm) ||
      session.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && session.is_active) ||
      (statusFilter === 'inactive' && !session.is_active) ||
      (statusFilter === 'suspicious' && session.is_suspicious);
    
    const matchesDevice = deviceFilter === 'all' || session.device_type === deviceFilter;
    
    const matchesSecurity = securityFilter === 'all' ||
      (securityFilter === 'high' && session.security_score >= 90) ||
      (securityFilter === 'medium' && session.security_score >= 70 && session.security_score < 90) ||
      (securityFilter === 'low' && session.security_score < 70);

    return matchesSearch && matchesStatus && matchesDevice && matchesSecurity;
  });

  const sessionStats = {
    total: sessions.length,
    active: sessions.filter(s => s.is_active).length,
    suspicious: sessions.filter(s => s.is_suspicious).length,
    avgDuration: Math.round(sessions.reduce((acc, s) => acc + s.session_duration, 0) / sessions.length)
  };

  return (
    <div className="space-y-6">
      {/* Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionStats.total}</div>
            <p className="text-xs text-muted-foreground">All user sessions</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sessionStats.active}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{sessionStats.suspicious}</div>
            <p className="text-xs text-muted-foreground">Flagged sessions</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(sessionStats.avgDuration)}</div>
            <p className="text-xs text-muted-foreground">Session length</p>
          </CardContent>
        </Card>
      </div>

      {/* Session Management */}
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Session Management</span>
              </CardTitle>
              <CardDescription>Monitor and manage active user sessions with security insights</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
              </SelectContent>
            </Select>
            <Select value={securityFilter} onValueChange={setSecurityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Security" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sessions Table */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User & Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Session Info</TableHead>
                  <TableHead>Security</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {getDeviceIcon(session.device_type)}
                        </div>
                        <div>
                          <p className="font-medium">{session.user_name}</p>
                          <p className="text-sm text-muted-foreground">{session.browser} • {session.os}</p>
                          <p className="text-xs text-muted-foreground font-mono">{session.ip_address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-sm">{session.location.city}</p>
                          <p className="text-xs text-muted-foreground">{session.location.country}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">Duration: {formatDuration(session.session_duration)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last: {new Date(session.last_activity).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getSecurityBadge(session.security_score, session.is_suspicious)}
                        <p className="text-xs text-muted-foreground">Score: {session.security_score}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(session.is_active, session.is_suspicious)}
                        <div>
                          <span className="text-sm">
                            {session.is_active ? 'Active' : 'Ended'}
                          </span>
                          {session.logout_reason && (
                            <p className="text-xs text-muted-foreground">{session.logout_reason}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {session.is_active && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => terminateSession(session.id)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};