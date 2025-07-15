import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Zap, Edit3, Save, X, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Product } from '@/pages/Index';

interface ProductListItemProps {
  product: Product;
  isSelected: boolean;
  onSelectionChange: (productId: string) => void;
  onOptimize: (product: Product) => void;
  storeUrl?: string;
  onProductUpdated: () => void;
}

export const ProductListItem = ({ 
  product, 
  isSelected, 
  onSelectionChange, 
  onOptimize,
  storeUrl,
  onProductUpdated
}: ProductListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [storeConfig, setStoreConfig] = useState<{domain: string} | null>(null);
  const [editedProduct, setEditedProduct] = useState({
    title: product.title,
    vendor: product.vendor,
    type: product.type,
    tags: product.tags,
    variantPrice: product.variantPrice || 0,
    variantCompareAtPrice: product.variantCompareAtPrice || 0,
    variantSku: product.variantSku || '',
    variantInventoryQty: product.variantInventoryQty || 0,
    seoTitle: product.seoTitle || '',
    seoDescription: product.seoDescription || '',
    variantGrams: product.variantGrams || 0
  });
  
  const { session } = useSessionContext();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStoreConfig = async () => {
      if (!session?.user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('store_configurations')
          .select('domain')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .limit(1);
          
        if (error) throw error;
        if (data && data.length > 0) {
          setStoreConfig(data[0]);
        }
      } catch (error) {
        console.error('Error fetching store config:', error);
      }
    };

    fetchStoreConfig();
  }, [session?.user?.id]);

  const getProductUrl = (handle: string) => {
    if (storeUrl && storeUrl.trim()) {
      const cleanUrl = storeUrl.replace(/\/+$/, '');
      return `${cleanUrl}/products/${handle}`;
    }
    return null;
  };

  const getShopifyAdminUrl = (handle: string) => {
    if (!storeConfig?.domain) {
      return null;
    }
    
    const storeName = storeConfig.domain.replace('.myshopify.com', '');
    return `https://admin.shopify.com/store/${storeName}/products/${handle}`;
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      // Track edits before saving
      const editsToTrack = [
        { field: 'title', before: product.title, after: editedProduct.title },
        { field: 'vendor', before: product.vendor, after: editedProduct.vendor },
        { field: 'type', before: product.type, after: editedProduct.type },
        { field: 'tags', before: product.tags, after: editedProduct.tags },
        { field: 'variant_price', before: product.variantPrice?.toString(), after: editedProduct.variantPrice?.toString() },
        { field: 'variant_compare_at_price', before: product.variantCompareAtPrice?.toString(), after: editedProduct.variantCompareAtPrice?.toString() },
        { field: 'variant_sku', before: product.variantSku, after: editedProduct.variantSku },
        { field: 'variant_inventory_qty', before: product.variantInventoryQty?.toString(), after: editedProduct.variantInventoryQty?.toString() },
        { field: 'seo_title', before: product.seoTitle, after: editedProduct.seoTitle },
        { field: 'seo_description', before: product.seoDescription, after: editedProduct.seoDescription },
        { field: 'variant_grams', before: product.variantGrams?.toString(), after: editedProduct.variantGrams?.toString() }
      ];

      // Filter out unchanged fields and track each edit
      const changedEdits = editsToTrack.filter(edit => 
        (edit.before || '') !== (edit.after || '')
      );

      console.log('Tracking edits for product:', product.handle, changedEdits);

      // Track each edit in the edit history
      for (const edit of changedEdits) {
        try {
          await supabase
            .from('product_edit_history')
            .insert({
              user_id: session.user.id,
              product_handle: product.handle,
              field_name: edit.field,
              before_value: edit.before || '',
              after_value: edit.after || '',
              edit_type: 'manual'
            });
        } catch (editError) {
          console.error('Error tracking edit:', editError);
        }
      }

      const { error } = await supabase
        .from('products')
        .update({
          title: editedProduct.title,
          vendor: editedProduct.vendor,
          type: editedProduct.type,
          tags: editedProduct.tags,
          variant_price: editedProduct.variantPrice,
          variant_compare_at_price: editedProduct.variantCompareAtPrice,
          variant_sku: editedProduct.variantSku,
          variant_inventory_qty: editedProduct.variantInventoryQty,
          seo_title: editedProduct.seoTitle,
          seo_description: editedProduct.seoDescription,
          variant_grams: editedProduct.variantGrams,
          updated_at: new Date().toISOString()
        })
        .eq('handle', product.handle)
        .eq('user_id', session.user.id);

      if (error) throw error;

      toast({
        title: "Product Updated",
        description: `Changes saved successfully${changedEdits.length > 0 ? ` (${changedEdits.length} edits tracked for AI learning)` : ''}`,
      });

      setIsEditing(false);
      onProductUpdated();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSyncToShopify = async () => {
    if (!session?.user?.id) return;

    setIsSyncing(true);
    try {
      const { data: syncData, error: syncError } = await supabase.functions.invoke('shopify-products', {
        body: { 
          action: 'update',
          products: [{
            handle: product.handle,
            title: editedProduct.title,
            vendor: editedProduct.vendor,
            type: editedProduct.type,
            tags: editedProduct.tags,
            price: editedProduct.variantPrice,
            compare_at_price: editedProduct.variantCompareAtPrice,
            sku: editedProduct.variantSku,
            inventory_quantity: editedProduct.variantInventoryQty
          }]
        }
      });

      if (syncError) throw syncError;

      if (syncData?.error) {
        throw new Error(syncData.error);
      }

      // Update sync status
      await supabase
        .from('products')
        .update({ 
          shopify_sync_status: 'synced',
          shopify_synced_at: new Date().toISOString()
        })
        .eq('handle', product.handle)
        .eq('user_id', session.user.id);

      toast({
        title: "Synced to Shopify",
        description: "Product successfully updated in your Shopify store",
      });

      onProductUpdated();
    } catch (error: any) {
      console.error('Shopify sync error:', error);
      
      // Update sync status to failed
      await supabase
        .from('products')
        .update({ 
          shopify_sync_status: 'failed',
          shopify_synced_at: new Date().toISOString()
        })
        .eq('handle', product.handle)
        .eq('user_id', session.user.id);

      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync to Shopify",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCancel = () => {
    setEditedProduct({
      title: product.title,
      vendor: product.vendor,
      type: product.type,
      tags: product.tags,
      variantPrice: product.variantPrice || 0,
      variantCompareAtPrice: product.variantCompareAtPrice || 0,
      variantSku: product.variantSku || '',
      variantInventoryQty: product.variantInventoryQty || 0,
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      variantGrams: product.variantGrams || 0
    });
    setIsEditing(false);
  };

  const hasChanges = () => {
    return (
      editedProduct.title !== product.title ||
      editedProduct.vendor !== product.vendor ||
      editedProduct.type !== product.type ||
      editedProduct.tags !== product.tags ||
      editedProduct.variantPrice !== (product.variantPrice || 0) ||
      editedProduct.variantCompareAtPrice !== (product.variantCompareAtPrice || 0) ||
      editedProduct.variantSku !== (product.variantSku || '') ||
      editedProduct.variantInventoryQty !== (product.variantInventoryQty || 0) ||
      editedProduct.seoTitle !== (product.seoTitle || '') ||
      editedProduct.seoDescription !== (product.seoDescription || '') ||
      editedProduct.variantGrams !== (product.variantGrams || 0)
    );
  };

  return (
    <Card className="p-4 hover:shadow-card transition-all duration-300">
      <div className="flex items-start gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelectionChange(product.id)}
          className="mt-1"
        />
        
        {product.imageSrc && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
            <img 
              src={product.imageSrc} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {isEditing ? (
                <>
                  {/* Editable Title */}
                  <Input
                    value={editedProduct.title}
                    onChange={(e) => setEditedProduct({ ...editedProduct, title: e.target.value })}
                    className="font-semibold"
                    placeholder="Product title"
                  />
                  
                  {/* Editable Info Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={editedProduct.vendor}
                      onChange={(e) => setEditedProduct({ ...editedProduct, vendor: e.target.value })}
                      placeholder="Vendor"
                      className="text-xs"
                    />
                    <Input
                      value={editedProduct.type}
                      onChange={(e) => setEditedProduct({ ...editedProduct, type: e.target.value })}
                      placeholder="Product type"
                      className="text-xs"
                    />
                  </div>
                  
                  {/* Pricing & Basic Info */}
                  <div className="grid grid-cols-5 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={editedProduct.variantPrice}
                      onChange={(e) => setEditedProduct({ ...editedProduct, variantPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Price"
                      className="text-xs"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={editedProduct.variantCompareAtPrice}
                      onChange={(e) => setEditedProduct({ ...editedProduct, variantCompareAtPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="Compare price"
                      className="text-xs"
                    />
                    <Input
                      value={editedProduct.variantSku}
                      onChange={(e) => setEditedProduct({ ...editedProduct, variantSku: e.target.value })}
                      placeholder="SKU"
                      className="text-xs"
                    />
                    <Input
                      type="number"
                      value={editedProduct.variantInventoryQty}
                      onChange={(e) => setEditedProduct({ ...editedProduct, variantInventoryQty: parseInt(e.target.value) || 0 })}
                      placeholder="Inventory"
                      className="text-xs"
                    />
                    <Input
                      type="number"
                      value={editedProduct.variantGrams}
                      onChange={(e) => setEditedProduct({ ...editedProduct, variantGrams: parseFloat(e.target.value) || 0 })}
                      placeholder="Weight (g)"
                      className="text-xs"
                    />
                  </div>
                  
                  {/* SEO Fields */}
                  <div className="space-y-2">
                    <Input
                      value={editedProduct.seoTitle}
                      onChange={(e) => setEditedProduct({ ...editedProduct, seoTitle: e.target.value })}
                      placeholder="SEO Title"
                      className="text-xs"
                    />
                    <Textarea
                      value={editedProduct.seoDescription}
                      onChange={(e) => setEditedProduct({ ...editedProduct, seoDescription: e.target.value })}
                      placeholder="SEO Description"
                      className="text-xs"
                      rows={2}
                    />
                  </div>
                  
                  {/* Editable Tags */}
                  <Textarea
                    value={editedProduct.tags}
                    onChange={(e) => setEditedProduct({ ...editedProduct, tags: e.target.value })}
                    placeholder="Tags (comma-separated)"
                    className="text-xs"
                    rows={2}
                  />
                </>
              ) : (
                <>
                  {/* Display Mode */}
                  <h3 className="font-semibold text-sm leading-tight mb-1 truncate">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span>{product.vendor}</span>
                    <span>•</span>
                    <span>${product.variantPrice}</span>
                    {product.variantCompareAtPrice && product.variantCompareAtPrice > 0 && (
                      <>
                        <span>•</span>
                        <span className="line-through">${product.variantCompareAtPrice}</span>
                      </>
                    )}
                    {product.variantSku && (
                      <>
                        <span>•</span>
                        <span>SKU: {product.variantSku}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>Stock: {product.variantInventoryQty || 0}</span>
                    {product.variantGrams && product.variantGrams > 0 && (
                      <>
                        <span>•</span>
                        <span>Weight: {product.variantGrams}g</span>
                      </>
                    )}
                    {product.type && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs py-0 px-1">
                          {product.type}
                        </Badge>
                      </>
                    )}
                  </div>
                  {(product.seoTitle || product.seoDescription) && (
                    <div className="text-xs text-muted-foreground mb-2">
                      {product.seoTitle && (
                        <div className="mb-1">
                          <span className="font-medium">SEO Title:</span> {product.seoTitle}
                        </div>
                      )}
                      {product.seoDescription && (
                        <div>
                          <span className="font-medium">SEO Description:</span> {product.seoDescription}
                        </div>
                      )}
                    </div>
                  )}
                  {product.tags && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.split(',').slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                          {tag.trim()}
                        </Badge>
                      ))}
                      {product.tags.split(',').length > 3 && (
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          +{product.tags.split(',').length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="transition-all duration-300 hover:scale-105"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges()}
                    className="bg-gradient-primary transition-all duration-300 hover:scale-105"
                  >
                    {isSaving ? (
                      <Save className="h-3 w-3 animate-pulse" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                  </Button>
                  {hasChanges() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncToShopify}
                      disabled={isSyncing}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      {isSyncing ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="transition-all duration-300 hover:scale-105"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  {getShopifyAdminUrl(product.handle) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getShopifyAdminUrl(product.handle)!, '_blank')}
                      className="transition-all duration-300 hover:scale-105"
                      title="Edit product in Shopify"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncToShopify}
                    disabled={isSyncing}
                    className="transition-all duration-300 hover:scale-105"
                    title="Sync to Shopify"
                  >
                    {isSyncing ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onOptimize(product)}
                    className="bg-gradient-primary transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Optimize
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};