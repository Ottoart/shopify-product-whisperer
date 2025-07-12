import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Package, Truck, Clock, TrendingUp, MapPin, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Sample data - replace with real data from your backend
const dailyOrdersData = [
  { date: '06/11', shipped: 42, unshipped: 5 },
  { date: '06/12', shipped: 38, unshipped: 7 },
  { date: '06/13', shipped: 41, unshipped: 4 },
  { date: '06/14', shipped: 33, unshipped: 8 },
  { date: '06/15', shipped: 29, unshipped: 6 },
  { date: '06/16', shipped: 46, unshipped: 3 },
  { date: '06/17', shipped: 44, unshipped: 9 },
  { date: '06/18', shipped: 39, unshipped: 5 },
  { date: '06/19', shipped: 31, unshipped: 7 },
  { date: '06/20', shipped: 35, unshipped: 4 },
  { date: '06/21', shipped: 28, unshipped: 6 },
  { date: '06/22', shipped: 41, unshipped: 8 },
  { date: '06/23', shipped: 37, unshipped: 5 },
  { date: '06/24', shipped: 32, unshipped: 7 },
  { date: '06/25', shipped: 29, unshipped: 4 },
];

const carriersData = [
  { name: 'Sendle by ShipStation', qty: 305, share: 68, color: '#8B5CF6' },
  { name: 'UPS', qty: 100, share: 22, color: '#3B82F6' },
  { name: 'FedEx', qty: 45, share: 10, color: '#10B981' },
];

const agingData = [
  { range: '0-1', count: 12, color: '#8B5CF6' },
  { range: '1-2', count: 8, color: '#A855F7' },
  { range: '2-4', count: 5, color: '#C084FC' },
  { range: '4+', count: 2, color: '#DDD6FE' },
];

export function ShippingOverview() {
  const [dateRange, setDateRange] = useState("06/11/2025 - 07/11/2025");
  const [totalNewOrders] = useState(813);
  const [totalShipped] = useState(797);
  const [totalUnshipped] = useState(16);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">Shipping dashboard and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Date Range
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="06/11/2025 - 07/11/2025">06/11/2025 - 07/11/2025</SelectItem>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="thismonth">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Daily Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg"># of New Orders each Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyOrdersData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="shipped" stackId="a" fill="#8B5CF6" name="Orders Shipped" />
                <Bar dataKey="unshipped" stackId="a" fill="#3B82F6" name="Orders Unshipped" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <div className="text-4xl font-bold text-primary mb-2">{totalNewOrders.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground font-medium">New Orders</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">{totalShipped.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground font-medium">Orders Shipped</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-2">{totalUnshipped.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground font-medium">Orders Unshipped</div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipments by Carrier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shipments by Carrier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Carrier</div>
                <div>Qty</div>
                <div>Share</div>
              </div>
              {carriersData.map((carrier, index) => (
                <div key={index} className="grid grid-cols-3 text-sm items-center py-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: carrier.color }}
                    />
                    <span className="font-medium">{carrier.name}</span>
                  </div>
                  <div className="font-bold">{carrier.qty}</div>
                  <div className="text-muted-foreground">{carrier.share}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open Order Aging */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Open Order Aging
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </div>
            <CardDescription>
              Current fill time SLA: 48 hours
              <Button variant="link" className="p-0 h-auto text-primary">
                Change SLA
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agingData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.range} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-4 rounded-sm" 
                      style={{ 
                        backgroundColor: item.color, 
                        width: `${(item.count / Math.max(...agingData.map(d => d.count))) * 100}px` 
                      }}
                    />
                    <span className="text-sm font-bold w-6 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8B5CF6] rounded-sm" />
          <span className="text-sm text-muted-foreground">Orders Shipped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#3B82F6] rounded-sm" />
          <span className="text-sm text-muted-foreground">Orders Unshipped</span>
        </div>
      </div>
    </div>
  );
}