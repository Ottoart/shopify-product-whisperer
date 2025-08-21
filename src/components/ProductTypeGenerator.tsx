import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Check, X, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
interface ProductTypeChange {
  id: string;
  title: string;
  currentType: string;
  suggestedType: string;
}
interface ProductTypeGeneratorProps {
  products: Product[];
  selectedProducts: Set<string>;
  onProductsUpdated: () => void;
}
export const ProductTypeGenerator = ({
  products,
  selectedProducts,
  onProductsUpdated
}: ProductTypeGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedChanges, setSuggestedChanges] = useState<ProductTypeChange[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const {
    toast
  } = useToast();
  const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
  const generateProductTypes = async () => {
    if (selectedProductsList.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products first.",
        variant: "destructive"
      });
      return;
    }
    setIsGenerating(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('ai-generate-product-types', {
        body: {
          products: selectedProductsList
        }
      });
      if (error) throw error;
      const changes: ProductTypeChange[] = selectedProductsList.map(product => {
        const suggestion = data.productTypes.find((pt: any) => pt.id === product.id);
        return {
          id: product.id,
          title: product.title,
          currentType: product.type || 'No type',
          suggestedType: suggestion?.suggestedType || product.type || 'No type'
        };
      });
      setSuggestedChanges(changes);
      toast({
        title: "Product Types Generated",
        description: `Generated types for ${changes.length} products.`
      });
    } catch (error) {
      console.error('Error generating product types:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate product types. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const applyChanges = async () => {
    setIsApplying(true);
    try {
      for (const change of suggestedChanges) {
        const {
          error
        } = await supabase.from('products').update({
          type: change.suggestedType
        }).eq('handle', change.id);
        if (error) throw error;
      }
      toast({
        title: "Changes Applied",
        description: `Updated ${suggestedChanges.length} product types.`
      });
      setSuggestedChanges([]);
      onProductsUpdated();
    } catch (error) {
      console.error('Error applying changes:', error);
      toast({
        title: "Update Failed",
        description: "Failed to apply changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };
  const discardChanges = () => {
    setSuggestedChanges([]);
    toast({
      title: "Changes Discarded",
      description: "All suggested changes have been discarded."
    });
  };
  if (suggestedChanges.length > 0) {
    return <Card className="border-0 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Product Type Changes Preview
          </CardTitle>
          <CardDescription>
            Review the suggested product type changes before applying them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-3">
            {suggestedChanges.map(change => <div key={change.id} className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium text-sm truncate">{change.title}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{change.currentType}</Badge>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="secondary">{change.suggestedType}</Badge>
                </div>
              </div>)}
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyChanges} disabled={isApplying} className="bg-gradient-primary">
              {isApplying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Apply Changes
            </Button>
            <Button variant="outline" onClick={discardChanges} disabled={isApplying}>
              <X className="h-4 w-4 mr-2" />
              Discard
            </Button>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="border-0 shadow-card">
      
      
    </Card>;
};