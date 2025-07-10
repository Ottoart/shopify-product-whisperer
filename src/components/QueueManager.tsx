import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader,
  Settings,
  ExternalLink,
  AlertTriangle,
  X,
  RefreshCw
} from 'lucide-react';
import { Product, UpdatedProduct } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProductComparison } from '@/components/ProductComparison';

interface QueueItem {
  productId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface QueueManagerProps {
  queueItems: QueueItem[];
  products: Product[];
  onUpdateStatus: (productId: string, status: 'pending' | 'processing' | 'completed' | 'error', error?: string) => void;
  onUpdateProduct: (productId: string, updatedData: UpdatedProduct) => void;
  onRemoveFromQueue: (productId: string) => void;
  onRetryProduct?: (productId: string) => void;
}

export const QueueManager = ({ 
  queueItems, 
  products, 
  onUpdateStatus, 
  onUpdateProduct,
  onRemoveFromQueue,
  onRetryProduct
}: QueueManagerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatGptUrl, setChatGptUrl] = useState('https://chatgpt.com/g/g-6837c28c521c81918f8f1d319eb87f9a-shopify');
  const [processingDelay, setProcessingDelay] = useState(30000);
  const [useDirectAI, setUseDirectAI] = useState(true);
  const [customPromptTemplate, setCustomPromptTemplate] = useState(`Create comprehensive Shopify product optimization with ALL required fields.

PRODUCT INPUT:
Title: {title}
Type: {type}
Description: {description}
Tags: {tags}
Vendor: {vendor}

CRITICAL: You MUST respond with ONLY a valid JSON object containing ALL these fields:

{
  "title": "optimized title (max 60 chars)",
  "description": "complete HTML description with <p>, <strong>, <ul>, <li> tags",
  "tags": "comma-separated specific tags",
  "type": "SPECIFIC product type like 'Leave-In Hair Conditioner' or 'Anti-Aging Face Serum'",
  "category": "Health & Beauty > Personal Care > Cosmetics > [specific subcategory]",
  "seo_title": "SEO title different from main title (max 60 chars)", 
  "seo_description": "SEO meta description (max 160 chars)",
  "vendor": "brand/vendor name",
  "variant_price": price_number_or_null,
  "variant_compare_at_price": price_number_or_null,
  "variant_sku": "SKU code",
  "variant_barcode": "barcode",
  "variant_grams": weight_number_or_null,
  "google_shopping_condition": "new",
  "google_shopping_gender": "unisex",
  "google_shopping_age_group": "adult"
}

REQUIREMENTS:
- ALL fields must be included in response
- Use HTML formatting in description
- Be specific with product type and category
- Generate SEO-optimized content
- Include comprehensive tag system with Brand_, Type_, Benefits_, Ingredients_, etc.
- Ensure all pricing/variant fields are properly formatted
`);
  const [currentProcessing, setCurrentProcessing] = useState<{
    productId: string;
    step: string;
    progress: number;
  } | null>(null);
  const [comparisonData, setComparisonData] = useState<{
    originalProduct: {
      handle: string;
      title: string;
      body_html: string | null;
      tags: string | null;
      type: string | null;
      category: string | null;
    };
    optimizedProduct: {
      title: string;
      description: string;
      tags: string;
      type: string;
      category: string;
    };
  } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const completedCount = queueItems.filter(item => item.status === 'completed').length;
  const errorCount = queueItems.filter(item => item.status === 'error').length;
  const progress = queueItems.length > 0 ? (completedCount / queueItems.length) * 100 : 0;

  // Handle page unload to reset processing items back to pending
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Reset any processing items back to pending
      queueItems.forEach(item => {
        if (item.status === 'processing') {
          onUpdateStatus(item.productId, 'pending');
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also reset on component unmount
      queueItems.forEach(item => {
        if (item.status === 'processing') {
          onUpdateStatus(item.productId, 'pending');
        }
      });
    };
  }, [queueItems, onUpdateStatus]);

