import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building, 
  Search, 
  MoreHorizontal, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Eye,
  Settings
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain?: string;
  subscription_plan?: string;
  subscription_status?: string;
  billing_email?: string;
  created_at: string;
  updated_at: string;
  settings?: any;
  address?: any;
  phone?: string;
}

interface CompanyMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  supportTickets: number;
  lastActivity: string;
  healthScore: number;
}

export const EnhancedCompanyDashboard = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyMetrics, setCompanyMetrics] = useState<Record<string, CompanyMetrics>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadCompanies();
    loadCompanyMetrics();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyMetrics = async () => {
    try {
      // This would typically come from aggregated data or a separate metrics table
      const mockMetrics: Record<string, CompanyMetrics> = {};
      
      // Generate mock metrics for each company
      companies.forEach(company => {
        mockMetrics[company.id] = {
          totalUsers: Math.floor(Math.random() * 100) + 10,
          activeSubscriptions: Math.floor(Math.random() * 5) + 1,
          monthlyRevenue: Math.floor(Math.random() * 10000) + 1000,
          supportTickets: Math.floor(Math.random() * 10),
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          healthScore: Math.floor(Math.random() * 40) + 60 // 60-100
        };
      });
      
      setCompanyMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading company metrics:', error);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      case 'trial': return 'outline';
      default: return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise': return 'default';
      case 'pro': return 'secondary';
      case 'free': return 'outline';
      default: return 'outline';
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.billing_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || company.subscription_status === statusFilter;
    const matchesPlan = planFilter === 'all' || company.subscription_plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalStats = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter(c => c.subscription_status === 'active').length,
    totalRevenue: Object.values(companyMetrics).reduce((sum, metrics) => sum + metrics.monthlyRevenue, 0),
    avgHealthScore: Object.values(companyMetrics).reduce((sum, metrics) => sum + metrics.healthScore, 0) / Object.keys(companyMetrics).length || 0
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{Math.floor(totalStats.totalCompanies * 0.12)} this month
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activeCompanies}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalStats.activeCompanies / totalStats.totalCompanies) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Health Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getHealthScoreColor(totalStats.avgHealthScore)}`}>
              {Math.round(totalStats.avgHealthScore)}%
            </div>
            <p className="text-xs text-muted-foreground">Company health average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enhanced Company Management</CardTitle>
              <CardDescription>Comprehensive company monitoring and business intelligence</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
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
                  <TableHead>Company</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const metrics = companyMetrics[company.id];
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-muted-foreground">{company.domain || 'No domain'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getHealthScoreIcon(metrics?.healthScore || 0)}
                          <span className={`font-medium ${getHealthScoreColor(metrics?.healthScore || 0)}`}>
                            {metrics?.healthScore || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{metrics?.totalUsers || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${metrics?.monthlyRevenue?.toLocaleString() || 0}/mo</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(company.subscription_plan || 'free')}>
                          {company.subscription_plan || 'free'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(company.subscription_status || 'inactive')}>
                          {company.subscription_status || 'inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {metrics?.lastActivity ? new Date(metrics.lastActivity).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Company Details: {company.name}</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium">Company Information</h4>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Domain:</strong> {company.domain || 'N/A'}</div>
                                    <div><strong>Email:</strong> {company.billing_email || 'N/A'}</div>
                                    <div><strong>Phone:</strong> {company.phone || 'N/A'}</div>
                                    <div><strong>Created:</strong> {new Date(company.created_at).toLocaleDateString()}</div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="font-medium">Metrics & Performance</h4>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Health Score:</strong> {metrics?.healthScore || 0}%</div>
                                    <div><strong>Total Users:</strong> {metrics?.totalUsers || 0}</div>
                                    <div><strong>Monthly Revenue:</strong> ${metrics?.monthlyRevenue?.toLocaleString() || 0}</div>
                                    <div><strong>Support Tickets:</strong> {metrics?.supportTickets || 0}</div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};