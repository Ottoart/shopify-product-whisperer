import { Zap, Sparkles, Brain, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductWhisperStats } from '@/types/productwhisper';
import { AIConnectionIndicator } from '@/components/AIConnectionIndicator';
import { usePatternLearning } from '@/hooks/usePatternLearning';

interface ProductWhisperHeaderProps {
  stats: ProductWhisperStats;
  onOpenPatternDashboard?: () => void;
}

export const ProductWhisperHeader = ({ stats, onOpenPatternDashboard }: ProductWhisperHeaderProps) => {
  const { approvedPatterns } = usePatternLearning();
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              ProductWhisper
              <Sparkles className="h-6 w-6 text-primary" />
            </h1>
            <p className="text-muted-foreground">
              AI-powered product management without the sync complexity
            </p>
          </div>
        </div>
        
        {stats.total > 0 && (
          <div className="text-sm text-muted-foreground">
            Managing {stats.total} products across {stats.categories} categories from {stats.vendors} vendors
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <AIConnectionIndicator showDetails />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenPatternDashboard}
          className="gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Patterns ({approvedPatterns?.length || 0})
        </Button>
        
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};