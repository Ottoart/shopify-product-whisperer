import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { History, RotateCcw, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChangeHistoryDialogProps {
  productHandle?: string;
  children: React.ReactNode;
}

interface EditHistory {
  id: string;
  product_handle: string;
  field_name: string;
  before_value: string;
  after_value: string;
  edit_type: 'manual' | 'ai_suggestion' | 'bulk_edit';
  created_at: string;
}

export const ChangeHistoryDialog = ({ productHandle, children }: ChangeHistoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { session } = useSessionContext();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, productHandle]);

  const fetchHistory = async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('product_edit_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (productHandle) {
        query = query.eq('product_handle', productHandle);
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      setHistory((data || []) as EditHistory[]);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Failed to load change history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const revertChange = async (change: EditHistory) => {
    try {
      // Get current product data
      const { data: product, error: fetchError } = await (supabase as any)
        .from('products')
        .select('*')
        .eq('handle', change.product_handle)
        .eq('user_id', session?.user?.id)
        .single();

      if (fetchError) throw fetchError;

      // Prepare update object with reverted value
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map field names to database columns
      const fieldMap: Record<string, string> = {
        'title': 'title',
        'description': 'body_html',
        'tags': 'tags',
        'type': 'type',
        'category': 'category',
        'vendor': 'vendor',
        'price': 'variant_price',
        'inventory': 'variant_inventory_qty',
        'sku': 'variant_sku'
      };

      const dbField = fieldMap[change.field_name] || change.field_name;
      updateData[dbField] = change.before_value;

      // Update the product
      const { error: updateError } = await (supabase as any)
        .from('products')
        .update(updateData)
        .eq('handle', change.product_handle)
        .eq('user_id', session?.user?.id);

      if (updateError) throw updateError;

      // Record the reversion in history
      await (supabase as any)
        .from('product_edit_history')
        .insert({
          user_id: session?.user?.id,
          product_handle: change.product_handle,
          field_name: change.field_name,
          before_value: change.after_value,
          after_value: change.before_value,
          edit_type: 'manual'
        });

      toast({
        title: "Change Reverted",
        description: `${change.field_name} has been reverted to previous value`,
      });

      fetchHistory(); // Refresh history
    } catch (error) {
      console.error('Error reverting change:', error);
      toast({
        title: "Revert Failed",
        description: "Failed to revert the change",
        variant: "destructive",
      });
    }
  };

  const filteredHistory = history.filter(change => {
    const matchesSearch = 
      change.product_handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.field_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.before_value?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      change.after_value?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesField = fieldFilter === 'all' || change.field_name === fieldFilter;
    const matchesType = typeFilter === 'all' || change.edit_type === typeFilter;

    return matchesSearch && matchesField && matchesType;
  });

  const uniqueFields = [...new Set(history.map(h => h.field_name))];

  const getEditTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'ai_suggestion': return 'bg-purple-100 text-purple-800';
      case 'bulk_edit': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFieldName = (field: string) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const truncateValue = (value: string, maxLength = 50) => {
    if (!value) return 'Empty';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
            {productHandle && (
              <Badge variant="outline" className="ml-2">
                {productHandle}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search changes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={fieldFilter} onValueChange={setFieldFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All fields" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fields</SelectItem>
              {uniqueFields.map(field => (
                <SelectItem key={field} value={field}>
                  {formatFieldName(field)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="ai_suggestion">AI Suggestion</SelectItem>
              <SelectItem value="bulk_edit">Bulk Edit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-96">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading change history...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No changes found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((change) => (
                <Card key={change.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {formatFieldName(change.field_name)}
                        </Badge>
                        <Badge className={getEditTypeColor(change.edit_type)}>
                          {change.edit_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(change.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {!productHandle && (
                        <div className="text-sm font-medium text-muted-foreground">
                          Product: {change.product_handle}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Before:</div>
                          <div className="bg-red-50 text-red-700 p-2 rounded border">
                            {truncateValue(change.before_value)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">After:</div>
                          <div className="bg-green-50 text-green-700 p-2 rounded border">
                            {truncateValue(change.after_value)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revertChange(change)}
                      className="ml-4"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Revert
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Showing {filteredHistory.length} of {history.length} changes</span>
          <Button variant="outline" onClick={fetchHistory} disabled={loading}>
            Refresh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};