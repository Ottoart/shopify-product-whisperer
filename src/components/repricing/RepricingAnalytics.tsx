import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Target,
  DollarSign
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data for demonstration
const priceChangeData = [
  { date: '2024-01-01', changes: 45, profit_impact: 2.3 },
  { date: '2024-01-02', changes: 52, profit_impact: 3.1 },
  { date: '2024-01-03', changes: 38, profit_impact: 1.8 },
  { date: '2024-01-04', changes: 67, profit_impact: 4.2 },
  { date: '2024-01-05', changes: 43, profit_impact: 2.7 },
  { date: '2024-01-06', changes: 59, profit_impact: 3.8 },
  { date: '2024-01-07', changes: 71, profit_impact: 4.9 },
];

const rulePerformanceData = [
  { name: 'Competitive Pricing', value: 45, color: '#0088FE' },
  { name: 'Inventory Based', value: 25, color: '#00C49F' },
  { name: 'Velocity Based', value: 20, color: '#FFBB28' },
  { name: 'Time Based', value: 10, color: '#FF8042' },
];

const buyBoxData = [
  { marketplace: 'Amazon', won: 78, lost: 22, total: 100 },
  { marketplace: 'Walmart', won: 65, lost: 35, total: 100 },
  { marketplace: 'eBay', won: 82, lost: 18, total: 100 },
];

export default function RepricingAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [marketplaceFilter, setMarketplaceFilter] = useState("all");
  const [ruleFilter, setRuleFilter] = useState("all");

  const downloadReport = (reportType: string) => {
    // Simulate report download
    const filename = `repricing_${reportType}_${timeRange}.csv`;
    console.log(`Downloading ${filename}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Repricing Analytics</h2>
          <p className="text-muted-foreground">Track performance and insights</p>
        </div>
        
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={marketplaceFilter} onValueChange={setMarketplaceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Marketplaces</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Walmart">Walmart</SelectItem>
              <SelectItem value="eBay">eBay</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Price Changes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3m</div>
            <p className="text-xs text-muted-foreground">
              -15% faster than last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+$2,840</div>
            <p className="text-xs text-muted-foreground">
              +8.2% margin improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buy Box Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74.5%</div>
            <p className="text-xs text-muted-foreground">
              +3.2% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Changes Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Price Changes & Profit Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={priceChangeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="changes" fill="#8884d8" />
                <Line yAxisId="right" type="monotone" dataKey="profit_impact" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rule Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rulePerformanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rulePerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Buy Box Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Buy Box Performance by Marketplace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {buyBoxData.map((marketplace) => (
              <div key={marketplace.marketplace} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{marketplace.marketplace}</span>
                  <Badge variant={marketplace.won > 70 ? "default" : "secondary"}>
                    {marketplace.won}% Win Rate
                  </Badge>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${marketplace.won}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Won: {marketplace.won}</span>
                  <span>Lost: {marketplace.lost}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Downloadable Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Downloadable Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => downloadReport('price_changes')}
            >
              <Download className="h-5 w-5" />
              <span>Price Changes Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => downloadReport('buybox')}
            >
              <Download className="h-5 w-5" />
              <span>Buy Box Tracking</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => downloadReport('errors')}
            >
              <Download className="h-5 w-5" />
              <span>Error/Exception Logs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}