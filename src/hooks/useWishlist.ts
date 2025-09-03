import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
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

interface UseWishlistReturn {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

export function useWishlist(): UseWishlistReturn {
  const session = useSession();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchWishlistItems();
    } else {
      setWishlistItems([]);
    }
  }, [session?.user?.id]);

  const fetchWishlistItems = async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      // First get wishlist items
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id, product_id, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (wishlistError) throw wishlistError;

      // Then get product details for each wishlist item
      const wishlistItems = [];
      for (const item of wishlistData || []) {
        const { data: product } = await supabase
          .from('store_products')
          .select('id, name, price, sale_price, image_url, in_stock, currency')
          .eq('id', item.product_id)
          .maybeSingle();

        if (product) {
          wishlistItems.push({
            ...item,
            product
          });
        }
      }

      setWishlistItems(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      toast({
        title: "Error",
        description: "Failed to load wishlist items.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!session?.user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: session.user.id,
          product_id: productId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already in Wishlist",
            description: "This item is already in your wishlist.",
          });
          return;
        }
        throw error;
      }

      await fetchWishlistItems();
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist.",
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', session.user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchWishlistItems();
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist
  };
}