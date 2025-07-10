import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  title: string;
  body_html?: string;
  vendor?: string;
  type?: string;
  tags?: string;
  published?: boolean;
  variant_price?: number;
  variant_inventory_qty?: number;
  seo_title?: string;
  seo_description?: string;
}

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated: () => void;
}

export const ProductEditDialog = ({ 
  product, 
  open, 
  onOpenChange, 
  onProductUpdated 
}: ProductEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        body_html: product.body_html || '',
        vendor: product.vendor || '',
        type: product.type || '',
        tags: product.tags || '',
        published: product.published || false,
        variant_price: product.variant_price || 0,
        variant_inventory_qty: product.variant_inventory_qty || 0,
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
      });
    }
  }, [product]);

  const handleSave = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-products', {
        body: {
          action: 'update',
          productId: product.id,
          productData: formData,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Update failed');

      toast({
        title: "Product Updated",
        description: "Product has been successfully updated.",
      });

      onProductUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Product title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.body_html || ''}
              onChange={(e) => handleInputChange('body_html', e.target.value)}
              placeholder="Product description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={formData.vendor || ''}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder="Product vendor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Product Type</Label>
              <Input
                id="type"
                value={formData.type || ''}
                onChange={(e) => handleInputChange('type', e.target.value)}
                placeholder="Product type"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags || ''}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              placeholder="Comma-separated tags"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.variant_price || 0}
                onChange={(e) => handleInputChange('variant_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory Quantity</Label>
              <Input
                id="inventory"
                type="number"
                value={formData.variant_inventory_qty || 0}
                onChange={(e) => handleInputChange('variant_inventory_qty', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              value={formData.seo_title || ''}
              onChange={(e) => handleInputChange('seo_title', e.target.value)}
              placeholder="SEO title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">SEO Description</Label>
            <Textarea
              id="seo-description"
              value={formData.seo_description || ''}
              onChange={(e) => handleInputChange('seo_description', e.target.value)}
              placeholder="SEO description"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published || false}
              onCheckedChange={(checked) => handleInputChange('published', checked)}
            />
            <Label htmlFor="published">Published</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};