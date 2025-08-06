import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number;
    image_url?: string;
    in_stock: boolean;
    currency: string;
  };
}

interface UseShoppingCartReturn {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
}

export function useShoppingCart(): UseShoppingCartReturn {
  const session = useSession();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [session?.user?.id]);

  const fetchCartItems = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          added_at,
          product:store_products(
            id,
            name,
            price,
            sale_price,
            image_url,
            in_stock,
            currency
          )
        `)
        .eq('cart_id', await getOrCreateCartId());

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getOrCreateCartId = async (): Promise<string> => {
    if (!session?.user?.id) throw new Error('User not authenticated');

    // Check if cart exists
    const { data: existingCart } = await supabase
      .from('shopping_carts')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (existingCart) {
      return existingCart.id;
    }

    // Create new cart
    const { data: newCart, error } = await supabase
      .from('shopping_carts')
      .insert({ user_id: session.user.id })
      .select('id')
      .single();

    if (error) throw error;
    return newCart.id;
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!session?.user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      const cartId = await getOrCreateCartId();
      
      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            quantity
          });

        if (error) throw error;
      }

      await fetchCartItems();
      toast({
        title: "Added to Cart",
        description: "Item has been added to your cart.",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!session?.user?.id) return;

    try {
      const cartId = await getOrCreateCartId();
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchCartItems();
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!session?.user?.id) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      const cartId = await getOrCreateCartId();
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    if (!session?.user?.id) return;

    try {
      const cartId = await getOrCreateCartId();
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) throw error;

      setCartItems([]);
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    }
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product.sale_price || item.product.price;
    return total + (price * item.quantity);
  }, 0);

  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount
  };
}