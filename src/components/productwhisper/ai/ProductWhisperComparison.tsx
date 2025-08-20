import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Scale,
  X,
  Check,
  Edit,
  ArrowRight,
  Sparkles,
  Eye,
  Save
} from "lucide-react";
import { ProductWhisperItem } from "@/types/productwhisper";
import { useToast } from "@/hooks/use-toast";

interface ProductWhisperComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  originalProduct: ProductWhisperItem;
  optimizedData: any;
  onApplyChanges: (changes: any) => void;
}

export function ProductWhisperComparison({
  isOpen,
  onClose,
  originalProduct,
  optimizedData,
  onApplyChanges
}: ProductWhisperComparisonProps) {
  const { toast } = useToast();
  const [editableData, setEditableData] = useState(optimizedData);
  const [isEditing, setIsEditing] = useState(false);

  const getComparisonRows = () => {
    const rows = [];
    
    // Title comparison
    if (optimizedData.title && optimizedData.title !== originalProduct.title) {
      rows.push({
        field: 'Title',
        original: originalProduct.title,
        optimized: editableData.title,
        isChanged: optimizedData.title !== originalProduct.title
      });
    }
    
    // Description comparison
    if (optimizedData.body_html && optimizedData.body_html !== originalProduct.body_html) {
      rows.push({
        field: 'Description',
        original: originalProduct.body_html?.substring(0, 100) + '...',
        optimized: editableData.body_html?.substring(0, 100) + '...',
        isChanged: optimizedData.body_html !== originalProduct.body_html
      });
    }
    
    // SEO Title
    if (optimizedData.seo_title && optimizedData.seo_title !== originalProduct.seo_title) {
      rows.push({
        field: 'SEO Title',
        original: originalProduct.seo_title || 'Not set',
        optimized: editableData.seo_title,
        isChanged: true
      });
    }
    
    // SEO Description
    if (optimizedData.seo_description && optimizedData.seo_description !== originalProduct.seo_description) {
      rows.push({
        field: 'SEO Description',
        original: originalProduct.seo_description || 'Not set',
        optimized: editableData.seo_description,
        isChanged: true
      });
    }
    
    // Tags
    if (optimizedData.tags && optimizedData.tags !== originalProduct.tags) {
      rows.push({
        field: 'Tags',
        original: originalProduct.tags || 'No tags',
        optimized: editableData.tags,
        isChanged: optimizedData.tags !== originalProduct.tags
      });
    }
    
    // Vendor
    if (optimizedData.vendor && optimizedData.vendor !== originalProduct.vendor) {
      rows.push({
        field: 'Vendor',
        original: originalProduct.vendor || 'Not set',
        optimized: editableData.vendor,
        isChanged: true
      });
    }

    return rows;
  };

  const handleApplyChanges = () => {
    onApplyChanges(editableData);
    toast({
      title: "Changes Applied",
      description: "Product has been updated with AI optimizations.",
    });
    onClose();
  };

  const handleEditField = (field: string, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const comparisonRows = getComparisonRows();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            AI Optimization Results
            <Badge variant="secondary" className="ml-2">
              {comparisonRows.length} changes suggested
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh]">
          <div className="space-y-6">
            {/* Product Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {originalProduct.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  AI has analyzed your product and suggested {comparisonRows.length} improvements.
                  Review the changes below and edit them if needed before applying.
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Comparison Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Field</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>AI Suggestion</TableHead>
                  <TableHead className="w-16">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.field}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm bg-muted/50 p-2 rounded">
                        {row.original}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {isEditing ? (
                        <textarea
                          value={row.optimized}
                          onChange={(e) => handleEditField(row.field.toLowerCase().replace(/\s+/g, '_'), e.target.value)}
                          className="w-full p-2 text-sm border rounded resize-none"
                          rows={2}
                        />
                      ) : (
                        <div className="text-sm bg-green-50 border border-green-200 p-2 rounded">
                          {row.optimized}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.isChanged && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Updated
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {comparisonRows.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="text-muted-foreground">
                    No changes suggested. Your product is already well optimized!
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Stop Editing' : 'Edit Suggestions'}
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyChanges}
              disabled={comparisonRows.length === 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}