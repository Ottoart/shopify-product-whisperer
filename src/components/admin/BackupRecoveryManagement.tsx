import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  HardDrive, 
  Cloud, 
  Download, 
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  Archive,
  Shield,
  Calendar,
  FileText,
  Server,
  Activity,
  Zap
} from "lucide-react";

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  source: string;
  destination: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  size: string;
  started_at?: string;
  completed_at?: string;
  next_run: string;
  frequency: string;
  retention_days: number;
  encryption: boolean;
}

interface RestorePoint {
  id: string;
  backup_job_id: string;
  name: string;
  created_at: string;
  size: string;
  type: string;
  status: 'available' | 'corrupted' | 'archived';
  checksum: string;
  location: string;
}

interface DisasterRecoveryPlan {
  id: string;
  name: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  rto: number; // Recovery Time Objective in hours
  rpo: number; // Recovery Point Objective in hours
  last_tested: string;
  test_status: 'passed' | 'failed' | 'pending';
  components: string[];
  status: 'active' | 'inactive' | 'testing';
}

interface StorageLocation {
  id: string;
  name: string;
  type: 'local' | 'cloud' | 'offsite';
  provider?: string;
  capacity: string;
  used: string;
  available: string;
  status: 'online' | 'offline' | 'maintenance';
  encryption: boolean;
  last_sync: string;
}

