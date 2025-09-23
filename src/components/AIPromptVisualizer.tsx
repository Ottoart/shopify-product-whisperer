import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Eye, EyeOff, Sparkles, Settings, Code } from 'lucide-react';
import { usePatternLearning } from '@/hooks/usePatternLearning';

export const AIPromptVisualizer = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { approvedPatterns, patterns } = usePatternLearning();

  const basePrompt = `You are an expert e-commerce product optimization specialist. Your task is to enhance product listings for maximum search visibility, conversion, and appeal while maintaining accuracy and authenticity.

OPTIMIZATION GUIDELINES:
- Create compelling, SEO-optimized titles that include relevant keywords
- Write detailed, benefit-focused descriptions that address customer pain points
- Ensure all product attributes are accurate and complete
- Use persuasive language that drives conversions
- Maintain brand consistency and authenticity`;

  const getPatternDescription = (pattern: any) => {
    const data = pattern.pattern_data;
    if (data.field_preferences) {
      const fields = Object.keys(data.field_preferences);
      return `Prefers ${fields.join(', ')} optimizations`;
    }
    return data.description || 'Custom optimization pattern';
  };

  return (
    <Card className="border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Code className="h-5 w-5 text-primary-foreground" />
          </div>
          AI Prompt System
          <Badge variant="secondary" className="ml-auto">
            {approvedPatterns?.length || 0} Active Patterns
          </Badge>
        </CardTitle>
        <CardDescription>
          See how your patterns enhance AI product optimization
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pattern Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold text-primary">{patterns?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Patterns</div>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 text-center">
            <div className="text-2xl font-bold text-green-600">{approvedPatterns?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Active Patterns</div>
          </div>
        </div>

        {/* Active Patterns Preview */}
        {approvedPatterns && approvedPatterns.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Active Learning Patterns
            </h4>
            <div className="space-y-2">
              {approvedPatterns.slice(0, 3).map((pattern: any) => (
                <div key={pattern.id} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {pattern.pattern_type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {getPatternDescription(pattern)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((pattern.confidence_score || 0) * 100)}% confidence
                    </div>
                  </div>
                </div>
              ))}
              {approvedPatterns.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{approvedPatterns.length - 3} more patterns active
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt Preview */}
        <Collapsible open={showPrompt} onOpenChange={setShowPrompt}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                {showPrompt ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPrompt ? 'Hide' : 'Show'} Base AI Prompt
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="p-4 rounded-lg bg-muted/30 border">
              <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                {basePrompt}
              </pre>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              This base prompt is enhanced with your approved patterns when optimizing products
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Connection Indicator */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div className="text-sm">
              <span className="font-medium">AI System Connected</span>
              <div className="text-muted-foreground">
                Your patterns are automatically applied during product optimization
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};