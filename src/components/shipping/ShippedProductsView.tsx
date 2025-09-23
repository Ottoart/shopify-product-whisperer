import { useState, useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface ShippedProduct {
  productTitle: string;
  productHandle?: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  orderNumber: string;
  customerName: string;
  storeName: string;
  status: 'shipped' | 'delivered';
  trackingNumber?: string;
  carrier?: string;
  shippedDate?: string;
  deliveredDate?: string;
  shippingAddress: {
    city: string;
    state: string;
    country: string;
  };
}

export function ShippedProductsView() {
  const { orders, loading } = useOrders();
  const [shippedProducts, setShippedProducts] = useState<ShippedProduct[]>([]);

  useEffect(() => {
    if (!orders) return;

    const products: ShippedProduct[] = [];
    
    // Filter orders that are shipped or delivered
    const shippedOrders = orders.filter(order => 
      order.status === 'shipped' || order.status === 'delivered'
    );

    // Extract products from shipped orders
    shippedOrders.forEach(order => {
      order.items.forEach(item => {
        products.push({
          productTitle: item.productTitle,
          productHandle: item.productHandle,
          variantTitle: item.variantTitle,
          sku: item.sku,
          quantity: item.quantity,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          storeName: order.storeName,
          status: order.status as 'shipped' | 'delivered',
          trackingNumber: order.shippingDetails.trackingNumber,
          carrier: order.shippingDetails.carrier,
          shippedDate: order.shippedDate,
          deliveredDate: order.deliveredDate,
          shippingAddress: {
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            country: order.shippingAddress.country,
          }
        });
      });
    });

    setShippedProducts(products);
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shipped':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped':
        return <Truck className="h-3 w-3" />;
      case 'delivered':
        return <Package className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (shippedProducts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Shipped Products</h3>
          <p className="text-muted-foreground">
            No products have been shipped or are in transit yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shipped & In-Transit Products</h2>
          <p className="text-muted-foreground">
            {shippedProducts.length} products currently shipped or delivered
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shippedProducts.map((product, index) => (
          <Card key={`${product.orderNumber}-${index}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.productTitle}
                  </CardTitle>
                  {product.variantTitle && (
                    <CardDescription className="mt-1">
                      {product.variantTitle}
                    </CardDescription>
                  )}
                </div>
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${getStatusColor(product.status)}`}
                >
                  {getStatusIcon(product.status)}
                  <span className="ml-1 capitalize">{product.status}</span>
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Quantity:</span>
                  <p className="font-medium">{product.quantity}</p>
                </div>
                {product.sku && (
                  <div>
                    <span className="text-muted-foreground">SKU:</span>
                    <p className="font-medium">{product.sku}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{product.orderNumber}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {product.shippingAddress.city}, {product.shippingAddress.state}
                  </span>
                </div>

                {product.trackingNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xs">
                      {product.trackingNumber}
                    </span>
                  </div>
                )}

                {product.carrier && (
                  <div className="text-xs text-muted-foreground">
                    via {product.carrier}
                  </div>
                )}
              </div>

              <div className="border-t pt-3 text-xs text-muted-foreground">
                <p>{product.customerName} • {product.storeName}</p>
                {product.shippedDate && (
                  <p>
                    Shipped: {format(new Date(product.shippedDate), 'MMM d, yyyy')}
                  </p>
                )}
                {product.deliveredDate && (
                  <p>
                    Delivered: {format(new Date(product.deliveredDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}