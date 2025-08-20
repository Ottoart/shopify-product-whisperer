import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, PlayCircle, PauseCircle, RotateCcw, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QueueItem {
  id: string;
  operation_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  failed_items: number;
  progress_percentage: number;
  metadata: any;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  error_log: string[] | null;
}

interface ProductWhisperQueueManagerProps {
  children: React.ReactNode;
}

export const ProductWhisperQueueManager = ({ children }: ProductWhisperQueueManagerProps) => {
  const [open, setOpen] = useState(false);
  const { session } = useSessionContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch queue items
  const { data: queueItems, isLoading, refetch } = useQuery({
    queryKey: ['queue-items'],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('batch_operations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as QueueItem[];
    },
    enabled: Boolean(session?.user?.id) && open,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Retry failed operation
  const retryMutation = useMutation({
    mutationFn: async (operationId: string) => {
      const { error } = await supabase
        .from('batch_operations')
        .update({
          status: 'pending',
          processed_items: 0,
          failed_items: 0,
          progress_percentage: 0,
          error_log: null,
          started_at: null,
          completed_at: null
        })
        .eq('id', operationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-items'] });
      toast({
        title: "Operation Restarted",
        description: "The failed operation has been added back to the queue",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Retry Failed",
        description: error.message || "Failed to retry operation",
        variant: "destructive",
      });
    },
  });

  // Delete operation
  const deleteMutation = useMutation({
    mutationFn: async (operationId: string) => {
      const { error } = await supabase
        .from('batch_operations')
        .delete()
        .eq('id', operationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-items'] });
      toast({
        title: "Operation Deleted",
        description: "The operation has been removed from the queue",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete operation",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatOperationType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEstimatedTimeRemaining = (item: QueueItem) => {
    if (item.status !== 'processing' || !item.started_at) return null;
    
    const startTime = new Date(item.started_at).getTime();
    const now = Date.now();
    const elapsed = now - startTime;
    const rate = item.processed_items / elapsed; // items per ms
    const remaining = item.total_items - item.processed_items;
    const estimatedMs = remaining / rate;
    
    if (estimatedMs < 60000) return 'Less than 1 minute';
    if (estimatedMs < 3600000) return `~${Math.round(estimatedMs / 60000)} minutes`;
    return `~${Math.round(estimatedMs / 3600000)} hours`;
  };

  const pendingCount = queueItems?.filter(item => item.status === 'pending').length || 0;
  const processingCount = queueItems?.filter(item => item.status === 'processing').length || 0;
  const completedCount = queueItems?.filter(item => item.status === 'completed').length || 0;
  const failedCount = queueItems?.filter(item => item.status === 'failed').length || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            AI Optimization Queue
            {processingCount > 0 && (
              <Badge className="bg-blue-500 animate-pulse">{processingCount} Processing</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Queue Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{processingCount}</p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{failedCount}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </Card>
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading queue...
            </div>
          ) : !queueItems || queueItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PlayCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No operations in queue</p>
              <p className="text-sm">AI optimizations will appear here when started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queueItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <CardTitle className="text-base">
                            {formatOperationType(item.operation_type)}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {item.metadata?.description || 'AI optimization operation'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {item.processed_items} / {item.total_items}</span>
                        <span>{item.progress_percentage}%</span>
                      </div>
                      <Progress value={item.progress_percentage} className="h-2" />
                      {item.failed_items > 0 && (
                        <p className="text-xs text-red-600">
                          {item.failed_items} items failed
                        </p>
                      )}
                    </div>

                    {/* Time estimates */}
                    {item.status === 'processing' && (
                      <div className="text-sm text-muted-foreground">
                        Started: {formatDistanceToNow(new Date(item.started_at!), { addSuffix: true })}
                        {getEstimatedTimeRemaining(item) && (
                          <span className="ml-4">
                            ETA: {getEstimatedTimeRemaining(item)}
                          </span>
                        )}
                      </div>
                    )}

                    {item.status === 'completed' && item.completed_at && (
                      <div className="text-sm text-green-600">
                        Completed: {formatDistanceToNow(new Date(item.completed_at), { addSuffix: true })}
                      </div>
                    )}

                    {/* Error logs */}
                    {item.status === 'failed' && item.error_log && item.error_log.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
                        <div className="text-xs text-red-700 space-y-1 max-h-20 overflow-y-auto">
                          {item.error_log.slice(0, 3).map((error, index) => (
                            <p key={index}>{error}</p>
                          ))}
                          {item.error_log.length > 3 && (
                            <p className="text-red-600">... and {item.error_log.length - 3} more errors</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      {item.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryMutation.mutate(item.id)}
                          disabled={retryMutation.isPending}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Retry
                        </Button>
                      )}
                      
                      {(item.status === 'completed' || item.status === 'failed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this operation?')) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Auto-refreshes every 5 seconds
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Refresh Now
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};