import { useState, useEffect } from 'react';
import { usePackingData } from '@/hooks/usePackingData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Clock, 
  Truck, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Pause, 
  Plus,
  BarChart3,
  RefreshCw,
  MapPin,
  Users,
  Activity
} from 'lucide-react';

export default function PackingDashboard() {
  const { 
    loading, 
    packingStations, 
    packSessions, 
    packages, 
    returnAuthorizations, 
    shippingAnalytics,
    createPackSession,
    updatePackSession,
    createPackage,
    createReturnAuthorization,
    refreshData
  } = usePackingData();
  
  const { toast } = useToast();
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [newSessionData, setNewSessionData] = useState({
    packing_station_id: '',
    fulfillment_order_id: '',
    estimated_time_minutes: 30,
    session_notes: ''
  });

  // Calculate dashboard metrics
  const activeSessions = packSessions.filter(s => s.status === 'active').length;
  const completedToday = packSessions.filter(s => 
    s.status === 'completed' && 
    s.completed_at && 
    new Date(s.completed_at).toDateString() === new Date().toDateString()
  ).length;
  const packagesShippedToday = packages.filter(p => 
    p.status === 'shipped' && 
    p.shipped_at && 
    new Date(p.shipped_at).toDateString() === new Date().toDateString()
  ).length;
  const pendingReturns = returnAuthorizations.filter(r => r.status === 'pending').length;

  const handleCreateSession = async () => {
    if (!newSessionData.packing_station_id || !newSessionData.fulfillment_order_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a packing station and enter a fulfillment order ID.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPackSession(newSessionData);
      setNewSessionData({
        packing_station_id: '',
        fulfillment_order_id: '',
        estimated_time_minutes: 30,
        session_notes: ''
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleStartSession = async (sessionId: string) => {
    await updatePackSession(sessionId, {
      status: 'active',
      started_at: new Date().toISOString(),
    });
  };

  const handleCompleteSession = async (sessionId: string) => {
    await updatePackSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'paused': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPackageStatusColor = (status: string) => {
    switch (status) {
      case 'packed': return 'bg-blue-500';
      case 'labeled': return 'bg-green-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading packing dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Packing & Shipping Dashboard</h1>
          <p className="text-muted-foreground">
            Manage packing operations, shipping labels, and returns processing
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Pack Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Pack Session</DialogTitle>
                <DialogDescription>
                  Start a new packing session for order fulfillment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="station">Packing Station</Label>
                  <Select
                    value={newSessionData.packing_station_id}
                    onValueChange={(value) => setNewSessionData(prev => ({ ...prev, packing_station_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a packing station" />
                    </SelectTrigger>
                    <SelectContent>
                      {packingStations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.station_name} ({station.station_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fulfillment_order_id">Fulfillment Order ID</Label>
                  <Input
                    id="fulfillment_order_id"
                    value={newSessionData.fulfillment_order_id}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, fulfillment_order_id: e.target.value }))}
                    placeholder="Enter fulfillment order ID"
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
                  <Input
                    id="estimated_time"
                    type="number"
                    value={newSessionData.estimated_time_minutes}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, estimated_time_minutes: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Session Notes</Label>
                  <Textarea
                    id="notes"
                    value={newSessionData.session_notes}
                    onChange={(e) => setNewSessionData(prev => ({ ...prev, session_notes: e.target.value }))}
                    placeholder="Optional notes for this session"
                  />
                </div>
                <Button onClick={handleCreateSession} className="w-full">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Currently packing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Sessions finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped Today</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packagesShippedToday}</div>
            <p className="text-xs text-muted-foreground">
              Packages shipped
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReturns}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stations">Packing Stations</TabsTrigger>
          <TabsTrigger value="sessions">Pack Sessions</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="stations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packingStations.map((station) => (
              <Card key={station.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{station.station_name}</CardTitle>
                    <Badge variant={station.current_session_id ? "default" : "secondary"}>
                      {station.current_session_id ? "In Use" : "Available"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Code: {station.station_code} • Zone: {station.location_zone}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Zone {station.location_zone}</span>
                    </div>
                    {station.equipment_available && Array.isArray(station.equipment_available) && (
                      <div className="flex flex-wrap gap-1">
                        {station.equipment_available.map((equipment: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {equipment}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="space-y-4">
            {packSessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Session #{session.id.slice(-6)}</CardTitle>
                      <CardDescription>
                        Fulfillment Order: {session.fulfillment_order_id}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      {session.status === 'preparing' && (
                        <Button size="sm" onClick={() => handleStartSession(session.id)}>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {session.status === 'active' && (
                        <Button size="sm" onClick={() => handleCompleteSession(session.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <div className="font-medium">{session.packed_items}/{session.total_items}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estimated Time:</span>
                      <div className="font-medium">{session.estimated_time_minutes}min</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Started:</span>
                      <div className="font-medium">
                        {session.started_at ? new Date(session.started_at).toLocaleTimeString() : '-'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <div className="font-medium">
                        {session.completed_at ? new Date(session.completed_at).toLocaleTimeString() : '-'}
                      </div>
                    </div>
                  </div>
                  {session.total_items > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm">{Math.round((session.packed_items / session.total_items) * 100)}%</span>
                      </div>
                      <Progress value={(session.packed_items / session.total_items) * 100} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <div className="space-y-4">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.package_number}</CardTitle>
                    <Badge className={getPackageStatusColor(pkg.status)}>
                      {pkg.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Type: {pkg.package_type} • Session: {pkg.pack_session_id.slice(-6)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <div className="font-medium">{pkg.weight_lbs ? `${pkg.weight_lbs} lbs` : '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dimensions:</span>
                      <div className="font-medium">
                        {pkg.length_inches && pkg.width_inches && pkg.height_inches 
                          ? `${pkg.length_inches}×${pkg.width_inches}×${pkg.height_inches}"`
                          : '-'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Carrier:</span>
                      <div className="font-medium">{pkg.carrier || '-'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tracking:</span>
                      <div className="font-medium">{pkg.tracking_number || '-'}</div>
                    </div>
                  </div>
                  {pkg.shipping_cost && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Shipping Cost: </span>
                      <span className="font-medium">${pkg.shipping_cost}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <div className="space-y-4">
            {returnAuthorizations.map((rma) => (
              <Card key={rma.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{rma.rma_number}</CardTitle>
                    <Badge variant={rma.status === 'pending' ? 'destructive' : 'default'}>
                      {rma.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Order: {rma.order_id} • Type: {rma.return_type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Reason: </span>
                      <span className="text-sm">{rma.return_reason}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Requested: </span>
                      <span className="text-sm">{new Date(rma.requested_at).toLocaleDateString()}</span>
                    </div>
                    {rma.customer_notes && (
                      <div>
                        <span className="text-sm text-muted-foreground">Customer Notes: </span>
                        <span className="text-sm">{rma.customer_notes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shippingAnalytics.slice(0, 7).map((analytics) => (
              <Card key={analytics.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {new Date(analytics.date).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Packages:</span>
                      <div className="font-bold text-lg">{analytics.total_packages}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Shipping Cost:</span>
                      <div className="font-bold text-lg">${analytics.total_shipping_cost.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Pack Time:</span>
                      <div className="font-bold text-lg">{analytics.avg_pack_time_minutes.toFixed(1)}min</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost per Package:</span>
                      <div className="font-bold text-lg">${analytics.cost_per_package.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}