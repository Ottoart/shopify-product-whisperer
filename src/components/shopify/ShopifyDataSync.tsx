import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Loader2, Package, Users, ShoppingCart, Database, Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useShopifyProductSync } from '@/hooks/useShopifyProductSync';
import { useShopifyOrderSync } from '@/hooks/useShopifyOrderSync';
import { useShopifyCustomerSync } from '@/hooks/useShopifyCustomerSync';
import { useShopifyInventorySync } from '@/hooks/useShopifyInventorySync';
import { useShopifyBulkOperations } from '@/hooks/useShopifyBulkOperations';
import { formatDistanceToNow } from 'date-fns';

export function ShopifyDataSync() {
  const productSync = useShopifyProductSync();
  const orderSync = useShopifyOrderSync();
  const customerSync = useShopifyCustomerSync();
  const inventorySync = useShopifyInventorySync();
  const bulkOps = useShopifyBulkOperations();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'RUNNING':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productSync.localProductsCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              {productSync.isCompleted ? 'Sync completed' : 'Ready to sync'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderSync.localOrdersCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total orders synced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerSync.localCustomersCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total customers synced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySync.localInventoryCount?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Inventory records</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sync" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sync">Data Sync</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="sync">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Products Sync
                </CardTitle>
                <CardDescription>
                  Sync products and variants from your Shopify store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {productSync.isSyncing && (
                  <Progress value={productSync.syncProgress.current} className="w-full" />
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => productSync.syncBatch()}
                    disabled={productSync.isSyncing || !productSync.hasCredentials()}
                    size="sm"
                  >
                    {productSync.isSyncing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sync Batch
                  </Button>
                  <Button
                    onClick={productSync.startFullSync}
                    disabled={productSync.isSyncing || !productSync.hasCredentials()}
                    variant="outline"
                    size="sm"
                  >
                    Full Sync
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Orders Sync
                </CardTitle>
                <CardDescription>
                  Sync orders and order items from your Shopify store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => orderSync.syncOrders({ limit: 100 })}
                    disabled={orderSync.isSyncing || !orderSync.hasCredentials}
                    size="sm"
                  >
                    {orderSync.isSyncing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sync Orders
                  </Button>
                  <Button
                    onClick={orderSync.syncAllOrders}
                    disabled={orderSync.isSyncing || !orderSync.hasCredentials}
                    variant="outline"
                    size="sm"
                  >
                    Full Sync
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customers Sync
                </CardTitle>
                <CardDescription>
                  Sync customer data and profiles from your Shopify store
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => customerSync.syncCustomers({ limit: 100 })}
                    disabled={customerSync.isSyncing || !customerSync.hasCredentials}
                    size="sm"
                  >
                    {customerSync.isSyncing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sync Customers
                  </Button>
                  <Button
                    onClick={customerSync.syncAllCustomers}
                    disabled={customerSync.isSyncing || !customerSync.hasCredentials}
                    variant="outline"
                    size="sm"
                  >
                    Full Sync
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Inventory Sync
                </CardTitle>
                <CardDescription>
                  Sync inventory levels across all locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => inventorySync.syncInventory({})}
                    disabled={inventorySync.isSyncing || !inventorySync.hasCredentials}
                    size="sm"
                  >
                    {inventorySync.isSyncing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Sync Inventory
                  </Button>
                  <Button
                    onClick={inventorySync.syncAllInventory}
                    disabled={inventorySync.isSyncing || !inventorySync.hasCredentials}
                    variant="outline"
                    size="sm"
                  >
                    Full Sync
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Start Bulk Operation</CardTitle>
                <CardDescription>
                  Start a new bulk operation using GraphQL queries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => bulkOps.startBulkOperation({ query: bulkOps.predefinedQueries.products })}
                    disabled={bulkOps.isStarting || !bulkOps.hasCredentials}
                    size="sm"
                  >
                    {bulkOps.isStarting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Bulk Export Products
                  </Button>
                  <Button
                    onClick={() => bulkOps.startBulkOperation({ query: bulkOps.predefinedQueries.orders })}
                    disabled={bulkOps.isStarting || !bulkOps.hasCredentials}
                    size="sm"
                  >
                    Bulk Export Orders
                  </Button>
                  <Button
                    onClick={() => bulkOps.startBulkOperation({ query: bulkOps.predefinedQueries.customers })}
                    disabled={bulkOps.isStarting || !bulkOps.hasCredentials}
                    size="sm"
                  >
                    Bulk Export Customers
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bulk Operations</CardTitle>
                <CardDescription>
                  Monitor and download bulk operation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bulkOps.operationsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : bulkOps.bulkOperations?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bulk operations yet</p>
                  ) : (
                    bulkOps.bulkOperations?.slice(0, 5).map((operation) => (
                      <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(operation.status)}
                          <div>
                            <p className="text-sm font-medium">{operation.operation_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(operation.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={operation.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {operation.status}
                          </Badge>
                          <Button
                            onClick={() => bulkOps.checkBulkOperation({ bulkOperationId: operation.id })}
                            disabled={bulkOps.isChecking}
                            size="sm"
                            variant="ghost"
                          >
                            Check
                          </Button>
                          {operation.status === 'COMPLETED' && (
                            <Button
                              onClick={() => bulkOps.downloadBulkData({ bulkOperationId: operation.id })}
                              disabled={bulkOps.isDownloading}
                              size="sm"
                              variant="ghost"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}