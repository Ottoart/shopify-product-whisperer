import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { ProductWhisperItem } from '@/types/productwhisper';
import { useEditTracking } from '@/hooks/useEditTracking';
import { useProductDrafts } from '@/hooks/useProductDrafts';
import { Save, Clock, FileText } from 'lucide-react';
import { ProductWhisperDrafts } from './ProductWhisperDrafts';

interface ProductWhisperEditorProps {
  product: ProductWhisperItem;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export const ProductWhisperEditor = ({ 
  product, 
  isOpen, 
  onClose, 
  onProductUpdated 
}: ProductWhisperEditorProps) => {
  const { toast } = useToast();
  const { session } = useSessionContext();
  const [isSaving, setIsSaving] = useState(false);
  const [editedProduct, setEditedProduct] = useState<ProductWhisperItem>(product);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { trackProductUpdate } = useEditTracking({ 
    onProductUpdate: () => onProductUpdated()
  });

  const { saveDraft } = useProductDrafts(product.handle);

  useEffect(() => {
    setEditedProduct(product);
    setHasUnsavedChanges(false);
  }, [product]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !session?.user?.id) return;

    try {
      const draftData = {
        title: editedProduct.title,
        description: editedProduct.body_html || '',
        tags: editedProduct.tags || '',
        type: editedProduct.type || '',
        category: editedProduct.category || ''
      };

      // Create auto-save draft
      saveDraft(`Auto-save ${new Date().toLocaleTimeString()}`, draftData);
      setLastAutoSave(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [editedProduct, hasUnsavedChanges, session, saveDraft]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [isOpen, autoSave]);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(editedProduct) !== JSON.stringify(product);
    setHasUnsavedChanges(hasChanges);
  }, [editedProduct, product]);

  const handleApplyDraft = useCallback((draftData: any) => {
    setEditedProduct(prev => ({
      ...prev,
      title: draftData.title,
      body_html: draftData.description,
      tags: draftData.tags,
      type: draftData.type,
      category: draftData.category
    }));
  }, []);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    setIsSaving(true);
    try {
      // Update product in database
      const { error } = await supabase
        .from('products')
        .update({
          title: editedProduct.title,
          body_html: editedProduct.body_html,
          type: editedProduct.type,
          category: editedProduct.category,
          vendor: editedProduct.vendor,
          tags: editedProduct.tags,
          published: editedProduct.published,
          variant_price: editedProduct.variant_price,
          variant_compare_at_price: editedProduct.variant_compare_at_price,
          variant_sku: editedProduct.variant_sku,
          variant_inventory_qty: editedProduct.variant_inventory_qty,
          variant_inventory_policy: editedProduct.variant_inventory_policy,
          variant_requires_shipping: editedProduct.variant_requires_shipping,
          variant_taxable: editedProduct.variant_taxable,
          variant_barcode: editedProduct.variant_barcode,
          variant_grams: editedProduct.variant_grams,
          seo_title: editedProduct.seo_title,
          seo_description: editedProduct.seo_description,
          google_shopping_condition: editedProduct.google_shopping_condition,
          google_shopping_gender: editedProduct.google_shopping_gender,
          google_shopping_age_group: editedProduct.google_shopping_age_group,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Track changes for AI learning
      await trackProductUpdate(
        product.handle,
        {
          title: product.title,
          bodyHtml: product.body_html,
          type: product.type,
          category: product.category,
          vendor: product.vendor,
          tags: product.tags
        } as any,
        {
          title: editedProduct.title,
          description: editedProduct.body_html,
          type: editedProduct.type || '',
          category: editedProduct.category || '',
          tags: editedProduct.tags || ''
        },
        'manual'
      );

      toast({
        title: "Product Updated",
        description: "Product has been updated successfully.",
      });

      onClose();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Product</span>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Unsaved changes
                </Badge>
              )}
              {lastAutoSave && (
                <Badge variant="outline" className="text-xs">
                  Auto-saved {lastAutoSave.toLocaleTimeString()}
                </Badge>
              )}
              <ProductWhisperDrafts 
                productHandle={product.handle}
                onApplyDraft={handleApplyDraft}
              >
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Drafts
                </Button>
              </ProductWhisperDrafts>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={editedProduct.title}
                  onChange={(e) => setEditedProduct({...editedProduct, title: e.target.value})}
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <Label htmlFor="type">Product Type</Label>
                <Input
                  id="type"
                  value={editedProduct.type || ''}
                  onChange={(e) => setEditedProduct({...editedProduct, type: e.target.value})}
                  placeholder="e.g., Electronics, Clothing"
                />
              </div>

              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={editedProduct.vendor || ''}
                  onChange={(e) => setEditedProduct({...editedProduct, vendor: e.target.value})}
                  placeholder="Enter vendor name"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editedProduct.category || ''}
                  onChange={(e) => setEditedProduct({...editedProduct, category: e.target.value})}
                  placeholder="Enter category"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={editedProduct.tags || ''}
                  onChange={(e) => setEditedProduct({...editedProduct, tags: e.target.value})}
                  placeholder="Comma-separated tags"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editedProduct.body_html || ''}
                onChange={(e) => setEditedProduct({...editedProduct, body_html: e.target.value})}
                placeholder="Enter product description"
                rows={4}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editedProduct.variant_price}
                  onChange={(e) => setEditedProduct({...editedProduct, variant_price: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="compare_price">Compare at Price</Label>
                <Input
                  id="compare_price"
                  type="number"
                  step="0.01"
                  value={editedProduct.variant_compare_at_price}
                  onChange={(e) => setEditedProduct({...editedProduct, variant_compare_at_price: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={editedProduct.variant_sku}
                  onChange={(e) => setEditedProduct({...editedProduct, variant_sku: e.target.value})}
                  placeholder="Enter SKU"
                />
              </div>

              <div>
                <Label htmlFor="inventory">Inventory Quantity</Label>
                <Input
                  id="inventory"
                  type="number"
                  value={editedProduct.variant_inventory_qty}
                  onChange={(e) => setEditedProduct({...editedProduct, variant_inventory_qty: parseInt(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={editedProduct.variant_barcode}
                  onChange={(e) => setEditedProduct({...editedProduct, variant_barcode: e.target.value})}
                  placeholder="Enter barcode"
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight (grams)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={editedProduct.variant_grams}
                  onChange={(e) => setEditedProduct({...editedProduct, variant_grams: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SEO & Marketing</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={editedProduct.seo_title}
                  onChange={(e) => setEditedProduct({...editedProduct, seo_title: e.target.value})}
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={editedProduct.seo_description}
                  onChange={(e) => setEditedProduct({...editedProduct, seo_description: e.target.value})}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visibility</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={editedProduct.published}
                onCheckedChange={(checked) => setEditedProduct({...editedProduct, published: checked})}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};