import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, DollarSign, Calendar, Building2 } from "lucide-react";

interface BillingInfo {
  id: string;
  company_id: string;
  plan_name: string;
  plan_price: number;
  status: string;
  billing_interval: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  companies: {
    name: string;
    domain: string;
  };
}

export const BillingManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newBilling, setNewBilling] = useState({
    company_id: "",
    plan_name: "",
    plan_price: "",
    billing_interval: "monthly"
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: billingData, isLoading } = useQuery({
    queryKey: ["admin-billing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("billing_subscriptions")
        .select(`
          *,
          companies (
            name,
            domain
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as BillingInfo[];
    }
  });

  const { data: companies } = useQuery({
    queryKey: ["companies-for-billing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, domain")
        .eq("subscription_status", "active")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  const createBillingMutation = useMutation({
    mutationFn: async (billingData: typeof newBilling) => {
      const { data, error } = await supabase
        .from("billing_subscriptions")
        .insert([{
          company_id: billingData.company_id,
          plan_name: billingData.plan_name,
          plan_price: parseFloat(billingData.plan_price),
          billing_interval: billingData.billing_interval,
          status: "active"
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-billing"] });
      setIsCreateDialogOpen(false);
      setNewBilling({ company_id: "", plan_name: "", plan_price: "", billing_interval: "monthly" });
      toast({ title: "Billing information created successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating billing information", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateBillingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BillingInfo> }) => {
      const { data, error } = await supabase
        .from("billing_subscriptions")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-billing"] });
      toast({ title: "Billing information updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating billing information", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleCreateBilling = () => {
    createBillingMutation.mutate(newBilling);
  };

  const handleStatusToggle = (billing: BillingInfo) => {
    const newStatus = billing.status === "active" ? "suspended" : "active";
    updateBillingMutation.mutate({
      id: billing.id,
      updates: { status: newStatus }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Billing Management</CardTitle>
            <CardDescription>Manage company billing and subscriptions</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                Add Billing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Billing Information</DialogTitle>
                <DialogDescription>
                  Set up billing for a company
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Select value={newBilling.company_id} onValueChange={(value) => setNewBilling(prev => ({ ...prev, company_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan_name">Plan Name</Label>
                  <Input
                    id="plan_name"
                    value={newBilling.plan_name}
                    onChange={(e) => setNewBilling(prev => ({ ...prev, plan_name: e.target.value }))}
                    placeholder="Professional Plan"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plan_price">Plan Price</Label>
                    <Input
                      id="plan_price"
                      type="number"
                      step="0.01"
                      value={newBilling.plan_price}
                      onChange={(e) => setNewBilling(prev => ({ ...prev, plan_price: e.target.value }))}
                      placeholder="99.99"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billing_interval">Billing Interval</Label>
                    <Select value={newBilling.billing_interval} onValueChange={(value) => setNewBilling(prev => ({ ...prev, billing_interval: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newBilling.plan_price}
                    onChange={(e) => setNewBilling(prev => ({ ...prev, plan_price: e.target.value }))}
                    placeholder="99.99"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateBilling}
                  disabled={createBillingMutation.isPending || !newBilling.company_id || !newBilling.plan_name || !newBilling.plan_price}
                >
                  {createBillingMutation.isPending ? "Creating..." : "Create Billing"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading billing data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData?.map((billing) => (
                <TableRow key={billing.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4" />
                      <span>{billing.companies.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{billing.plan_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">${billing.plan_price}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(billing.plan_price)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{billing.billing_interval}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={billing.status === "active" ? "default" : "destructive"}>
                      {billing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {billing.current_period_end 
                      ? new Date(billing.current_period_end).toLocaleDateString()
                      : "—"
                    }
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(billing)}
                      disabled={updateBillingMutation.isPending}
                    >
                      {billing.status === "active" ? "Suspend" : "Activate"}
                    </Button>
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