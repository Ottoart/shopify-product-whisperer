import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Zap, Upload, Download, Filter, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BulkOperation {
  id: string;
  name: string;
  type: 'price_update' | 'category_change' | 'tag_update' | 'status_change' | 'export' | 'import';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  startedAt?: Date;
  completedAt?: Date;
  errors: string[];
}

const mockOperations: BulkOperation[] = [
  {
    id: '1',
    name: 'Update Electronics Pricing',
    type: 'price_update',
    status: 'completed',
    progress: 100,
    totalItems: 1250,
    processedItems: 1250,
    failedItems: 0,
    startedAt: new Date('2024-01-15T10:00:00'),
    completedAt: new Date('2024-01-15T10:15:00'),
    errors: []
  },
  {
    id: '2',
    name: 'Import New Products',
    type: 'import',
    status: 'running',
    progress: 65,
    totalItems: 800,
    processedItems: 520,
    failedItems: 5,
    startedAt: new Date('2024-01-15T11:00:00'),
    errors: ['SKU-12345: Duplicate SKU found', 'SKU-67890: Invalid price format']
  },
  {
    id: '3',
    name: 'Category Reorganization',
    type: 'category_change',
    status: 'failed',
    progress: 45,
    totalItems: 2000,
    processedItems: 900,
    failedItems: 100,
    startedAt: new Date('2024-01-15T09:00:00'),
    errors: ['Database connection timeout', 'Invalid category mapping']
  }
];

export function BulkOperationsManager() {
  const [operations, setOperations] = useState<BulkOperation[]>(mockOperations);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'paused': return 'outline';
      default: return 'outline';
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'price_update': return '💰';
      case 'category_change': return '📁';
      case 'tag_update': return '🏷️';
      case 'status_change': return '🔄';
      case 'export': return '📤';
      case 'import': return '📥';
      default: return '⚙️';
    }
  };

  const pauseOperation = (operationId: string) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, status: 'paused' as const } : op
    ));
    toast({
      title: "Operation Paused",
      description: "The bulk operation has been paused.",
    });
  };

  const resumeOperation = (operationId: string) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, status: 'running' as const } : op
    ));
    toast({
      title: "Operation Resumed",
      description: "The bulk operation has been resumed.",
    });
  };

  const retryOperation = (operationId: string) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId ? { 
        ...op, 
        status: 'running' as const, 
        progress: 0, 
        processedItems: 0, 
        failedItems: 0,
        errors: []
      } : op
    ));
    toast({
      title: "Operation Restarted",
      description: "The bulk operation has been restarted.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bulk Operations</h2>
          <p className="text-muted-foreground">
            Manage large-scale data operations and imports
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                New Operation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Bulk Operation</DialogTitle>
                <DialogDescription>
                  Set up a new bulk operation to process multiple items
                </DialogDescription>
              </DialogHeader>
              <CreateOperationForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Operation Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Operations</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.filter(op => op.status === 'running').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Processed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.reduce((sum, op) => sum + op.processedItems, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.8%</div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Length</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {operations.filter(op => op.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Operations waiting
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Operations</TabsTrigger>
          <TabsTrigger value="history">Operation History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {operations.filter(op => ['running', 'pending', 'paused'].includes(op.status)).map((operation) => (
              <Card key={operation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getOperationIcon(operation.type)}</div>
                      <div>
                        <CardTitle className="text-lg">{operation.name}</CardTitle>
                        <CardDescription>
                          {operation.processedItems} of {operation.totalItems} items processed
                          {operation.failedItems > 0 && (
                            <span className="text-destructive ml-2">
                              • {operation.failedItems} failed
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(operation.status)}>
                        {operation.status}
                      </Badge>
                      {operation.status === 'running' && (
                        <Button variant="outline" size="sm" onClick={() => pauseOperation(operation.id)}>
                          <Pause className="h-3 w-3" />
                        </Button>
                      )}
                      {operation.status === 'paused' && (
                        <Button variant="outline" size="sm" onClick={() => resumeOperation(operation.id)}>
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {operation.status === 'failed' && (
                        <Button variant="outline" size="sm" onClick={() => retryOperation(operation.id)}>
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{operation.progress}%</span>
                      </div>
                      <Progress value={operation.progress} className="h-2" />
                    </div>
                    
                    {operation.errors.length > 0 && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          Errors Encountered
                        </div>
                        <div className="space-y-1">
                          {operation.errors.slice(0, 3).map((error, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {error}
                            </div>
                          ))}
                          {operation.errors.length > 3 && (
                            <div className="text-sm text-muted-foreground">
                              +{operation.errors.length - 3} more errors
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <div>{operation.startedAt?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <div className="capitalize">{operation.type.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <div>{operation.totalItems.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {operations.filter(op => ['completed', 'failed'].includes(op.status)).map((operation) => (
              <Card key={operation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getOperationIcon(operation.type)}</div>
                      <div>
                        <CardTitle className="text-lg">{operation.name}</CardTitle>
                        <CardDescription>
                          Completed {operation.completedAt?.toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(operation.status)}>
                      {operation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Items:</span>
                      <div className="font-medium">{operation.totalItems.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processed:</span>
                      <div className="font-medium">{operation.processedItems.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <div className="font-medium">{operation.failedItems.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <div className="font-medium">
                        {((operation.processedItems / operation.totalItems) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                name: 'Price Update Template',
                description: 'Bulk update product prices with percentage or fixed amounts',
                fields: ['SKU', 'New Price', 'Price Type']
              },
              {
                name: 'Category Migration',
                description: 'Move products between categories in bulk',
                fields: ['SKU', 'Current Category', 'New Category']
              },
              {
                name: 'Inventory Sync',
                description: 'Update inventory quantities from external source',
                fields: ['SKU', 'Quantity', 'Location']
              },
              {
                name: 'Tag Management',
                description: 'Add or remove tags from multiple products',
                fields: ['SKU', 'Tags to Add', 'Tags to Remove']
              }
            ].map((template, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Required Fields:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.fields.map((field) => (
                          <Badge key={field} variant="outline" className="text-xs">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download Template
                      </Button>
                      <Button variant="outline" size="sm">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreateOperationForm({ onClose }: { onClose: () => void }) {
  const [operationType, setOperationType] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Operation Created",
      description: "Your bulk operation has been queued and will start shortly.",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="operation-name">Operation Name</Label>
          <Input id="operation-name" placeholder="Enter operation name" />
        </div>
        
        <div>
          <Label htmlFor="operation-type">Operation Type</Label>
          <Select value={operationType} onValueChange={setOperationType}>
            <SelectTrigger>
              <SelectValue placeholder="Select operation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price_update">Price Update</SelectItem>
              <SelectItem value="category_change">Category Change</SelectItem>
              <SelectItem value="tag_update">Tag Update</SelectItem>
              <SelectItem value="status_change">Status Change</SelectItem>
              <SelectItem value="import">Data Import</SelectItem>
              <SelectItem value="export">Data Export</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="data-source">Data Source</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select data source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv_upload">CSV Upload</SelectItem>
              <SelectItem value="selected_products">Selected Products</SelectItem>
              <SelectItem value="filter_criteria">Filter Criteria</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="file-upload">Upload File (Optional)</Label>
          <Input id="file-upload" type="file" accept=".csv,.xlsx" />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe the operation..." />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="validate-data" />
          <Label htmlFor="validate-data" className="text-sm">
            Validate data before processing
          </Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Operation
        </Button>
      </div>
    </form>
  );
}