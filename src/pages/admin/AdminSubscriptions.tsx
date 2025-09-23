import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  current_period_end: string | null;
}

interface Plan { id: string; plan_name: string; }

const AdminSubscriptions = () => {
  const session = useSession();
  const { toast } = useToast();
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAll = async () => {
    const { data: subsData } = await supabase.from("subscriptions").select("id,user_id,plan_id,plan_name,status,current_period_end").order("created_at", { ascending: false }).limit(100);
    const { data: plansData } = await supabase.from("plans").select("id,plan_name").order("plan_name");
    setSubs(subsData || []);
    setPlans(plansData || []);
  };

  useEffect(() => { if (session) fetchAll(); }, [session]);

  const modifyPlan = async (sub: SubscriptionRow, newPlanId: string) => {
    try {
      setUpdating(sub.id);
      const { error, data } = await supabase.functions.invoke('billing-modify-subscription', {
        body: { userId: sub.user_id, planId: newPlanId }
      });
      if (error) throw error;
      toast({ title: 'Subscription updated', description: data?.message || 'Plan changed.' });
      fetchAll();
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Subscriptions</h1>
        <p className="text-muted-foreground">Upgrade, downgrade, or cancel user subscriptions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {subs.length === 0 ? (
            <p className="text-muted-foreground">No subscriptions found.</p>
          ) : (
            <div className="grid gap-3">
              {subs.map((s) => (
                <div key={s.id} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-medium">User: {s.user_id}</div>
                    <div className="text-sm text-muted-foreground">Plan: {s.plan_name} • Status: {s.status} {s.current_period_end ? `• Renews: ${new Date(s.current_period_end).toLocaleDateString()}` : ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(val) => modifyPlan(s, val)} disabled={updating === s.id}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Change plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.plan_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => modifyPlan(s, s.plan_id)} disabled={updating === s.id}>Refresh</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
