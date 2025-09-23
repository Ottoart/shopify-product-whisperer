import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ComposedChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Calendar, Download, RefreshCw, Zap } from "lucide-react";

interface TrendData {
  period: string;
  revenue: number;
  orders: number;
  users: number;
  conversion: number;
  satisfaction: number;
  performance: number;
}

interface TrendMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  target: number;
  unit: string;
  color: string;
}

interface Forecast {
  period: string;
  predicted: number;
  confidence: number;
  actual?: number;
}

export const PerformanceTrending: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  const mockTrendData: TrendData[] = [
    { period: 'Jan', revenue: 45000, orders: 120, users: 450, conversion: 2.67, satisfaction: 4.2, performance: 85 },
    { period: 'Feb', revenue: 52000, orders: 140, users: 520, conversion: 2.69, satisfaction: 4.3, performance: 87 },
    { period: 'Mar', revenue: 48000, orders: 135, users: 490, conversion: 2.76, satisfaction: 4.1, performance: 83 },
    { period: 'Apr', revenue: 61000, orders: 165, users: 580, conversion: 2.84, satisfaction: 4.4, performance: 89 },
    { period: 'May', revenue: 55000, orders: 155, users: 550, conversion: 2.82, satisfaction: 4.2, performance: 86 },
    { period: 'Jun', revenue: 67000, orders: 180, users: 620, conversion: 2.90, satisfaction: 4.5, performance: 91 },
    { period: 'Jul', revenue: 72000, orders: 195, users: 680, conversion: 2.95, satisfaction: 4.6, performance: 93 },
    { period: 'Aug', revenue: 68000, orders: 185, users: 650, conversion: 2.88, satisfaction: 4.4, performance: 90 },
  ];

  const mockForecasts: Forecast[] = [
    { period: 'Sep', predicted: 75000, confidence: 85, actual: 74200 },
    { period: 'Oct', predicted: 78000, confidence: 82 },
    { period: 'Nov', predicted: 85000, confidence: 78 },
    { period: 'Dec', predicted: 92000, confidence: 75 },
  ];

  const trendMetrics: TrendMetric[] = [
    {
      name: 'Revenue Growth',
      current: 6.8,
      previous: 4.2,
      change: 2.6,
      target: 8.0,
      unit: '%',
      color: 'hsl(var(--primary))'
    },
    {
      name: 'User Acquisition',
      current: 15.2,
      previous: 12.8,
      change: 2.4,
      target: 20.0,
      unit: '%',
      color: 'hsl(var(--secondary))'
    },
    {
      name: 'Conversion Rate',
      current: 2.95,
      previous: 2.67,
      change: 0.28,
      target: 3.5,
      unit: '%',
      color: 'hsl(var(--accent))'
    },
    {
      name: 'Customer Satisfaction',
      current: 4.6,
      previous: 4.2,
      change: 0.4,
      target: 4.8,
      unit: '/5',
      color: 'hsl(var(--muted))'
    }
  ];

  useEffect(() => {
    loadTrendData();
  }, [timeRange]);

  const loadTrendData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTrendData(mockTrendData);
      setForecasts(mockForecasts);
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrendDirection = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(change)
    };
  };

  const getProgressToTarget = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const exportTrendData = () => {
    const dataStr = JSON.stringify({ trends: trendData, forecasts }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-trends-${timeRange}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Trending</h2>
          <p className="text-muted-foreground">Track trends and forecast future performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="2y">Last 2 years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadTrendData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportTrendData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendMetrics.map((metric, index) => {
          const trend = calculateTrendDirection(metric.current, metric.previous);
          const progress = getProgressToTarget(metric.current, metric.target);
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted-foreground">{metric.name}</span>
                  <Badge variant={trend.direction === 'up' ? 'default' : trend.direction === 'down' ? 'destructive' : 'secondary'}>
                    {trend.direction === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                     trend.direction === 'down' ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                    {trend.percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {metric.current}{metric.unit}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Target: {metric.target}{metric.unit}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Previous: {metric.previous}{metric.unit}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecast">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend Analysis</CardTitle>
                <CardDescription>Historical revenue performance with trend lines</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="revenue" />
                    <Tooltip formatter={(value, name) => [
                      name === 'revenue' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]} />
                    <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Velocity</CardTitle>
                <CardDescription>Month-over-month growth rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trendData.map((item, index) => ({
                    ...item,
                    growth: index > 0 ? ((item.revenue - trendData[index - 1].revenue) / trendData[index - 1].revenue) * 100 : 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Growth Rate']} />
                    <Bar dataKey="growth" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
                <CardDescription>Active user acquisition and retention</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate Trend</CardTitle>
                <CardDescription>User engagement and conversion optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                    <Line type="monotone" dataKey="conversion" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Performance Score</CardTitle>
                <CardDescription>Overall system health trending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Performance Score']} />
                    <Line type="monotone" dataKey="performance" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>User satisfaction trending</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={trendData}>
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip formatter={(value) => [`${value}/5`, 'Satisfaction']} />
                    <Area type="monotone" dataKey="satisfaction" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Upward Trend</span>
                  </div>
                  <Badge variant="default">+8.2%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Target Progress</span>
                  </div>
                  <Badge variant="secondary">76%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium">Attention Needed</span>
                  </div>
                  <Badge variant="destructive">2 areas</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>AI-powered revenue predictions with confidence intervals</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={[...trendData.slice(-4), ...forecasts]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      typeof value === 'number' ? `$${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Actual Revenue' : 
                      name === 'predicted' ? 'Predicted Revenue' : name
                    ]} />
                    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} />
                    <Line type="monotone" dataKey="predicted" stroke="hsl(var(--secondary))" strokeWidth={2} strokeDasharray="5 5" />
                    <Area type="monotone" dataKey="predicted" stroke="none" fill="hsl(var(--secondary))" fillOpacity={0.1} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>Model confidence and accuracy metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {forecasts.map((forecast, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{forecast.period}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{forecast.confidence}% confidence</Badge>
                        {forecast.actual && (
                          <Badge variant="default">
                            <Zap className="h-3 w-3 mr-1" />
                            Accurate
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Predicted: ${forecast.predicted.toLocaleString()}</span>
                        {forecast.actual && (
                          <span>Actual: ${forecast.actual.toLocaleString()}</span>
                        )}
                      </div>
                      <Progress value={forecast.confidence} className="h-2" />
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-foreground">94.2%</div>
                      <div className="text-xs text-muted-foreground">Model Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">±3.1%</div>
                      <div className="text-xs text-muted-foreground">Avg Error Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scenario Planning</CardTitle>
              <CardDescription>Best case, worst case, and most likely scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-700 mb-2">$98K</div>
                  <div className="text-sm font-medium text-green-600 mb-1">Best Case</div>
                  <div className="text-xs text-muted-foreground">15% growth rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-700 mb-2">$85K</div>
                  <div className="text-sm font-medium text-blue-600 mb-1">Most Likely</div>
                  <div className="text-xs text-muted-foreground">8% growth rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <div className="text-2xl font-bold text-orange-700 mb-2">$72K</div>
                  <div className="text-sm font-medium text-orange-600 mb-1">Worst Case</div>
                  <div className="text-xs text-muted-foreground">2% growth rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};