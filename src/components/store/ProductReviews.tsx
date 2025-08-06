import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useProductReviews } from "@/hooks/useProductReviews";
import { Star, ThumbsUp, Edit2, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { 
    reviews, 
    userReview, 
    isLoading, 
    averageRating, 
    totalReviews, 
    addReview, 
    updateReview, 
    deleteReview 
  } = useProductReviews(productId);

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    review_text: "",
  });

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 transition-colors ${
              interactive ? 'cursor-pointer hover:text-yellow-400' : ''
            } ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : i < rating 
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-muted-foreground'
            }`}
            onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
          />
        ))}
      </div>
    );
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse(); // Show 5 stars first
  };

  const handleSubmitReview = async () => {
    if (editingReview) {
      await updateReview(editingReview, reviewForm);
      setEditingReview(null);
    } else {
      await addReview(reviewForm);
    }
    setIsReviewDialogOpen(false);
    setReviewForm({ rating: 5, title: "", review_text: "" });
  };

  const handleEditReview = (review: any) => {
    setReviewForm({
      rating: review.rating,
      title: review.title || "",
      review_text: review.review_text || "",
    });
    setEditingReview(review.id);
    setIsReviewDialogOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteReview(reviewId);
    }
  };

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant={userReview ? "outline" : "default"}
                  onClick={() => {
                    if (userReview) {
                      handleEditReview(userReview);
                    } else {
                      setReviewForm({ rating: 5, title: "", review_text: "" });
                      setEditingReview(null);
                    }
                  }}
                >
                  {userReview ? (
                    <>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Review
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Write Review
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingReview ? "Edit Your Review" : "Write a Review"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Rating</Label>
                    <div className="mt-2">
                      {renderStars(reviewForm.rating, true, (rating) => 
                        setReviewForm(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="review-title">Title (Optional)</Label>
                    <Input
                      id="review-title"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summarize your review"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="review-comment">Comment</Label>
                    <Textarea
                      id="review-comment"
                      value={reviewForm.review_text}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, review_text: e.target.value }))}
                      placeholder="Share your experience with this product"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSubmitReview} className="flex-1">
                      {editingReview ? "Update Review" : "Submit Review"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsReviewDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex justify-center mb-2">
                    {renderStars(averageRating)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Based on {totalReviews} reviews
                  </div>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {ratingDistribution.map((count, index) => {
                  const stars = 5 - index;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-12">{stars} star</span>
                      <Progress value={percentage} className="flex-1" />
                      <span className="w-8 text-muted-foreground">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        {review.verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-medium">{review.title}</h4>
                      )}
                    </div>
                    
                    {review.user_id === userReview?.user_id && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {review.review_text && (
                    <p className="text-muted-foreground">{review.review_text}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM dd, yyyy')}
                    </span>
                    
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful_votes})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}