export const BackupRecoveryManagement: React.FC = () => {
  const { toast } = useToast();
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([]);
  const [drPlans, setDrPlans] = useState<DisasterRecoveryPlan[]>([]);
  const [storageLocations, setStorageLocations] = useState<StorageLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const mockBackupJobs: BackupJob[] = [
    {
      id: '1',
      name: 'Production Database Backup',
      type: 'full',
      source: 'PostgreSQL Production',
      destination: 'AWS S3 Primary',
      status: 'completed',
      progress: 100,
      size: '2.4 GB',
      started_at: '2024-01-15T02:00:00Z',
      completed_at: '2024-01-15T02:45:00Z',
      next_run: '2024-01-16T02:00:00Z',
      frequency: 'Daily',
      retention_days: 30,
      encryption: true
    },
    {
      id: '2',
      name: 'Application Files Backup',
      type: 'incremental',
      source: 'Application Server',
      destination: 'Azure Blob Storage',
      status: 'running',
      progress: 65,
      size: '850 MB',
      started_at: '2024-01-15T14:30:00Z',
      next_run: '2024-01-15T18:30:00Z',
      frequency: 'Every 4 hours',
      retention_days: 7,
      encryption: true
    },
    {
      id: '3',
      name: 'User Data Archive',
      type: 'differential',
      source: 'User Storage',
      destination: 'Local NAS',
      status: 'scheduled',
      progress: 0,
      size: '1.2 GB',
      next_run: '2024-01-15T20:00:00Z',
      frequency: 'Weekly',
      retention_days: 90,
      encryption: false
    }
  ];

  const mockRestorePoints: RestorePoint[] = [
    {
      id: '1',
      backup_job_id: '1',
      name: 'Production DB - Jan 15, 2024',
      created_at: '2024-01-15T02:45:00Z',
      size: '2.4 GB',
      type: 'Full Backup',
      status: 'available',
      checksum: 'sha256:a1b2c3d4...',
      location: 'AWS S3 Primary'
    },
    {
      id: '2',
      backup_job_id: '1',
      name: 'Production DB - Jan 14, 2024',
      created_at: '2024-01-14T02:45:00Z',
      size: '2.3 GB',
      type: 'Full Backup',
      status: 'available',
      checksum: 'sha256:e5f6g7h8...',
      location: 'AWS S3 Primary'
    },
    {
      id: '3',
      backup_job_id: '2',
      name: 'App Files - Jan 15, 14:30',
      created_at: '2024-01-15T14:30:00Z',
      size: '850 MB',
      type: 'Incremental',
      status: 'available',
      checksum: 'sha256:i9j0k1l2...',
      location: 'Azure Blob Storage'
    }
  ];

  const mockDrPlans: DisasterRecoveryPlan[] = [
    {
      id: '1',
      name: 'Critical System Recovery',
      priority: 'critical',
      rto: 4,
      rpo: 1,
      last_tested: '2024-01-01T00:00:00Z',
      test_status: 'passed',
      components: ['Database', 'Application Server', 'Load Balancer'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Secondary Services Recovery',
      priority: 'high',
      rto: 12,
      rpo: 6,
      last_tested: '2023-12-15T00:00:00Z',
      test_status: 'pending',
      components: ['Analytics', 'Reporting', 'Monitoring'],
      status: 'active'
    }
  ];

  const mockStorageLocations: StorageLocation[] = [
    {
      id: '1',
      name: 'AWS S3 Primary',
      type: 'cloud',
      provider: 'Amazon Web Services',
      capacity: '10 TB',
      used: '3.2 TB',
      available: '6.8 TB',
      status: 'online',
      encryption: true,
      last_sync: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      name: 'Azure Blob Storage',
      type: 'cloud',
      provider: 'Microsoft Azure',
      capacity: '5 TB',
      used: '1.8 TB',
      available: '3.2 TB',
      status: 'online',
      encryption: true,
      last_sync: '2024-01-15T14:25:00Z'
    },
    {
      id: '3',
      name: 'Local NAS',
      type: 'local',
      capacity: '20 TB',
      used: '8.5 TB',
      available: '11.5 TB',
      status: 'online',
      encryption: false,
      last_sync: '2024-01-15T14:00:00Z'
    }
  ];

  useEffect(() => {
    loadBackupData();
  }, []);

  const loadBackupData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBackupJobs(mockBackupJobs);
      setRestorePoints(mockRestorePoints);
      setDrPlans(mockDrPlans);
      setStorageLocations(mockStorageLocations);
    } catch (error) {
      console.error('Error loading backup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startBackupJob = (jobId: string) => {
    setBackupJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'running' as const, started_at: new Date().toISOString(), progress: 0 }
        : job
    ));
    
    // Simulate backup progress
    const progressInterval = setInterval(() => {
      setBackupJobs(prev => prev.map(job => {
        if (job.id === jobId && job.status === 'running') {
          const newProgress = Math.min(job.progress + Math.random() * 15, 100);
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return { 
              ...job, 
              status: 'completed' as const, 
              progress: 100, 
              completed_at: new Date().toISOString() 
            };
          }
          return { ...job, progress: newProgress };
        }
        return job;
      }));
    }, 1000);
    
    toast({
      title: "Backup Started",
      description: "The backup job has been initiated"
    });
  };

  const restoreFromPoint = (restorePoint: RestorePoint) => {
    toast({
      title: "Restore Initiated",
      description: `Starting restore from ${restorePoint.name}`,
    });
    
    // In a real implementation, this would trigger the restore process
    setTimeout(() => {
      toast({
        title: "Restore Completed",
        description: "Data has been successfully restored"
      });
    }, 3000);
  };

  const testDrPlan = (planId: string) => {
    setDrPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, status: 'testing' as const }
        : plan
    ));
    
    setTimeout(() => {
      setDrPlans(prev => prev.map(plan => 
        plan.id === planId 
          ? { 
              ...plan, 
              status: 'active' as const, 
              test_status: 'passed' as const,
              last_tested: new Date().toISOString()
            }
          : plan
      ));
      
      toast({
        title: "DR Test Completed",
        description: "Disaster recovery test passed successfully"
      });
    }, 5000);
    
    toast({
      title: "DR Test Started",
      description: "Disaster recovery plan test is running"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
      case 'online':
      case 'available': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
      case 'corrupted':
      case 'offline': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStorageUsagePercentage = (used: string, capacity: string) => {
    const usedNum = parseFloat(used.split(' ')[0]);
    const capacityNum = parseFloat(capacity.split(' ')[0]);
    return (usedNum / capacityNum) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Backup & Recovery Management</h2>
          <p className="text-muted-foreground">Comprehensive backup, restore, and disaster recovery operations</p>
        </div>
        <Button onClick={loadBackupData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Active Backups</span>
              </div>
              <Badge variant="default">
                {backupJobs.filter(job => job.status !== 'failed').length}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{backupJobs.length}</div>
              <p className="text-xs text-muted-foreground">Total backup jobs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Archive className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Restore Points</span>
              </div>
              <Badge variant="secondary">
                {restorePoints.filter(rp => rp.status === 'available').length}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{restorePoints.length}</div>
              <p className="text-xs text-muted-foreground">Available for restore</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">DR Plans</span>
              </div>
              <Badge variant="outline">
                {drPlans.filter(plan => plan.status === 'active').length}
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{drPlans.length}</div>
              <p className="text-xs text-muted-foreground">Disaster recovery plans</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">Storage Used</span>
              </div>
              <Badge variant="secondary">
                {storageLocations.reduce((total, loc) => {
                  const used = parseFloat(loc.used.split(' ')[0]);
                  return total + used;
                }, 0).toFixed(1)} TB
              </Badge>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">
                {storageLocations.reduce((total, loc) => {
                  const capacity = parseFloat(loc.capacity.split(' ')[0]);
                  return total + capacity;
                }, 0)} TB
              </div>
              <p className="text-xs text-muted-foreground">Total capacity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backups">Backup Jobs</TabsTrigger>
          <TabsTrigger value="restore">Restore Points</TabsTrigger>
          <TabsTrigger value="disaster-recovery">Disaster Recovery</TabsTrigger>
          <TabsTrigger value="storage">Storage Management</TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Jobs Management</CardTitle>
              <CardDescription>Monitor and manage all backup operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backupJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{job.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {job.source} → {job.destination}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={job.type === 'full' ? 'default' : 'secondary'}>
                          {job.type}
                        </Badge>
                        {getStatusIcon(job.status)}
                      </div>
                    </div>
                    
                    {job.status === 'running' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{Math.round(job.progress)}%</span>
                        </div>
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <strong>Size:</strong> {job.size}
                      </div>
                      <div>
                        <strong>Frequency:</strong> {job.frequency}
                      </div>
                      <div>
                        <strong>Retention:</strong> {job.retention_days} days
                      </div>
                      <div>
                        <strong>Encryption:</strong> {job.encryption ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Next run: {new Date(job.next_run).toLocaleString()}
                      </span>
                      <div className="flex space-x-2">
                        {job.status === 'scheduled' && (
                          <Button variant="outline" size="sm" onClick={() => startBackupJob(job.id)}>
                            <Upload className="h-3 w-3 mr-1" />
                            Start Now
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Create New Backup Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restore Points</CardTitle>
              <CardDescription>Available backup restore points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {restorePoints.map((point) => (
                  <div key={point.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{point.name}</h4>
                        <p className="text-sm text-muted-foreground">{point.type} • {point.size}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={point.status === 'available' ? 'default' : 'destructive'}>
                          {point.status}
                        </Badge>
                        {getStatusIcon(point.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <strong>Created:</strong> {new Date(point.created_at).toLocaleString()}
                      </div>
                      <div>
                        <strong>Location:</strong> {point.location}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-mono">
                        {point.checksum.substring(0, 32)}...
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => restoreFromPoint(point)}>
                          <Download className="h-3 w-3 mr-1" />
                          Restore
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disaster-recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Disaster Recovery Plans</CardTitle>
              <CardDescription>Business continuity and disaster recovery planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          RTO: {plan.rto}h • RPO: {plan.rpo}h
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(plan.priority)}>
                          {plan.priority.toUpperCase()}
                        </Badge>
                        {getStatusIcon(plan.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <strong>Last Tested:</strong> {new Date(plan.last_tested).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Test Status:</strong> 
                        <Badge variant={plan.test_status === 'passed' ? 'default' : 'secondary'} className="ml-2">
                          {plan.test_status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <strong className="text-sm">Components:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {plan.components.map((component, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {component}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Status: {plan.status}
                      </span>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => testDrPlan(plan.id)}
                          disabled={plan.status === 'testing'}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          {plan.status === 'testing' ? 'Testing...' : 'Test Plan'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Create New DR Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Locations</CardTitle>
              <CardDescription>Manage backup storage destinations and capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storageLocations.map((location) => (
                  <div key={location.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        {location.type === 'cloud' ? <Cloud className="h-5 w-5" /> : <HardDrive className="h-5 w-5" />}
                        <div>
                          <h4 className="font-medium">{location.name}</h4>
                          {location.provider && (
                            <p className="text-sm text-muted-foreground">{location.provider}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={location.encryption ? 'default' : 'secondary'}>
                          {location.encryption ? 'Encrypted' : 'Unencrypted'}
                        </Badge>
                        {getStatusIcon(location.status)}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Usage</span>
                        <span>{location.used} / {location.capacity}</span>
                      </div>
                      <Progress value={getStorageUsagePercentage(location.used, location.capacity)} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <strong>Type:</strong> {location.type}
                      </div>
                      <div>
                        <strong>Available:</strong> {location.available}
                      </div>
                      <div>
                        <strong>Last Sync:</strong> {new Date(location.last_sync).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Sync Now
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full">
                  <Cloud className="h-4 w-4 mr-2" />
                  Add Storage Location
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};