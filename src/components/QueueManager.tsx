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
  const [processingDelay, setProcessingDelay] = useState(15000);
  const [useDirectAI, setUseDirectAI] = useState(true);
  const [customPromptTemplate, setCustomPromptTemplate] = useState(`You are a product listing generator for Shopify, specializing in hair and nail care products. Your job is to create high-converting, SEO-optimized product descriptions that follow a strict structure. You must write all content in plain text — no HTML, emojis, or formatting tags. Just highlight important information and section titles in bold. Structure and clarity are essential.

Product Title
{title}

Product Type
{type}

Product Description
{description}
Includes:

How to Use the Product?
{how_to_use}

Key Features of the Product:
{key_features}

Who Should Use This Product & Hair Concerns It Can Address?
{who_should_use_and_concerns}

Why Should You Use This Product & Benefits?
{why_use_and_benefits}

Tags
{tags}

Tag Guidelines to Follow When Populating {tags}:
Brand Tags
Prefix: Brand_
Examples: Brand_Kérastase, Brand_OPI

Hair Type Tags
Hair Type_All Hair Types, Hair Type_Curly Hair, Hair Type_Straight Hair, Hair Type_Wavy Hair, Hair Type_Coily Hair, Hair Type_Fine Hair, Hair Type_Thick Hair, Hair Type_Damaged Hair, Hair Type_Color Treated Hair, Hair Type_Sensitive Scalp, Hair Type_Oily Hair, Hair Type_Dry Hair

Nail Type Tags
Nail Type_All Nail Types, Nail Type_Short Nails, Nail Type_Long Nails, Nail Type_Natural Nails, Nail Type_Brittle Nails, Nail Type_Damaged Nails, Nail Type_Weak Nails, Nail Type_Splitting Nails, Nail Type_Rounded Nails, Nail Type_Square Nails, Nail Type_Squoval Nails, Nail Type_Almond Nails, Nail Type_Coffin Nails, Nail Type_Stiletto Nails

Benefits Tags
For Hair:
Benefits_Hydrating, Benefits_Moisturizing, Benefits_Strengthening, Benefits_Color Protection, Benefits_Heat Protection, Benefits_Shine Enhancing, Benefits_Volume Boosting, Benefits_Smoothing, Benefits_Anti-Frizz, Benefits_Repair, Benefits_Nourishing, Benefits_Scalp Soothing, Benefits_Scalp Detox, Benefits_Exfoliating
For Nails:
Benefits_Long-Lasting, Benefits_Chip-Resistant, Benefits_Fast-Drying, Benefits_Strengthening, Benefits_High Shine, Benefits_Easy Removal, Benefits_Reinforcing, Benefits_Hydrating, Benefits_Nail Growth, Benefits_Nourishing, Benefits_Reusable, Benefits_Vegan, Benefits_Eco-Friendly, Benefits_No UV Required, Benefits_Salon Quality

Ingredients Tags
Ingredients_Argan Oil, Ingredients_Keratin, Ingredients_Sulfate-Free, Ingredients_Paraben-Free, Ingredients_Natural, Ingredients_Organic, Ingredients_Vegan, Ingredients_Silicone-Free, Ingredients_Mineral Oil-Free, Ingredients_Glycolic Acid, Ingredients_Fermented Tea, Ingredients_Colorant-Free, Ingredients_Cruelty-Free, Ingredients_Tea Tree Oil, Ingredients_Biotin, Ingredients_Vitamin E, Ingredients_Silk Proteins, Ingredients_AHA, Ingredients_Calcium, Ingredients_Formaldehyde-Free, Ingredients_Toluene-Free, Ingredients_DBP-Free

Desired Effect Tags
For Hair:
Desired Effect_Smooth Hair, Desired Effect_Shiny Hair, Desired Effect_Soft Hair, Desired Effect_Manageable Hair, Desired Effect_Healthy Hair, Desired Effect_Scalp Relief, Desired Effect_Healthy Scalp, Desired Effect_Balanced Scalp
For Nails:
Desired Effect_Strong Nails, Desired Effect_Smooth Nails, Desired Effect_Glossy Finish, Desired Effect_Matte Look, Desired Effect_Salon-Quality Manicure, Desired Effect_Sophisticated Nails, Desired Effect_Brilliant Shine, Desired Effect_Perfect Shape, Desired Effect_Glamorous Look

Concern Tags
For Hair:
Concern_Dry Hair, Concern_Damaged Hair, Concern_Frizz, Concern_Dull Hair, Concern_Brittle Hair, Concern_Split Ends, Concern_Hair Loss, Concern_Sensitive Scalp, Concern_Scalp Buildup, Concern_Oily Scalp, Concern_Dry Scalp, Concern_Dandruff
For Nails:
Concern_Chipping, Concern_Brittle Nails, Concern_Weak Nails, Concern_Splitting Nails, Concern_Slow Nail Growth, Concern_Yellowing, Concern_Staining, Concern_Dullness, Concern_Nail Damage

Finish Tags (for Nail Products)
Finish_Crème, Finish_Shimmer, Finish_Metallic, Finish_Gel-Like, Finish_Matte, Finish_Glossy, Finish_Sheer, Finish_Opaque, Finish_Holographic, Finish_Chrome, Finish_Frosted, Finish_Iridescent, Finish_Glitter

Color Tags (for Nail Products)
Color_Pink, Color_Red, Color_Nude, Color_Black, Color_White, Color_Blue, Color_Purple, Color_Green, Color_Yellow, Color_Orange, Color_Brown, Color_Gold, Color_Silver, Color_Coral, Color_Grey, Color_Taupe

Usage Tags
Usage_Daily Use, Usage_Weekly Treatment, Usage_Professional, Usage_Salon Quality, Usage_Daily Wear, Usage_Special Occasions, Usage_Everyday Wear, Usage_At-Home Manicure, Usage_Travel-Friendly, Usage_Party Ready, Usage_Wedding, Usage_Summer Look, Usage_Winter Collection`);
  const [currentProcessing, setCurrentProcessing] = useState<{
    productId: string;
    step: string;
    progress: number;
  } | null>(null);
  const { toast } = useToast();

  const completedCount = queueItems.filter(item => item.status === 'completed').length;
  const errorCount = queueItems.filter(item => item.status === 'error').length;
  const progress = queueItems.length > 0 ? (completedCount / queueItems.length) * 100 : 0;

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

        // Step 3: Update local database
        setCurrentProcessing({
          productId: item.productId,
          step: `Processing ${i + 1}/${pendingItems.length}: GPT completed! Updating database...`,
          progress: 70
        });

        const updatedProduct: UpdatedProduct = {
          title: data.optimizedData.title,
          type: product.type,
          description: data.optimizedData.description,
          tags: data.optimizedData.tags
        };

        onUpdateProduct(item.productId, updatedProduct);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for DB update

        // Step 4: Export to Shopify (optional)
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
                type: product.type,
                tags: data.optimizedData.tags
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

        // Step 5: Complete
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
    </div>
  );
};