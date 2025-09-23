import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Copy, 
  Mail, 
  Search,
  Truck,
  AlertTriangle,
  RefreshCw,
  Eye,
  ExternalLink,
  Navigation
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  tracking_number: string | null;
  carrier: string | null;
  status: string;
  shipped_date: string | null;
  delivered_date: string | null;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  total_amount: number;
}

interface TrackingEvent {
  id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  description: string | null;
  location: string | null;
  event_time: string;
  created_at: string;
}

export function EnhancedTrackingDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [searchTracking, setSearchTracking] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .not('tracking_number', 'is', null)
        .order('shipped_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    }
  };

  const fetchTrackingEvents = async (trackingNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .order('event_time', { ascending: false });

      if (error) throw error;
      setTrackingEvents(data || []);
    } catch (error) {
      console.error('Error fetching tracking events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tracking events",
        variant: "destructive",
      });
    }
  };

  const searchTrackingNumber = async () => {
    if (!searchTracking) return;
    
    setLoading(true);
    try {
      // Find order by tracking number
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', searchTracking)
        .single();

      if (orderError && orderError.code !== 'PGRST116') throw orderError;
      
      if (orderData) {
        setSelectedOrder(orderData);
        await fetchTrackingEvents(searchTracking);
        setActiveTab('details');
        toast({
          title: "Package Found",
          description: `Found shipment for order #${orderData.order_number}`,
        });
      } else {
        toast({
          title: "Not Found",
          description: "No shipment found with this tracking number",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching tracking:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for tracking number",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast({
      title: "Copied",
      description: "Tracking number copied to clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
      case 'in transit':
      case 'out for delivery':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'processing':
      case 'awaiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
      case 'in transit':
      case 'out for delivery':
        return 'bg-blue-500';
      case 'processing':
      case 'awaiting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 100;
      case 'out for delivery':
        return 80;
      case 'in transit':
        return 60;
      case 'shipped':
        return 40;
      case 'processing':
        return 20;
      default:
        return 0;
    }
  };

  const refreshTracking = async (order: Order) => {
    if (!order.tracking_number) return;
    
    setLoading(true);
    try {
      // In a real implementation, this would call a carrier API
      await fetchTrackingEvents(order.tracking_number);
      toast({
        title: "Tracking Updated",
        description: "Latest tracking information retrieved",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh tracking information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Tracking</h2>
          <p className="text-muted-foreground">
            Monitor shipments and provide real-time updates to customers
          </p>
        </div>
        <Button onClick={() => fetchOrders()} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="search">Track Package</TabsTrigger>
          <TabsTrigger value="details">Package Details</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm text-muted-foreground">Total Shipments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'shipped' || o.status === 'in transit').length}
                </div>
                <div className="text-sm text-muted-foreground">In Transit</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'delivered').length}
                </div>
                <div className="text-sm text-muted-foreground">Delivered</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">
                  {orders.filter(o => !o.tracking_number && o.status === 'shipped').length}
                </div>
                <div className="text-sm text-muted-foreground">Missing Tracking</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Shipments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Latest packages with tracking information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No shipments found with tracking numbers
                  </div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <div className="font-medium">#{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.tracking_number && (
                              <span className="flex items-center gap-1">
                                <Navigation className="h-3 w-3" />
                                {order.tracking_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={order.status === 'delivered' ? 'default' : 'outline'}>
                          {order.status}
                        </Badge>
                        {order.tracking_number && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              fetchTrackingEvents(order.tracking_number!);
                              setActiveTab('details');
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Track Package</CardTitle>
              <CardDescription>Enter a tracking number to get real-time status updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input
                    id="tracking"
                    value={searchTracking}
                    onChange={(e) => setSearchTracking(e.target.value)}
                    placeholder="Enter tracking number (e.g., 1Z999AA1234567890)"
                    onKeyPress={(e) => e.key === 'Enter' && searchTrackingNumber()}
                  />
                </div>
                <Button 
                  className="mt-6" 
                  onClick={searchTrackingNumber}
                  disabled={loading || !searchTracking}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Searching...' : 'Track'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedOrder ? (
            <>
              {/* Package Status */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order #{selectedOrder.order_number}
                      </CardTitle>
                      <CardDescription>
                        Tracking: {selectedOrder.tracking_number}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => copyTrackingNumber(selectedOrder.tracking_number!)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => refreshTracking(selectedOrder)}
                        disabled={loading}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Overview */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-green-800 capitalize">{selectedOrder.status}</h3>
                        <p className="text-green-700">Customer: {selectedOrder.customer_name}</p>
                        <p className="text-green-600">
                          {selectedOrder.shipping_address_line1}, {selectedOrder.shipping_city}, {selectedOrder.shipping_state}
                        </p>
                      </div>
                      <div className="text-6xl text-green-500">📦</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Delivery Progress</span>
                      <span>{calculateProgress(selectedOrder.status)}%</span>
                    </div>
                    <Progress value={calculateProgress(selectedOrder.status)} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Ordered</span>
                      <span>Shipped</span>
                      <span>In Transit</span>
                      <span>Delivered</span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold mb-2">Customer Details</h4>
                      <p className="text-sm">{selectedOrder.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Details</h4>
                      <p className="text-sm">Carrier: {selectedOrder.carrier || 'Not specified'}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: ${selectedOrder.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Tracking History</CardTitle>
                  <CardDescription>
                    Detailed tracking events for this shipment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trackingEvents.length === 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        No tracking events found. Events will appear here as the package moves through the shipping network.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      {trackingEvents.map((event, index) => (
                        <div key={event.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${index === 0 ? getStatusColor(event.status) : 'bg-gray-300'}`}></div>
                            {index < trackingEvents.length - 1 && (
                              <div className="w-px h-8 bg-gray-300 mt-1"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={index === 0 ? "default" : "outline"}>
                                {event.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(event.event_time).toLocaleDateString()} at{' '}
                                {new Date(event.event_time).toLocaleTimeString()}
                              </span>
                            </div>
                            {event.location && (
                              <p className="text-sm font-medium flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a package from the dashboard or use the search function to view tracking details.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}