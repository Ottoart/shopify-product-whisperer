import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Play, Save, Download, Copy, Trash2, Calendar, Filter, BarChart3, PieChart, LineChart, Table } from "lucide-react";

interface ReportField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  table: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  fields: string[];
  filters: ReportFilter[];
  chartType: string;
  createdAt: string;
}

export const CustomReportBuilder: React.FC = () => {
  const { toast } = useToast();
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [chartType, setChartType] = useState('table');
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const availableFields: ReportField[] = [
    { id: 'user_count', name: 'User Count', type: 'number', table: 'users' },
    { id: 'total_revenue', name: 'Total Revenue', type: 'number', table: 'orders' },
    { id: 'order_count', name: 'Order Count', type: 'number', table: 'orders' },
    { id: 'avg_order_value', name: 'Average Order Value', type: 'number', table: 'orders' },
    { id: 'created_at', name: 'Created Date', type: 'date', table: 'orders' },
    { id: 'status', name: 'Status', type: 'string', table: 'orders' },
    { id: 'customer_email', name: 'Customer Email', type: 'string', table: 'orders' },
    { id: 'shipping_cost', name: 'Shipping Cost', type: 'number', table: 'orders' },
    { id: 'product_title', name: 'Product Title', type: 'string', table: 'order_items' },
    { id: 'quantity', name: 'Quantity', type: 'number', table: 'order_items' },
  ];

  const operators = {
    string: ['equals', 'contains', 'starts_with', 'ends_with'],
    number: ['equals', 'greater_than', 'less_than', 'between'],
    date: ['equals', 'after', 'before', 'between'],
    boolean: ['equals']
  };

  const chartTypes = [
    { value: 'table', label: 'Table', icon: <Table className="h-4 w-4" /> },
    { value: 'bar', label: 'Bar Chart', icon: <BarChart3 className="h-4 w-4" /> },
    { value: 'line', label: 'Line Chart', icon: <LineChart className="h-4 w-4" /> },
    { value: 'pie', label: 'Pie Chart', icon: <PieChart className="h-4 w-4" /> },
  ];

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const addFilter = () => {
    setFilters(prev => [...prev, { field: '', operator: '', value: '' }]);
  };

  const updateFilter = (index: number, key: keyof ReportFilter, value: string) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, [key]: value } : filter
    ));
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const runReport = async () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one field for the report",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data based on selected fields
      const mockData = Array.from({ length: 10 }, (_, i) => {
        const row: any = {};
        selectedFields.forEach(field => {
          const fieldInfo = availableFields.find(f => f.id === field);
          if (fieldInfo) {
            switch (fieldInfo.type) {
              case 'number':
                row[field] = Math.floor(Math.random() * 1000) + 1;
                break;
              case 'string':
                row[field] = `Sample ${field} ${i + 1}`;
                break;
              case 'date':
                row[field] = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                break;
              case 'boolean':
                row[field] = Math.random() > 0.5;
                break;
            }
          }
        });
        return row;
      });

      setReportData(mockData);
      toast({
        title: "Success",
        description: "Report generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveReport = () => {
    if (!reportName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a report name",
        variant: "destructive"
      });
      return;
    }

    const newReport: SavedReport = {
      id: Date.now().toString(),
      name: reportName,
      description: reportDescription,
      fields: selectedFields,
      filters,
      chartType,
      createdAt: new Date().toISOString()
    };

    setSavedReports(prev => [...prev, newReport]);
    toast({
      title: "Success",
      description: "Report saved successfully"
    });
  };

  const loadReport = (report: SavedReport) => {
    setReportName(report.name);
    setReportDescription(report.description);
    setSelectedFields(report.fields);
    setFilters(report.filters);
    setChartType(report.chartType);
  };

  const exportReport = () => {
    if (reportData.length === 0) {
      toast({
        title: "Error",
        description: "No data to export. Please run the report first.",
        variant: "destructive"
      });
      return;
    }

    const csv = [
      selectedFields.join(','),
      ...reportData.map(row => selectedFields.map(field => row[field] || '').join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName || 'report'}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Custom Report Builder</h2>
          <p className="text-muted-foreground">Create and customize detailed reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
              <CardDescription>Set up your custom report parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Enter report name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportDescription">Description</Label>
                  <Textarea
                    id="reportDescription"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Describe what this report shows"
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Field Selection */}
              <div className="space-y-4">
                <Label>Select Fields</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={selectedFields.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                      />
                      <Label htmlFor={field.id} className="text-sm">
                        {field.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {field.type}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Filters */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Filters</Label>
                  <Button variant="outline" size="sm" onClick={addFilter}>
                    <Filter className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                </div>
                {filters.map((filter, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select value={filter.field} onValueChange={(value) => updateFilter(index, 'field', value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filter.operator} onValueChange={(value) => updateFilter(index, 'operator', value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.field && operators[availableFields.find(f => f.id === filter.field)?.type || 'string'].map((op) => (
                          <SelectItem key={op} value={op}>
                            {op.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={filter.value}
                      onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      placeholder="Value"
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={() => removeFilter(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Chart Type */}
              <div className="space-y-4">
                <Label>Chart Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {chartTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={chartType === type.value ? "default" : "outline"}
                      onClick={() => setChartType(type.value)}
                      className="justify-start"
                    >
                      {type.icon}
                      <span className="ml-2">{type.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button onClick={runReport} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Running...' : 'Run Report'}
                </Button>
                <Button variant="outline" onClick={saveReport}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </Button>
                <Button variant="outline" onClick={exportReport} disabled={reportData.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saved Reports */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Load or manage your saved reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {savedReports.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No saved reports yet
                    </p>
                  ) : (
                    savedReports.map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm">{report.name}</h4>
                          <Button variant="ghost" size="sm" onClick={() => loadReport(report)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">{report.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {report.fields.length} fields
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Report Results */}
      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Results</CardTitle>
            <CardDescription>Generated report data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    {selectedFields.map((field) => {
                      const fieldInfo = availableFields.find(f => f.id === field);
                      return (
                        <th key={field} className="border border-border p-2 text-left text-sm font-medium">
                          {fieldInfo?.name || field}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      {selectedFields.map((field) => (
                        <td key={field} className="border border-border p-2 text-sm">
                          {row[field]?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};