import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAIOptimizationWithLearning } from "@/hooks/useAIOptimizationWithLearning";
import { useProductDrafts } from "@/hooks/useProductDrafts";
import { RefreshCw, Save, FolderOpen } from "lucide-react";

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
    vendor: string | null;
  };
  optimizedProduct: {
    title: string;
    description: string;
    tags: string;
    type: string;
    category: string;
  };
  onSave: () => void;
  onReprocess?: (productData: any) => void;
}

export function ProductComparison({ 
  isOpen, 
  onClose, 
  originalProduct, 
  optimizedProduct, 
  onSave,
  onReprocess
}: ProductComparisonProps) {
  const [editedTitle, setEditedTitle] = useState(optimizedProduct.title);
  const [editedDescription, setEditedDescription] = useState(optimizedProduct.description);
  const [editedTags, setEditedTags] = useState(optimizedProduct.tags);
  const [editedType, setEditedType] = useState(optimizedProduct.type);
  const [editedCategory, setEditedCategory] = useState(optimizedProduct.category);
  const [isLoading, setIsLoading] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const { toast } = useToast();
  
  // Initialize hooks for AI reprocessing and draft management
  const { optimizeWithLearning, isOptimizing } = useAIOptimizationWithLearning();
  const { drafts, saveDraft, deleteDraft, isSaving } = useProductDrafts(originalProduct.handle);

  // Reset edited values when optimizedProduct changes
  useEffect(() => {
    setEditedTitle(optimizedProduct.title);
    setEditedDescription(optimizedProduct.description);
    setEditedTags(optimizedProduct.tags);
    setEditedType(optimizedProduct.type);
    setEditedCategory(optimizedProduct.category);
  }, [optimizedProduct]);

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

  const handleReprocess = async () => {
    if (!onReprocess) return;
    
    try {
      const productData = {
        title: originalProduct.title,
        type: originalProduct.type,
        description: originalProduct.body_html,
        tags: originalProduct.tags,
        vendor: originalProduct.vendor || 'Premium Beauty' // Use actual vendor or fallback
      };
      
      onReprocess(productData);
      toast({
        title: "Reprocessing Product",
        description: "AI is generating a new optimized version...",
      });
    } catch (error) {
      toast({
        title: "Reprocess Failed",
        description: "Failed to reprocess product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsDraft = async () => {
    if (!draftName.trim()) {
      toast({
        title: "Draft Name Required",
        description: "Please enter a name for your draft.",
        variant: "destructive",
      });
      return;
    }

    const optimizedData = {
      title: editedTitle,
      description: editedDescription,
      tags: editedTags,
      type: editedType,
      category: editedCategory,
    };

    saveDraft(draftName, optimizedData);
    setDraftName(''); // Clear draft name after saving
  };

  const handleLoadDraft = (draftId: string) => {
    const draft = drafts?.find(d => d.id === draftId);
    if (draft && draft.optimized_data && typeof draft.optimized_data === 'object') {
      const data = draft.optimized_data as {
        title: string;
        description: string;
        tags: string;
        type: string;
        category: string;
      };
      
      setEditedTitle(data.title);
      setEditedDescription(data.description);
      setEditedTags(data.tags);
      setEditedType(data.type);
      setEditedCategory(data.category);
      
      toast({
        title: "Draft Loaded",
        description: `Loaded draft: ${draft.draft_name}`,
      });
    }
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
            
            <div className="flex flex-wrap justify-between items-center gap-2 pt-4">
              <div className="flex space-x-2">
                {onReprocess && (
                  <Button 
                    variant="outline" 
                    onClick={handleReprocess} 
                    disabled={isOptimizing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                    {isOptimizing ? 'Reprocessing...' : 'Reprocess'}
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Accept Changes'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            {/* Draft Management Section */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Draft Management
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="draft-name">Save Current as Draft</Label>
                  <div className="flex gap-2">
                    <Input
                      id="draft-name"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Enter draft name..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveAsDraft} 
                      disabled={isSaving || !draftName.trim()}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="load-draft">Load Existing Draft</Label>
                  <div className="flex gap-2">
                    <Select value={selectedDraftId} onValueChange={setSelectedDraftId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a draft..." />
                      </SelectTrigger>
                      <SelectContent>
                        {drafts?.map((draft) => (
                          <SelectItem key={draft.id} value={draft.id}>
                            {draft.draft_name} ({new Date(draft.created_at).toLocaleDateString()})
                          </SelectItem>
                        ))}
                        {!drafts?.length && (
                          <SelectItem value="none" disabled>No drafts available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => handleLoadDraft(selectedDraftId)} 
                      disabled={!selectedDraftId}
                      variant="outline"
                    >
                      Load
                    </Button>
                    <Button 
                      onClick={() => deleteDraft(selectedDraftId)} 
                      disabled={!selectedDraftId}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
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