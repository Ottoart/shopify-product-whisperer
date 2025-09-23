import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Lightbulb, Brain, Zap } from 'lucide-react';
import { usePatternLearning } from '@/hooks/usePatternLearning';

interface PatternAnalyzerProps {
  onAnalysisComplete?: () => void;
}

export const PatternAnalyzer = ({ onAnalysisComplete }: PatternAnalyzerProps) => {
  const { analyzePatterns, isAnalyzing } = usePatternLearning();

  const handleAnalyze = async () => {
    await analyzePatterns();
    onAnalysisComplete?.();
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          AI Pattern Discovery
        </CardTitle>
        <CardDescription>
          Analyze your editing history to discover new patterns and improve AI suggestions
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center p-6 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Discover Your Editing Patterns</h3>
            <p className="text-muted-foreground">
              AI analyzes your manual edits to learn preferences and improve future product optimizations.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">📝</div>
              <div className="text-xs text-muted-foreground">Manual Edits</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">🧠</div>
              <div className="text-xs text-muted-foreground">AI Learning</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">⚡</div>
              <div className="text-xs text-muted-foreground">Smart Suggestions</div>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          size="lg"
          className="w-full bg-gradient-primary hover:shadow-lg transition-all duration-200"
        >
          {isAnalyzing ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Lightbulb className="h-5 w-5 mr-2" />
          )}
          {isAnalyzing ? 'Analyzing Patterns...' : 'Discover New Patterns'}
        </Button>
      </CardContent>
    </Card>
  );
};