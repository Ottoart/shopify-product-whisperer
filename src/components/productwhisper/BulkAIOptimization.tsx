import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAIOptimizationWithLearning } from '@/hooks/useAIOptimizationWithLearning';
import { usePatternLearning } from '@/hooks/usePatternLearning';
import { ProductWhisperItem } from '@/types/productwhisper';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Sparkles, Zap, Target, Settings, PlayCircle } from 'lucide-react';

interface BulkAIOptimizationProps {
  selectedProducts: ProductWhisperItem[];
  onClose: () => void;
  onOptimizationComplete: () => void;
  children?: React.ReactNode;
}

export const BulkAIOptimization = ({ 
  selectedProducts, 
  onClose, 
  onOptimizationComplete,
  children 
}: BulkAIOptimizationProps) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [currentProduct, setCurrentProduct] = useState('');
  const [selectedFields, setSelectedFields] = useState({
    title: true,
    description: true,
    tags: true,
    seoTitle: false,
    seoDescription: false,
    category: false,
    type: false
  });
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [batchSize, setBatchSize] = useState('5');
  const [useDirectAI, setUseDirectAI] = useState(false);

  const { session } = useSessionContext();
  const { toast } = useToast();
  const { optimizeWithLearningAsync } = useAIOptimizationWithLearning();
  const { patterns } = usePatternLearning();

  const approvedPatterns = patterns?.filter(p => p.is_approved === true) || [];

  const handleBulkOptimization = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products to optimize",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);

    try {
      // Create batch operation record
      const { data: batchOperation, error: batchError } = await supabase
        .from('batch_operations')
        .insert({
          user_id: session?.user?.id,
          operation_type: 'bulk_ai_optimization',
          status: 'processing',
          total_items: selectedProducts.length,
          processed_items: 0,
          progress_percentage: 0,
          metadata: {
            description: `Bulk AI optimization of ${selectedProducts.length} products`,
            fields: selectedFields,
            patterns: selectedPatterns,
            custom_prompt: customPrompt,
            use_direct_ai: useDirectAI
          },
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (batchError) throw batchError;

      const batch_size = parseInt(batchSize);
      const totalBatches = Math.ceil(selectedProducts.length / batch_size);
      const errors: string[] = [];

      // Process in batches with delays
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * batch_size;
        const endIndex = Math.min(startIndex + batch_size, selectedProducts.length);
        const batch = selectedProducts.slice(startIndex, endIndex);

        // Process batch in parallel
        const batchPromises = batch.map(async (product) => {
          try {
            setCurrentProduct(product.title);
            
            const optimizationData = {
              title: product.title,
              type: product.type,
              description: product.body_html,
              tags: product.tags,
              vendor: product.vendor,
              variant_price: product.variant_price,
              variant_compare_at_price: product.variant_compare_at_price,
              variant_sku: product.variant_sku,
              variant_barcode: product.variant_barcode,
              variant_grams: product.variant_grams
            };

            await optimizeWithLearningAsync({
              productHandle: product.handle,
              productData: optimizationData,
              useDirectAI,
              customPromptTemplate: customPrompt || undefined
            });

            const newProcessedCount = processedCount + 1;
            setProcessedCount(newProcessedCount);
            setProgress((newProcessedCount / selectedProducts.length) * 100);

            // Update batch operation
            await supabase
              .from('batch_operations')
              .update({
                processed_items: newProcessedCount,
                progress_percentage: Math.round((newProcessedCount / selectedProducts.length) * 100)
              })
              .eq('id', batchOperation.id);

          } catch (error: any) {
            console.error(`Error optimizing product ${product.handle}:`, error);
            errors.push(`${product.title}: ${error.message}`);
          }
        });

        await Promise.allSettled(batchPromises);

        // Add delay between batches to respect rate limits
        if (batchIndex < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Complete batch operation
      await supabase
        .from('batch_operations')
        .update({
          status: errors.length === selectedProducts.length ? 'failed' : 'completed',
          completed_at: new Date().toISOString(),
          failed_items: errors.length,
          error_log: errors.length > 0 ? errors : null
        })
        .eq('id', batchOperation.id);

      const successCount = selectedProducts.length - errors.length;
      
      toast({
        title: "Bulk Optimization Complete",
        description: `${successCount} products optimized successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
        variant: errors.length === selectedProducts.length ? "destructive" : "default",
      });

      if (successCount > 0) {
        onOptimizationComplete();
      }

      setOpen(false);
      onClose();

    } catch (error: any) {
      console.error('Bulk optimization error:', error);
      toast({
        title: "Bulk Optimization Failed",
        description: error.message || "Failed to start bulk optimization",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessedCount(0);
      setCurrentProduct('');
    }
  };

  const toggleField = (field: keyof typeof selectedFields) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const togglePattern = (patternId: string) => {
    setSelectedPatterns(prev => 
      prev.includes(patternId) 
        ? prev.filter(id => id !== patternId)
        : [...prev, patternId]
    );
  };

  const selectedFieldsCount = Object.values(selectedFields).filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            Bulk AI Optimize ({selectedProducts.length})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Bulk AI Optimization
            <Badge variant="outline">{selectedProducts.length} products</Badge>
          </DialogTitle>
        </DialogHeader>

        {isProcessing ? (
          // Processing State
          <div className="space-y-6 py-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-medium">Optimizing Products...</h3>
              <p className="text-sm text-muted-foreground">
                Processing {processedCount} of {selectedProducts.length} products
              </p>
              {currentProduct && (
                <p className="text-sm text-muted-foreground mt-2">
                  Current: {currentProduct}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        ) : (
          // Configuration State
          <div className="space-y-6">
            {/* Selected Products Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Selected Products ({selectedProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {selectedProducts.slice(0, 10).map((product) => (
                      <div key={product.id} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1">{product.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.type || 'No type'}
                        </Badge>
                      </div>
                    ))}
                    {selectedProducts.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        ... and {selectedProducts.length - 10} more products
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Fields to Optimize */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Fields to Optimize ({selectedFieldsCount} selected)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedFields).map(([field, checked]) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field}
                        checked={checked}
                        onCheckedChange={() => toggleField(field as keyof typeof selectedFields)}
                      />
                      <Label htmlFor={field} className="text-sm font-medium">
                        {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Patterns */}
            {approvedPatterns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Apply Learning Patterns ({selectedPatterns.length} selected)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    These patterns have been learned from your previous edits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {approvedPatterns.map((pattern) => (
                      <div key={pattern.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={pattern.id}
                          checked={selectedPatterns.includes(pattern.id)}
                          onCheckedChange={() => togglePattern(pattern.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor={pattern.id} className="text-sm font-medium">
                            {pattern.pattern_type}
                          </Label>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {Math.round((pattern.confidence_score || 0) * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="batchSize" className="text-sm font-medium">
                      Batch Size
                    </Label>
                    <Select value={batchSize} onValueChange={setBatchSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 products (slower, safer)</SelectItem>
                        <SelectItem value="5">5 products (recommended)</SelectItem>
                        <SelectItem value="10">10 products (faster, higher risk)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="useDirectAI"
                      checked={useDirectAI}
                      onCheckedChange={(checked) => setUseDirectAI(checked as boolean)}
                    />
                    <Label htmlFor="useDirectAI" className="text-sm">
                      Use Direct AI (bypass patterns)
                    </Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="customPrompt" className="text-sm font-medium">
                    Custom Optimization Prompt (Optional)
                  </Label>
                  <Textarea
                    id="customPrompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Add specific instructions for the AI optimization..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between gap-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkOptimization}
                disabled={selectedFieldsCount === 0}
                className="min-w-32"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Optimization
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};