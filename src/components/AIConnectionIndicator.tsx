import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap } from 'lucide-react';
import { usePatternLearning } from '@/hooks/usePatternLearning';

interface AIConnectionIndicatorProps {
  isOptimizing?: boolean;
  showDetails?: boolean;
}

export const AIConnectionIndicator = ({ isOptimizing, showDetails = false }: AIConnectionIndicatorProps) => {
  const { approvedPatterns } = usePatternLearning();
  const activePatterns = approvedPatterns?.length || 0;

  if (isOptimizing) {
    return (
      <Badge variant="secondary" className="animate-pulse bg-primary/10 text-primary border-primary/20">
        <Zap className="h-3 w-3 mr-1" />
        AI Optimizing with {activePatterns} patterns
      </Badge>
    );
  }

  if (activePatterns > 0) {
    return (
      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">
        <Sparkles className="h-3 w-3 mr-1" />
        {activePatterns} AI pattern{activePatterns !== 1 ? 's' : ''} active
        {showDetails && (
          <span className="ml-1 text-xs opacity-75">
            (enhancing AI suggestions)
          </span>
        )}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      <Sparkles className="h-3 w-3 mr-1" />
      No patterns learned yet
    </Badge>
  );
};