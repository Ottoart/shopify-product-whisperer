import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, Package, Zap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Product, UpdatedProduct } from "@/pages/Index";
import { ProductComparison } from "@/components/ProductComparison";

interface SingleProductProcessorProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: (productId: string, updatedData: UpdatedProduct) => void;
  useDirectAI?: boolean;
  customPromptTemplate?: string;
}

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
}

export function SingleProductProcessor({
  product,
  isOpen,
  onClose,
  onProductUpdated,
  useDirectAI = false,
  customPromptTemplate = ''
}: SingleProductProcessorProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: 'analyze', label: 'Analyzing product data', status: 'pending', progress: 0 },
    { id: 'optimize', label: 'AI optimization in progress', status: 'pending', progress: 0 },
    { id: 'review', label: 'Ready for review', status: 'pending', progress: 0 },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const updateStepStatus = (stepIndex: number, status: ProcessingStep['status'], progress: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, progress } : step
    ));
  };

  const startProcessing = async () => {
    if (!product) return;

    setIsProcessing(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Step 1: Analyze product
      setCurrentStep(0);
      updateStepStatus(0, 'processing', 50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(0, 'completed', 100);

      // Step 2: AI Optimization
      setCurrentStep(1);
      updateStepStatus(1, 'processing', 30);

      const { data, error } = await supabase.functions.invoke('ai-optimize-product', {
        body: {
          productHandle: product.handle,
          productData: {
            title: product.title,
            type: product.type,
            description: product.bodyHtml,
            tags: product.tags,
            vendor: product.vendor,
            seo_title: product.seoTitle,
            seo_description: product.seoDescription,
            published: product.published,
            variant_price: product.variantPrice,
            variant_compare_at_price: product.variantCompareAtPrice,
            variant_sku: product.variantSku,
            variant_barcode: product.variantBarcode,
            variant_grams: product.variantGrams,
            variant_inventory_qty: product.variantInventoryQty,
            variant_inventory_policy: product.variantInventoryPolicy,
            variant_requires_shipping: product.variantRequiresShipping,
            variant_taxable: product.variantTaxable,
            google_shopping_condition: product.googleShoppingCondition,
            google_shopping_gender: product.googleShoppingGender,
            google_shopping_age_group: product.googleShoppingAgeGroup,
            category: product.category
          },
          useDirectAI: useDirectAI,
          customPromptTemplate: useDirectAI ? customPromptTemplate : undefined
        }
      });

      updateStepStatus(1, 'processing', 80);

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'AI optimization failed');
      }

      updateStepStatus(1, 'completed', 100);
      setOptimizedData(data.optimizedData);

      // Step 3: Ready for review
      setCurrentStep(2);
      updateStepStatus(2, 'completed', 100);
      setShowComparison(true);

      toast({
        title: "Processing Complete",
        description: "Product optimization is ready for review.",
      });

    } catch (error: any) {
      setError(error.message);
      updateStepStatus(currentStep, 'error', 0);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process product.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSteps([
      { id: 'analyze', label: 'Analyzing product data', status: 'pending', progress: 0 },
      { id: 'optimize', label: 'AI optimization in progress', status: 'pending', progress: 0 },
      { id: 'review', label: 'Ready for review', status: 'pending', progress: 0 },
    ]);
    setCurrentStep(0);
    setIsProcessing(false);
    setError(null);
    setOptimizedData(null);
    setShowComparison(false);
    onClose();
  };

  const handleSaveOptimization = () => {
    if (!product || !optimizedData) return;

    const updatedData: UpdatedProduct = {
      title: optimizedData.title,
      type: optimizedData.type || product.type,
      description: optimizedData.description,
      tags: optimizedData.tags,
      category: optimizedData.category || 'Health & Beauty > Personal Care',
      vendor: optimizedData.vendor || product.vendor,
      seoTitle: optimizedData.seo_title || product.seoTitle,
      seoDescription: optimizedData.seo_description || product.seoDescription,
      published: optimizedData.published !== undefined ? optimizedData.published : product.published,
      variantPrice: optimizedData.variant_price || product.variantPrice,
      variantCompareAtPrice: optimizedData.variant_compare_at_price || product.variantCompareAtPrice,
      variantSku: optimizedData.variant_sku || product.variantSku,
      variantBarcode: optimizedData.variant_barcode || product.variantBarcode,
      variantGrams: optimizedData.variant_grams || product.variantGrams,
      variantInventoryQty: optimizedData.variant_inventory_qty || product.variantInventoryQty,
      variantInventoryPolicy: optimizedData.variant_inventory_policy || product.variantInventoryPolicy,
      variantRequiresShipping: optimizedData.variant_requires_shipping !== undefined ? optimizedData.variant_requires_shipping : product.variantRequiresShipping,
      variantTaxable: optimizedData.variant_taxable !== undefined ? optimizedData.variant_taxable : product.variantTaxable,
      googleShoppingCondition: optimizedData.google_shopping_condition || product.googleShoppingCondition,
      googleShoppingGender: optimizedData.google_shopping_gender || product.googleShoppingGender,
      googleShoppingAgeGroup: optimizedData.google_shopping_age_group || product.googleShoppingAgeGroup
    };

    onProductUpdated(product.handle, updatedData);
    handleClose();
  };

  const getStepIcon = (step: ProcessingStep) => {
    if (step.status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (step.status === 'error') return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (step.status === 'processing') return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
  };

  if (!product) return null;

  return (
    <>
      <Dialog open={isOpen && !showComparison} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <div>Processing Product</div>
                <div className="text-sm font-normal text-muted-foreground truncate">
                  {product.title}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              {product.imageSrc && (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  <img 
                    src={product.imageSrc} 
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{product.title}</div>
                <div className="text-xs text-muted-foreground">{product.vendor} • ${product.variantPrice}</div>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step)}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{step.label}</div>
                      {step.status === 'processing' && (
                        <div className="text-xs text-muted-foreground">Please wait...</div>
                      )}
                    </div>
                    <Badge variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'error' ? 'destructive' :
                      step.status === 'processing' ? 'secondary' : 'outline'
                    }>
                      {step.status === 'completed' ? 'Done' :
                       step.status === 'error' ? 'Error' :
                       step.status === 'processing' ? 'Processing' : 'Pending'}
                    </Badge>
                  </div>
                  {step.status === 'processing' && (
                    <Progress value={step.progress} className="h-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {!isProcessing && !optimizedData && (
                <Button onClick={startProcessing} className="bg-gradient-primary">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Processing
                </Button>
              )}
              {optimizedData && !isProcessing && (
                <Button onClick={() => setShowComparison(true)} className="bg-gradient-primary">
                  Review Changes
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Modal */}
      {showComparison && optimizedData && (
        <ProductComparison
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          originalProduct={{
            handle: product.handle,
            title: product.title,
            body_html: product.bodyHtml,
            tags: product.tags,
            type: product.type,
            category: product.category || null,
            vendor: product.vendor
          }}
          optimizedProduct={{
            title: optimizedData.title,
            description: optimizedData.description,
            tags: optimizedData.tags,
            type: optimizedData.type || product.type,
            category: optimizedData.category || 'Health & Beauty > Personal Care'
          }}
          onSave={handleSaveOptimization}
          onReprocess={async (productData) => {
            setShowComparison(false);
            // Reset and restart processing with new data
            setSteps([
              { id: 'analyze', label: 'Analyzing product data', status: 'pending', progress: 0 },
              { id: 'optimize', label: 'AI optimization in progress', status: 'pending', progress: 0 },
              { id: 'review', label: 'Ready for review', status: 'pending', progress: 0 },
            ]);
            setCurrentStep(0);
            setOptimizedData(null);
            await startProcessing();
          }}
        />
      )}
    </>
  );
}