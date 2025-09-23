import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileFilterTriggerProps {
  activeFilterCount: number;
  isFloating?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function MobileFilterTrigger({
  activeFilterCount,
  isFloating = false,
  className,
  size = "default",
  variant = "outline"
}: MobileFilterTriggerProps) {
  const baseClasses = isFloating 
    ? "fixed bottom-20 right-4 z-40 shadow-lg h-14 px-4 rounded-full bg-background border-2 border-primary/20 hover:border-primary/40"
    : "";

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "relative",
        baseClasses,
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isFloating ? (
          <Filter className="h-5 w-5" />
        ) : (
          <SlidersHorizontal className="h-4 w-4" />
        )}
        {!isFloating && <span>Filters</span>}
        {activeFilterCount > 0 && (
          <Badge 
            variant="destructive" 
            className={cn(
              "text-xs h-5 min-w-[20px] flex items-center justify-center",
              isFloating && "absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            )}
          >
            {activeFilterCount > 99 ? "99+" : activeFilterCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}