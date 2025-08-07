import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LayoutGrid, Grid3X3, Package, List } from "lucide-react";

type ViewMode = 'grid-4' | 'grid-3' | 'grid-2' | 'list';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  size?: 'sm' | 'default';
}

export default function ViewModeToggle({ 
  viewMode, 
  onViewModeChange, 
  size = 'default' 
}: ViewModeToggleProps) {
  const viewModes: Array<{
    mode: ViewMode;
    icon: React.ElementType;
    label: string;
    description: string;
  }> = [
    {
      mode: 'grid-4',
      icon: LayoutGrid,
      label: '4 Columns',
      description: 'Compact grid view'
    },
    {
      mode: 'grid-3',
      icon: Grid3X3,
      label: '3 Columns',
      description: 'Balanced grid view'
    },
    {
      mode: 'grid-2',
      icon: Package,
      label: '2 Columns',
      description: 'Large grid view'
    },
    {
      mode: 'list',
      icon: List,
      label: 'List',
      description: 'Detailed list view'
    }
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
        {viewModes.map(({ mode, icon: Icon, label, description }) => (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <Button
                variant={viewMode === mode ? "default" : "ghost"}
                size={size === 'sm' ? "sm" : "icon"}
                onClick={() => onViewModeChange(mode)}
                className={size === 'sm' ? "h-8 w-8" : "h-9 w-9"}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}