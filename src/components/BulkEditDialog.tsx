import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit3, DollarSign, Tag, Package, FileText, Plus, X, Zap } from 'lucide-react';

interface BulkEditDialogProps {
  selectedProducts: string[];
  products: any[];
  onComplete: () => void;
  children: React.ReactNode;
}

interface BulkEditOperation {
  field: string;
  operation: 'set' | 'append' | 'remove' | 'increase' | 'decrease';
  value: string | number;
}

export const BulkEditDialog = ({ selectedProducts, products, onComplete, children }: BulkEditDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [operations, setOperations] = useState<BulkEditOperation[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Pricing operations
  const [priceOperation, setPriceOperation] = useState<'increase' | 'decrease' | 'set'>('set');
  const [priceValue, setPriceValue] = useState('');
  const [priceType, setPriceType] = useState<'percentage' | 'fixed'>('percentage');

  // Tag operations
  const [tagOperation, setTagOperation] = useState<'add' | 'remove' | 'replace'>('add');
  const [tagValue, setTagValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Other fields
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [inventory, setInventory] = useState('');
  const [inventoryOperation, setInventoryOperation] = useState<'set' | 'increase' | 'decrease'>('set');

  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const addTag = () => {
    if (tagValue.trim() && !selectedTags.includes(tagValue.trim())) {
      setSelectedTags([...selectedTags, tagValue.trim()]);
      setTagValue('');
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const generatePreview = () => {
    const preview = selectedProductsData.map(product => {
      let updatedProduct = { ...product };
      
      // Apply pricing changes
      if (priceValue) {
        const currentPrice = product.variantPrice || 0;
        if (priceOperation === 'set') {
          updatedProduct.variantPrice = parseFloat(priceValue);
        } else if (priceOperation === 'increase') {
          if (priceType === 'percentage') {
            updatedProduct.variantPrice = currentPrice * (1 + parseFloat(priceValue) / 100);
          } else {
            updatedProduct.variantPrice = currentPrice + parseFloat(priceValue);
          }
        } else if (priceOperation === 'decrease') {
          if (priceType === 'percentage') {
            updatedProduct.variantPrice = currentPrice * (1 - parseFloat(priceValue) / 100);
          } else {
            updatedProduct.variantPrice = Math.max(0, currentPrice - parseFloat(priceValue));
          }
        }
      }

      // Apply tag changes
      if (selectedTags.length > 0) {
        const currentTags = product.tags ? product.tags.split(',').map(t => t.trim()) : [];
        if (tagOperation === 'add') {
          const newTags = [...new Set([...currentTags, ...selectedTags])];
          updatedProduct.tags = newTags.join(', ');
        } else if (tagOperation === 'remove') {
          const newTags = currentTags.filter(tag => !selectedTags.includes(tag));
          updatedProduct.tags = newTags.join(', ');
        } else if (tagOperation === 'replace') {
          updatedProduct.tags = selectedTags.join(', ');
        }
      }

      // Apply other field changes
      if (vendor) updatedProduct.vendor = vendor;
      if (category) updatedProduct.category = category;
      if (status) updatedProduct.status = status;
      if (inventory) {
        const currentInventory = product.variantInventoryQty || 0;
        if (inventoryOperation === 'set') {
          updatedProduct.variantInventoryQty = parseInt(inventory);
        } else if (inventoryOperation === 'increase') {
          updatedProduct.variantInventoryQty = currentInventory + parseInt(inventory);
        } else if (inventoryOperation === 'decrease') {
          updatedProduct.variantInventoryQty = Math.max(0, currentInventory - parseInt(inventory));
        }
      }

      return updatedProduct;
    });

    setPreviewData(preview);
    setShowPreview(true);
  };

  const applyBulkEdit = async () => {
    setIsProcessing(true);
    try {
      // Convert products to database format and update
      const updates = previewData.map(product => ({
        handle: product.handle,
        title: product.title,
        vendor: product.vendor,
        type: product.type,
        category: product.category,
        tags: product.tags,
        published: product.published,
        variant_price: product.variantPrice,
        variant_inventory_qty: product.variantInventoryQty,
        updated_at: new Date().toISOString()
      }));

      // Batch update products in database
      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('products')
          .update(update)
          .eq('handle', update.handle);

        if (error) {
          console.error('Error updating product:', error);
          throw error;
        }
      }

      toast({
        title: "Bulk Edit Complete",
        description: `Successfully updated ${selectedProducts.length} products`,
      });

      onComplete();
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error('Bulk edit error:', error);
      toast({
        title: "Bulk Edit Failed",
        description: "Failed to update products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setPriceValue('');
    setTagValue('');
    setSelectedTags([]);
    setVendor('');
    setCategory('');
    setStatus('');
    setInventory('');
    setShowPreview(false);
    setPreviewData([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Bulk Edit Products ({selectedProducts.length} selected)
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit Fields</TabsTrigger>
            <TabsTrigger value="preview" disabled={!showPreview}>Preview Changes</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            {/* Pricing Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={priceOperation} onValueChange={(value: any) => setPriceOperation(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set">Set to</SelectItem>
                      <SelectItem value="increase">Increase by</SelectItem>
                      <SelectItem value="decrease">Decrease by</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Amount"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                    type="number"
                    step="0.01"
                  />
                  {priceOperation !== 'set' && (
                    <Select value={priceType} onValueChange={(value: any) => setPriceType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">$</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={tagOperation} onValueChange={(value: any) => setTagOperation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add tags</SelectItem>
                    <SelectItem value="remove">Remove tags</SelectItem>
                    <SelectItem value="replace">Replace all tags</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag name"
                    value={tagValue}
                    onChange={(e) => setTagValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Fields */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-4 w-4" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    placeholder="Set vendor"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="Set category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Set status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="inventory">Inventory</Label>
                  <div className="flex gap-2">
                    <Select value={inventoryOperation} onValueChange={(value: any) => setInventoryOperation(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="set">Set to</SelectItem>
                        <SelectItem value="increase">Increase by</SelectItem>
                        <SelectItem value="decrease">Decrease by</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Quantity"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      type="number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={generatePreview} variant="outline">
                Preview Changes
              </Button>
              <Button onClick={resetForm} variant="outline">
                Reset Form
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {previewData.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Preview of changes for {previewData.length} products:
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {previewData.slice(0, 5).map((product, index) => (
                    <Card key={index} className="p-3">
                      <div className="text-sm font-medium">{product.title}</div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {product.variantPrice !== selectedProductsData[index]?.variantPrice && (
                          <div>Price: {selectedProductsData[index]?.variantPrice || 0} → ${product.variantPrice?.toFixed(2)}</div>
                        )}
                        {product.tags !== selectedProductsData[index]?.tags && (
                          <div>Tags: {product.tags}</div>
                        )}
                        {product.vendor !== selectedProductsData[index]?.vendor && (
                          <div>Vendor: {product.vendor}</div>
                        )}
                        {product.category !== selectedProductsData[index]?.category && (
                          <div>Category: {product.category}</div>
                        )}
                      </div>
                    </Card>
                  ))}
                  {previewData.length > 5 && (
                    <div className="text-xs text-muted-foreground text-center">
                      ... and {previewData.length - 5} more products
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={applyBulkEdit} disabled={isProcessing} className="bg-gradient-primary">
                    {isProcessing ? 'Applying...' : 'Apply Changes'}
                  </Button>
                  <Button onClick={() => setShowPreview(false)} variant="outline">
                    Back to Edit
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
