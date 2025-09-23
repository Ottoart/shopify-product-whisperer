import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Activity, Database, Wifi, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: Date;
  responseTime?: number;
  details?: string;
}

export const HealthMonitor = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const { toast } = useToast();

  const runHealthChecks = async () => {
    setIsChecking(true);
    const checks: HealthCheck[] = [];

    try {
      // Database connectivity check
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('ai_insights').select('id').limit(1);
      const dbResponseTime = Date.now() - dbStart;
      
      checks.push({
        name: 'Database Connection',
        status: dbError ? 'critical' : dbResponseTime > 1000 ? 'warning' : 'healthy',
        lastCheck: new Date(),
        responseTime: dbResponseTime,
        details: dbError ? `Error: ${dbError.message}` : `Response time: ${dbResponseTime}ms`
      });

      // Edge Functions check
      const funcStart = Date.now();
      try {
        const { error: funcError } = await supabase.functions.invoke('generate-ai-insights', {
          body: { type: 'performance', timeframe: 'week' }
        });
        const funcResponseTime = Date.now() - funcStart;
        
        checks.push({
          name: 'AI Insights Function',
          status: funcError ? 'warning' : funcResponseTime > 5000 ? 'warning' : 'healthy',
          lastCheck: new Date(),
          responseTime: funcResponseTime,
          details: funcError ? `Error: ${funcError.message}` : `Response time: ${funcResponseTime}ms`
        });
      } catch (error) {
        checks.push({
          name: 'AI Insights Function',
          status: 'critical',
          lastCheck: new Date(),
          details: `Function unavailable: ${error}`
        });
      }

      // Real-time subscription check
      const realtimeStart = Date.now();
      const channel = supabase.channel('health-check').subscribe((status) => {
        const realtimeResponseTime = Date.now() - realtimeStart;
        checks.push({
          name: 'Real-time Connection',
          status: status === 'SUBSCRIBED' ? 'healthy' : 'warning',
          lastCheck: new Date(),
          responseTime: realtimeResponseTime,
          details: `Status: ${status}, Response time: ${realtimeResponseTime}ms`
        });
        
        supabase.removeChannel(channel);
      });

      // API rate limits check
      const rateLimitStart = Date.now();
      const promises = Array(5).fill(null).map(() => 
        supabase.from('performance_metrics').select('id').limit(1)
      );
      
      try {
        await Promise.all(promises);
        const rateLimitResponseTime = Date.now() - rateLimitStart;
        checks.push({
          name: 'API Rate Limits',
          status: rateLimitResponseTime > 2000 ? 'warning' : 'healthy',
          lastCheck: new Date(),
          responseTime: rateLimitResponseTime,
          details: `5 concurrent requests completed in ${rateLimitResponseTime}ms`
        });
      } catch (error) {
        checks.push({
          name: 'API Rate Limits',
          status: 'warning',
          lastCheck: new Date(),
          details: 'Rate limit exceeded or connection issues'
        });
      }

      setHealthChecks(checks);
      
      // Calculate overall health
      const criticalCount = checks.filter(c => c.status === 'critical').length;
      const warningCount = checks.filter(c => c.status === 'warning').length;
      
      if (criticalCount > 0) {
        setOverallHealth('critical');
        toast({
          title: "Critical Health Issues Detected",
          description: `${criticalCount} critical issues found. Immediate attention required.`,
          variant: "destructive",
        });
      } else if (warningCount > 0) {
        setOverallHealth('warning');
        toast({
          title: "Health Warnings Detected",
          description: `${warningCount} warnings found. Monitor closely.`,
        });
      } else {
        setOverallHealth('healthy');
      }

    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: "Unable to complete system health check.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runHealthChecks();
    
    // Run health checks every 5 minutes
    const interval = setInterval(runHealthChecks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const healthPercentage = healthChecks.length > 0 
    ? ((healthChecks.filter(c => c.status === 'healthy').length / healthChecks.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">System Health Monitor</CardTitle>
            <CardDescription>
              Real-time monitoring of critical system components
            </CardDescription>
          </div>
          <Button onClick={runHealthChecks} disabled={isChecking} size="sm">
            {isChecking ? 'Checking...' : 'Run Health Check'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Health Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(overallHealth)}
                <span className="text-lg font-semibold">Overall Health</span>
                <Badge variant={overallHealth === 'healthy' ? 'default' : 'destructive'}>
                  {overallHealth.toUpperCase()}
                </Badge>
              </div>
              <div className="flex-1">
                <Progress value={healthPercentage} className="w-full" />
                <span className="text-sm text-muted-foreground">
                  {healthPercentage.toFixed(0)}% of systems healthy
                </span>
              </div>
            </div>

            {/* Critical Alerts */}
            {healthChecks.filter(c => c.status === 'critical').length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Critical issues detected! Immediate attention required for production stability.
                </AlertDescription>
              </Alert>
            )}

            {/* Health Check Results */}
            <div className="grid gap-4 md:grid-cols-2">
              {healthChecks.map((check, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: getStatusColor(check.status) }}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(check.status)}
                        <CardTitle className="text-sm font-medium">{check.name}</CardTitle>
                      </div>
                      <Badge variant={check.status === 'healthy' ? 'default' : 'destructive'}>
                        {check.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Last checked: {check.lastCheck.toLocaleTimeString()}
                      </div>
                      {check.responseTime && (
                        <div className="text-sm">
                          Response time: <span className="font-mono">{check.responseTime}ms</span>
                        </div>
                      )}
                      {check.details && (
                        <div className="text-sm text-muted-foreground">
                          {check.details}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};