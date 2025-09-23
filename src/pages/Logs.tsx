import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, XCircle, Info, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  details?: any;
  user_id: string;
}

export default function Logs() {
  const user = { id: 'demo-user-id' };
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  const fetchLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For now, get logs from localStorage since types aren't updated yet
      const storedLogs = localStorage.getItem(`logs_${user.id}`);
      const parsedLogs = storedLogs ? JSON.parse(storedLogs) : [];
      
      // If no logs exist, add some sample logs to demonstrate the feature
      if (parsedLogs.length === 0) {
        const sampleLogs = [
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            level: 'info' as const,
            category: 'System',
            message: 'Application started successfully',
            user_id: user.id
          },
          {
            id: crypto.randomUUID(),
            timestamp: new Date(Date.now() - 5000).toISOString(),
            level: 'success' as const,
            category: 'Authentication',
            message: 'User logged in successfully',
            user_id: user.id
          },
          {
            id: crypto.randomUUID(),
            timestamp: new Date(Date.now() - 10000).toISOString(),
            level: 'warning' as const,
            category: 'API',
            message: 'Slow response time detected for UPS API',
            details: { responseTime: '2.5s', endpoint: '/api/rating' },
            user_id: user.id
          }
        ];
        localStorage.setItem(`logs_${user.id}`, JSON.stringify(sampleLogs));
        setLogs(sampleLogs);
      } else {
        setLogs(parsedLogs);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const filteredLogs = logs.filter(log => filter === 'all' || log.level === filter);

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': 
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadgeVariant = (level: string) => {
    switch (level) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': 
      default: return 'outline';
    }
  };

  const clearLogs = () => {
    if (!user) return;
    
    try {
      localStorage.removeItem(`logs_${user.id}`);
      setLogs([]);
    } catch (error) {
      console.error('Error clearing logs:', error);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Logs</h1>
          <p className="text-muted-foreground">Monitor system activities and errors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="destructive" onClick={clearLogs}>
            Clear Logs
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <Tabs value={filter} onValueChange={(value: any) => setFilter(value)}>
            <TabsList>
              <TabsTrigger value="all">All ({logs.length})</TabsTrigger>
              <TabsTrigger value="error">Errors ({logs.filter(l => l.level === 'error').length})</TabsTrigger>
              <TabsTrigger value="warning">Warnings ({logs.filter(l => l.level === 'warning').length})</TabsTrigger>
              <TabsTrigger value="success">Success ({logs.filter(l => l.level === 'success').length})</TabsTrigger>
              <TabsTrigger value="info">Info ({logs.filter(l => l.level === 'info').length})</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Loading logs...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No logs found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.level)}
                        <Badge variant={getLogBadgeVariant(log.level) as any}>
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{log.category}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    <div className="text-sm">
                      <strong>{log.message}</strong>
                    </div>
                    {log.details && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-foreground">
                          Show details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded whitespace-pre-wrap overflow-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}