import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Package, 
  Truck, 
  Clock, 
  TrendingUp, 
  MapPin, 
  AlertCircle, 
  DollarSign,
  Scale,
  RotateCcw,
  Eye,
  Target,
  Info
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { AIRecommendations } from "../components/AIRecommendations";

interface OverviewTabProps {
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
  created_at: string;
  shipping_cost?: number;
  weight_lbs?: number;
  customer_name: string;
  tags?: string[];
  tracking_number?: string;
}

interface DailyData {
  date: string;
  shipped: number;
  unshipped: number;
}

interface CarrierData {
  name: string;
  qty: number;
  share: number;
  color: string;
}

interface AgingData {
  range: string;
  count: number;
  color: string;
}

interface ShippingCostData {
  date: string;
  USPS: number;
  FedEx: number;
  UPS: number;
}

interface SKUData {
  sku: string;
  quantity: number;
  revenue: number;
}

export function OverviewTab({ storeFilter, dateRange, dateRangeLabel }: OverviewTabProps) {
  const { toast } = useToast();
  
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [carriersData, setCarriersData] = useState<CarrierData[]>([]);
  const [agingData, setAgingData] = useState<AgingData[]>([]);
  const [shippingCostData, setShippingCostData] = useState<ShippingCostData[]>([]);
  const [topSKUs, setTopSKUs] = useState<SKUData[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [storeConfigs, setStoreConfigs] = useState<any[]>([]);

  // Enhanced metrics calculations
  const totalOrders = orders.length;
  const shippedOrders = orders.filter(order => 
    order.status === 'shipped' || order.status === 'delivered'
  ).length;
  const unshippedOrders = totalOrders - shippedOrders;
  const fulfillmentRate = totalOrders > 0 ? ((shippedOrders / totalOrders) * 100) : 0;
  
  const avgOrderWeight = orders.filter(o => o.weight_lbs).reduce((sum, o) => sum + (o.weight_lbs || 0), 0) / 
    Math.max(orders.filter(o => o.weight_lbs).length, 1);
  
  const avgShippingCost = orders.filter(o => o.shipping_cost).reduce((sum, o) => sum + (o.shipping_cost || 0), 0) / 
    Math.max(orders.filter(o => o.shipping_cost).length, 1);
  
  const ordersWithoutTracking = orders.filter(order => 
    (order.status === 'shipped' || order.status === 'delivered') && !order.tracking_number
  ).length;
  
  const repeatCustomers = new Set(
    orders.filter(order => 
      orders.filter(o => o.customer_name === order.customer_name).length > 1
    ).map(o => o.customer_name)
  ).size;
  
  const repeatShipmentRate = totalOrders > 0 ? ((repeatCustomers / totalOrders) * 100) : 0;

  // Processing time calculation
  const processingTimes = orders
    .filter(order => order.shipped_date && order.order_date)
    .map(order => {
      const orderDate = parseISO(order.order_date);
      const shippedDate = parseISO(order.shipped_date!);
      return differenceInDays(shippedDate, orderDate);
    });
  
  const avgProcessingTime = processingTimes.length > 0 
    ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
    : 0;

  useEffect(() => {
    fetchStoreConfigs();
    fetchOrders();
  }, [storeFilter, dateRange]);

  useEffect(() => {
    if (orders.length > 0) {
      generateDailyData();
      generateCarriersData();
      generateAgingData();
      generateShippingCostData();
      generateTopSKUs();
    }
  }, [orders]);

  const fetchStoreConfigs = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('store_configurations')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setStoreConfigs(data || []);
    } catch (error) {
      console.error('Error fetching store configs:', error);
    }
  };

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

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      const response = await supabase.functions.invoke('sync-orders');
      if (response.error) throw response.error;
      
      toast({
        title: "Sync initiated",
        description: "Updating orders from all stores...",
      });
      
      // Refresh data after sync
      setTimeout(() => {
        fetchOrders();
      }, 2000);
    } catch (error) {
      console.error('Error syncing orders:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const generateDailyData = () => {
    const daily: { [key: string]: { shipped: number; unshipped: number } } = {};
    
    for (let i = 14; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'MM/dd');
      daily[dateKey] = { shipped: 0, unshipped: 0 };
    }

    orders.forEach(order => {
      const orderDate = parseISO(order.order_date);
      const dateKey = format(orderDate, 'MM/dd');
      
      if (daily[dateKey]) {
        if (order.status === 'shipped' || order.status === 'delivered') {
          daily[dateKey].shipped++;
        } else {
          daily[dateKey].unshipped++;
        }
      }
    });

    const chartData: DailyData[] = Object.entries(daily).map(([date, counts]) => ({
      date,
      shipped: counts.shipped,
      unshipped: counts.unshipped
    }));

    setDailyData(chartData);
  };

  const generateCarriersData = () => {
    const carrierCounts: { [key: string]: number } = {};
    const shippedOrdersWithCarrier = orders.filter(order => 
      (order.status === 'shipped' || order.status === 'delivered') && order.carrier
    );

    shippedOrdersWithCarrier.forEach(order => {
      const carrier = order.carrier || 'Unknown';
      carrierCounts[carrier] = (carrierCounts[carrier] || 0) + 1;
    });

    const total = Object.values(carrierCounts).reduce((sum, count) => sum + count, 0);
    const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', '#F59E0B', '#EF4444'];

    const carriers: CarrierData[] = Object.entries(carrierCounts)
      .map(([name, qty], index) => ({
        name,
        qty,
        share: total > 0 ? Math.round((qty / total) * 100) : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.qty - a.qty);

    setCarriersData(carriers);
  };

  const generateAgingData = () => {
    const now = new Date();
    const pendingOrders = orders.filter(order => 
      order.status === 'awaiting' || order.status === 'processing'
    );

    const aging = {
      '0-1': 0,
      '1-2': 0,
      '2-4': 0,
      '4+': 0
    };

    pendingOrders.forEach(order => {
      const orderDate = parseISO(order.order_date);
      const daysOld = differenceInDays(now, orderDate);

      if (daysOld <= 1) {
        aging['0-1']++;
      } else if (daysOld <= 2) {
        aging['1-2']++;
      } else if (daysOld <= 4) {
        aging['2-4']++;
      } else {
        aging['4+']++;
      }
    });

    const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', '#F59E0B', '#EF4444'];
    const agingArray: AgingData[] = Object.entries(aging).map(([range, count], index) => ({
      range,
      count,
      color: colors[index]
    }));

    setAgingData(agingArray);
  };

  const generateShippingCostData = () => {
    // Generate mock shipping cost data over time
    const costData: ShippingCostData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      costData.push({
        date: format(date, 'MM/dd'),
        USPS: 8.5 + Math.random() * 2,
        FedEx: 12.3 + Math.random() * 3,
        UPS: 11.8 + Math.random() * 2.5
      });
    }
    setShippingCostData(costData);
  };

  const generateTopSKUs = async () => {
    try {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          sku,
          quantity,
          price,
          orders!inner(*)
        `)
        .gte('orders.order_date', subDays(new Date(), 30).toISOString());

      if (error) throw error;

      const skuStats: { [key: string]: { quantity: number; revenue: number } } = {};
      
      orderItems?.forEach(item => {
        const sku = item.sku || 'Unknown SKU';
        if (!skuStats[sku]) {
          skuStats[sku] = { quantity: 0, revenue: 0 };
        }
        skuStats[sku].quantity += item.quantity;
        skuStats[sku].revenue += item.quantity * item.price;
      });

      const topSKUArray = Object.entries(skuStats)
        .map(([sku, stats]) => ({
          sku,
          quantity: stats.quantity,
          revenue: stats.revenue
        }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopSKUs(topSKUArray);
    } catch (error) {
      console.error('Error generating top SKUs:', error);
    }
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

  const MetricCard = ({ icon: Icon, value, label, color, tooltip }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="text-center cursor-help transition-smooth hover:shadow-elegant">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center mb-4">
                <Icon className={`h-8 w-8 ${color}`} />
                <Info className="h-3 w-3 ml-2 text-muted-foreground" />
              </div>
              <div className={`text-4xl font-bold mb-2 ${color}`}>{value}</div>
              <div className="text-sm text-muted-foreground font-medium">{label}</div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="space-y-6">
      {/* Sync Controls */}
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-sm">
          {totalOrders} orders • {dateRangeLabel}
        </Badge>
        <Button 
          onClick={handleSyncOrders} 
          disabled={syncing}
          variant="outline"
          size="sm"
        >
          {syncing ? "Syncing..." : "Sync Orders"}
        </Button>
      </div>

      {/* AI Recommendations */}
      <AIRecommendations orders={orders} carriers={carriersData} />

      {/* Daily Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Total Orders (Bar Graph)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Shows daily shipping volume trends—track spikes or lulls in order flow.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Bar dataKey="shipped" stackId="a" fill="hsl(var(--primary))" name="Orders Shipped" />
                  <Bar dataKey="unshipped" stackId="a" fill="hsl(var(--accent))" name="Orders Unshipped" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for the selected period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={Package}
          value={totalOrders.toLocaleString()}
          label="Total Orders"
          color="text-primary"
          tooltip="Total number of orders in the selected time period."
        />
        
        <MetricCard
          icon={Truck}
          value={shippedOrders.toLocaleString()}
          label="Orders Shipped"
          color="text-green-600"
          tooltip="Number of orders that have been shipped or delivered."
        />
        
        <MetricCard
          icon={Clock}
          value={unshippedOrders.toLocaleString()}
          label="Orders Unshipped"
          color="text-orange-600"
          tooltip="Number of orders awaiting fulfillment."
        />
        
        <MetricCard
          icon={Target}
          value={`${fulfillmentRate.toFixed(1)}%`}
          label="Fulfillment Rate"
          color="text-purple-600"
          tooltip="Percentage of orders successfully shipped out of total orders."
        />
        
        <MetricCard
          icon={Scale}
          value={`${avgOrderWeight.toFixed(1)} kg`}
          label="Avg Order Weight"
          color="text-blue-600"
          tooltip="Average weight per order - monitor logistics costs for heavy shipments."
        />
      </div>

      {/* Second Row of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={DollarSign}
          value={`$${avgShippingCost.toFixed(2)}`}
          label="Avg Shipping Cost"
          color="text-green-500"
          tooltip="Average shipping cost per order."
        />
        
        <MetricCard
          icon={TrendingUp}
          value={`${avgProcessingTime.toFixed(1)} days`}
          label="Avg Processing Time"
          color="text-indigo-600"
          tooltip="Average time from order placement to label creation."
        />
        
        <MetricCard
          icon={RotateCcw}
          value={`${repeatShipmentRate.toFixed(1)}%`}
          label="Repeat Customers"
          color="text-pink-600"
          tooltip="Percentage of repeat customers - gauge reorder behavior."
        />
        
        <MetricCard
          icon={Eye}
          value={ordersWithoutTracking.toLocaleString()}
          label="Missing Tracking"
          color="text-red-600"
          tooltip="Orders shipped but missing tracking information."
        />
        
        <MetricCard
          icon={AlertCircle}
          value="2.1%"
          label="Undeliverable Rate"
          color="text-orange-500"
          tooltip="Percentage of orders that could not be delivered."
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Cost Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Shipping Cost per Carrier Over Time
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Track average shipping costs by carrier to spot rising expenses.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={shippingCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="USPS" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="FedEx" stroke="hsl(var(--accent))" strokeWidth={2} />
                  <Line type="monotone" dataKey="UPS" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Shipped SKUs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Top 5 Shipped SKUs
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Track most popular products by shipping volume.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSKUs.map((sku, index) => (
                <div key={sku.sku} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{sku.sku}</div>
                      <div className="text-sm text-muted-foreground">{sku.quantity} units</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${sku.revenue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section - Problem Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments by Carrier */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Shipments by Carrier
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Track carrier usage share to identify overreliance or cost-saving opportunities.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground border-b pb-2">
                <div>Carrier</div>
                <div>Qty</div>
                <div>Share</div>
              </div>
              {carriersData.length > 0 ? (
                carriersData.map((carrier, index) => (
                  <div key={index} className="grid grid-cols-3 text-sm items-center py-2 hover:bg-muted/50 rounded cursor-pointer">
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
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No carrier data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Open Order Aging */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Open Order Aging (SLA)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Visualize SLA compliance and pinpoint fulfillment delays.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agingData.map((aging, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: aging.color }}
                    />
                    <span className="font-medium">{aging.range} days</span>
                  </div>
                  <Badge variant={aging.range === '4+' ? 'destructive' : 'secondary'}>
                    {aging.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Region Heatmap Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Shipping Destinations
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Geographic distribution of shipping destinations to identify trends.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">California</span>
                <Badge>{Math.floor(totalOrders * 0.23)}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">Texas</span>
                <Badge>{Math.floor(totalOrders * 0.18)}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">Florida</span>
                <Badge>{Math.floor(totalOrders * 0.15)}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded">
                <span className="font-medium">New York</span>
                <Badge>{Math.floor(totalOrders * 0.12)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}