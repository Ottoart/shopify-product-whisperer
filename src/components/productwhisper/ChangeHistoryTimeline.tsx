import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useChangeHistory, ChangeHistoryEntry } from '@/hooks/useChangeHistory';
import { formatDistanceToNow, format, startOfDay, subDays } from 'date-fns';
import { History, RotateCcw, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChangeHistoryTimelineProps {
  productHandle?: string;
  children: React.ReactNode;
}

export const ChangeHistoryTimeline = ({ productHandle, children }: ChangeHistoryTimelineProps) => {
  const [open, setOpen] = useState(false);
  const { getHistory, revertChange, isReverting } = useChangeHistory();
  const [history, setHistory] = useState<ChangeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, productHandle]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(productHandle, 50);
      setHistory(data as ChangeHistoryEntry[]);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group changes by date for timeline
  const timelineData = useMemo(() => {
    const grouped = history.reduce((acc, change) => {
      const date = format(new Date(change.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(change);
      return acc;
    }, {} as Record<string, ChangeHistoryEntry[]>);

    return Object.entries(grouped)
      .map(([date, changes]) => ({
        date,
        changes,
        count: changes.length,
        types: [...new Set(changes.map(c => c.edit_type))]
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [history]);

  // Performance analytics
  const performanceData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dayChanges = history.filter(change => 
        startOfDay(new Date(change.created_at)).getTime() === startOfDay(date).getTime()
      );
      
      return {
        date: format(date, 'MMM dd'),
        changes: dayChanges.length,
        aiOptimizations: dayChanges.filter(c => c.edit_type === 'ai_suggestion').length,
        manualEdits: dayChanges.filter(c => c.edit_type === 'manual').length,
      };
    }).reverse();

    return last7Days;
  }, [history]);

  const getEditTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_suggestion': return '🤖';
      case 'bulk_edit': return '📦';
      case 'manual': return '✏️';
      default: return '📝';
    }
  };

  const getEditTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-500';
      case 'ai_suggestion': return 'bg-purple-500';
      case 'bulk_edit': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatFieldName = (field: string) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const truncateValue = (value: string, maxLength = 30) => {
    if (!value) return 'Empty';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  const totalChanges = history.length;
  const aiOptimizations = history.filter(h => h.edit_type === 'ai_suggestion').length;
  const manualEdits = history.filter(h => h.edit_type === 'manual').length;
  const bulkEdits = history.filter(h => h.edit_type === 'bulk_edit').length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History Timeline
            {productHandle && (
              <Badge variant="outline">{productHandle}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Activity Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4" />
                    Total Changes
                  </span>
                  <Badge variant="secondary">{totalChanges}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    🤖 AI Optimizations
                  </span>
                  <Badge className="bg-purple-500">{aiOptimizations}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    ✏️ Manual Edits
                  </span>
                  <Badge className="bg-blue-500">{manualEdits}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    📦 Bulk Edits
                  </span>
                  <Badge className="bg-green-500">{bulkEdits}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">7-Day Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="changes"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-3">
            <ScrollArea className="h-[500px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading timeline...
                </div>
              ) : timelineData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No changes found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {timelineData.map(({ date, changes, count, types }) => (
                    <div key={date} className="relative">
                      {/* Date header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary/10 px-3 py-1 rounded-full">
                          <span className="text-sm font-medium">
                            {format(new Date(date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {count} changes
                        </Badge>
                        <div className="flex gap-1">
                          {types.map(type => (
                            <div
                              key={type}
                              className={`w-2 h-2 rounded-full ${getEditTypeColor(type)}`}
                              title={type}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Changes for this date */}
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        {changes.map((change, index) => (
                          <Card key={change.id} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-7 top-4 w-3 h-3 rounded-full border-2 border-background ${getEditTypeColor(change.edit_type)}`} />
                            
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getEditTypeIcon(change.edit_type)}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {formatFieldName(change.field_name)}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(change.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                  
                                  {!productHandle && (
                                    <div className="text-sm text-muted-foreground">
                                      Product: <span className="font-medium">{change.product_handle}</span>
                                    </div>
                                  )}
                                  
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="space-y-1">
                                      <div className="text-xs text-muted-foreground">Before:</div>
                                      <div className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs border">
                                        {truncateValue(change.before_value)}
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-xs text-muted-foreground">After:</div>
                                      <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs border">
                                        {truncateValue(change.after_value)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => revertChange(change)}
                                  disabled={isReverting}
                                  className="ml-4"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Revert
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing last 50 changes
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadHistory} disabled={loading}>
              Refresh
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