import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProductDrafts } from '@/hooks/useProductDrafts';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Trash2, Eye, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductWhisperDraftsProps {
  productHandle: string;
  children: React.ReactNode;
  onApplyDraft?: (draftData: any) => void;
}

export const ProductWhisperDrafts = ({ 
  productHandle, 
  children, 
  onApplyDraft 
}: ProductWhisperDraftsProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { drafts, isLoading, deleteDraft, isDeleting } = useProductDrafts(productHandle);
  const { toast } = useToast();

  const handleApplyDraft = (draft: any) => {
    if (onApplyDraft) {
      onApplyDraft(draft.optimized_data);
      toast({
        title: "Draft Applied",
        description: `Applied draft "${draft.draft_name}" to product`,
      });
      setOpen(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      deleteDraft(draftId);
    }
  };

  const DraftPreview = ({ draft }: { draft: any }) => (
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Draft Preview: {draft?.draft_name}</DialogTitle>
        </DialogHeader>
        
        {draft && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-sm border rounded p-2 bg-muted/50">{draft.optimized_data.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-sm border rounded p-2 bg-muted/50">{draft.optimized_data.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="text-sm border rounded p-2 bg-muted/50">{draft.optimized_data.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <p className="text-sm border rounded p-2 bg-muted/50">{draft.optimized_data.tags}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm border rounded p-3 bg-muted/50 whitespace-pre-wrap">
                {draft.optimized_data.description}
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                handleApplyDraft(draft);
                setPreviewOpen(false);
              }}>
                Apply Draft
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Product Drafts
              <Badge variant="outline">{productHandle}</Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading drafts...
              </div>
            ) : !drafts || drafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No drafts found for this product</p>
                <p className="text-sm">Drafts are automatically saved when using AI optimization</p>
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.map((draft: any) => (
                  <Card key={draft.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{draft.draft_name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Title:</span>
                            <p className="font-medium truncate">{draft.optimized_data.title}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <p className="font-medium">{draft.optimized_data.type}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="line-clamp-2 text-muted-foreground">
                            {draft.optimized_data.description?.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDraft(draft);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApplyDraft(draft)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDraft(draft.id)}
                          disabled={isDeleting}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{drafts?.length || 0} drafts available</span>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <DraftPreview draft={selectedDraft} />
    </>
  );
};