import { cn } from "@/lib/utils";
import { RefreshCw, ChevronDown } from "lucide-react";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isAtThreshold: boolean;
  isRefreshing: boolean;
  threshold?: number;
  className?: string;
}

export default function PullToRefreshIndicator({
  pullDistance,
  isAtThreshold,
  isRefreshing,
  threshold = 80,
  className
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180;

  return (
    <div
      className={cn(
        "absolute top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200",
        className
      )}
      style={{
        transform: `translateX(-50%) translateY(${Math.max(pullDistance - 20, -50)}px)`,
        opacity: pullDistance > 10 ? 1 : 0
      }}
    >
      <div className="flex flex-col items-center">
        {/* Pull indicator */}
        <div
          className={cn(
            "w-12 h-12 rounded-full border-2 border-primary/20 bg-background/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200",
            isAtThreshold && "border-primary bg-primary text-primary-foreground scale-110",
            isRefreshing && "animate-spin"
          )}
        >
          {isRefreshing ? (
            <RefreshCw className="h-5 w-5" />
          ) : (
            <ChevronDown
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                isAtThreshold && "text-primary-foreground"
              )}
              style={{
                transform: `rotate(${rotation}deg)`
              }}
            />
          )}
        </div>

        {/* Progress indicator */}
        <div className="w-16 h-1 bg-muted rounded-full mt-2 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-200 rounded-full",
              isAtThreshold ? "bg-primary" : "bg-primary/60"
            )}
            style={{
              width: `${progress * 100}%`,
              transform: isRefreshing ? 'translateX(100%)' : 'translateX(0%)'
            }}
          />
        </div>

        {/* Status text */}
        <div className="mt-2 text-xs font-medium text-center">
          {isRefreshing ? (
            <span className="text-primary">Refreshing...</span>
          ) : isAtThreshold ? (
            <span className="text-primary">Release to refresh</span>
          ) : pullDistance > 10 ? (
            <span className="text-muted-foreground">Pull to refresh</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}