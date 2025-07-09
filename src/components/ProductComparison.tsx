import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  originalProduct: {
    handle: string;
    title: string;
    body_html: string | null;
    tags: string | null;
    type: string | null;
    category: string | null;
  };
  optimizedProduct: {
    title: string;
    description: string;
    tags: string;
    type: string;
    category: string;
  };
  onSave: () => void;
}

export function ProductComparison({ 
  isOpen, 
  onClose, 
  originalProduct, 
  optimizedProduct, 
  onSave 
}: ProductComparisonProps) {
  const [editedTitle, setEditedTitle] = useState(optimizedProduct.title);
  const [editedDescription, setEditedDescription] = useState(optimizedProduct.description);
  const [editedTags, setEditedTags] = useState(optimizedProduct.tags);
  const [editedType, setEditedType] = useState(optimizedProduct.type);
  const [editedCategory, setEditedCategory] = useState(optimizedProduct.category);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: editedTitle,
          type: editedType,
          category: editedCategory,
          body_html: editedDescription,
          tags: editedTags,
          updated_at: new Date().toISOString(),
        })
        .eq('handle', originalProduct.handle);

      if (error) {
        throw error;
      }

      toast({
        title: "Product updated successfully",
        description: "Your changes have been saved.",
      });
      
      // Notify QueueManager that user accepted changes
      if ((window as any).tempOnSave) {
        (window as any).tempOnSave();
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Notify QueueManager that user canceled changes
    if ((window as any).tempOnCancel) {
      (window as any).tempOnCancel();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Optimization Comparison</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison">Before vs After</TabsTrigger>
            <TabsTrigger value="edit">Edit Optimized Version</TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600">Original Version</h3>
                
                <div>
                  <Label className="text-sm font-medium">Title:</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                    <p className="text-sm">{originalProduct.title}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Type:</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                    <p className="text-sm">{originalProduct.type || 'No type'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description:</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1 max-h-60 overflow-y-auto">
                    <div className="text-sm prose prose-sm max-w-none" 
                         dangerouslySetInnerHTML={{ __html: originalProduct.body_html || 'No description' }} />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Category:</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                    <p className="text-sm">{originalProduct.category || 'No category'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Tags:</Label>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                    <p className="text-sm">{originalProduct.tags || 'No tags'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">AI Optimized Version</h3>
                
                <div>
                  <Label className="text-sm font-medium">Title:</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                    <p className="text-sm">{optimizedProduct.title}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Type:</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                    <p className="text-sm">{optimizedProduct.type}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description:</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1 max-h-60 overflow-y-auto">
                    <div className="text-sm prose prose-sm max-w-none" 
                         dangerouslySetInnerHTML={{ __html: optimizedProduct.description }} />
                  </div>
                </div>
                
                
                <div>
                  <Label className="text-sm font-medium">Category:</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                    <p className="text-sm">{optimizedProduct.category}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Tags:</Label>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                    <p className="text-sm">{optimizedProduct.tags}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Accept Changes'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Product Title</Label>
                <Input
                  id="edit-title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">Product Type</Label>
                <Input
                  id="edit-type"
                  value={editedType}
                  onChange={(e) => setEditedType(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Shampoo, Conditioner, Hair Oil"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Product Description (HTML)</Label>
                <Textarea
                  id="edit-description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={15}
                  className="mt-1 font-mono text-sm"
                  placeholder="Enter HTML formatted description..."
                />
              </div>
              
              <div>
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                  className="mt-1"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">Product Category</Label>
                <Input
                  id="edit-category"
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Health & Beauty > Personal Care > Cosmetics > Hair Care"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="p-4 border rounded-md bg-gray-50">
                  <h4 className="font-semibold mb-2">{editedTitle}</h4>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Type:</strong> {editedType}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Category:</strong> {editedCategory}
                  </div>
                  <div className="prose prose-sm max-w-none mb-2" 
                       dangerouslySetInnerHTML={{ __html: editedDescription }} />
                  <div className="text-sm text-gray-600">
                    <strong>Tags:</strong> {editedTags}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}