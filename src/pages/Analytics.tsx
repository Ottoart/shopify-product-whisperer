import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Target, ShoppingCart, Download, Search } from "lucide-react";
import { PatternStatsOverview } from "@/components/patterns/PatternStatsOverview";
import { usePatternLearning } from "@/hooks/usePatternLearning";

// Mock data for charts
const salesData = [
  { date: '2024-01-01', grossSales: 12500, profit: 3750, volume: 45, buyBox: 85 },
  { date: '2024-01-02', grossSales: 15200, profit: 4560, volume: 52, buyBox: 88 },
  { date: '2024-01-03', grossSales: 11800, profit: 3540, volume: 41, buyBox: 82 },
  { date: '2024-01-04', grossSales: 18900, profit: 5670, volume: 67, buyBox: 91 },
  { date: '2024-01-05', grossSales: 16300, profit: 4890, volume: 58, buyBox: 89 },
];

const priceChanges = [
  { sku: 'SKU-001', title: 'Wireless Bluetooth Headphones', oldPrice: 79.99, newPrice: 74.99, marketplace: 'Amazon', timestamp: '2024-01-05 14:30' },
  { sku: 'SKU-002', title: 'Smart Phone Case', oldPrice: 24.99, newPrice: 22.99, marketplace: 'eBay', timestamp: '2024-01-05 14:25' },
  { sku: 'SKU-003', title: 'USB-C Cable 6ft', oldPrice: 15.99, newPrice: 17.99, marketplace: 'Amazon', timestamp: '2024-01-05 14:20' },
];

const reports = [
  { category: 'Performance Reports', items: ['Performance by Listing', 'Sales Price Over Time'] },
  { category: 'Competitor Reports', items: ['Competition Landscape', 'Competition Summary', 'Competition Below Minimum Price', 'Listings in the Buy Box', 'Listings Not in the Buy Box', 'Listings Being Beaten'] },
  { category: 'Listing Reports', items: ['Featured Merchant Status', 'Listings With No Cost', 'Listings With No Minimum Price', 'Listings at Maximum Price'] },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("gross-sales");
  const [searchTerm, setSearchTerm] = useState("");
  const { patterns } = usePatternLearning();

  // Calculate pattern stats
  const stats = patterns && patterns.length > 0 ? {
    totalPatterns: patterns.length,
    approvedPatterns: patterns.filter(p => p.is_approved === true).length,
    avgConfidence: patterns.reduce((sum, p) => sum + p.confidence_score, 0) / patterns.length,
    mostFrequentType: Object.entries(
      patterns.reduce((acc: Record<string, number>, p) => {
        acc[p.pattern_type] = (acc[p.pattern_type] || 0) + 1;
        return acc;
      }, {})
    ).sort(([,a], [,b]) => b - a)[0]?.[0] || '',
    recentActivity: patterns.filter(p => {
      const created = new Date(p.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length
  } : null;

  const kpis = {
    totalSales: 74700,
    totalProfit: 22410,
    profitMargin: 30.0,
    buyBoxWinRate: 87.2,
    salesVolume: 263
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Performance tracking, repricing intelligence, and AI learning patterns
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CalendarDateRangePicker />
          <Select defaultValue="all-marketplaces">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Marketplace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-marketplaces">All Marketplaces</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
              <SelectItem value="ebay">eBay</SelectItem>
              <SelectItem value="walmart">Walmart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Learning Pattern Stats */}
      <PatternStatsOverview stats={stats} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.totalSales.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpis.totalProfit.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.profitMargin}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buy Box Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.buyBoxWinRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Volume</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.salesVolume}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="gross-sales">Gross Sales</TabsTrigger>
          <TabsTrigger value="profit">Profit</TabsTrigger>
          <TabsTrigger value="sales-volume">Sales Volume</TabsTrigger>
          <TabsTrigger value="buy-box">Buy Box</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="price-changes">Price Changes</TabsTrigger>
        </TabsList>

        <TabsContent value="gross-sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Gross Sales</CardTitle>
              <CardDescription>Total revenue with profit overlay</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="grossSales" fill="#3b82f6" name="Gross Sales" />
                  <Bar dataKey="profit" fill="#10b981" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Data by Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Gross Sales</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Profit Margin</TableHead>
                    <TableHead>Buy Box %</TableHead>
                    <TableHead>Sales Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>${row.grossSales.toLocaleString()}</TableCell>
                      <TableCell>${row.profit.toLocaleString()}</TableCell>
                      <TableCell>{((row.profit / row.grossSales) * 100).toFixed(1)}%</TableCell>
                      <TableCell>{row.buyBox}%</TableCell>
                      <TableCell>{row.volume}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Net Profit</CardTitle>
              <CardDescription>Profit margins and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="profit" fill="#10b981" name="Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales-volume" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Volume Trends</CardTitle>
              <CardDescription>Unit-based order velocity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buy-box" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buy Box Win Rate</CardTitle>
              <CardDescription>Daily Buy Box ownership percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="buyBox" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reports.map((reportCategory, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{reportCategory.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {reportCategory.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{item}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="price-changes" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <CalendarDateRangePicker />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Price Changes</CardTitle>
              <CardDescription>SKU-level repricing history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Listing Title</TableHead>
                    <TableHead>Old Price</TableHead>
                    <TableHead>New Price</TableHead>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceChanges.map((change, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Button variant="link" className="p-0 h-auto font-mono text-sm">
                          {change.sku}
                        </Button>
                      </TableCell>
                      <TableCell>{change.title}</TableCell>
                      <TableCell>${change.oldPrice}</TableCell>
                      <TableCell className="font-medium">${change.newPrice}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{change.marketplace}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{change.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}