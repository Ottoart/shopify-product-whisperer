import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ProductDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productHandle: string;
  productTitle: string;
}

interface Product {
  id: string;
  handle: string;
  title: string;
  vendor: string;
  type: string;
  tags: string;
  body_html: string;
  seo_title: string;
  seo_description: string;
  variant_price: number;
  variant_sku: string;
  variant_inventory_qty: number;
  published: boolean;
  image_src: string;
}

export function ProductDetailsDialog({ isOpen, onClose, productHandle, productTitle }: ProductDetailsDialogProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && productHandle) {
      fetchProductDetails();
    }
  }, [isOpen, productHandle]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // First try to find by handle
      let { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('handle', productHandle)
        .maybeSingle();

      if (error) throw error;
      
      // If no product found by handle, try to find by title match
      if (!data) {
        ({ data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('title', `%${productTitle}%`)
          .limit(1)
          .maybeSingle());
          
        if (error) throw error;
      }
      
      if (data) {
        setProduct(data);
      } else {
        toast({
          title: "Product not found",
          description: "Could not find product details",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!product) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: product.title,
          vendor: product.vendor,
          type: product.type,
          tags: product.tags,
          body_html: product.body_html,
          seo_title: product.seo_title,
          seo_description: product.seo_description,
          variant_price: product.variant_price,
          variant_sku: product.variant_sku,
          variant_inventory_qty: product.variant_inventory_qty,
          published: product.published,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully"
      });
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGoToProduct = () => {
    navigate(`/bulk-editor?search=${encodeURIComponent(productHandle)}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" aria-describedby="product-details-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Product Details
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoToProduct}
              className="ml-auto"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Go to Product
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div id="product-details-description" className="sr-only">
          Edit product information including title, price, inventory, and other details
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading product details...</div>
          </div>
        ) : product ? (
          <div className="space-y-4">
            {product.image_src && (
              <div className="flex justify-center mb-4">
                <img 
                  src={product.image_src} 
                  alt={product.title}
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={product.title}
                  onChange={(e) => setProduct({...product, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={product.vendor || ''}
                  onChange={(e) => setProduct({...product, vendor: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={product.type || ''}
                  onChange={(e) => setProduct({...product, type: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={product.variant_sku || ''}
                  onChange={(e) => setProduct({...product, variant_sku: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={product.variant_price || 0}
                  onChange={(e) => setProduct({...product, variant_price: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory</Label>
                <Input
                  id="inventory"
                  type="number"
                  value={product.variant_inventory_qty || 0}
                  onChange={(e) => setProduct({...product, variant_inventory_qty: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={product.tags || ''}
                onChange={(e) => setProduct({...product, tags: e.target.value})}
                placeholder="Comma separated tags"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_title">SEO Title</Label>
              <Input
                id="seo_title"
                value={product.seo_title || ''}
                onChange={(e) => setProduct({...product, seo_title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_description">SEO Description</Label>
              <Textarea
                id="seo_description"
                value={product.seo_description || ''}
                onChange={(e) => setProduct({...product, seo_description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={product.body_html || ''}
                onChange={(e) => setProduct({...product, body_html: e.target.value})}
                rows={5}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={product.published || false}
                onChange={(e) => setProduct({...product, published: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Product not found</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}