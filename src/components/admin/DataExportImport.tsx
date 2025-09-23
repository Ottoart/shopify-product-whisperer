import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, Database, AlertCircle, CheckCircle, X, Eye } from "lucide-react";

interface ExportJob {
  id: string;
  name: string;
  table: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  recordCount: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

interface ImportJob {
  id: string;
  name: string;
  table: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  createdAt: string;
  completedAt?: string;
  errors: string[];
}

export const DataExportImport: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFilters, setExportFilters] = useState('');
  const [importMapping, setImportMapping] = useState<{[key: string]: string}>({});
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const availableTables = [
    { value: 'orders', label: 'Orders', count: 1250 },
    { value: 'order_items', label: 'Order Items', count: 3400 },
    { value: 'products', label: 'Products', count: 890 },
    { value: 'users', label: 'Users', count: 450 },
    { value: 'marketplace_configurations', label: 'Marketplace Configs', count: 125 },
    { value: 'inventory_submissions', label: 'Inventory Submissions', count: 67 },
  ];

  const exportFormats = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
    { value: 'xml', label: 'XML', description: 'Extensible Markup Language' },
  ];

  const startExport = async () => {
    if (!selectedTable) {
      toast({
        title: "Error",
        description: "Please select a table to export",
        variant: "destructive"
      });
      return;
    }

    const tableInfo = availableTables.find(t => t.value === selectedTable);
    const newJob: ExportJob = {
      id: Date.now().toString(),
      name: `${tableInfo?.label} Export`,
      table: selectedTable,
      status: 'pending',
      progress: 0,
      recordCount: tableInfo?.count || 0,
      createdAt: new Date().toISOString()
    };

    setExportJobs(prev => [newJob, ...prev]);

    // Simulate export process
    await simulateExportProcess(newJob.id);
  };

  const simulateExportProcess = async (jobId: string) => {
    // Update to running
    setExportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'running' as const } : job
    ));

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, progress: i } : job
      ));
    }

    // Complete
    setExportJobs(prev => prev.map(job => 
      job.id === jobId ? { 
        ...job, 
        status: 'completed' as const, 
        completedAt: new Date().toISOString(),
        downloadUrl: `#download-${jobId}`
      } : job
    ));

    toast({
      title: "Success",
      description: "Export completed successfully"
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedTable) {
      toast({
        title: "Error",
        description: "Please select a destination table first",
        variant: "destructive"
      });
      return;
    }

    // Generate preview data
    const mockPreview = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      column1: `Sample Data ${i + 1}`,
      column2: Math.floor(Math.random() * 1000),
      column3: new Date().toISOString().split('T')[0],
      column4: Math.random() > 0.5 ? 'Active' : 'Inactive'
    }));

    setPreviewData(mockPreview);
    setShowPreview(true);
  };

  const startImport = async () => {
    if (!selectedTable || previewData.length === 0) {
      toast({
        title: "Error",
        description: "Please select a file and table first",
        variant: "destructive"
      });
      return;
    }

    const newJob: ImportJob = {
      id: Date.now().toString(),
      name: `Import to ${selectedTable}`,
      table: selectedTable,
      status: 'pending',
      progress: 0,
      totalRows: 1000,
      processedRows: 0,
      errorRows: 0,
      createdAt: new Date().toISOString(),
      errors: []
    };

    setImportJobs(prev => [newJob, ...prev]);
    setShowPreview(false);
    setPreviewData([]);

    // Simulate import process
    await simulateImportProcess(newJob.id);
  };

  const simulateImportProcess = async (jobId: string) => {
    setImportJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'running' as const } : job
    ));

    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 150));
      const processedRows = Math.floor((i / 100) * 1000);
      const errorRows = Math.floor(Math.random() * 10);
      
      setImportJobs(prev => prev.map(job => 
        job.id === jobId ? { 
          ...job, 
          progress: i,
          processedRows,
          errorRows
        } : job
      ));
    }

    setImportJobs(prev => prev.map(job => 
      job.id === jobId ? { 
        ...job, 
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        errors: ['Row 15: Invalid email format', 'Row 23: Missing required field']
      } : job
    ));

    toast({
      title: "Success",
      description: "Import completed with minor errors"
    });
  };

  const downloadExport = (job: ExportJob) => {
    // Simulate file download
    const blob = new Blob(['Sample export data'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${job.table}_export.${exportFormat}`;
    link.click();
  };

  const cancelJob = (jobId: string, type: 'export' | 'import') => {
    if (type === 'export') {
      setExportJobs(prev => prev.filter(job => job.id !== jobId));
    } else {
      setImportJobs(prev => prev.filter(job => job.id !== jobId));
    }
    toast({
      title: "Cancelled",
      description: "Job cancelled successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Export & Import</h2>
          <p className="text-muted-foreground">Manage data transfers and bulk operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Data Export
            </CardTitle>
            <CardDescription>Export data from your database tables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Table</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose table to export" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      <div className="flex justify-between items-center w-full">
                        <span>{table.label}</span>
                        <Badge variant="outline" className="ml-2">
                          {table.count} records
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exportFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div>
                        <div className="font-medium">{format.label}</div>
                        <div className="text-xs text-muted-foreground">{format.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filters (Optional)</Label>
              <Textarea
                value={exportFilters}
                onChange={(e) => setExportFilters(e.target.value)}
                placeholder="WHERE status = 'active' AND created_at > '2024-01-01'"
                rows={3}
              />
            </div>

            <Button onClick={startExport} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Start Export
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Data Import
            </CardTitle>
            <CardDescription>Import data from CSV, JSON, or Excel files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Destination Table</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose destination table" />
                </SelectTrigger>
                <SelectContent>
                  {availableTables.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select File</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drop files here or click to browse
                </p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
              </div>
            </div>

            {showPreview && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Data Preview</Label>
                  <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border rounded-lg p-2 max-h-32 overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <th key={key} className="text-left p-1 border-b">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 3).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value: any, j) => (
                            <td key={j} className="p-1">{value?.toString()}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <Button onClick={startImport} className="w-full" disabled={!showPreview}>
              <Upload className="h-4 w-4 mr-2" />
              Start Import
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Job Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Export Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No export jobs yet
                </p>
              ) : (
                exportJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{job.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {job.recordCount} records
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : job.status === 'failed' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                        )}
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    {job.status === 'running' && (
                      <Progress value={job.progress} className="h-2" />
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </span>
                      <div className="flex space-x-1">
                        {job.status === 'completed' && job.downloadUrl && (
                          <Button variant="outline" size="sm" onClick={() => downloadExport(job)}>
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                        {job.status !== 'completed' && (
                          <Button variant="outline" size="sm" onClick={() => cancelJob(job.id, 'export')}>
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Import Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Import Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No import jobs yet
                </p>
              ) : (
                importJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{job.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {job.processedRows}/{job.totalRows} processed
                          {job.errorRows > 0 && `, ${job.errorRows} errors`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : job.status === 'failed' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                        )}
                        <Badge variant={
                          job.status === 'completed' ? 'default' :
                          job.status === 'failed' ? 'destructive' : 'secondary'
                        }>
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                    {job.status === 'running' && (
                      <Progress value={job.progress} className="h-2" />
                    )}
                    {job.status === 'completed' && job.errors.length > 0 && (
                      <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                        <div className="font-medium">Errors:</div>
                        {job.errors.slice(0, 2).map((error, i) => (
                          <div key={i}>• {error}</div>
                        ))}
                        {job.errors.length > 2 && (
                          <div>... and {job.errors.length - 2} more</div>
                        )}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleString()}
                      </span>
                      {job.status !== 'completed' && (
                        <Button variant="outline" size="sm" onClick={() => cancelJob(job.id, 'import')}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};