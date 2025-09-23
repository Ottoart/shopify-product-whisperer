import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Database, Download, Upload, Trash2, RefreshCw, Shield, Clock, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BackupRecord {
  id: string;
  name: string;
  size: string;
  created: string;
  status: 'completed' | 'in_progress' | 'failed';
  type: 'full' | 'incremental' | 'differential';
}

interface DataExport {
  id: string;
  table: string;
  format: string;
  status: 'completed' | 'processing' | 'failed';
  created: string;
  size?: string;
  downloadUrl?: string;
}

export const DataManagement = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([
    {
      id: '1',
      name: 'Daily-Backup-2024-01-15',
      size: '2.4 GB',
      created: '2024-01-15 02:00:00',
      status: 'completed',
      type: 'full'
    },
    {
      id: '2',
      name: 'Incremental-Backup-2024-01-14',
      size: '456 MB',
      created: '2024-01-14 14:30:00',
      status: 'completed',
      type: 'incremental'
    },
    {
      id: '3',
      name: 'Emergency-Backup-2024-01-13',
      size: '1.8 GB',
      created: '2024-01-13 18:45:00',
      status: 'completed',
      type: 'full'
    }
  ]);

  const [exports, setExports] = useState<DataExport[]>([
    {
      id: '1',
      table: 'users',
      format: 'CSV',
      status: 'completed',
      created: '2024-01-15 10:30:00',
      size: '25 MB',
      downloadUrl: '/exports/users-export.csv'
    },
    {
      id: '2',
      table: 'orders',
      format: 'JSON',
      status: 'processing',
      created: '2024-01-15 11:15:00'
    }
  ]);

  const [storageStats, setStorageStats] = useState({
    totalSpace: '100 GB',
    usedSpace: '68.4 GB',
    freeSpace: '31.6 GB',
    usagePercentage: 68.4,
    databases: 12,
    tables: 98,
    records: 1248392
  });

  const { toast } = useToast();

  const createBackup = (type: 'full' | 'incremental') => {
    toast({
      title: "Backup Started",
      description: `${type} backup has been initiated`,
    });
  };

  const downloadBackup = (backupId: string) => {
    toast({
      title: "Download Started",
      description: "Backup download has been initiated",
    });
  };

  const deleteBackup = (backupId: string) => {
    setBackups(backups.filter(b => b.id !== backupId));
    toast({
      title: "Backup Deleted",
      description: "Backup has been permanently removed",
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress':
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'default';
      case 'incremental': return 'secondary';
      case 'differential': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management & Analytics
          </CardTitle>
          <CardDescription>
            Backup, export, import, and manage system data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="exports">Data Export</TabsTrigger>
              <TabsTrigger value="imports">Data Import</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Retention</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{storageStats.usedSpace}</p>
                        <p className="text-sm text-muted-foreground">Used Storage</p>
                      </div>
                      <HardDrive className="h-8 w-8 text-blue-500" />
                    </div>
                    <Progress value={storageStats.usagePercentage} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {storageStats.freeSpace} remaining of {storageStats.totalSpace}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{storageStats.databases}</p>
                        <p className="text-sm text-muted-foreground">Databases</p>
                      </div>
                      <Database className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{storageStats.tables}</p>
                        <p className="text-sm text-muted-foreground">Tables</p>
                      </div>
                      <Database className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{storageStats.records.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Records</p>
                      </div>
                      <Database className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Daily backup completed successfully - 2.4 GB</span>
                      <span className="text-muted-foreground ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>User data export generated - CSV format</span>
                      <span className="text-muted-foreground ml-auto">5 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Database optimization completed</span>
                      <span className="text-muted-foreground ml-auto">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backups" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Database Backups</h3>
                <div className="flex gap-2">
                  <Button onClick={() => createBackup('incremental')} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Incremental
                  </Button>
                  <Button onClick={() => createBackup('full')}>
                    <Database className="h-4 w-4 mr-2" />
                    Full Backup
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {backups.map((backup) => (
                  <Card key={backup.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{backup.name}</h4>
                          <Badge variant={getStatusColor(backup.status) as any}>
                            {backup.status}
                          </Badge>
                          <Badge variant={getTypeColor(backup.type) as any}>
                            {backup.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            Size: {backup.size}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Created: {new Date(backup.created).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadBackup(backup.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteBackup(backup.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="exports" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Data Exports</h3>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  New Export
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="table-select">Table/Data Source</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select table" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="users">Users</SelectItem>
                          <SelectItem value="orders">Orders</SelectItem>
                          <SelectItem value="products">Products</SelectItem>
                          <SelectItem value="analytics">Analytics</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="format-select">Export Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Start Export
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {exports.map((exportRecord) => (
                  <Card key={exportRecord.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{exportRecord.table} Export</h4>
                          <Badge variant={getStatusColor(exportRecord.status) as any}>
                            {exportRecord.status}
                          </Badge>
                          <Badge variant="outline">{exportRecord.format}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Created: {new Date(exportRecord.created).toLocaleString()}</span>
                          {exportRecord.size && <span>Size: {exportRecord.size}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {exportRecord.downloadUrl && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="imports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Import</CardTitle>
                  <CardDescription>
                    Upload and import data from external sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="import-type">Import Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select import type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="users">User Data</SelectItem>
                          <SelectItem value="products">Product Catalog</SelectItem>
                          <SelectItem value="orders">Order History</SelectItem>
                          <SelectItem value="custom">Custom Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="file-format">File Format</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Drop files here to upload</p>
                    <p className="text-muted-foreground mb-4">or click to browse files</p>
                    <Button variant="outline">
                      Choose Files
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Data Privacy & Retention
                  </CardTitle>
                  <CardDescription>
                    Manage data retention policies and privacy compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Data Retention Policies</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">User Activity Logs</span>
                          <Badge variant="outline">90 days</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Analytics Data</span>
                          <Badge variant="outline">2 years</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Deleted User Data</span>
                          <Badge variant="outline">30 days</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">System Backups</span>
                          <Badge variant="outline">1 year</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Privacy Compliance</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">GDPR Compliance</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">CCPA Compliance</span>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Data Anonymization</span>
                          <Badge variant="default">Enabled</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Audit Logging</span>
                          <Badge variant="default">Enabled</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>
                      Update Policies
                    </Button>
                    <Button variant="outline">
                      Generate Privacy Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};