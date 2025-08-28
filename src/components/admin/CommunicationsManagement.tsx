import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Mail, Bell, Send, Users, Settings, BarChart3, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  status: 'active' | 'draft';
  lastModified: string;
  usage: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  created: string;
  assignee?: string;
}

export const CommunicationsManagement = () => {
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Our Platform!',
      category: 'onboarding',
      status: 'active',
      lastModified: '2024-01-15',
      usage: 1250
    },
    {
      id: '2',
      name: 'Order Confirmation',
      subject: 'Your Order #{{order_id}} is Confirmed',
      category: 'transactional',
      status: 'active',
      lastModified: '2024-01-14',
      usage: 892
    },
    {
      id: '3',
      name: 'Password Reset',
      subject: 'Reset Your Password',
      category: 'security',
      status: 'active',
      lastModified: '2024-01-13',
      usage: 345
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance window on Sunday 2AM-4AM EST',
      type: 'info',
      timestamp: '2024-01-15 10:30:00',
      read: false
    },
    {
      id: '2',
      title: 'High Server Load Detected',
      message: 'Server CPU usage is above 85% for the past 10 minutes',
      type: 'warning',
      timestamp: '2024-01-15 09:15:00',
      read: false
    }
  ]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-001',
      subject: 'Unable to process payments',
      customer: 'john@example.com',
      priority: 'urgent',
      status: 'open',
      created: '2024-01-15 08:30:00',
      assignee: 'Support Team A'
    },
    {
      id: 'TKT-002',
      subject: 'Shipping label generation error',
      customer: 'jane@example.com',
      priority: 'high',
      status: 'pending',
      created: '2024-01-15 07:45:00'
    }
  ]);

  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive';
      case 'pending': return 'secondary';
      case 'resolved': return 'default';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <AlertCircle className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Communications Management
          </CardTitle>
          <CardDescription>
            Manage emails, notifications, and customer support communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="emails" className="space-y-4">
            <TabsList>
              <TabsTrigger value="emails">Email Management</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="support">Support Tickets</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcasts</TabsTrigger>
            </TabsList>

            <TabsContent value="emails" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Email Templates</h3>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>

              <div className="grid gap-4">
                {emailTemplates.map((template) => (
                  <Card key={template.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                            {template.status}
                          </Badge>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Subject: {template.subject}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Modified: {template.lastModified}</span>
                          <span>Usage: {template.usage} sent</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">System Notifications</h3>
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </div>

              <div className="grid gap-3">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={`p-4 ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(notification.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button variant="ghost" size="sm">
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="support" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Support Tickets</h3>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    Create Ticket
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {supportTickets.map((ticket) => (
                  <Card key={ticket.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{ticket.id}</h4>
                          <Badge variant={getPriorityColor(ticket.priority) as any}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant={getStatusColor(ticket.status) as any}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{ticket.subject}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Customer: {ticket.customer}</span>
                          <span>Created: {new Date(ticket.created).toLocaleString()}</span>
                          {ticket.assignee && <span>Assigned: {ticket.assignee}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          Reply
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="broadcast" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Broadcast Message</CardTitle>
                  <CardDescription>
                    Send announcements to all users or specific groups
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="audience">Audience</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="active">Active Subscribers</SelectItem>
                          <SelectItem value="trial">Trial Users</SelectItem>
                          <SelectItem value="admins">Administrators</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Message Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="announcement">Announcement</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="feature">New Feature</SelectItem>
                          <SelectItem value="promotion">Promotion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Enter message subject" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message..."
                      rows={6}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                    <Button variant="outline">
                      Schedule
                    </Button>
                    <Button variant="outline">
                      Save Draft
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