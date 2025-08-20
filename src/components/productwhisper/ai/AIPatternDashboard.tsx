import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import { usePatternLearning } from '@/hooks/usePatternLearning';
import { AIPromptVisualizer } from '@/components/AIPromptVisualizer';

interface AIPatternDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIPatternDashboard({ isOpen, onClose }: AIPatternDashboardProps) {
  const { 
    patterns, 
    approvedPatterns, 
    editHistory, 
    isLoading, 
    analyzePatterns, 
    approvePattern, 
    rejectPattern,
    deleteEdit,
    isAnalyzing 
  } = usePatternLearning();

  const [selectedTab, setSelectedTab] = useState('overview');

  const getPatternStats = () => {
    const total = patterns?.length || 0;
    const approved = approvedPatterns?.length || 0;
    const pending = patterns?.filter(p => p.is_approved === null).length || 0;
    const rejected = patterns?.filter(p => p.is_approved === false).length || 0;
    
    return { total, approved, pending, rejected };
  };

  const stats = getPatternStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPatternDescription = (pattern: any) => {
    const data = pattern.pattern_data;
    if (data.field_preferences) {
      const fields = Object.keys(data.field_preferences);
      return `Prefers ${fields.join(', ')} optimizations`;
    }
    return data.description || 'Custom optimization pattern';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Pattern Learning Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="history">Edit History</TabsTrigger>
            <TabsTrigger value="prompt">AI Prompt</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[65vh] mt-4">
            <TabsContent value="overview" className="space-y-4">
              {/* Stats Overview */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Patterns</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={analyzePatterns} 
                    disabled={isAnalyzing}
                    className="w-full justify-start gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    {isAnalyzing ? 'Analyzing...' : 'Analyze New Patterns'}
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    Last analysis: {editHistory?.[0] ? formatDate(editHistory[0].created_at) : 'Never'}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {editHistory?.slice(0, 5).map((edit) => (
                      <div key={edit.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {edit.field_name} updated
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {edit.product_handle} • {formatDate(edit.created_at)}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {edit.edit_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Learning Patterns</h3>
                <Button onClick={analyzePatterns} disabled={isAnalyzing} size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Patterns'}
                </Button>
              </div>

              <div className="space-y-3">
                {patterns?.map((pattern) => (
                  <Card key={pattern.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{pattern.pattern_type}</Badge>
                            <Badge variant={
                              pattern.is_approved === true ? 'default' :
                              pattern.is_approved === false ? 'destructive' : 'secondary'
                            }>
                              {pattern.is_approved === true ? 'Approved' :
                               pattern.is_approved === false ? 'Rejected' : 'Pending'}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(pattern.confidence_score * 100)}% confidence
                            </div>
                          </div>
                          
                          <div className="text-sm mb-2">
                            {getPatternDescription(pattern)}
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Used {pattern.usage_count} times • Created {formatDate(pattern.created_at)}
                          </div>
                        </div>
                        
                        {pattern.is_approved === null && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => approvePattern(pattern.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => rejectPattern(pattern.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <div className="text-muted-foreground">
                        No patterns found. Start optimizing products to generate learning patterns.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Edit History</h3>
                <div className="text-sm text-muted-foreground">
                  {editHistory?.length || 0} edits tracked
                </div>
              </div>

              <div className="space-y-2">
                {editHistory?.map((edit) => (
                  <Card key={edit.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {edit.field_name}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {edit.edit_type}
                            </Badge>
                          </div>
                          
                          <div className="text-sm font-medium mb-1">
                            {edit.product_handle}
                          </div>
                          
                          {edit.before_value && edit.after_value && (
                            <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2">
                              <div>
                                <span className="font-medium">Before:</span> {edit.before_value.substring(0, 50)}...
                              </div>
                              <div>
                                <span className="font-medium">After:</span> {edit.after_value.substring(0, 50)}...
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(edit.created_at)}
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteEdit(edit.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) || (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <div className="text-muted-foreground">
                        No edit history found. Your edits will appear here as you make changes.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="prompt">
              <AIPromptVisualizer />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}