import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgressiveImageLoaderProps {
  src: string;
  alt: string;
  className?: string;
  lowQualitySrc?: string;
  placeholderClassName?: string;
  blurDataURL?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ProgressiveImageLoader({
  src,
  alt,
  className,
  lowQualitySrc,
  placeholderClassName,
  blurDataURL,
  priority = false,
  onLoad,
  onError
}: ProgressiveImageLoaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Preload low quality image
  useEffect(() => {
    if (!isInView || !lowQualitySrc) return;

    const img = new Image();
    img.onload = () => setLowQualityLoaded(true);
    img.src = lowQualitySrc;
  }, [isInView, lowQualitySrc]);

  // Load high quality image
  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setError(true);
      onError?.();
    };
    img.src = src;
  }, [isInView, src, onLoad, onError]);

  const generateBlurDataURL = (color = '#f3f4f6') => {
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="${color}" filter="url(#blur)"/>
      </svg>`
    )}`;
  };

  if (error) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground",
          className
        )}
      >
        <div className="text-center p-4">
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden bg-muted", className)}
    >
      {/* Placeholder/Blur background */}
      {!imageLoaded && (
        <div className="absolute inset-0">
          {blurDataURL ? (
            <img
              src={blurDataURL}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'blur(20px)' }}
            />
          ) : lowQualitySrc && lowQualityLoaded ? (
            <img
              src={lowQualitySrc}
              alt=""
              className="w-full h-full object-cover"
              style={{ filter: 'blur(10px)' }}
            />
          ) : (
            <div 
              className={cn("w-full h-full", placeholderClassName)}
              style={{
                backgroundImage: `url("${generateBlurDataURL()}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {!imageLoaded && !lowQualityLoaded && (
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        </div>
      )}

      {/* High quality image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}

      {/* Loading indicator */}
      {isInView && !imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}