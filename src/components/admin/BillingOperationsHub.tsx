import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  DollarSign, 
  Search, 
  TrendingUp, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Send,
  RefreshCw,
  FileText,
  Calendar,
  TrendingDown
} from "lucide-react";

interface BillingSubscription {
  id: string;
  company_id: string;
  plan_name: string;
  plan_price?: number;
  status: string;
  billing_interval?: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

interface BillingInvoice {
  id: string;
  subscription_id: string;
  amount: number;
  status: string;
  invoice_date: string;
  due_date?: string;
  paid_date?: string;
  currency?: string;
  created_at: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  churnRate: number;
  avgRevenuePerUser: number;
  growthRate: number;
  upcomingRenewals: number;
}

export const BillingOperationsHub = () => {
  const [subscriptions, setSubscriptions] = useState<BillingSubscription[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'invoices' | 'renewals'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    monthlyRecurring: 0,
    churnRate: 0,
    avgRevenuePerUser: 0,
    growthRate: 0,
    upcomingRenewals: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      
      // Load subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('billing_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) throw subscriptionsError;
      
      // Load invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('billing_invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      setSubscriptions(subscriptionsData || []);
      setInvoices(invoicesData || []);
      
      // Calculate metrics
      calculateRevenueMetrics(subscriptionsData || [], invoicesData || []);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast({
        title: "Error",
        description: "Failed to load billing data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueMetrics = (subs: BillingSubscription[], invs: BillingInvoice[]) => {
    const totalRevenue = invs
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    
    const monthlyRecurring = subs
      .filter(sub => sub.status === 'active' && sub.billing_interval === 'monthly')
      .reduce((sum, sub) => sum + (sub.plan_price || 0), 0);
    
    const activeUsers = subs.filter(sub => sub.status === 'active').length;
    const avgRevenuePerUser = activeUsers > 0 ? totalRevenue / activeUsers : 0;
    
    // Mock calculations for demonstration
    const upcomingRenewals = subs.filter(sub => {
      if (!sub.current_period_end) return false;
      const renewalDate = new Date(sub.current_period_end);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return renewalDate >= today && renewalDate <= nextWeek;
    }).length;

    setRevenueMetrics({
      totalRevenue,
      monthlyRecurring,
      churnRate: 3.2, // Mock
      avgRevenuePerUser,
      growthRate: 15.5, // Mock
      upcomingRenewals
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'overdue': return 'destructive';
      case 'trialing': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.plan_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.amount.toString().includes(searchTerm) ||
      invoice.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
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
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{revenueMetrics.growthRate}% growth
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.monthlyRecurring.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.avgRevenuePerUser.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per active user</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{revenueMetrics.churnRate}%</div>
            <p className="text-xs text-muted-foreground">Monthly churn</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Renewals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueMetrics.upcomingRenewals}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Advanced Billing Operations</CardTitle>
              <CardDescription>Revenue management, subscriptions, and financial analytics</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            <TabButton value="overview" icon={TrendingUp}>Overview</TabButton>
            <TabButton value="subscriptions" icon={RefreshCw}>Subscriptions</TabButton>
            <TabButton value="invoices" icon={FileText}>Invoices</TabButton>
            <TabButton value="renewals" icon={Calendar}>Renewals</TabButton>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Revenue chart visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Enterprise', 'Pro', 'Free'].map((plan, index) => (
                      <div key={plan} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-primary' : index === 1 ? 'bg-secondary' : 'bg-muted'
                          }`} />
                          <span className="font-medium">{plan}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {subscriptions.filter(s => s.plan_name.toLowerCase().includes(plan.toLowerCase())).length}
                          </div>
                          <div className="text-xs text-muted-foreground">subscribers</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeTab === 'subscriptions' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Period</TableHead>
                  <TableHead>Trial End</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.plan_name}</TableCell>
                    <TableCell>${subscription.plan_price || 0}</TableCell>
                    <TableCell>{subscription.billing_interval || 'monthly'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(subscription.status)}
                        <Badge variant={getStatusBadgeVariant(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription.current_period_start && subscription.current_period_end
                        ? `${new Date(subscription.current_period_start).toLocaleDateString()} - ${new Date(subscription.current_period_end).toLocaleDateString()}`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      {subscription.trial_end ? new Date(subscription.trial_end).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : activeTab === 'invoices' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">${invoice.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {invoice.paid_date ? new Date(invoice.paid_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{invoice.currency?.toUpperCase() || 'USD'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Renewal Management</h3>
              <p className="text-muted-foreground">
                Track upcoming renewals and manage subscription lifecycle
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};