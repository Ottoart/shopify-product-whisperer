import { useState } from 'react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Minus, 
  Search,
  BarChart3,
  Boxes,
  Activity,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

export default function InventoryDashboard() {
  const {
    inventory,
    movements,
    adjustments,
    alerts,
    bins,
    loading,
    createMovement,
    createAdjustment,
    acknowledgeAlert,
    checkLowStock
  } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBin, setSelectedBin] = useState('all');
  
  // Movement form state
  const [movementForm, setMovementForm] = useState({
    submission_item_id: '',
    from_bin_id: '',
    to_bin_id: '',
    quantity: '',
    movement_type: 'transfer',
    reason: ''
  });

  // Adjustment form state
  const [adjustmentForm, setAdjustmentForm] = useState({
    submission_item_id: '',
    bin_id: '',
    adjustment_quantity: '',
    reason: ''
  });

  // Filter inventory based on search and bin selection
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !searchTerm || 
      item.submission_item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submission_item.product_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBin = selectedBin === 'all' || item.bin_id === selectedBin;
    
    return matchesSearch && matchesBin;
  });

  // Calculate summary stats
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalUniqueProducts = new Set(inventory.map(item => item.submission_item_id)).size;
  const criticalAlerts = alerts.filter(alert => alert.alert_level === 'critical').length;
  const outOfStockAlerts = alerts.filter(alert => alert.alert_level === 'out_of_stock').length;

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementForm.submission_item_id || !movementForm.to_bin_id || !movementForm.quantity) return;

    await createMovement({
      submission_item_id: movementForm.submission_item_id,
      from_bin_id: movementForm.from_bin_id || undefined,
      to_bin_id: movementForm.to_bin_id,
      quantity: parseInt(movementForm.quantity),
      movement_type: movementForm.movement_type,
      reason: movementForm.reason || undefined
    });

    setMovementForm({
      submission_item_id: '',
      from_bin_id: '',
      to_bin_id: '',
      quantity: '',
      movement_type: 'transfer',
      reason: ''
    });
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentForm.submission_item_id || !adjustmentForm.bin_id || !adjustmentForm.adjustment_quantity || !adjustmentForm.reason) return;

    await createAdjustment({
      submission_item_id: adjustmentForm.submission_item_id,
      bin_id: adjustmentForm.bin_id,
      adjustment_quantity: parseInt(adjustmentForm.adjustment_quantity),
      reason: adjustmentForm.reason
    });

    setAdjustmentForm({
      submission_item_id: '',
      bin_id: '',
      adjustment_quantity: '',
      reason: ''
    });
  };

  const getAlertBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'out_of_stock': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your warehouse inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkLowStock} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Low Stock
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Products</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUniqueProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{outOfStockAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="movements">Movements</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
          <TabsTrigger value="alerts">Low Stock Alerts</TabsTrigger>
          <TabsTrigger value="bins">Bin Management</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Inventory</CardTitle>
                  <CardDescription>View and manage your current stock levels</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Move Items
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Move Inventory</DialogTitle>
                        <DialogDescription>Transfer items between bins</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleMovementSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="movement-item">Item</Label>
                          <Select onValueChange={(value) => setMovementForm(prev => ({ ...prev, submission_item_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventory.map((item) => (
                                <SelectItem key={item.submission_item_id} value={item.submission_item_id}>
                                  {item.submission_item.sku} - {item.submission_item.product_title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="from-bin">From Bin (optional)</Label>
                          <Select onValueChange={(value) => setMovementForm(prev => ({ ...prev, from_bin_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source bin" />
                            </SelectTrigger>
                            <SelectContent>
                              {bins.map((bin) => (
                                <SelectItem key={bin.id} value={bin.id}>
                                  {bin.bin_code} - {bin.zone_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="to-bin">To Bin</Label>
                          <Select onValueChange={(value) => setMovementForm(prev => ({ ...prev, to_bin_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination bin" />
                            </SelectTrigger>
                            <SelectContent>
                              {bins.map((bin) => (
                                <SelectItem key={bin.id} value={bin.id}>
                                  {bin.bin_code} - {bin.zone_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="movement-quantity">Quantity</Label>
                          <Input
                            id="movement-quantity"
                            type="number"
                            value={movementForm.quantity}
                            onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: e.target.value }))}
                            min="1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="movement-reason">Reason (optional)</Label>
                          <Textarea
                            id="movement-reason"
                            value={movementForm.reason}
                            onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Enter reason for movement"
                          />
                        </div>

                        <Button type="submit" className="w-full">Create Movement</Button>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Adjust Inventory
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adjust Inventory</DialogTitle>
                        <DialogDescription>Make manual inventory adjustments</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="adjustment-item">Item</Label>
                          <Select onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, submission_item_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select item" />
                            </SelectTrigger>
                            <SelectContent>
                              {inventory.map((item) => (
                                <SelectItem key={item.submission_item_id} value={item.submission_item_id}>
                                  {item.submission_item.sku} - {item.submission_item.product_title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="adjustment-bin">Bin</Label>
                          <Select onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, bin_id: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bin" />
                            </SelectTrigger>
                            <SelectContent>
                              {bins.map((bin) => (
                                <SelectItem key={bin.id} value={bin.id}>
                                  {bin.bin_code} - {bin.zone_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="adjustment-quantity">Adjustment Quantity</Label>
                          <Input
                            id="adjustment-quantity"
                            type="number"
                            value={adjustmentForm.adjustment_quantity}
                            onChange={(e) => setAdjustmentForm(prev => ({ ...prev, adjustment_quantity: e.target.value }))}
                            placeholder="Use negative numbers to decrease"
                          />
                        </div>

                        <div>
                          <Label htmlFor="adjustment-reason">Reason</Label>
                          <Textarea
                            id="adjustment-reason"
                            value={adjustmentForm.reason}
                            onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Enter reason for adjustment"
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full">Create Adjustment</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by SKU or product name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={selectedBin} onValueChange={setSelectedBin}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by bin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All bins</SelectItem>
                    {bins.map((bin) => (
                      <SelectItem key={bin.id} value={bin.id}>
                        {bin.bin_code} - {bin.zone_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory Table */}
              <div className="space-y-4">
                {filteredInventory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No inventory items found
                  </div>
                ) : (
                  filteredInventory.map((item) => (
                    <Card key={`${item.submission_item_id}-${item.bin_id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.submission_item.sku}</h3>
                              <Badge variant="outline">{item.bin.bin_code}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.submission_item.product_title}</p>
                            <p className="text-xs text-muted-foreground">
                              Zone: {item.bin.zone_name} | Type: {item.bin.bin_type}
                            </p>
                            {item.submission_item.expiration_date && (
                              <p className="text-xs text-muted-foreground">
                                Expires: {format(new Date(item.submission_item.expiration_date), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{item.quantity}</div>
                            <div className="text-xs text-muted-foreground">
                              Updated: {format(new Date(item.last_updated_at), 'MMM dd, yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>Track all inventory movements and transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No movements recorded yet
                  </div>
                ) : (
                  movements.map((movement) => (
                    <Card key={movement.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{movement.movement_type}</Badge>
                              <span className="text-sm font-medium">Quantity: {movement.quantity}</span>
                            </div>
                            {movement.reason && (
                              <p className="text-sm text-muted-foreground">Reason: {movement.reason}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(movement.moved_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm">
                              {movement.from_bin_id && (
                                <>
                                  <span>From Bin</span>
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              )}
                              <span>To Bin</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adjustment History</CardTitle>
              <CardDescription>View all manual inventory adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adjustments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No adjustments recorded yet
                  </div>
                ) : (
                  adjustments.map((adjustment) => (
                    <Card key={adjustment.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={adjustment.adjustment_quantity > 0 ? "default" : "destructive"}>
                                {adjustment.adjustment_quantity > 0 ? '+' : ''}{adjustment.adjustment_quantity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Reason: {adjustment.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(adjustment.adjusted_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Monitor and manage low stock situations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active alerts
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <Card key={alert.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getAlertBadgeColor(alert.alert_level)}>
                                {alert.alert_level.replace('_', ' ')}
                              </Badge>
                              <span className="font-medium">{alert.submission_item.sku}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{alert.submission_item.product_title}</p>
                            <p className="text-sm">
                              Current: {alert.current_quantity} | Threshold: {alert.threshold_quantity}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                          <Button 
                            onClick={() => acknowledgeAlert(alert.id)}
                            variant="outline"
                            size="sm"
                          >
                            Acknowledge
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Bins</CardTitle>
              <CardDescription>Overview of all warehouse storage locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bins.map((bin) => (
                  <Card key={bin.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{bin.bin_code}</h3>
                          <Badge variant="outline">{bin.bin_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Zone: {bin.zone_name}</p>
                        {bin.aisle_number && (
                          <p className="text-sm text-muted-foreground">
                            Aisle {bin.aisle_number}, Level {bin.shelf_level}
                          </p>
                        )}
                        <div className="text-sm">
                          <span className="text-muted-foreground">Capacity: </span>
                          <span className="font-medium">
                            {bin.current_capacity} / {bin.max_capacity}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(bin.current_capacity / bin.max_capacity) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}