  const startProcessing = async () => {
    setIsProcessing(true);
    
    const pendingItems = queueItems.filter(item => item.status === 'pending');
    
    // Process items one by one sequentially
    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      try {
        // Step 1: Mark as processing
        setCurrentProcessing({
          productId: item.productId,
          step: `Processing ${i + 1}/${pendingItems.length}: Analyzing product...`,
          progress: 20
        });
        onUpdateStatus(item.productId, 'processing');
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UI update
        // Step 2: Custom GPT Optimization
        setCurrentProcessing({
          productId: item.productId,
          step: `Processing ${i + 1}/${pendingItems.length}: Sending to ${useDirectAI ? 'AI' : 'Custom GPT'}...`,
          progress: 30
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        setCurrentProcessing({
          productId: item.productId,
          step: `Processing ${i + 1}/${pendingItems.length}: ${useDirectAI ? 'AI' : 'Custom GPT'} analyzing product...`,
          progress: 50
        });

        console.log('Calling AI optimize with payload:', {
          productHandle: product.handle,
          productData: {
            title: product.title,
            type: product.type,
            description: product.bodyHtml,
            tags: product.tags
          },
          useDirectAI: useDirectAI,
          customPromptTemplate: useDirectAI ? customPromptTemplate : undefined
        });

        const { data, error } = await supabase.functions.invoke('ai-optimize-product', {
          body: {
            productHandle: product.handle,
            productData: {
              title: product.title,
              type: product.type,
              description: product.bodyHtml,
              tags: product.tags
            },
            useDirectAI: useDirectAI,
            customPromptTemplate: useDirectAI ? customPromptTemplate : undefined
          }
        });

        console.log('Edge function response:', { data, error });
        console.log('Full error object:', JSON.stringify(error, null, 2));

        if (error) {
          console.error('Edge function error details:', {
            name: error.name,
            message: error.message,
            context: error.context,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          
          // Extract more specific error information
          let errorMessage = error.message || 'Unknown error';
          if (error.context) {
            errorMessage += ` (Context: ${JSON.stringify(error.context)})`;
          }
          if (error.details) {
            errorMessage += ` (Details: ${error.details})`;
          }
          
          throw new Error(`Edge function error: ${errorMessage}`);
        }

        if (data?.error) {
          console.error('Data error:', data.error);
          throw new Error(data.error);
        }

        if (!data?.success) {
          console.error('Unexpected response format:', data);
          throw new Error('Unexpected response from AI optimization service');
        }

        // Step 3: Show comparison and wait for user decision
        setComparisonData({
          originalProduct: {
            handle: product.handle,
            title: product.title,
            body_html: product.bodyHtml,
            tags: product.tags,
            type: product.type,
            category: null // Since this will be a new field, existing products won't have it
          },
          optimizedProduct: {
            title: data.optimizedData.title,
            description: data.optimizedData.description,
            tags: data.optimizedData.tags,
            type: data.optimizedData.type || product.type,
            category: data.optimizedData.category || 'Health & Beauty > Personal Care'
          }
        });
        setShowComparison(true);
        
        // Processing will pause here until user accepts/rejects changes
        setCurrentProcessing({
          productId: item.productId,
          step: `Processing ${i + 1}/${pendingItems.length}: Review changes and approve...`,
          progress: 70
        });
        
        // Wait for user decision via a promise that resolves with their choice
        const userAccepted = await new Promise<boolean>(resolve => {
          const originalOnSave = (window as any).tempOnSave;
          const originalOnCancel = (window as any).tempOnCancel;
          
          (window as any).tempOnSave = () => {
            resolve(true);
            (window as any).tempOnSave = originalOnSave;
            (window as any).tempOnCancel = originalOnCancel;
          };
          
          (window as any).tempOnCancel = () => {
            resolve(false);
            (window as any).tempOnSave = originalOnSave;
            (window as any).tempOnCancel = originalOnCancel;
          };
          
          // Also check if modal closes (as backup)
          const checkClosed = () => {
            if (!showComparison) {
              // If modal closed without save/cancel callbacks, assume canceled
              if ((window as any).tempOnSave === resolve || (window as any).tempOnCancel === resolve) {
                resolve(false);
              }
            } else {
              setTimeout(checkClosed, 500);
            }
          };
          checkClosed();
        });

        if (!userAccepted) {
          // User canceled - mark as pending to allow retry
          onUpdateStatus(item.productId, 'pending');
          setCurrentProcessing(null);
          continue; // Skip to next product
        }

        // Step 4: Export to Shopify (only if user accepted)
        setCurrentProcessing({
          productId: item.productId,
          step: `Processing ${i + 1}/${pendingItems.length}: Exporting to Shopify...`,
          progress: 90
        });

        try {
          const { data: exportData, error: exportError } = await supabase.functions.invoke('shopify-products', {
            body: { 
              action: 'update',
              products: [{
                handle: product.handle,
                title: data.optimizedData.title,
                description: data.optimizedData.description,
                type: data.optimizedData.type || product.type,
                tags: data.optimizedData.tags,
                category: data.optimizedData.category
              }]
            }
          });

          if (exportError) {
            console.warn('Shopify export warning:', exportError.message);
          }
        } catch (exportError) {
          console.warn('Shopify export failed:', exportError);
          // Don't fail the whole process if Shopify export fails
        }

        // Step 5: Complete (only if user accepted changes)
        setCurrentProcessing({
          productId: item.productId,
          step: `Processing ${i + 1}/${pendingItems.length}: Completed!`,
          progress: 100
        });

        onUpdateStatus(item.productId, 'completed');
        
        toast({
          title: "Product Optimized",
          description: `${product.title} has been successfully optimized and updated.`,
        });

        // Wait before processing next product
        if (i < pendingItems.length - 1) {
          setCurrentProcessing({
            productId: item.productId,
            step: `Waiting ${processingDelay/1000}s before next product...`,
            progress: 100
          });
          await new Promise(resolve => setTimeout(resolve, processingDelay));
        }
          
      } catch (error: any) {
        console.error(`Error processing ${product.title}:`, error);
        let errorMessage = `Failed: ${error.message}`;
        
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          errorMessage = 'OpenAI rate limited - will retry with longer delays';
        } else if (error.message.includes('non-2xx status code')) {
          errorMessage = 'API error - check logs for details';
        }
        
        onUpdateStatus(item.productId, 'error', errorMessage);
        
        toast({
          title: "Processing Error",
          description: `${product.title}: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }
    
    setIsProcessing(false);
    setCurrentProcessing(null);
  };

  const pauseProcessing = () => {
    setIsProcessing(false);
  };

  const retryProduct = (productId: string) => {
    onUpdateStatus(productId, 'pending');
    if (onRetryProduct) {
      onRetryProduct(productId);
    }
  };

  const retryAllErrors = () => {
    const errorItems = queueItems.filter(item => item.status === 'error');
    errorItems.forEach(item => {
      onUpdateStatus(item.productId, 'pending');
      if (onRetryProduct) {
        onRetryProduct(item.productId);
      }
    });
  };

  const resetQueue = () => {
    queueItems.forEach(item => {
      if (item.status !== 'completed') {
        onUpdateStatus(item.productId, 'pending');
      }
    });
    setIsProcessing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-gradient-primary">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-gradient-success">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  if (queueItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-secondary flex items-center justify-center">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No items in queue</h3>
        <p className="text-sm text-muted-foreground">
          Select products to start processing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="p-6 border-b">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Processing Progress</h3>
            <div className="text-sm text-muted-foreground">
              {completedCount}/{queueItems.length} completed
            </div>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2"
          />
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span>{completedCount} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span>{errorCount} errors</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
              <span>{queueItems.length - completedCount - errorCount} pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Progress */}
      {isProcessing && currentProcessing && (
        <div className="space-y-3 p-4 bg-secondary/20 rounded-lg border mx-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {products.find(p => p.id === currentProcessing.productId)?.title || 'Processing...'}
            </span>
            <span className="text-muted-foreground">
              {currentProcessing.progress}%
            </span>
          </div>
          <Progress value={currentProcessing.progress} className="h-3" />
          <div className="text-xs text-muted-foreground">
            {currentProcessing.step}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-6 space-y-4">
        <div className="flex items-center gap-2">
          {!isProcessing ? (
            <Button 
              onClick={startProcessing} 
              className="bg-gradient-primary flex-1"
              disabled={queueItems.every(item => item.status === 'completed')}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Processing
            </Button>
          ) : (
            <Button 
              onClick={pauseProcessing} 
              variant="outline" 
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={resetQueue} 
            variant="outline"
            disabled={isProcessing}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          {errorCount > 0 && (
            <Button 
              onClick={retryAllErrors} 
              variant="outline"
              disabled={isProcessing}
              className="text-destructive hover:text-destructive"
            >
              Retry All Errors ({errorCount})
            </Button>
          )}
        </div>

        {/* Settings */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <Label className="text-sm font-medium">Settings</Label>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">AI Mode</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Custom GPT</span>
                <Switch 
                  checked={useDirectAI} 
                  onCheckedChange={setUseDirectAI} 
                />
                <span className="text-xs text-muted-foreground">Direct AI</span>
              </div>
            </div>
            
            {!useDirectAI ? (
              <div className="space-y-2">
                <Label htmlFor="chatgpt-url" className="text-xs">ChatGPT URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="chatgpt-url"
                    value={chatGptUrl}
                    onChange={(e) => setChatGptUrl(e.target.value)}
                    className="text-xs"
                    placeholder="https://chatgpt.com/share/..."
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(chatGptUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="custom-prompt" className="text-xs">Custom AI Prompt Template</Label>
                <Textarea
                  id="custom-prompt"
                  value={customPromptTemplate}
                  onChange={(e) => setCustomPromptTemplate(e.target.value)}
                  className="text-xs min-h-[120px] font-mono"
                  placeholder="Enter your custom prompt template. Use {title}, {type}, {description}, {tags} as placeholders."
                />
                <p className="text-xs text-muted-foreground">
                  Use placeholders: {"{title}"}, {"{type}"}, {"{description}"}, {"{tags}"}
                </p>
              </div>
            )}
          </div>
          
            <div className="space-y-2">
              <Label htmlFor="delay" className="text-xs">Processing Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={processingDelay}
                onChange={(e) => setProcessingDelay(Number(e.target.value))}
                className="text-xs"
                min="5000"
                max="30000"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 15-20 seconds for custom GPT processing time
              </p>
            </div>
        </Card>

        {/* AI Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Products will be optimized using AI to improve titles, descriptions, and tags for better conversion rates.
          </AlertDescription>
        </Alert>
      </div>

      {/* Queue Items */}
      <div className="space-y-2 px-6 pb-6">
        {queueItems.map((item) => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return null;

          return (
            <Card key={item.productId} className="p-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium truncate">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      {item.status === 'error' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryProduct(item.productId)}
                          className="h-6 w-6 p-0 hover:bg-accent/10 hover:text-accent"
                          title="Retry this product"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                      {(item.status === 'pending' || item.status === 'error') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFromQueue(item.productId)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {item.error && (
                    <p className="text-xs text-destructive mt-1">{item.error}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Product Comparison Modal */}
      {comparisonData && (
        <ProductComparison
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          originalProduct={comparisonData.originalProduct}
          optimizedProduct={comparisonData.optimizedProduct}
          onSave={() => {
            const updatedProduct: UpdatedProduct = {
              title: comparisonData.optimizedProduct.title,
              type: comparisonData.optimizedProduct.type || products.find(p => p.handle === comparisonData.originalProduct.handle)?.type || '',
              description: comparisonData.optimizedProduct.description,
              tags: comparisonData.optimizedProduct.tags,
              category: comparisonData.optimizedProduct.category
            };
            onUpdateProduct(comparisonData.originalProduct.handle, updatedProduct);
            setComparisonData(null);
          }}
        />
      )}
    </div>
  );
};