import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, Database, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BackupRecord {
  id: string;
  name: string;
  size: string;
  created_at: string;
  status: 'completed' | 'in_progress' | 'failed';
  type: 'full' | 'incremental' | 'manual';
  tables: string[];
}

export const BackupManager = () => {
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedBackupType, setSelectedBackupType] = useState<'full' | 'incremental'>('incremental');
  const { toast } = useToast();

  const fetchBackups = async () => {
    try {
      // In a real implementation, this would fetch from a backups table
      // For now, we'll simulate backup records
      const mockBackups: BackupRecord[] = [
        {
          id: '1',
          name: 'Auto Backup - Daily',
          size: '2.4 MB',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          type: 'incremental',
          tables: ['ai_insights', 'performance_metrics', 'batch_operations']
        },
        {
          id: '2', 
          name: 'Manual Full Backup',
          size: '18.7 MB',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          type: 'full',
          tables: ['all']
        },
        {
          id: '3',
          name: 'Auto Backup - Weekly',
          size: '12.1 MB',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          type: 'full',
          tables: ['all']
        }
      ];
      
      setBackups(mockBackups);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      toast({
        title: "Failed to Load Backups",
        description: "Unable to retrieve backup history.",
        variant: "destructive",
      });
    }
  };

  const createBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // Simulate backup creation process
      const tables = selectedBackupType === 'full' 
        ? ['all']
        : ['ai_insights', 'performance_metrics', 'batch_operations', 'user_edit_patterns'];

      // Progress simulation
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        name: `Manual ${selectedBackupType === 'full' ? 'Full' : 'Incremental'} Backup`,
        size: selectedBackupType === 'full' ? '15.3 MB' : '3.7 MB',
        created_at: new Date().toISOString(),
        status: 'completed',
        type: selectedBackupType,
        tables
      };

      setBackups(prev => [newBackup, ...prev]);

      toast({
        title: "Backup Created Successfully",
        description: `${selectedBackupType === 'full' ? 'Full' : 'Incremental'} backup completed.`,
      });

    } catch (error) {
      console.error('Backup creation failed:', error);
      toast({
        title: "Backup Failed",
        description: "Unable to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const restoreBackup = async (backupId: string) => {
    setIsRestoring(true);

    try {
      const backup = backups.find(b => b.id === backupId);
      if (!backup) throw new Error('Backup not found');

      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Restore Completed",
        description: `Data restored from backup: ${backup.name}`,
      });

    } catch (error) {
      console.error('Restore failed:', error);
      toast({
        title: "Restore Failed", 
        description: "Unable to restore from backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const backup = backups.find(b => b.id === backupId);
      if (!backup) throw new Error('Backup not found');

      // Simulate download
      const blob = new Blob(['Mock backup data'], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading backup: ${backup.name}`,
      });

    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download backup.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Backup & Recovery Manager</span>
          </CardTitle>
          <CardDescription>
            Create, manage, and restore database backups for data protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Create Backup Section */}
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium mb-2">Create New Backup</h3>
                <Select value={selectedBackupType} onValueChange={(value: 'full' | 'incremental') => setSelectedBackupType(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incremental">Incremental Backup</SelectItem>
                    <SelectItem value="full">Full Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={createBackup} 
                disabled={isCreatingBackup}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{isCreatingBackup ? 'Creating...' : 'Create Backup'}</span>
              </Button>
            </div>

            {/* Backup Progress */}
            {isCreatingBackup && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Creating backup...</span>
                  <span>{backupProgress}%</span>
                </div>
                <Progress value={backupProgress} className="w-full" />
              </div>
            )}

            {/* Restore Status */}
            {isRestoring && (
              <Alert>
                <Clock className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Restoring data from backup. This may take a few minutes...
                </AlertDescription>
              </Alert>
            )}

            {/* Backup History */}
            <div>
              <h3 className="font-medium mb-4">Backup History</h3>
              <div className="space-y-3">
                {backups.map((backup) => (
                  <Card key={backup.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(backup.status)}
                          <div>
                            <div className="font-medium">{backup.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(backup.created_at).toLocaleString()} • {backup.size}
                            </div>
                          </div>
                          <Badge variant={backup.type === 'full' ? 'default' : 'secondary'}>
                            {backup.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadBackup(backup.id)}
                            className="flex items-center space-x-1"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => restoreBackup(backup.id)}
                            disabled={isRestoring || backup.status !== 'completed'}
                          >
                            Restore
                          </Button>
                        </div>
                      </div>
                      {backup.tables.length > 0 && backup.tables[0] !== 'all' && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Tables: {backup.tables.join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};