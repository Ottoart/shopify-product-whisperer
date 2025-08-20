import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { ProductWhisperItem } from '@/types/productwhisper';
import { X, Plus } from 'lucide-react';

interface BulkEditOperation {
  field: string;
  operation: 'set' | 'increase' | 'decrease' | 'add' | 'remove' | 'replace';
  value: string | number | boolean;
}

interface ProductWhisperBulkEditProps {
  selectedProducts: ProductWhisperItem[];
  allProducts: ProductWhisperItem[];
  onComplete: () => void;
  children: React.ReactNode;
}

export const ProductWhisperBulkEdit = ({
  selectedProducts,
  allProducts,
  onComplete,
  children
}: ProductWhisperBulkEditProps) => {
  const { toast } = useToast();
  const { session } = useSessionContext();
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Pricing
  const [priceOperation, setPriceOperation] = useState<'set' | 'increase' | 'decrease'>('set');
  const [priceValue, setPriceValue] = useState('');
  const [priceType, setPriceType] = useState<'fixed' | 'percentage'>('fixed');

  // Tags
  const [tagOperation, setTagOperation] = useState<'add' | 'remove' | 'replace'>('add');
  const [tagInput, setTagInput] = useState('');
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);

  // Other fields
  const [newVendor, setNewVendor] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newStatus, setNewStatus] = useState<'published' | 'draft' | ''>('');
  const [inventoryOperation, setInventoryOperation] = useState<'set' | 'increase' | 'decrease'>('set');
  const [inventoryValue, setInventoryValue] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tagsToAdd.includes(tagInput.trim())) {
      setTagsToAdd([...tagsToAdd, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string, from: 'add' | 'remove') => {
    if (from === 'add') {
      setTagsToAdd(tagsToAdd.filter(t => t !== tag));
    } else {
      setTagsToRemove(tagsToRemove.filter(t => t !== tag));
    }
  };

  const addTagToRemove = () => {
    if (tagInput.trim() && !tagsToRemove.includes(tagInput.trim())) {
      setTagsToRemove([...tagsToRemove, tagInput.trim()]);
      setTagInput('');
    }
  };

  const generatePreview = () => {
    const operations: BulkEditOperation[] = [];

    if (priceValue) {
      operations.push({
        field: 'variant_price',
        operation: priceOperation,
        value: priceType === 'percentage' && priceOperation !== 'set' 
          ? parseFloat(priceValue) / 100 
          : parseFloat(priceValue)
      });
    }

    if (tagsToAdd.length > 0) {
      operations.push({
        field: 'tags',
        operation: 'add',
        value: tagsToAdd.join(', ')
      });
    }

    if (tagsToRemove.length > 0) {
      operations.push({
        field: 'tags',
        operation: 'remove',
        value: tagsToRemove.join(', ')
      });
    }

    if (newVendor) {
      operations.push({
        field: 'vendor',
        operation: 'set',
        value: newVendor
      });
    }

    if (newCategory) {
      operations.push({
        field: 'category',
        operation: 'set',
        value: newCategory
      });
    }

    if (newStatus) {
      operations.push({
        field: 'published',
        operation: 'set',
        value: newStatus === 'published'
      });
    }

    if (inventoryValue) {
      operations.push({
        field: 'variant_inventory_qty',
        operation: inventoryOperation,
        value: parseInt(inventoryValue)
      });
    }

    return operations;
  };

  const applyBulkEdit = async () => {
    if (!session?.user?.id) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const operations = generatePreview();
      const totalProducts = selectedProducts.length;

      for (let i = 0; i < selectedProducts.length; i++) {
        const product = selectedProducts[i];
        const updates: any = {};

        // Apply each operation
        operations.forEach(op => {
          switch (op.field) {
            case 'variant_price':
              if (op.operation === 'set') {
                updates.variant_price = op.value;
              } else if (op.operation === 'increase') {
                const increase = priceType === 'percentage' 
                  ? product.variant_price * (op.value as number)
                  : op.value as number;
                updates.variant_price = product.variant_price + increase;
              } else if (op.operation === 'decrease') {
                const decrease = priceType === 'percentage' 
                  ? product.variant_price * (op.value as number)
                  : op.value as number;
                updates.variant_price = Math.max(0, product.variant_price - decrease);
              }
              break;

            case 'tags':
              if (op.operation === 'add') {
                const currentTags = product.tags ? product.tags.split(',').map(t => t.trim()) : [];
                const newTags = (op.value as string).split(',').map(t => t.trim());
                const combinedTags = [...new Set([...currentTags, ...newTags])];
                updates.tags = combinedTags.join(', ');
              } else if (op.operation === 'remove') {
                const currentTags = product.tags ? product.tags.split(',').map(t => t.trim()) : [];
                const tagsToRemove = (op.value as string).split(',').map(t => t.trim());
                const filteredTags = currentTags.filter(tag => !tagsToRemove.includes(tag));
                updates.tags = filteredTags.join(', ');
              }
              break;

            case 'vendor':
              updates.vendor = op.value;
              break;

            case 'category':
              updates.category = op.value;
              break;

            case 'published':
              updates.published = op.value as boolean;
              break;

            case 'variant_inventory_qty':
              if (op.operation === 'set') {
                updates.variant_inventory_qty = op.value;
              } else if (op.operation === 'increase') {
                updates.variant_inventory_qty = product.variant_inventory_qty + (op.value as number);
              } else if (op.operation === 'decrease') {
                updates.variant_inventory_qty = Math.max(0, product.variant_inventory_qty - (op.value as number));
              }
              break;
          }
        });

        // Update the product
        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          
          const { error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', product.id)
            .eq('user_id', session.user.id);

          if (error) throw error;
        }

        setProgress(((i + 1) / totalProducts) * 100);
      }

      toast({
        title: "Bulk Edit Complete",
        description: `Successfully updated ${selectedProducts.length} products.`,
      });

      resetForm();
      onComplete();
      setOpen(false);
    } catch (error: any) {
      console.error('Error in bulk edit:', error);
      toast({
        title: "Bulk Edit Failed",
        description: error.message || "Failed to update products.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setPriceOperation('set');
    setPriceValue('');
    setPriceType('fixed');
    setTagOperation('add');
    setTagInput('');
    setTagsToAdd([]);
    setTagsToRemove([]);
    setNewVendor('');
    setNewCategory('');
    setNewStatus('');
    setInventoryOperation('set');
    setInventoryValue('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Bulk Edit {selectedProducts.length} Products
          </DialogTitle>
        </DialogHeader>

        {isProcessing ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-semibold">Processing bulk edit...</p>
              <p className="text-muted-foreground">
                Updating {selectedProducts.length} products
              </p>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>
        ) : (
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">Edit Fields</TabsTrigger>
              <TabsTrigger value="preview">Preview Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6">
              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Select value={priceOperation} onValueChange={(value: any) => setPriceOperation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set">Set to</SelectItem>
                      <SelectItem value="increase">Increase by</SelectItem>
                      <SelectItem value="decrease">Decrease by</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={priceValue}
                    onChange={(e) => setPriceValue(e.target.value)}
                  />
                  {priceOperation !== 'set' && (
                    <Select value={priceType} onValueChange={(value: any) => setPriceType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tags</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={tagOperation} onValueChange={(value: any) => setTagOperation(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="add">Add</SelectItem>
                        <SelectItem value="remove">Remove</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Enter tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tagOperation === 'add') addTag();
                          else addTagToRemove();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={tagOperation === 'add' ? addTag : addTagToRemove}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {tagsToAdd.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-green-600">Tags to Add:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tagsToAdd.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-green-100">
                            {tag}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => removeTag(tag, 'add')}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {tagsToRemove.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-red-600">Tags to Remove:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tagsToRemove.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-red-100">
                            {tag}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => removeTag(tag, 'remove')}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vendor">Set Vendor</Label>
                    <Input
                      id="vendor"
                      placeholder="New vendor name"
                      value={newVendor}
                      onChange={(e) => setNewVendor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Set Category</Label>
                    <Input
                      id="category"
                      placeholder="New category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Visibility</h3>
                <Select value={newStatus} onValueChange={(value: '' | 'published' | 'draft') => setNewStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Publish</SelectItem>
                    <SelectItem value="draft">Set as Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Inventory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Inventory</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={inventoryOperation} onValueChange={(value: any) => setInventoryOperation(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set">Set to</SelectItem>
                      <SelectItem value="increase">Increase by</SelectItem>
                      <SelectItem value="decrease">Decrease by</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={inventoryValue}
                    onChange={(e) => setInventoryValue(e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Changes to be applied:</h3>
                <div className="space-y-2">
                  {generatePreview().map((op, index) => (
                    <div key={index} className="text-sm">
                      <strong>{op.field}</strong>: {op.operation} {op.value}
                    </div>
                  ))}
                  {generatePreview().length === 0 && (
                    <p className="text-muted-foreground">No changes to apply</p>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                These changes will be applied to {selectedProducts.length} selected products.
              </div>
            </TabsContent>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={applyBulkEdit} 
                disabled={generatePreview().length === 0}
              >
                Apply Changes
              </Button>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
