import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderManagement } from '../OrderManagement';
import { ShippingLabelManager } from '../ShippingLabelManager';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart as BarChartIcon
} from 'recharts';
import { 
  Package, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users,
  Truck,
  MapPin,
  Calendar,
  Info,
  MoreHorizontal,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { AIRecommendations } from "../components/AIRecommendations";
import { UpsApiDocs } from "../UpsApiDocs";
import { CarrierRateComparison } from "../CarrierRateComparison";

interface OperationsTabProps {
  storeFilter: string | null;
  dateRange: string;
  dateRangeLabel: string;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  store_name: string;
  carrier?: string;
  order_date: string;
  shipped_date?: string;
  total_amount: number;
  shipping_cost?: number;
  weight_lbs?: number;
  customer_name: string;
  service_type?: string;
}

interface ShipmentsPerDayData {
  date: string;
  economy: number;
  standard: number;
  expedited: number;
}

interface CarrierPerformanceData {
  carrier: string;
  breachRate: number;
  avgDelay: number;
  margin: number;
}

interface UserProductivityData {
  user: string;
  processed: number;
  avgTime: number;
}

export function OperationsTab({ storeFilter, dateRange, dateRangeLabel }: OperationsTabProps) {
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipmentsPerDay, setShipmentsPerDay] = useState<ShipmentsPerDayData[]>([]);
  const [carrierPerformance, setCarrierPerformance] = useState<CarrierPerformanceData[]>([]);
  const [userProductivity, setUserProductivity] = useState<UserProductivityData[]>([]);

  // Key Operations Metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalShippingCost = orders
    .filter(o => o.shipping_cost)
    .reduce((sum, order) => sum + (order.shipping_cost || 0), 0);
  const netShippingRevenue = totalRevenue - totalShippingCost;
  const avgCostPerLabel = orders.filter(o => o.shipping_cost).length > 0 
    ? totalShippingCost / orders.filter(o => o.shipping_cost).length 
    : 0;

  // Calculate shipping efficiency metrics
  const processingTimes = orders
    .filter(order => order.shipped_date && order.order_date)
    .map(order => {
      const orderDate = parseISO(order.order_date);
      const shippedDate = parseISO(order.shipped_date!);
      return differenceInDays(shippedDate, orderDate);
    });
  
  const avgPaymentToFulfillment = processingTimes.length > 0 
    ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
    : 0;

  // Weekend/Holiday shipping ratio
  const weekendShipments = orders.filter(order => {
    if (!order.shipped_date) return false;
    const shippedDate = parseISO(order.shipped_date);
    const dayOfWeek = shippedDate.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }).length;
  
  const weekendShippingRatio = orders.filter(o => o.shipped_date).length > 0 
    ? (weekendShipments / orders.filter(o => o.shipped_date).length) * 100 
    : 0;

  useEffect(() => {
    fetchOrders();
  }, [storeFilter, dateRange]);

  useEffect(() => {
    if (orders.length > 0) {
      generateShipmentsPerDay();
      generateCarrierPerformance();
      generateUserProductivity();
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (storeFilter) {
        query = query.eq('store_name', storeFilter);
      }

      const endDate = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case 'last7days':
          startDate = subDays(endDate, 7);
          break;
        case 'last30days':
          startDate = subDays(endDate, 30);
          break;
        case 'thismonth':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
          break;
        default:
          startDate = subDays(endDate, 30);
      }

      query = query.gte('order_date', startDate.toISOString());

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateShipmentsPerDay = () => {
    const daily: { [key: string]: { economy: number; standard: number; expedited: number } } = {};
    
    for (let i = 14; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'MM/dd');
      daily[dateKey] = { economy: 0, standard: 0, expedited: 0 };
    }

    orders.forEach(order => {
      if (!order.shipped_date) return;
      const shippedDate = parseISO(order.shipped_date);
      const dateKey = format(shippedDate, 'MM/dd');
      
      if (daily[dateKey]) {
        const serviceType = order.service_type || 'standard';
        if (serviceType.toLowerCase().includes('economy') || serviceType.toLowerCase().includes('ground')) {
          daily[dateKey].economy++;
        } else if (serviceType.toLowerCase().includes('expedited') || serviceType.toLowerCase().includes('express')) {
          daily[dateKey].expedited++;
        } else {
          daily[dateKey].standard++;
        }
      }
    });

    const chartData: ShipmentsPerDayData[] = Object.entries(daily).map(([date, counts]) => ({
      date,
      economy: counts.economy,
      standard: counts.standard,
      expedited: counts.expedited
    }));

    setShipmentsPerDay(chartData);
  };

  const generateCarrierPerformance = () => {
    const carriers = ['USPS', 'FedEx', 'UPS', 'DHL'];
    const performance: CarrierPerformanceData[] = carriers.map(carrier => {
      const carrierOrders = orders.filter(o => o.carrier === carrier);
      
      // Mock SLA breach calculation (in real app, this would be based on actual SLA rules)
      const breachRate = Math.random() * 15; // 0-15% breach rate
      const avgDelay = Math.random() * 2; // 0-2 days average delay
      const margin = 15 + Math.random() * 10; // 15-25% margin
      
      return {
        carrier,
        breachRate: parseFloat(breachRate.toFixed(1)),
        avgDelay: parseFloat(avgDelay.toFixed(1)),
        margin: parseFloat(margin.toFixed(1))
      };
    });

    setCarrierPerformance(performance);
  };

  const generateUserProductivity = () => {
    // Mock user productivity data
    const users = ['John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'Tom B.'];
    const productivity: UserProductivityData[] = users.map(user => ({
      user,
      processed: Math.floor(Math.random() * 50) + 20, // 20-70 orders
      avgTime: parseFloat((Math.random() * 5 + 2).toFixed(1)) // 2-7 minutes
    }));

    setUserProductivity(productivity);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const MetricCard = ({ icon: Icon, value, label, color, tooltip, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${color}`} />
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {trend && (
            <Badge variant={trend > 0 ? 'default' : 'destructive'} className="text-xs">
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard" className="flex items-center gap-2">
          <BarChartIcon className="h-4 w-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Order Management
        </TabsTrigger>
        <TabsTrigger value="shipping" className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Rate Comparison
        </TabsTrigger>
        <TabsTrigger value="labels" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Shipping Labels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="space-y-6">
      {/* Key Operations Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={DollarSign}
          value={`$${totalRevenue.toLocaleString()}`}
          label="Total Revenue"
          color="text-green-600"
          tooltip="Revenue from all processed orders"
          trend={5.2}
        />
        <MetricCard
          icon={Truck}
          value={`$${totalShippingCost.toFixed(2)}`}
          label="Shipping Costs"
          color="text-blue-600"
          tooltip="Total shipping costs paid to carriers"
          trend={-2.1}
        />
        <MetricCard
          icon={Clock}
          value={`${avgPaymentToFulfillment.toFixed(1)}d`}
          label="Avg Fulfillment Time"
          color="text-orange-600"
          tooltip="Average days from payment to shipment"
          trend={-0.8}
        />
        <MetricCard
          icon={Package}
          value={`${weekendShippingRatio.toFixed(1)}%`}
          label="Weekend Shipping"
          color="text-purple-600"
          tooltip="Percentage of orders shipped on weekends"
          trend={1.4}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-auto p-3 text-left">
              <div>
                <div className="font-medium">Bulk Print</div>
                <div className="text-sm text-muted-foreground">Print multiple labels</div>
              </div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 text-left">
              <div>
                <div className="font-medium">Batch Ship</div>
                <div className="text-sm text-muted-foreground">Process multiple orders</div>
              </div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 text-left">
              <div>
                <div className="font-medium">Import Orders</div>
                <div className="text-sm text-muted-foreground">Upload CSV file</div>
              </div>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3 text-left">
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-muted-foreground">Download reports</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipments Per Day Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Shipments by Service Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shipmentsPerDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-card)'
                    }}
                  />
                  <Bar dataKey="economy" stackId="a" fill="hsl(var(--accent))" name="Economy" />
                  <Bar dataKey="standard" stackId="a" fill="hsl(var(--primary))" name="Standard" />
                  <Bar dataKey="expedited" stackId="a" fill="#EF4444" name="Expedited" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carrier SLA Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SLA Breach Rate by Carrier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {carrierPerformance.map((carrier) => (
                <div key={carrier.carrier} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{carrier.carrier}</span>
                    <Badge variant={carrier.breachRate > 10 ? 'destructive' : 'secondary'}>
                      {carrier.breachRate}% breach
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${carrier.breachRate > 10 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(carrier.breachRate * 5, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg delay: {carrier.avgDelay} days • Margin: {carrier.margin}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Productivity Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipments by Fulfillment User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {userProductivity.map((user) => (
              <Card key={user.user} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {user.processed}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {user.user}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user.avgTime}m avg
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AIRecommendations orders={orders} carriers={carrierPerformance.map(c => c.carrier)} />

      {/* UPS API Documentation Integration */}
      <UpsApiDocs />
      </TabsContent>

      <TabsContent value="orders">
        <OrderManagement />
      </TabsContent>

      <TabsContent value="shipping">
        <CarrierRateComparison />
      </TabsContent>

      <TabsContent value="labels">
        <ShippingLabelManager />
      </TabsContent>
    </Tabs>
  );
}