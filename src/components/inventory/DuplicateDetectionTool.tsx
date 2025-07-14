import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle, Copy, Trash2, Edit3, Eye } from 'lucide-react';

interface Product {
  id: string;
  handle: string;
  title: string;
  body_html: string | null;
  variant_sku: string | null;
  vendor: string | null;
  type: string | null;
  created_at: string;
}

interface DuplicateGroup {
  id: string;
  products: Product[];
  similarity: number;
  reason: string;
}

export function DuplicateDetectionTool() {
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Calculate similarity between two strings
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const detectDuplicates = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const groups: DuplicateGroup[] = [];
      const processed = new Set<string>();

      products?.forEach((product, index) => {
        if (processed.has(product.id)) return;

        const duplicates = [product];
        
        products.slice(index + 1).forEach(otherProduct => {
          if (processed.has(otherProduct.id)) return;

          const titleSimilarity = calculateSimilarity(
            product.title.toLowerCase(),
            otherProduct.title.toLowerCase()
          );

          let reason = '';
          let similarity = 0;

          if (titleSimilarity > 0.8) {
            reason = 'Similar titles';
            similarity = titleSimilarity;
          } else if (product.variant_sku && otherProduct.variant_sku && 
                    product.variant_sku === otherProduct.variant_sku) {
            reason = 'Identical SKU';
            similarity = 1.0;
          } else if (product.body_html && otherProduct.body_html) {
            const descSimilarity = calculateSimilarity(
              product.body_html.toLowerCase(),
              otherProduct.body_html.toLowerCase()
            );
            if (descSimilarity > 0.7) {
              reason = 'Similar descriptions';
              similarity = descSimilarity;
            }
          }

          if (similarity > 0.7) {
            duplicates.push(otherProduct);
            processed.add(otherProduct.id);
          }
        });

        if (duplicates.length > 1) {
          const groupReason = duplicates.length > 2 ? 'Multiple matches' : 
            duplicates.slice(1).map(dup => {
              const titleSim = calculateSimilarity(product.title.toLowerCase(), dup.title.toLowerCase());
              if (titleSim > 0.8) return 'Similar titles';
              if (product.variant_sku && dup.variant_sku && product.variant_sku === dup.variant_sku) return 'Identical SKU';
              return 'Similar descriptions';
            })[0] || 'Similar content';

          groups.push({
            id: `group-${index}`,
            products: duplicates,
            similarity: Math.max(...duplicates.slice(1).map(dup => 
              calculateSimilarity(product.title.toLowerCase(), dup.title.toLowerCase())
            )),
            reason: groupReason
          });
          duplicates.forEach(p => processed.add(p.id));
        }
      });

      setDuplicateGroups(groups);
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      toast({
        title: 'Error',
        description: 'Failed to detect duplicates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMergeProducts = async (products: Product[]) => {
    if (!user || products.length < 2) return;

    try {
      // Keep the first product and delete others
      const masterProduct = products[0];
      const toDelete = products.slice(1);

      for (const product of toDelete) {
        await supabase
          .from('products')
          .delete()
          .eq('id', product.id)
          .eq('user_id', user.id);
      }

      toast({
        title: 'Products merged',
        description: `Merged ${toDelete.length} duplicate products into ${masterProduct.title}`
      });

      // Refresh the duplicate detection
      detectDuplicates();
    } catch (error) {
      console.error('Error merging products:', error);
      toast({
        title: 'Error',
        description: 'Failed to merge products',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      toast({
        title: 'Product deleted',
        description: 'Product has been removed successfully'
      });

      detectDuplicates();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    detectDuplicates();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-muted-foreground">Crunching your data… just a sec ☕</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Duplicate Detection Tool
          </CardTitle>
        </CardHeader>
        <CardContent>
          {duplicateGroups.length === 0 ? (
            <Alert>
              <AlertDescription>
                Great news! No potential duplicates found in your inventory. 🎉
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Found {duplicateGroups.length} potential duplicate groups. 
                <span className="block mt-1 text-xs">
                  💡 Hover over each group to see how we're identifying duplicates.
                </span>
              </p>
              
              {duplicateGroups.map((group) => (
                <Card key={group.id} className="border-warning/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {group.products.length} products
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(group.similarity * 100)}% similar - {group.reason}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedGroup(group)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Compare
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Product Comparison</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {selectedGroup?.products.map((product, index) => (
                                <Card key={product.id} className={index === 0 ? "border-primary" : ""}>
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-sm">
                                        {index === 0 ? "Master Product" : `Duplicate ${index}`}
                                      </CardTitle>
                                      {index > 0 && (
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteProduct(product.id)}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                          <Button size="sm" variant="outline">
                                            <Edit3 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div>
                                      <p className="font-medium text-sm">{product.title}</p>
                                      <p className="text-xs text-muted-foreground">SKU: {product.variant_sku || 'N/A'}</p>
                                      <p className="text-xs text-muted-foreground">Vendor: {product.vendor || 'N/A'}</p>
                                    </div>
                                    {product.body_html && (
                                      <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
                                        <div dangerouslySetInnerHTML={{ __html: product.body_html.substring(0, 200) + '...' }} />
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                            <div className="flex justify-between pt-4">
                              <Button
                                onClick={() => handleMergeProducts(selectedGroup?.products || [])}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Merge Products
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          onClick={() => handleMergeProducts(group.products)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Merge
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {group.products.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <p className="font-medium text-sm">{product.title}</p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.variant_sku || 'N/A'} • Created: {new Date(product.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {index > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
