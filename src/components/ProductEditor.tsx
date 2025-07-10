import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit3, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Product } from '@/pages/Index';

interface ProductEditorProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export const ProductEditor = ({ product, isOpen, onClose, onProductUpdated }: ProductEditorProps) => {
  const [editedProduct, setEditedProduct] = useState({
    title: product.title,
    type: product.type || '',
    bodyHtml: product.bodyHtml || '',
    tags: product.tags || '',
    category: product.category || '',
    vendor: product.vendor || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const { session } = useSessionContext();
  const { toast } = useToast();

  // Debug authentication
  console.log('ProductEditor - Session:', session?.user?.id ? 'authenticated' : 'not authenticated');
  console.log('ProductEditor - Product handle:', product.handle);
  console.log('ProductEditor - Modal open:', isOpen);

  const trackManualEdit = async (fieldName: string, beforeValue: string, afterValue: string) => {
    if (beforeValue === afterValue || !session?.user?.id) return;

    try {
      console.log('Tracking manual edit:', { fieldName, beforeValue, afterValue });
      const { error } = await supabase
        .from('product_edit_history')
        .insert({
          user_id: session.user.id,
          product_handle: product.handle,
          field_name: fieldName,
          before_value: beforeValue,
          after_value: afterValue,
          edit_type: 'manual'
        });
      
      if (error) {
        console.error('Database error tracking edit:', error);
        // Don't throw - we don't want edit tracking to block product updates
      } else {
        console.log('Manual edit tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking manual edit:', error);
      // Don't throw - we don't want edit tracking to block product updates
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      console.log('Starting to save product edits...', { 
        productHandle: product.handle,
        changes: {
          title: product.title !== editedProduct.title,
          type: (product.type || '') !== editedProduct.type,
          description: (product.bodyHtml || '') !== editedProduct.bodyHtml,
          tags: (product.tags || '') !== editedProduct.tags,
          category: (product.category || '') !== editedProduct.category,
          vendor: (product.vendor || '') !== editedProduct.vendor
        }
      });

      // Track all manual edits (non-blocking)
      Promise.all([
        trackManualEdit('title', product.title, editedProduct.title),
        trackManualEdit('type', product.type || '', editedProduct.type),
        trackManualEdit('description', product.bodyHtml || '', editedProduct.bodyHtml),
        trackManualEdit('tags', product.tags || '', editedProduct.tags),
        trackManualEdit('category', product.category || '', editedProduct.category),
        trackManualEdit('vendor', product.vendor || '', editedProduct.vendor)
      ]).catch(error => {
        console.error('Edit tracking failed (non-blocking):', error);
      });

      // Update the product in the database
      console.log('Updating product in database...', {
        title: editedProduct.title,
        type: editedProduct.type,
        body_html: editedProduct.bodyHtml,
        tags: editedProduct.tags,
        category: editedProduct.category,
        vendor: editedProduct.vendor
      });

      const { error } = await supabase
        .from('products')
        .update({
          title: editedProduct.title,
          type: editedProduct.type,
          body_html: editedProduct.bodyHtml,
          tags: editedProduct.tags,
          category: editedProduct.category,
          vendor: editedProduct.vendor,
          updated_at: new Date().toISOString()
        })
        .eq('handle', product.handle)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Product updated successfully');

      toast({
        title: "Product Updated",
        description: "Your manual edits have been saved and will appear shortly.",
      });

      // Auto-sync to Shopify after manual edit
      try {
        const { data: syncData, error: syncError } = await supabase.functions.invoke('shopify-products', {
          body: { 
            action: 'update',
            products: [{
              handle: product.handle,
              title: editedProduct.title,
              description: editedProduct.bodyHtml,
              type: editedProduct.type,
              tags: editedProduct.tags
            }]
          }
        });

        if (syncError) {
          console.error('Shopify sync error:', syncError);
          toast({
            title: "Shopify Sync Failed",
            description: "Product saved locally but failed to sync to Shopify. You can export manually later.",
            variant: "destructive",
          });
        } else if (syncData?.error) {
          console.error('Shopify API error:', syncData.error);
          toast({
            title: "Shopify Sync Failed", 
            description: syncData.error,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Synced to Shopify",
            description: "Product updated in both database and Shopify store.",
          });
        }
      } catch (syncError: any) {
        console.error('Shopify sync error:', syncError);
        toast({
          title: "Shopify Sync Failed",
          description: "Product saved locally but failed to sync to Shopify.",
          variant: "destructive",
        });
      }

      // Force refresh the products list
      setTimeout(() => {
        onProductUpdated();
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your edits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Product Manually
          </DialogTitle>
          <DialogDescription>
            Make manual edits to this product. Your changes will be preserved during AI optimization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={editedProduct.title}
              onChange={(e) => setEditedProduct({ ...editedProduct, title: e.target.value })}
              placeholder="Enter product title"
            />
          </div>

          <div>
            <Label htmlFor="type">Product Type</Label>
            <Input
              id="type"
              value={editedProduct.type}
              onChange={(e) => setEditedProduct({ ...editedProduct, type: e.target.value })}
              placeholder="e.g., Leave-In Hair Conditioner"
            />
          </div>

          <div>
            <Label htmlFor="vendor">Vendor/Brand</Label>
            <Input
              id="vendor"
              value={editedProduct.vendor}
              onChange={(e) => setEditedProduct({ ...editedProduct, vendor: e.target.value })}
              placeholder="Enter vendor or brand name"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={editedProduct.category}
              onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
              placeholder="e.g., Health & Beauty > Hair Care"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={editedProduct.tags}
              onChange={(e) => setEditedProduct({ ...editedProduct, tags: e.target.value })}
              placeholder="Comma-separated tags"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedProduct.bodyHtml}
              onChange={(e) => setEditedProduct({ ...editedProduct, bodyHtml: e.target.value })}
              placeholder="Enter product description (HTML supported)"
              rows={6}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-primary flex-1"
          >
            {isSaving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};