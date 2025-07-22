import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, Edit, Users } from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain: string;
  billing_email: string | null;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
  phone: string | null;
  address: any;
  settings: any;
  user_count?: number;
}

export const CompanyManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    domain: "",
    billing_email: "",
    phone: "",
    subscription_plan: "basic"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          user_companies(count)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data.map(company => ({
        ...company,
        user_count: company.user_companies?.length || 0
      })) as Company[];
    }
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: typeof newCompany) => {
      const { data, error } = await supabase
        .from("companies")
        .insert([companyData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setIsCreateDialogOpen(false);
      setNewCompany({ name: "", domain: "", billing_email: "", phone: "", subscription_plan: "basic" });
      toast({ title: "Company created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating company", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Company> }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      setEditingCompany(null);
      toast({ title: "Company updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating company", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreateCompany = () => {
    createCompanyMutation.mutate(newCompany);
  };

  const handleStatusToggle = (company: Company) => {
    const newStatus = company.subscription_status === "active" ? "suspended" : "active";
    updateCompanyMutation.mutate({
      id: company.id,
      updates: { subscription_status: newStatus }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Company Management</CardTitle>
            <CardDescription>Manage companies and their settings</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Add a new company to the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Input
                    id="domain"
                    value={newCompany.domain}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="acme.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCompany.phone}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="subscription_plan">Subscription Plan</Label>
                  <Select value={newCompany.subscription_plan} onValueChange={(value) => setNewCompany(prev => ({ ...prev, subscription_plan: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="billing_email">Billing Email</Label>
                  <Input
                    id="billing_email"
                    type="email"
                    value={newCompany.billing_email}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, billing_email: e.target.value }))}
                    placeholder="billing@acme.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateCompany}
                  disabled={createCompanyMutation.isPending || !newCompany.name || !newCompany.domain}
                >
                  {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading companies...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies?.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      {company.billing_email && (
                        <div className="text-sm text-muted-foreground">{company.billing_email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-1 py-0.5 rounded">{company.domain}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{company.subscription_plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{company.user_count}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.subscription_status === "active" ? "default" : "destructive"}>
                      {company.subscription_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(company.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(company)}
                        disabled={updateCompanyMutation.isPending}
                      >
                        {company.subscription_status === "active" ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};