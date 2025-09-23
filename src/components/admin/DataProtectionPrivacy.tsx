import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Lock, 
  Eye, 
  Download, 
  Trash2, 
  UserX,
  FileText,
  Calendar,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Archive,
  Key
} from "lucide-react";

interface DataSubject {
  id: string;
  email: string;
  name: string;
  registration_date: string;
  last_activity: string;
  data_categories: string[];
  consent_status: 'given' | 'withdrawn' | 'pending';
  retention_period: string;
}

interface DataRequest {
  id: string;
  type: 'access' | 'deletion' | 'portability' | 'rectification';
  subject_email: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string;
  notes?: string;
}

interface RetentionPolicy {
  id: string;
  name: string;
  data_category: string;
  retention_period: number;
  action: 'delete' | 'anonymize' | 'archive';
  is_active: boolean;
  compliance_standard: string;
}

interface PrivacyAssessment {
  id: string;
  name: string;
  status: 'draft' | 'review' | 'approved' | 'needs_update';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_updated: string;
  data_types: string[];
  completion_percentage: number;
}

export const DataProtectionPrivacy: React.FC = () => {
  const { toast } = useToast();
  const [dataSubjects, setDataSubjects] = useState<DataSubject[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([]);
  const [privacyAssessments, setPrivacyAssessments] = useState<PrivacyAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  const mockDataSubjects: DataSubject[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      registration_date: '2023-06-15',
      last_activity: '2024-01-14',
      data_categories: ['Personal Info', 'Transaction Data', 'Preferences'],
      consent_status: 'given',
      retention_period: '7 years'
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      registration_date: '2023-08-22',
      last_activity: '2024-01-10',
      data_categories: ['Personal Info', 'Marketing Data'],
      consent_status: 'withdrawn',
      retention_period: '2 years'
    }
  ];

  const mockDataRequests: DataRequest[] = [
    {
      id: '1',
      type: 'access',
      subject_email: 'john.doe@example.com',
      status: 'completed',
      created_at: '2024-01-10T10:00:00Z',
      completed_at: '2024-01-12T15:30:00Z',
      notes: 'Data export provided via secure link'
    },
    {
      id: '2',
      type: 'deletion',
      subject_email: 'jane.smith@example.com',
      status: 'processing',
      created_at: '2024-01-14T09:15:00Z',
      notes: 'Verification documents received'
    }
  ];

  const mockRetentionPolicies: RetentionPolicy[] = [
    {
      id: '1',
      name: 'Customer Transaction Data',
      data_category: 'Financial Records',
      retention_period: 7,
      action: 'archive',
      is_active: true,
      compliance_standard: 'SOX'
    },
    {
      id: '2',
      name: 'Marketing Preferences',
      data_category: 'Marketing Data',
      retention_period: 2,
      action: 'delete',
      is_active: true,
      compliance_standard: 'GDPR'
    }
  ];

  const mockPrivacyAssessments: PrivacyAssessment[] = [
    {
      id: '1',
      name: 'Customer Data Processing DPIA',
      status: 'approved',
      risk_level: 'medium',
      last_updated: '2024-01-01',
      data_types: ['Personal Info', 'Financial Data'],
      completion_percentage: 100
    },
    {
      id: '2',
      name: 'Marketing Analytics DPIA',
      status: 'review',
      risk_level: 'low',
      last_updated: '2024-01-10',
      data_types: ['Behavioral Data', 'Preferences'],
      completion_percentage: 85
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDataSubjects(mockDataSubjects);
      setDataRequests(mockDataRequests);
      setRetentionPolicies(mockRetentionPolicies);
      setPrivacyAssessments(mockPrivacyAssessments);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataRequest = async (type: string) => {
    const newRequest: DataRequest = {
      id: Date.now().toString(),
      type: type as any,
      subject_email: '',
      status: 'pending',
      created_at: new Date().toISOString(),
      notes: 'Request created via admin panel'
    };

    setDataRequests(prev => [newRequest, ...prev]);
    toast({
      title: "Data Request Created",
      description: `${type} request has been logged and will be processed`
    });
  };

  const exportDataSubject = (subject: DataSubject) => {
    const data = {
      personal_info: {
        name: subject.name,
        email: subject.email,
        registration_date: subject.registration_date
      },
      activity_data: {
        last_activity: subject.last_activity,
        data_categories: subject.data_categories
      },
      consent_records: {
        current_status: subject.consent_status,
        retention_period: subject.retention_period
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-export-${subject.email.replace('@', '-')}.json`;
    link.click();

    toast({
      title: "Data Exported",
      description: `Personal data for ${subject.email} has been exported`
    });
  };

  const anonymizeDataSubject = (subject: DataSubject) => {
    setDataSubjects(prev => prev.map(s => 
      s.id === subject.id 
        ? { ...s, name: 'Anonymized User', email: 'anonymized@system.local', consent_status: 'withdrawn' as const }
        : s
    ));
    
    toast({
      title: "Data Anonymized",
      description: `Personal data for ${subject.email} has been anonymized`
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
      case 'review': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Data Protection & Privacy</h2>
          <p className="text-muted-foreground">GDPR compliance and privacy management tools</p>
        </div>
      </div>

      <Tabs defaultValue="data-subjects" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="data-subjects">Data Subjects</TabsTrigger>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="retention">Retention Policies</TabsTrigger>
          <TabsTrigger value="assessments">Privacy Impact</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="data-subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Subject Management</CardTitle>
              <CardDescription>Manage personal data and consent for all data subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataSubjects.map((subject) => (
                  <div key={subject.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{subject.name}</h4>
                        <p className="text-sm text-muted-foreground">{subject.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={subject.consent_status === 'given' ? 'default' : 'destructive'}>
                          {subject.consent_status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => exportDataSubject(subject)}>
                          <Download className="h-3 w-3 mr-1" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => anonymizeDataSubject(subject)}>
                          <UserX className="h-3 w-3 mr-1" />
                          Anonymize
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Registered:</strong> {new Date(subject.registration_date).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Last Activity:</strong> {new Date(subject.last_activity).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Retention:</strong> {subject.retention_period}
                      </div>
                      <div>
                        <strong>Data Categories:</strong> {subject.data_categories.length}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <strong className="text-sm">Data Categories:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {subject.data_categories.map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Data Request</CardTitle>
              <CardDescription>Process GDPR data subject requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button onClick={() => handleDataRequest('access')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Data Access
                </Button>
                <Button onClick={() => handleDataRequest('deletion')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Data Deletion
                </Button>
                <Button onClick={() => handleDataRequest('portability')}>
                  <Download className="h-4 w-4 mr-2" />
                  Data Portability
                </Button>
                <Button onClick={() => handleDataRequest('rectification')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Rectification
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription>Track and manage all data subject requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(request.status)}
                      <div>
                        <h4 className="font-medium capitalize">{request.type} Request</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.subject_email} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                        {request.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{request.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        request.status === 'completed' ? 'default' :
                        request.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {request.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policies</CardTitle>
              <CardDescription>Configure automatic data retention and deletion policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {retentionPolicies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{policy.name}</h4>
                        <p className="text-sm text-muted-foreground">{policy.data_category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{policy.compliance_standard}</Badge>
                        <Switch checked={policy.is_active} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Retention Period:</strong> {policy.retention_period} years
                      </div>
                      <div>
                        <strong>Action:</strong> {policy.action}
                      </div>
                      <div>
                        <strong>Status:</strong> {policy.is_active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Add New Retention Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Protection Impact Assessments</CardTitle>
              <CardDescription>Manage privacy impact assessments and risk evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {privacyAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{assessment.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date(assessment.last_updated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskColor(assessment.risk_level)}>
                          {assessment.risk_level.toUpperCase()} RISK
                        </Badge>
                        <Badge variant={assessment.status === 'approved' ? 'default' : 'secondary'}>
                          {assessment.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span>Completion Progress</span>
                        <span>{assessment.completion_percentage}%</span>
                      </div>
                      <Progress value={assessment.completion_percentage} className="h-2" />
                    </div>
                    
                    <div className="mb-3">
                      <strong className="text-sm">Data Types:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assessment.data_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Review
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Create New DPIA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Configure global privacy and GDPR settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-deletion of expired data</Label>
                    <p className="text-xs text-muted-foreground">Automatically delete data past retention period</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data request notifications</Label>
                    <p className="text-xs text-muted-foreground">Email notifications for new data requests</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Consent tracking</Label>
                    <p className="text-xs text-muted-foreground">Track and log all consent changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Default retention period</Label>
                  <Select defaultValue="2">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 year</SelectItem>
                      <SelectItem value="2">2 years</SelectItem>
                      <SelectItem value="5">5 years</SelectItem>
                      <SelectItem value="7">7 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Configuration</CardTitle>
                <CardDescription>Configure compliance standards and requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Active compliance standards</Label>
                  <div className="space-y-2">
                    {['GDPR', 'CCPA', 'HIPAA', 'PIPEDA'].map((standard) => (
                      <div key={standard} className="flex items-center space-x-2">
                        <input type="checkbox" id={standard} defaultChecked={['GDPR', 'CCPA'].includes(standard)} />
                        <Label htmlFor={standard}>{standard}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Data breach notification timeframe</Label>
                  <Select defaultValue="72">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="72">72 hours (GDPR)</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>DPO contact information</Label>
                  <Input placeholder="dpo@company.com" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};