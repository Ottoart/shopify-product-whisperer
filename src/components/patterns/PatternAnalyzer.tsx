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
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
            <Lightbulb className="h-8 w-8 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Discover Your Editing Patterns</h3>
            <p className="text-muted-foreground">
              Our AI analyzes your manual edits to learn your preferences and improve future suggestions.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4" />
            <span>Advanced machine learning analysis</span>
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