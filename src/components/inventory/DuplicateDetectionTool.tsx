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
  const [progress, setProgress] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<DuplicateGroup | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fast similarity calculation using word overlap
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;
    
    const words1 = str1.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const words2 = str2.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    const commonWords = words1.filter(word => words2.includes(word));
    return (commonWords.length * 2) / (words1.length + words2.length);
  };

  // Quick exact match checks
  const hasExactMatch = (product1: Product, product2: Product): { match: boolean; reason: string; similarity: number } => {
    // Exact SKU match (highest priority)
    if (product1.variant_sku && product2.variant_sku && 
        product1.variant_sku.toLowerCase() === product2.variant_sku.toLowerCase()) {
      return { match: true, reason: 'Identical SKU', similarity: 1.0 };
    }
    
    // Exact title match
    if (product1.title.toLowerCase() === product2.title.toLowerCase()) {
      return { match: true, reason: 'Identical title', similarity: 1.0 };
    }
    
    return { match: false, reason: '', similarity: 0 };
  };

  const detectDuplicates = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setProgress(0);
      
      // Limit to manageable batch size
      const BATCH_SIZE = 500;
      const { data: products, error } = await supabase
        .from('products')
        .select('id, handle, title, body_html, variant_sku, vendor, type, created_at')
        .eq('user_id', user.id)
        .limit(BATCH_SIZE);

      if (error) throw error;
      if (!products || products.length === 0) {
        setDuplicateGroups([]);
        return;
      }

      setTotalProducts(products.length);
      const groups: DuplicateGroup[] = [];
      const processed = new Set<string>();

      // Process in smaller chunks to prevent browser hanging
      const processChunk = (startIndex: number, endIndex: number) => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            for (let i = startIndex; i < Math.min(endIndex, products.length); i++) {
              const product = products[i];
              if (processed.has(product.id)) continue;

              const duplicates = [product];
              
              // Only check against remaining products (not all)
              for (let j = i + 1; j < products.length; j++) {
                const otherProduct = products[j];
                if (processed.has(otherProduct.id)) continue;

                // Quick exact match check first
                const exactMatch = hasExactMatch(product, otherProduct);
                if (exactMatch.match) {
                  duplicates.push(otherProduct);
                  processed.add(otherProduct.id);
                  continue;
                }

                // Only do similarity check if no exact match and reasonable similarity threshold
                const titleSimilarity = calculateSimilarity(product.title, otherProduct.title);
                if (titleSimilarity > 0.85) { // Increased threshold for performance
                  duplicates.push(otherProduct);
                  processed.add(otherProduct.id);
                }
              }

              if (duplicates.length > 1) {
                const similarity = duplicates.length > 2 ? 1.0 : 
                  Math.max(...duplicates.slice(1).map(dup => {
                    const exact = hasExactMatch(product, dup);
                    return exact.match ? exact.similarity : calculateSimilarity(product.title, dup.title);
                  }));

                const reason = duplicates.some(dup => hasExactMatch(product, dup).match) 
                  ? hasExactMatch(product, duplicates[1]).reason
                  : 'Similar titles';

                groups.push({
                  id: `group-${i}`,
                  products: duplicates,
                  similarity,
                  reason
                });
                duplicates.forEach(p => processed.add(p.id));
              }
            }
            
            setProgress(Math.round((endIndex / products.length) * 100));
            resolve();
          }, 0);
        });
      };

      // Process in chunks of 50 to prevent blocking
      const CHUNK_SIZE = 50;
      for (let i = 0; i < products.length; i += CHUNK_SIZE) {
        await processChunk(i, i + CHUNK_SIZE);
      }

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
      setProgress(0);
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-muted-foreground">Analyzing {totalProducts} products for duplicates… ☕</span>
            </div>
            {progress > 0 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
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
