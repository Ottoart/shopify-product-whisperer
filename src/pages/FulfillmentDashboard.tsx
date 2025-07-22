import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useFulfillmentData } from '@/hooks/useFulfillmentData';
import { Package, Clock, CheckCircle, AlertTriangle, Target, Play, Users } from 'lucide-react';

const FulfillmentDashboard = () => {
  const {
    fulfillmentOrders,
    pickLists,
    pickItems,
    pickSessions,
    inventoryAllocations,
    isLoading,
    updateFulfillmentOrderStatus,
    createPickList,
    createPickSession,
  } = useFulfillmentData();

  // Calculate dashboard metrics
  const pendingOrders = fulfillmentOrders.filter(order => order.status === 'pending').length;
  const activePickLists = pickLists.filter(list => list.status === 'in_progress').length;
  const completedToday = fulfillmentOrders.filter(order => 
    order.status === 'shipped' && 
    new Date(order.updated_at).toDateString() === new Date().toDateString()
  ).length;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      allocated: "outline",
      picking: "default",
      picked: "default",
      packed: "default",
      shipped: "default",
      cancelled: "destructive",
    };
    
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'Not started';
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Fulfillment</h1>
          <p className="text-muted-foreground">
            Manage picking, packing, and shipping operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => createPickSession({
              user_id: 'current-user-id', // This should come from auth context
              session_name: `Session ${Date.now()}`,
              total_orders: 0,
              total_items: 0,
              total_pick_lists: 0,
              efficiency_score: 0,
              status: 'planning',
              session_type: 'batch',
              assigned_picker_id: null,
              started_at: null,
              completed_at: null,
              notes: null,
            })}
            disabled={isLoading}
          >
            <Play className="w-4 h-4 mr-2" />
            New Pick Session
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting fulfillment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pick Lists</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePickLists}</div>
            <p className="text-xs text-muted-foreground">
              Currently being picked
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
              Orders shipped today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Allocated</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryAllocations.length}</div>
            <p className="text-xs text-muted-foreground">
              Items reserved for orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="pick-lists">Pick Lists</TabsTrigger>
          <TabsTrigger value="pick-items">Pick Items</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment Orders</CardTitle>
              <CardDescription>
                Orders ready for fulfillment and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pick Time</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fulfillmentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.order_id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.priority_level > 3 ? "destructive" : "default"}>
                          P{order.priority_level}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.estimated_pick_time_minutes}m</TableCell>
                      <TableCell>{formatTime(order.pick_started_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateFulfillmentOrderStatus(order.id, 'picking')}
                            >
                              Start Pick
                            </Button>
                          )}
                          {order.status === 'picking' && (
                            <Button
                              size="sm"
                              onClick={() => updateFulfillmentOrderStatus(order.id, 'picked')}
                            >
                              Mark Picked
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pick-lists">
          <Card>
            <CardHeader>
              <CardTitle>Pick Lists</CardTitle>
              <CardDescription>
                Generated pick lists for efficient warehouse operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>List Name</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Estimated Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickLists.map((list) => {
                    const progress = list.status === 'completed' ? 100 : 
                                   list.status === 'in_progress' ? 50 : 0;
                    
                    return (
                      <TableRow key={list.id}>
                        <TableCell className="font-medium">{list.list_name}</TableCell>
                        <TableCell>{list.total_items}</TableCell>
                        <TableCell>{list.estimated_time_minutes}m</TableCell>
                        <TableCell>{getStatusBadge(list.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="flex-1" />
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pick-items">
          <Card>
            <CardHeader>
              <CardTitle>Pick Items</CardTitle>
              <CardDescription>
                Individual items to be picked from warehouse locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sequence</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Picked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickItems.slice(0, 10).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.pick_sequence}</TableCell>
                      <TableCell>{item.location_path || item.bin_id.slice(-8)}</TableCell>
                      <TableCell>{item.quantity_requested}</TableCell>
                      <TableCell>{item.quantity_picked}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {item.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Pick Sessions</CardTitle>
              <CardDescription>
                Batch picking sessions for optimized warehouse operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickSessions.map((session) => {
                    const duration = session.started_at && session.completed_at ? 
                      Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000) : 0;
                    
                    return (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">{session.session_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{session.session_type}</Badge>
                        </TableCell>
                        <TableCell>{session.total_orders}</TableCell>
                        <TableCell>{session.total_items}</TableCell>
                        <TableCell>{session.efficiency_score.toFixed(1)}%</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>{duration > 0 ? `${duration}m` : '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Allocations</CardTitle>
              <CardDescription>
                Inventory reserved for specific orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Bin Location</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Picked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryAllocations.slice(0, 10).map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">
                        {allocation.fulfillment_order_id.slice(-8)}
                      </TableCell>
                      <TableCell>{allocation.bin_id.slice(-8)}</TableCell>
                      <TableCell>{allocation.quantity_allocated}</TableCell>
                      <TableCell>{allocation.quantity_picked}</TableCell>
                      <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                      <TableCell>
                        {allocation.expires_at ? 
                          new Date(allocation.expires_at).toLocaleDateString() : 
                          'No expiry'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={allocation.allocation_priority > 3 ? "destructive" : "default"}>
                          P{allocation.allocation_priority}
                        </Badge>
                      </TableCell>
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
};

export default FulfillmentDashboard;