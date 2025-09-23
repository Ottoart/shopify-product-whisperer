import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Pause, Settings, Plus, AlertTriangle, CheckCircle, Calendar, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface WorkflowRule {
  id: string;
  name: string;
  type: 'auto_approval' | 'bulk_operation' | 'scheduled_task' | 'notification';
  isActive: boolean;
  trigger: string;
  conditions: Record<string, any>;
  actions: string[];
  lastRun?: Date;
  nextRun?: Date;
  successRate: number;
}

const mockWorkflows: WorkflowRule[] = [
  {
    id: '1',
    name: 'Auto-approve High Confidence Pricing',
    type: 'auto_approval',
    isActive: true,
    trigger: 'ai_recommendation_created',
    conditions: { confidence_threshold: 95, type: 'pricing' },
    actions: ['approve_recommendation', 'apply_changes'],
    lastRun: new Date('2024-01-15T10:30:00'),
    nextRun: new Date('2024-01-16T10:30:00'),
    successRate: 94
  },
  {
    id: '2',
    name: 'Daily Inventory Optimization',
    type: 'scheduled_task',
    isActive: true,
    trigger: 'schedule',
    conditions: { frequency: 'daily', time: '09:00' },
    actions: ['analyze_inventory', 'generate_recommendations'],
    lastRun: new Date('2024-01-15T09:00:00'),
    nextRun: new Date('2024-01-16T09:00:00'),
    successRate: 98
  },
  {
    id: '3',
    name: 'Low Stock Alerts',
    type: 'notification',
    isActive: true,
    trigger: 'inventory_threshold',
    conditions: { stock_level: 10, categories: ['electronics', 'books'] },
    actions: ['send_notification', 'create_reorder_task'],
    lastRun: new Date('2024-01-15T14:22:00'),
    successRate: 100
  },
  {
    id: '4',
    name: 'Weekly Competitor Analysis',
    type: 'scheduled_task',
    isActive: false,
    trigger: 'schedule',
    conditions: { frequency: 'weekly', day: 'monday', time: '08:00' },
    actions: ['scrape_competitor_prices', 'generate_competitive_report'],
    lastRun: new Date('2024-01-08T08:00:00'),
    nextRun: new Date('2024-01-22T08:00:00'),
    successRate: 89
  }
];

export function AutomatedWorkflowManager() {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(mockWorkflows);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
    
    const workflow = workflows.find(w => w.id === workflowId);
    toast({
      title: `Workflow ${workflow?.isActive ? 'Disabled' : 'Enabled'}`,
      description: `${workflow?.name} has been ${workflow?.isActive ? 'disabled' : 'enabled'}.`,
    });
  };

  const runWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    toast({
      title: "Workflow Started",
      description: `${workflow?.name} is now running...`,
    });
    console.log(`Running workflow: ${workflowId}`);
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'auto_approval': return <CheckCircle className="h-4 w-4" />;
      case 'bulk_operation': return <Zap className="h-4 w-4" />;
      case 'scheduled_task': return <Calendar className="h-4 w-4" />;
      case 'notification': return <AlertTriangle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getStatusColor = (isActive: boolean, successRate: number) => {
    if (!isActive) return 'secondary';
    if (successRate >= 95) return 'default';
    if (successRate >= 80) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Automated Workflows</h2>
          <p className="text-muted-foreground">
            Manage and monitor your automated business processes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Set up automated processes to streamline your operations
              </DialogDescription>
            </DialogHeader>
            <CreateWorkflowForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              {workflows.length} total workflows
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.2%</div>
            <p className="text-xs text-muted-foreground">
              Average across all workflows
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              8 completed, 4 pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23.5h</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Tasks</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getWorkflowIcon(workflow.type)}
                      <div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <CardDescription>
                          Trigger: {workflow.trigger} | Success Rate: {workflow.successRate}%
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(workflow.isActive, workflow.successRate)}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Switch
                        checked={workflow.isActive}
                        onCheckedChange={() => toggleWorkflow(workflow.id)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Run:</span>
                        <div>{workflow.lastRun?.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Next Run:</span>
                        <div>{workflow.nextRun?.toLocaleDateString() || 'On trigger'}</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => runWorkflow(workflow.id)}>
                        <Play className="h-3 w-3 mr-1" />
                        Run Now
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedWorkflow(workflow)}>
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Scheduled Tasks</CardTitle>
              <CardDescription>
                Tasks scheduled to run automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.filter(w => w.nextRun).map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getWorkflowIcon(workflow.type)}
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {workflow.nextRun?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {workflow.isActive ? 'Scheduled' : 'Paused'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                History of workflow executions and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Daily Inventory Optimization', time: '2 hours ago', status: 'success', duration: '45s' },
                  { name: 'Auto-approve High Confidence Pricing', time: '4 hours ago', status: 'success', duration: '12s' },
                  { name: 'Low Stock Alerts', time: '6 hours ago', status: 'success', duration: '3s' },
                  { name: 'Weekly Competitor Analysis', time: '1 day ago', status: 'failed', duration: '2m 15s' },
                ].map((execution, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{execution.name}</div>
                      <div className="text-sm text-muted-foreground">{execution.time}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{execution.duration}</span>
                      <Badge variant={execution.status === 'success' ? 'default' : 'destructive'}>
                        {execution.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateWorkflowForm({ onClose }: { onClose: () => void }) {
  const [workflowType, setWorkflowType] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Workflow Created",
      description: "Your new workflow has been created and is now active.",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input id="workflow-name" placeholder="Enter workflow name" />
        </div>
        
        <div>
          <Label htmlFor="workflow-type">Workflow Type</Label>
          <Select value={workflowType} onValueChange={setWorkflowType}>
            <SelectTrigger>
              <SelectValue placeholder="Select workflow type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto_approval">Auto Approval</SelectItem>
              <SelectItem value="bulk_operation">Bulk Operation</SelectItem>
              <SelectItem value="scheduled_task">Scheduled Task</SelectItem>
              <SelectItem value="notification">Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="trigger">Trigger Condition</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ai_recommendation">AI Recommendation Created</SelectItem>
              <SelectItem value="inventory_change">Inventory Change</SelectItem>
              <SelectItem value="schedule">Time-based Schedule</SelectItem>
              <SelectItem value="threshold">Threshold Reached</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="confidence">Confidence Threshold (%)</Label>
          <Input id="confidence" type="number" placeholder="85" min="0" max="100" />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Workflow
        </Button>
      </div>
    </form>
  );
}