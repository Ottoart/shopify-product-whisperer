import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Send, 
  Search, 
  Plus,
  Users,
  Mail,
  Bell,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp,
  Eye,
  Edit,
  Copy,
  BarChart3,
  Filter,
  Megaphone,
  Clock
} from "lucide-react";

interface MessageCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'in_app' | 'push' | 'sms';
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  target_audience: 'all_users' | 'active_users' | 'new_users' | 'enterprise_users' | 'custom';
  scheduled_at?: string;
  sent_at?: string;
  total_recipients: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
  updated_at: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'billing' | 'feature_announcement' | 'maintenance' | 'custom';
  variables: string[];
  created_at: string;
}

interface CommunicationMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  avgOpenRate: number;
  avgClickRate: number;
  totalRecipients: number;
  campaignsThisMonth: number;
}

export const AdminCommunicationCenter = () => {
  const [campaigns, setCampaigns] = useState<MessageCampaign[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'analytics'>('campaigns');
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MessageCampaign | null>(null);
  const [communicationMetrics, setCommunicationMetrics] = useState<CommunicationMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    totalRecipients: 0,
    campaignsThisMonth: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCommunicationData();
  }, []);

  const loadCommunicationData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockCampaigns: MessageCampaign[] = [
        {
          id: '1',
          name: 'New Feature Announcement',
          subject: 'Introducing Advanced Shipping Analytics',
          content: 'We\'re excited to announce our new shipping analytics dashboard...',
          type: 'email',
          status: 'sent',
          target_audience: 'all_users',
          sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          total_recipients: 1250,
          delivery_rate: 98.5,
          open_rate: 24.8,
          click_rate: 6.2,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Monthly Newsletter',
          subject: 'PrepFox Monthly Updates - January 2024',
          content: 'Your monthly digest of new features, tips, and success stories...',
          type: 'email',
          status: 'scheduled',
          target_audience: 'active_users',
          scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          total_recipients: 890,
          delivery_rate: 0,
          open_rate: 0,
          click_rate: 0,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          name: 'System Maintenance Notice',
          subject: 'Scheduled Maintenance - Sunday 2 AM EST',
          content: 'We will be performing scheduled maintenance on our systems...',
          type: 'in_app',
          status: 'draft',
          target_audience: 'all_users',
          total_recipients: 0,
          delivery_rate: 0,
          open_rate: 0,
          click_rate: 0,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];

      const mockTemplates: MessageTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          subject: 'Welcome to PrepFox - Let\'s Get Started!',
          content: 'Hi {{first_name}}, welcome to PrepFox! We\'re excited to help you...',
          type: 'welcome',
          variables: ['first_name', 'company_name'],
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          name: 'Payment Failed',
          subject: 'Action Required: Payment Failed',
          content: 'Hi {{first_name}}, we were unable to process your payment...',
          type: 'billing',
          variables: ['first_name', 'amount', 'due_date'],
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setCampaigns(mockCampaigns);
      setTemplates(mockTemplates);

      // Calculate metrics
      const totalCampaigns = mockCampaigns.length;
      const activeCampaigns = mockCampaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
      const sentCampaigns = mockCampaigns.filter(c => c.status === 'sent');
      const avgOpenRate = sentCampaigns.reduce((sum, c) => sum + c.open_rate, 0) / sentCampaigns.length || 0;
      const avgClickRate = sentCampaigns.reduce((sum, c) => sum + c.click_rate, 0) / sentCampaigns.length || 0;
      const totalRecipients = mockCampaigns.reduce((sum, c) => sum + c.total_recipients, 0);

      setCommunicationMetrics({
        totalCampaigns,
        activeCampaigns,
        avgOpenRate,
        avgClickRate,
        totalRecipients,
        campaignsThisMonth: 8
      });

    } catch (error) {
      console.error('Error loading communication data:', error);
      toast({
        title: "Error",
        description: "Failed to load communication data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'sent': return 'default';
      case 'sending': return 'secondary';
      case 'scheduled': return 'outline';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'in_app': return <Bell className="h-4 w-4" />;
      case 'push': return <Megaphone className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesType = typeFilter === 'all' || campaign.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const TabButton = ({ value, children, icon: Icon }: { value: string; children: React.ReactNode; icon: any }) => (
    <button
      onClick={() => setActiveTab(value as any)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        activeTab === value 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Communication Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationMetrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationMetrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Running now</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationMetrics.avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Email campaigns</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationMetrics.avgClickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Email campaigns</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationMetrics.totalRecipients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Messages sent</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communicationMetrics.campaignsThisMonth}</div>
            <p className="text-xs text-muted-foreground">New campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Communication Center</CardTitle>
              <CardDescription>Manage messaging campaigns, templates, and user communications</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Message Template</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="template-name">Template Name</Label>
                        <Input id="template-name" placeholder="Enter template name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="template-type">Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="welcome">Welcome</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="feature_announcement">Feature Announcement</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Subject</Label>
                      <Input id="template-subject" placeholder="Email subject line" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-content">Content</Label>
                      <Textarea id="template-content" placeholder="Message content..." rows={6} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-variables">Variables (comma-separated)</Label>
                      <Input id="template-variables" placeholder="first_name, company_name, amount" />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateTemplateOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        toast({
                          title: "Template Created",
                          description: "Message template has been saved successfully.",
                        });
                        setIsCreateTemplateOpen(false);
                      }}>
                        Save Template
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Create Message Campaign</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="campaign-name">Campaign Name</Label>
                        <Input id="campaign-name" placeholder="Enter campaign name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="campaign-type">Message Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="in_app">In-App Notification</SelectItem>
                            <SelectItem value="push">Push Notification</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="target-audience">Target Audience</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_users">All Users</SelectItem>
                            <SelectItem value="active_users">Active Users</SelectItem>
                            <SelectItem value="new_users">New Users</SelectItem>
                            <SelectItem value="enterprise_users">Enterprise Users</SelectItem>
                            <SelectItem value="custom">Custom Segment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="schedule-type">Delivery</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="When to send" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="now">Send Now</SelectItem>
                            <SelectItem value="scheduled">Schedule for Later</SelectItem>
                            <SelectItem value="draft">Save as Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campaign-subject">Subject</Label>
                      <Input id="campaign-subject" placeholder="Message subject line" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campaign-content">Content</Label>
                      <Textarea id="campaign-content" placeholder="Message content..." rows={6} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="enable-tracking" />
                      <Label htmlFor="enable-tracking">Enable tracking (opens, clicks)</Label>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        toast({
                          title: "Campaign Created",
                          description: "Message campaign has been created successfully.",
                        });
                        setIsCreateCampaignOpen(false);
                      }}>
                        Create Campaign
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            <TabButton value="campaigns" icon={Send}>Campaigns</TabButton>
            <TabButton value="templates" icon={Copy}>Templates</TabButton>
            <TabButton value="analytics" icon={BarChart3}>Analytics</TabButton>
          </div>

          {activeTab === 'campaigns' && (
            <>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sending">Sending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Open Rate</TableHead>
                      <TableHead>Click Rate</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{campaign.name}</div>
                            <div className="text-sm text-muted-foreground">{campaign.subject}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(campaign.type)}
                            <span className="capitalize">{campaign.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.total_recipients.toLocaleString()}</TableCell>
                        <TableCell>
                          {campaign.status === 'sent' ? `${campaign.open_rate.toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell>
                          {campaign.status === 'sent' ? `${campaign.click_rate.toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {new Date(campaign.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.subject}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">{template.type.replace('_', ' ')}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">{template.content}</p>
                      {template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-2">Variables:</span>
                          {template.variables.map(variable => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Campaign analytics chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Engagement Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Engagement trends chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};