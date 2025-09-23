import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Truck,
  AlertTriangle,
  Search,
  Mail,
  Phone,
  ExternalLink
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  tracking_number: string | null;
  carrier: string | null;
  status: string;
  shipped_date: string | null;
  delivered_date: string | null;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
}

interface TrackingEvent {
  id: string;
  tracking_number: string;
  carrier: string;
  status: string;
  description: string | null;
  location: string | null;
  event_time: string;
}

export function CustomerTrackingPage() {
  const { trackingNumber } = useParams();
  const [searchTracking, setSearchTracking] = useState(trackingNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const searchTrackingNumber = async (trackingNum?: string) => {
    const searchValue = trackingNum || searchTracking;
    if (!searchValue) return;
    
    setLoading(true);
    setNotFound(false);
    
    try {
      // Find order by tracking number
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', searchValue)
        .single();

      if (orderError && orderError.code !== 'PGRST116') throw orderError;
      
      if (orderData) {
        setOrder(orderData);
        
        // Fetch tracking events
        const { data: eventsData, error: eventsError } = await supabase
          .from('tracking_events')
          .select('*')
          .eq('tracking_number', searchValue)
          .order('event_time', { ascending: false });

        if (eventsError) throw eventsError;
        setTrackingEvents(eventsData || []);
      } else {
        setNotFound(true);
        setOrder(null);
        setTrackingEvents([]);
      }
    } catch (error) {
      console.error('Error searching tracking:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
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

  const getProgressSteps = () => {
    return [
      { label: 'Order Placed', completed: true },
      { label: 'Processing', completed: order ? ['shipped', 'in transit', 'out for delivery', 'delivered'].includes(order.status.toLowerCase()) : false },
      { label: 'Shipped', completed: order ? ['in transit', 'out for delivery', 'delivered'].includes(order.status.toLowerCase()) : false },
      { label: 'Out for Delivery', completed: order ? ['delivered'].includes(order.status.toLowerCase()) : false },
      { label: 'Delivered', completed: order ? order.status.toLowerCase() === 'delivered' : false }
    ];
  };

  useEffect(() => {
    if (trackingNumber) {
      searchTrackingNumber(trackingNumber);
    }
  }, [trackingNumber]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Track Your Package</h1>
              <p className="text-muted-foreground">Get real-time updates on your shipment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  value={searchTracking}
                  onChange={(e) => setSearchTracking(e.target.value)}
                  placeholder="Enter your tracking number"
                  className="text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && searchTrackingNumber()}
                />
              </div>
              <Button 
                onClick={() => searchTrackingNumber()}
                disabled={loading || !searchTracking}
                size="lg"
              >
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Track Package'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Not Found */}
        {notFound && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              We couldn't find a package with that tracking number. Please check the number and try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Package Found */}
        {order && (
          <>
            {/* Status Overview */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">📦</div>
                  <div>
                    <h2 className="text-3xl font-bold text-green-800 capitalize">{order.status}</h2>
                    <p className="text-lg text-muted-foreground mt-2">
                      Order #{order.order_number} for {order.customer_name}
                    </p>
                    <p className="text-muted-foreground">
                      Tracking: {order.tracking_number}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progress</span>
                    <span>{calculateProgress(order.status)}%</span>
                  </div>
                  <Progress value={calculateProgress(order.status)} className="h-3" />
                  
                  <div className="grid grid-cols-5 gap-2 mt-6">
                    {getProgressSteps().map((step, index) => (
                      <div key={index} className="text-center">
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                        </div>
                        <div className={`text-xs ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                          {step.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h4>
                    <p className="text-muted-foreground">
                      {order.shipping_address_line1}<br />
                      {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Carrier Information
                    </h4>
                    <p className="text-muted-foreground">
                      Carrier: {order.carrier || 'Standard Shipping'}<br />
                      {order.shipped_date && (
                        <span>Shipped: {new Date(order.shipped_date).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking Details</CardTitle>
                <CardDescription>Follow your package's journey</CardDescription>
              </CardHeader>
              <CardContent>
                {trackingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Tracking information will appear here as your package moves through our network.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trackingEvents.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-green-500' : 'bg-gray-300'
                          }`}></div>
                          {index < trackingEvents.length - 1 && (
                            <div className="w-px h-12 bg-gray-300 mt-1"></div>
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

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Our customer service team is here to assist you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}