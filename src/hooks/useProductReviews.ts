import { useState, useEffect } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  title?: string;
  review_text?: string;
  verified_purchase: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
}

interface UseProductReviewsReturn {
  reviews: ProductReview[];
  userReview: ProductReview | null;
  isLoading: boolean;
  averageRating: number;
  totalReviews: number;
  addReview: (review: {
    rating: number;
    title?: string;
    review_text?: string;
  }) => Promise<void>;
  updateReview: (reviewId: string, updates: {
    rating?: number;
    title?: string;
    review_text?: string;
  }) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
}

export function useProductReviews(productId: string): UseProductReviewsReturn {
  const session = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  useEffect(() => {
    if (session?.user?.id && reviews.length > 0) {
      const userReviewFound = reviews.find(review => review.user_id === session.user.id);
      setUserReview(userReviewFound || null);
    }
  }, [session?.user?.id, reviews]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as any) || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (review: {
    rating: number;
    title?: string;
    review_text?: string;
  }) => {
    if (!session?.user?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to add a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: session.user.id,
          product_id: productId,
          rating: review.rating,
          title: review.title,
          review_text: review.review_text,
        });

      if (error) throw error;

      await fetchReviews();
      toast({
        title: "Review Added",
        description: "Your review has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding review:', error);
      toast({
        title: "Error",
        description: "Failed to add review.",
        variant: "destructive",
      });
    }
  };

  const updateReview = async (reviewId: string, updates: {
    rating?: number;
    title?: string;
    review_text?: string;
  }) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      await fetchReviews();
      toast({
        title: "Review Updated",
        description: "Your review has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review.",
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      await fetchReviews();
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const totalReviews = reviews.length;

  return {
    reviews,
    userReview,
    isLoading,
    averageRating,
    totalReviews,
    addReview,
    updateReview,
    deleteReview,
  };
}