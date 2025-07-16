import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown, Target, DollarSign, Package, AlertTriangle } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RepricingAIRecommendations } from "../components/RepricingAIRecommendations";

interface DashboardTabProps {
  storeFilter: string | null;
  dateRange: string;
  dateRangeLabel: string;
}

export function DashboardTab({ storeFilter, dateRange, dateRangeLabel }: DashboardTabProps) {
  const [searchParams] = useSearchParams();
  const [activeStoreFilter, setActiveStoreFilter] = useState<string>('');
  
  useEffect(() => {
    const storeParam = searchParams.get('store');
    if (storeParam) {
      setActiveStoreFilter(decodeURIComponent(storeParam));
    } else {
      setActiveStoreFilter(storeFilter || '');
    }
  }, [searchParams, storeFilter]);
  // Mock data - in real implementation, this would come from Supabase
  const buyBoxData = [
    { day: 'Mon', percentage: 85 },
    { day: 'Tue', percentage: 78 },
    { day: 'Wed', percentage: 92 },
    { day: 'Thu', percentage: 88 },
    { day: 'Fri', percentage: 75 },
    { day: 'Sat', percentage: 82 },
    { day: 'Sun', percentage: 90 }
  ];

  const salesVolumeData = [
    { day: 'Week 1', sales: 1250 },
    { day: 'Week 2', sales: 1380 },
    { day: 'Week 3', sales: 1420 },
    { day: 'Week 4', sales: 1180 }
  ];

  const grossSalesProfitData = [
    { month: 'Jan', sales: 12000, profit: 3600 },
    { month: 'Feb', sales: 15000, profit: 4200 },
    { month: 'Mar', sales: 18000, profit: 5400 },
    { month: 'Apr', sales: 16500, profit: 4950 },
    { month: 'May', sales: 21000, profit: 6720 },
    { month: 'Jun', sales: 19500, profit: 6240 }
  ];

  const listingsData = [
    { name: 'Active', value: 1247, color: '#22c55e' },
    { name: 'In Buy Box', value: 892, color: '#3b82f6' },
    { name: 'Not in Buy Box', value: 355, color: '#ef4444' },
    { name: 'Suppressed', value: 45, color: '#f59e0b' }
  ];

  const kpiCards = [
    {
      title: "Buy Box Ownership",
      value: "84.2%",
      change: "+2.1%",
      trend: "up",
      tooltip: "Track your Buy Box rate over time, identify loss patterns.",
      icon: Target
    },
    {
      title: "Gross Sales",
      value: "$21,847",
      change: "+15.3%",
      trend: "up",
      tooltip: "Total revenue over the selected period.",
      icon: DollarSign
    },
    {
      title: "Profit",
      value: "$6,892",
      change: "+8.7%",
      trend: "up",
      tooltip: "Calculated from product cost, shipping, and fees.",
      icon: TrendingUp
    },
    {
      title: "Price Changes",
      value: "142",
      change: "Last 24h",
      trend: "neutral",
      tooltip: "Number of price adjustments triggered automatically or manually.",
      icon: Package
    },
    {
      title: "Business Sales",
      value: "$3,247",
      change: "+12.8%",
      trend: "up",
      tooltip: "Separate indicator for wholesale/B2B volume.",
      icon: TrendingUp
    },
    {
      title: "Active Listings",
      value: "1,247",
      change: "+23",
      trend: "up",
      tooltip: "Total number of live listings across all marketplaces.",
      icon: Package
    }
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {kpi.title}
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{kpi.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className={`text-xs flex items-center gap-1 ${
                  kpi.trend === 'up' ? 'text-green-600' : 
                  kpi.trend === 'down' ? 'text-red-600' : 
                  'text-muted-foreground'
                }`}>
                  {kpi.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {kpi.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy Box Ownership Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Buy Box Ownership (Last 7 Days)
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Track your Buy Box rate over time, identify loss patterns.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Daily Buy Box win percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buyBoxData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Bar dataKey="percentage" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Sales Volume Trend
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Monitor daily sales trends across marketplaces.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Weekly sales volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Gross Sales & Profit (Last 6 Months)
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track performance trends over time.</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>Revenue and profit trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={grossSalesProfitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Gross Sales"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bottom Section with Listings KPIs and AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings KPIs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Listings Overview
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>All clickable to filtered Listings view.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <CardDescription>Current status of all your listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-green-600">1,247</div>
                  <div className="text-sm text-green-700">Active Listings</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-blue-600">892</div>
                  <div className="text-sm text-blue-700">In Buy Box</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-red-600">355</div>
                  <div className="text-sm text-red-700">Not in Buy Box</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-orange-600">45</div>
                  <div className="text-sm text-orange-700">Suppressed</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-gray-600">23</div>
                  <div className="text-sm text-gray-700">No Min Price</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-purple-600">187</div>
                  <div className="text-sm text-purple-700">Below Competitor</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-yellow-600">89</div>
                  <div className="text-sm text-yellow-700">At Min Price</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="text-2xl font-bold text-slate-600">12</div>
                  <div className="text-sm text-slate-700">Inactive</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <RepricingAIRecommendations />
        </div>
      </div>
    </TooltipProvider>
  );
}