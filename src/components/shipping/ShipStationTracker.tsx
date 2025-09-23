import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Truck, Package, Search, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface TrackingInfo {
  tracking_number: string;
  carrier: string;
  status: string;
  status_description: string;
  location?: string;
  estimated_delivery?: string;
  delivered_date?: string;
  events: any[];
  last_updated: string;
}

export function ShipStationTracker() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentLabels, setRecentLabels] = useState<any[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentLabels();
  }, []);

  const fetchRecentLabels = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_labels')
        .select('*')
        .eq('carrier', 'ShipStation')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentLabels(data || []);
    } catch (error) {
      console.error('Error fetching recent labels:', error);
    }
  };

  const handleTrackShipment = async (trackingNum?: string) => {
    const numberToTrack = trackingNum || trackingNumber;
    
    if (!numberToTrack) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTrackingInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke('shipstation-track-shipment', {
        body: { trackingNumber: numberToTrack }
      });

      if (error) throw error;

      setTrackingInfo(data);
      toast({
        title: "Success",
        description: "Tracking information retrieved",
      });

    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to track shipment',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'default';
      case 'in_transit': return 'secondary';
      case 'out_for_delivery': return 'secondary';
      case 'shipped': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Truck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Package Tracking</h1>
          <p className="text-muted-foreground">Track your ShipStation shipments in real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track Shipment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Shipment
            </CardTitle>
            <CardDescription>
              Enter a tracking number to get real-time status updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <div className="flex gap-2">
                <Input
                  id="tracking-number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number..."
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                />
                <Button
                  onClick={() => handleTrackShipment()}
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {trackingInfo && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Status:</span>
                    <Badge variant={getStatusBadgeVariant(trackingInfo.status)}>
                      {trackingInfo.status_description}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Carrier:</span>
                    <span>{trackingInfo.carrier}</span>
                  </div>

                  {trackingInfo.location && (
                    <div className="flex justify-between">
                      <span className="font-medium">Location:</span>
                      <span>{trackingInfo.location}</span>
                    </div>
                  )}

                  {trackingInfo.estimated_delivery && (
                    <div className="flex justify-between">
                      <span className="font-medium">Est. Delivery:</span>
                      <span>{formatDate(trackingInfo.estimated_delivery)}</span>
                    </div>
                  )}

                  {trackingInfo.delivered_date && (
                    <div className="flex justify-between">
                      <span className="font-medium">Delivered:</span>
                      <span>{formatDate(trackingInfo.delivered_date)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="font-medium">Last Updated:</span>
                    <span>{formatDate(trackingInfo.last_updated)}</span>
                  </div>
                </div>

                {trackingInfo.events && trackingInfo.events.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Tracking Events:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {trackingInfo.events.map((event: any, index: number) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{event.status || event.description}</span>
                            <span className="text-muted-foreground">
                              {event.date ? formatDate(event.date) : 'N/A'}
                            </span>
                          </div>
                          {event.location && (
                            <div className="text-muted-foreground">{event.location}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Labels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Shipments
            </CardTitle>
            <CardDescription>
              Quick access to your recent ShipStation labels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLabels.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent shipments found</p>
                <p className="text-sm">Create your first shipping label to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLabels.map((label) => (
                  <div
                    key={label.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-medium">#{label.tracking_number}</div>
                        <div className="text-sm text-muted-foreground">
                          {label.service_name} • ${label.shipping_cost}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(label.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={label.status === 'active' ? 'default' : 'secondary'}>
                          {label.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTrackShipment(label.tracking_number)}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}