import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  storeName: string;
  storePlatform: string;
  status: 'awaiting' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'error';
  totalAmount: number;
  currency: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    validated: boolean;
  };
  packageDetails: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  shippingDetails: {
    method?: string;
    cost?: number;
    carrier?: string;
    serviceType?: string;
    trackingNumber?: string;
    labelUrl?: string;
  };
  tags: string[];
  notes?: string;
  priorityLevel: number;
  orderDate: string;
  shippedDate?: string;
  deliveredDate?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productHandle?: string;
  productTitle: string;
  variantTitle?: string;
  sku?: string;
  quantity: number;
  price: number;
  weight?: number;
  imageSrc?: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // First fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Get all unique product handles and SKUs from order items
      const productHandles = Array.from(
        new Set(
          (ordersData || [])
            .flatMap(order => order.order_items)
            .map(item => item.product_handle)
            .filter(handle => handle)
        )
      );

      const productSkus = Array.from(
        new Set(
          (ordersData || [])
            .flatMap(order => order.order_items)
            .map(item => item.sku)
            .filter(sku => sku)
        )
      );

      // Fetch product images by handle and SKU
      let productImages: Record<string, string> = {};
      let skuImages: Record<string, string> = {};
      
      // First try to fetch by handles
      if (productHandles.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('handle, image_src')
          .in('handle', productHandles);
        
        productImages = (productsData || []).reduce((acc, product) => {
          if (product.handle && product.image_src) {
            acc[product.handle] = product.image_src;
          }
          return acc;
        }, {} as Record<string, string>);
      }

      // Then try to fetch by SKUs as variant_sku
      if (productSkus.length > 0) {
        const { data: skuProductsData } = await supabase
          .from('products')
          .select('variant_sku, image_src')
          .in('variant_sku', productSkus);
        
        skuImages = (skuProductsData || []).reduce((acc, product) => {
          if (product.variant_sku && product.image_src) {
            acc[product.variant_sku] = product.image_src;
          }
          return acc;
        }, {} as Record<string, string>);
      }

      const formattedOrders: Order[] = (ordersData || []).map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        storeName: order.store_name,
        storePlatform: order.store_platform,
        status: order.status as Order['status'],
        totalAmount: order.total_amount,
        currency: order.currency,
        shippingAddress: {
          line1: order.shipping_address_line1,
          line2: order.shipping_address_line2,
          city: order.shipping_city,
          state: order.shipping_state,
          zip: order.shipping_zip,
          country: order.shipping_country,
          validated: order.address_validated
        },
        packageDetails: {
          weight: order.weight_lbs,
          length: order.length_inches,
          width: order.width_inches,
          height: order.height_inches
        },
        shippingDetails: {
          method: order.shipping_method,
          cost: order.shipping_cost,
          carrier: order.carrier,
          serviceType: order.service_type,
          trackingNumber: order.tracking_number,
          labelUrl: order.label_url
        },
        tags: order.tags || [],
        notes: order.notes,
        priorityLevel: order.priority_level,
        orderDate: order.order_date,
        shippedDate: order.shipped_date,
        deliveredDate: order.delivered_date,
        items: order.order_items.map((item: any) => {
          // Try to get image from handle first, then try SKU as handle
          let imageSrc = undefined;
          if (item.product_handle && productImages[item.product_handle]) {
            imageSrc = productImages[item.product_handle];
          } else if (item.sku && skuImages[item.sku]) {
            imageSrc = skuImages[item.sku];
          }
          
          return {
            id: item.id,
            productHandle: item.product_handle,
            productTitle: item.product_title,
            variantTitle: item.variant_title,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            weight: item.weight_lbs,
            imageSrc
          };
        })
      }));

      setOrders(formattedOrders);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error fetching orders",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'shipped' && { shipped_date: new Date().toISOString() }),
          ...(status === 'delivered' && { delivered_date: new Date().toISOString() })
        })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast({
        title: "Order updated",
        description: `Order status changed to ${status}`,
      });
    } catch (err: any) {
      toast({
        title: "Error updating order",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const updateShippingDetails = async (orderId: string, shippingDetails: Partial<Order['shippingDetails']>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          shipping_method: shippingDetails.method,
          shipping_cost: shippingDetails.cost,
          carrier: shippingDetails.carrier,
          service_type: shippingDetails.serviceType,
          tracking_number: shippingDetails.trackingNumber,
          label_url: shippingDetails.labelUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast({
        title: "Shipping details updated",
        description: "Order shipping information has been saved",
      });
    } catch (err: any) {
      toast({
        title: "Error updating shipping details",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const createOrder = async (orderData: Omit<Order, 'id'>) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderData.orderNumber,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          store_name: orderData.storeName,
          store_platform: orderData.storePlatform,
          status: orderData.status,
          total_amount: orderData.totalAmount,
          currency: orderData.currency,
          shipping_address_line1: orderData.shippingAddress.line1,
          shipping_address_line2: orderData.shippingAddress.line2,
          shipping_city: orderData.shippingAddress.city,
          shipping_state: orderData.shippingAddress.state,
          shipping_zip: orderData.shippingAddress.zip,
          shipping_country: orderData.shippingAddress.country,
          address_validated: orderData.shippingAddress.validated,
          weight_lbs: orderData.packageDetails.weight,
          length_inches: orderData.packageDetails.length,
          width_inches: orderData.packageDetails.width,
          height_inches: orderData.packageDetails.height,
          tags: orderData.tags,
          notes: orderData.notes,
          priority_level: orderData.priorityLevel,
          order_date: orderData.orderDate
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      if (orderData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            orderData.items.map(item => ({
              order_id: order.id,
              product_handle: item.productHandle,
              product_title: item.productTitle,
              variant_title: item.variantTitle,
              sku: item.sku,
              quantity: item.quantity,
              price: item.price,
              weight_lbs: item.weight
            }))
          );

        if (itemsError) throw itemsError;
      }

      await fetchOrders();
      toast({
        title: "Order created",
        description: `Order ${orderData.orderNumber} has been created successfully`,
      });

      return order;
    } catch (err: any) {
      toast({
        title: "Error creating order",
        description: err.message,
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    updateOrderStatus,
    updateShippingDetails,
    createOrder
  };
};