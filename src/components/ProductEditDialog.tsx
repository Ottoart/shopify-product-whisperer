import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign } from 'lucide-react';

interface Product {
  id: string;
  handle?: string;
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
  updated_at?: string;
  shopify_synced_at?: string;
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

  // Prevent form reset when dialog closes and reopens
  useEffect(() => {
    if (!open && product) {
      // Reset form when dialog is closed to prevent stale data
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
  }, [open, product]);

  const handleSave = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-products', {
        body: {
          action: 'update',
          productId: product.id,
          productHandle: product.handle,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">Optimize Product</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            AI-powered product optimization and sync to Shopify.
          </DialogDescription>
          {(product.updated_at || product.shopify_synced_at) && (
            <div className="text-xs text-muted-foreground space-y-1 mt-3 p-2 bg-muted/30 rounded">
              {product.updated_at && (
                <div>Last edited: {new Date(product.updated_at).toLocaleString()}</div>
              )}
              {product.shopify_synced_at && (
                <div>Last synced: {new Date(product.shopify_synced_at).toLocaleString()}</div>
              )}
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
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

          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Dynamic Repricing</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/settings', '_blank')}
                className="text-xs"
              >
                Connect Store
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/repricing', '_blank')}
                className="text-xs"
              >
                Manage Rules
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
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
            className="bg-gradient-primary text-primary-foreground hover:bg-gradient-primary/90"
          >
            {isSaving ? 'Optimizing...' : 'Optimize'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};