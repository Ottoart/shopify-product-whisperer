import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';
import { cn } from '@/lib/utils';

interface PromotionalBanner {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  banner_type: string;
  position: number;
}

interface PromotionalBannerProps {
  type?: 'hero' | 'strip' | 'sidebar';
  autoRotate?: boolean;
  rotationInterval?: number;
  showDismiss?: boolean;
  className?: string;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({
  type = 'hero',
  autoRotate = true,
  rotationInterval = 5000,
  showDismiss = false,
  className
}) => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const { trackBannerClick } = useAnalyticsTracking();

  useEffect(() => {
    fetchBanners();
  }, [type]);

  useEffect(() => {
    if (autoRotate && banners.length > 1 && !isDismissed) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % banners.length);
      }, rotationInterval);
      return () => clearInterval(interval);
    }
  }, [autoRotate, banners.length, rotationInterval, isDismissed]);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*')
        .eq('banner_type', type)
        .eq('is_active', true)
        .order('position');

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBannerClick = (banner: PromotionalBanner) => {
    trackBannerClick(banner.id, {
      title: banner.title,
      type: banner.banner_type,
      url: banner.cta_url
    });

    if (banner.cta_url) {
      if (banner.cta_url.startsWith('http')) {
        window.open(banner.cta_url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = banner.cta_url;
      }
    }
  };

  const nextBanner = () => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const previousBanner = () => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <Skeleton className={cn(
          "w-full rounded-lg",
          type === 'hero' && "h-64 md:h-80",
          type === 'strip' && "h-16",
          type === 'sidebar' && "h-48"
        )} />
      </div>
    );
  }

  if (!banners.length || isDismissed) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const getBannerStyles = () => {
    switch (type) {
      case 'hero':
        return "relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5";
      case 'strip':
        return "relative h-16 rounded-md overflow-hidden bg-gradient-to-r from-accent/20 to-accent/10";
      case 'sidebar':
        return "relative h-48 rounded-lg overflow-hidden bg-gradient-to-b from-muted/50 to-muted/20";
      default:
        return "relative rounded-lg overflow-hidden";
    }
  };

  const getContentStyles = () => {
    switch (type) {
      case 'hero':
        return "absolute inset-0 flex items-center justify-center text-center p-6 md:p-8";
      case 'strip':
        return "absolute inset-0 flex items-center justify-between px-4";
      case 'sidebar':
        return "absolute inset-0 flex flex-col items-center justify-center text-center p-4";
      default:
        return "absolute inset-0 flex items-center justify-center text-center p-4";
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Card className={getBannerStyles()}>
        {/* Background Image */}
        {currentBanner.image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${currentBanner.image_url})` }}
          />
        )}

        {/* Content */}
        <div className={getContentStyles()}>
          <div className="flex-1">
            <h3 className={cn(
              "font-bold text-foreground mb-2",
              type === 'hero' && "text-2xl md:text-4xl",
              type === 'strip' && "text-sm md:text-base",
              type === 'sidebar' && "text-lg"
            )}>
              {currentBanner.title}
            </h3>
            
            {currentBanner.description && type !== 'strip' && (
              <p className={cn(
                "text-muted-foreground mb-4",
                type === 'hero' && "text-lg",
                type === 'sidebar' && "text-sm"
              )}>
                {currentBanner.description}
              </p>
            )}
          </div>

          {/* CTA Button */}
          {currentBanner.cta_text && (
            <Button
              onClick={() => handleBannerClick(currentBanner)}
              variant={type === 'hero' ? 'default' : 'secondary'}
              size={type === 'strip' ? 'sm' : 'default'}
              className="hover-scale"
            >
              {currentBanner.cta_text}
            </Button>
          )}
        </div>

        {/* Navigation for multiple banners */}
        {banners.length > 1 && type === 'hero' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={previousBanner}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
              onClick={nextBanner}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex ? "bg-primary" : "bg-background/60"
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}

        {/* Dismiss button */}
        {showDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Banner count badge */}
        {banners.length > 1 && type !== 'strip' && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 left-2 bg-background/80"
          >
            {currentIndex + 1} / {banners.length}
          </Badge>
        )}
      </Card>
    </div>
  );
};