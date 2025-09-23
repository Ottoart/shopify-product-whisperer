import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Settings, Zap, Target, BarChart3, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIService {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  model: string;
  accuracy: number;
  lastRun: string;
  isEnabled: boolean;
}

export const AIConfiguration = () => {
  const [aiServices, setAIServices] = useState<AIService[]>([
    {
      id: 'pricing',
      name: 'AI Pricing Engine',
      description: 'Intelligent pricing optimization based on market data',
      status: 'active',
      model: 'gpt-4-turbo',
      accuracy: 94.5,
      lastRun: '2 minutes ago',
      isEnabled: true
    },
    {
      id: 'categorization',
      name: 'Product Categorization',
      description: 'Automatic product category classification',
      status: 'active',
      model: 'claude-3-sonnet',
      accuracy: 97.2,
      lastRun: '5 minutes ago',
      isEnabled: true
    },
    {
      id: 'inventory',
      name: 'Inventory Predictions',
      description: 'Demand forecasting and inventory optimization',
      status: 'inactive',
      model: 'gpt-4',
      accuracy: 89.1,
      lastRun: '1 hour ago',
      isEnabled: false
    },
    {
      id: 'shipping',
      name: 'Shipping Optimization',
      description: 'Route optimization and carrier selection',
      status: 'active',
      model: 'gpt-4-turbo',
      accuracy: 92.8,
      lastRun: '10 minutes ago',
      isEnabled: true
    },
    {
      id: 'fraud',
      name: 'Fraud Detection',
      description: 'Real-time transaction fraud analysis',
      status: 'error',
      model: 'claude-3-opus',
      accuracy: 98.5,
      lastRun: '30 minutes ago',
      isEnabled: true
    },
    {
      id: 'content',
      name: 'Content Generation',
      description: 'Product descriptions and marketing content',
      status: 'active',
      model: 'gpt-4',
      accuracy: 91.3,
      lastRun: '15 minutes ago',
      isEnabled: true
    },
    {
      id: 'analytics',
      name: 'Analytics Insights',
      description: 'Business intelligence and trend analysis',
      status: 'active',
      model: 'claude-3-sonnet',
      accuracy: 93.7,
      lastRun: '1 minute ago',
      isEnabled: true
    }
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    maxConcurrentJobs: 10,
    defaultTimeout: 30,
    retryAttempts: 3,
    confidenceThreshold: 0.85,
    enableLogging: true,
    enableMetrics: true
  });

  const { toast } = useToast();

  const toggleService = (id: string) => {
    setAIServices(services =>
      services.map(service =>
        service.id === id
          ? { ...service, isEnabled: !service.isEnabled, status: service.isEnabled ? 'inactive' : 'active' }
          : service
      )
    );

    toast({
      title: "AI Service Updated",
      description: `Service has been ${aiServices.find(s => s.id === id)?.isEnabled ? 'disabled' : 'enabled'}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleGlobalSettingChange = (key: string, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Systems Configuration
          </CardTitle>
          <CardDescription>
            Configure and monitor AI services across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="services" className="space-y-4">
            <TabsList>
              <TabsTrigger value="services">AI Services</TabsTrigger>
              <TabsTrigger value="models">Model Settings</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="global">Global Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              <div className="grid gap-4">
                {aiServices.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(service.status)}
                          <Switch
                            checked={service.isEnabled}
                            onCheckedChange={() => toggleService(service.id)}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{service.name}</h4>
                            <Badge variant={getStatusColor(service.status) as any}>
                              {service.status}
                            </Badge>
                            <Badge variant="outline">{service.model}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              Accuracy: {service.accuracy}%
                            </span>
                            <span>Last run: {service.lastRun}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Metrics
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="models" className="space-y-4">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Model Configuration</CardTitle>
                    <CardDescription>
                      Configure AI model parameters and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="default-model">Default Model</Label>
                        <Input id="default-model" value="gpt-4-turbo" readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fallback-model">Fallback Model</Label>
                        <Input id="fallback-model" value="gpt-4" readOnly />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature: {globalSettings.confidenceThreshold}</Label>
                      <Slider
                        id="temperature"
                        value={[globalSettings.confidenceThreshold * 100]}
                        onValueChange={([value]) => handleGlobalSettingChange('confidenceThreshold', value / 100)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-tokens">Max Tokens</Label>
                      <Input id="max-tokens" type="number" value="2048" readOnly />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">94.2%</p>
                        <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                      </div>
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">1.2s</p>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                      </div>
                      <Zap className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">99.8%</p>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="global" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Global AI Settings</CardTitle>
                  <CardDescription>
                    System-wide AI configuration and behavior settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="max-concurrent">Max Concurrent Jobs</Label>
                      <Input
                        id="max-concurrent"
                        type="number"
                        value={globalSettings.maxConcurrentJobs}
                        onChange={(e) => handleGlobalSettingChange('maxConcurrentJobs', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeout">Default Timeout (seconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={globalSettings.defaultTimeout}
                        onChange={(e) => handleGlobalSettingChange('defaultTimeout', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="retry">Retry Attempts</Label>
                      <Input
                        id="retry"
                        type="number"
                        value={globalSettings.retryAttempts}
                        onChange={(e) => handleGlobalSettingChange('retryAttempts', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confidence">Confidence Threshold</Label>
                      <Slider
                        value={[globalSettings.confidenceThreshold * 100]}
                        onValueChange={([value]) => handleGlobalSettingChange('confidenceThreshold', value / 100)}
                        max={100}
                        step={1}
                      />
                      <span className="text-sm text-muted-foreground">
                        {(globalSettings.confidenceThreshold * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="logging">Enable Detailed Logging</Label>
                        <p className="text-sm text-muted-foreground">Log all AI service interactions</p>
                      </div>
                      <Switch
                        id="logging"
                        checked={globalSettings.enableLogging}
                        onCheckedChange={(checked) => handleGlobalSettingChange('enableLogging', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="metrics">Enable Performance Metrics</Label>
                        <p className="text-sm text-muted-foreground">Collect and analyze performance data</p>
                      </div>
                      <Switch
                        id="metrics"
                        checked={globalSettings.enableMetrics}
                        onCheckedChange={(checked) => handleGlobalSettingChange('enableMetrics', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => toast({ title: "Settings Saved", description: "Global AI settings have been updated" })}>
                      Save Settings
                    </Button>
                    <Button variant="outline">
                      Reset to Defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};