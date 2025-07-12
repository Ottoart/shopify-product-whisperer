import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Package, Truck, Clock, TrendingUp, MapPin, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, parseISO, startOfDay, differenceInDays } from 'date-fns';

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

export function ShippingOverview() {
  const [searchParams] = useSearchParams();
  const storeFilter = searchParams.get('store');
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState("last30days");
  const [syncing, setSyncing] = useState(false);
  const [storeConfigs, setStoreConfigs] = useState<any[]>([]);

  useEffect(() => {
    fetchStoreConfigs();
  }, []);

  const fetchStoreConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('store_configurations')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setStoreConfigs(data || []);
    } catch (error) {
      console.error('Error fetching store configs:', error);
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

  const handleSyncSpecificStore = async (storeName: string) => {
    setSyncing(true);
    try {
      const response = await supabase.functions.invoke('sync-orders', {
        body: { storeName }
      });
      if (response.error) throw response.error;
      
      toast({
        title: "Store sync initiated",
        description: `Updating orders from ${storeName}...`,
      });
    } catch (error) {
      console.error('Error syncing store:', error);
      toast({
        title: "Sync failed",
        description: `Failed to sync ${storeName}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [carriersData, setCarriersData] = useState<CarrierData[]>([]);
  const [agingData, setAgingData] = useState<AgingData[]>([]);

  // Calculate metrics from real data
  const totalOrders = orders.length;
  const shippedOrders = orders.filter(order => 
    order.status === 'shipped' || order.status === 'delivered'
  ).length;
  const unshippedOrders = totalOrders - shippedOrders;

  useEffect(() => {
    fetchOrders();
  }, [storeFilter, dateRange]);

  useEffect(() => {
    if (orders.length > 0) {
      generateDailyData();
      generateCarriersData();
      generateAgingData();
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });

      // Apply store filter if present
      if (storeFilter) {
        query = query.eq('store_name', storeFilter);
      }

      // Apply date range filter
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

  const generateDailyData = () => {
    const daily: { [key: string]: { shipped: number; unshipped: number } } = {};
    
    // Initialize last 15 days
    for (let i = 14; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'MM/dd');
      daily[dateKey] = { shipped: 0, unshipped: 0 };
    }

    // Count orders by day
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
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    const carriers: CarrierData[] = Object.entries(carrierCounts)
      .map(([name, qty], index) => ({
        name,
        qty,
        share: total > 0 ? Math.round((qty / total) * 100) : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.qty - a.qty);

    // Add "No carrier specified" if there are orders without carriers
    const ordersWithoutCarrier = orders.filter(order => 
      (order.status === 'shipped' || order.status === 'delivered') && !order.carrier
    ).length;

    if (ordersWithoutCarrier > 0) {
      const totalWithUnknown = total + ordersWithoutCarrier;
      carriers.push({
        name: 'No carrier specified',
        qty: ordersWithoutCarrier,
        share: Math.round((ordersWithoutCarrier / totalWithUnknown) * 100),
        color: '#6B7280'
      });
    }

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

    const colors = ['#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE'];
    const agingArray: AgingData[] = Object.entries(aging).map(([range, count], index) => ({
      range,
      count,
      color: colors[index]
    }));

    setAgingData(agingArray);
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'last7days':
        return 'Last 7 days';
      case 'last30days':
        return 'Last 30 days';
      case 'thismonth':
        return 'This month';
      default:
        return 'Last 30 days';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {storeFilter ? `${storeFilter} Overview` : 'Overview'}
          </h1>
          <p className="text-muted-foreground">
            {storeFilter 
              ? `Shipping dashboard for ${storeFilter} store` 
              : 'Shipping dashboard and analytics'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Date Range
          </div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          <CardTitle className="text-lg">
            # of Orders each Day ({getDateRangeLabel()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for the selected period
              </div>
            )}
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
            <div className="text-4xl font-bold text-primary mb-2">{totalOrders.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Orders</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">{shippedOrders.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground font-medium">Orders Shipped</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="text-4xl font-bold text-orange-600 mb-2">{unshippedOrders.toLocaleString()}</div>
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
              {carriersData.length > 0 ? (
                carriersData.map((carrier, index) => (
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                Open Order Aging
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </div>
            <CardDescription>
              Current fill time SLA: 48 hours
              <Button variant="link" className="p-0 h-auto text-primary ml-2">
                Change SLA
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agingData.length > 0 && agingData.some(item => item.count > 0) ? (
                agingData.map((item, index) => (
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
                          width: `${Math.max(item.count * 20, 4)}px` 
                        }}
                      />
                      <span className="text-sm font-bold w-6 text-right">{item.count}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No pending orders
                </div>
              )}
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