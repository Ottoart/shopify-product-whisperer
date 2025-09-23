import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id?: string;
  plan_name: string;
  monthly_cost: number;
  stripe_price_id?: string | null;
  is_active: boolean;
  features: any;
}

const AdminPlans = () => {
  const session = useSession();
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Plan | null>(null);

  const blankPlan: Plan = useMemo(() => ({
    plan_name: "",
    monthly_cost: 0,
    stripe_price_id: "",
    is_active: true,
    features: { limits: { labels_per_month: 0, repriced_skus: 0 } },
  }), []);

  const [form, setForm] = useState<Plan>(blankPlan);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("plans").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPlans(data as Plan[]);
    } catch (e: any) {
      toast({ title: "Failed to load plans", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchPlans();
  }, [session]);

  const resetForm = () => {
    setForm(blankPlan);
    setEditing(null);
  };

  const savePlan = async () => {
    try {
      const payload: any = {
        plan_name: form.plan_name,
        monthly_cost: Number(form.monthly_cost) || 0,
        is_active: Boolean(form.is_active),
        stripe_price_id: form.stripe_price_id || null,
        features: typeof form.features === "string" ? JSON.parse(form.features as any) : form.features,
      };

      if (editing?.id) {
        const { error } = await supabase.from("plans").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast({ title: "Plan updated" });
      } else {
        const { error } = await supabase.from("plans").insert(payload);
        if (error) throw error;
        toast({ title: "Plan created" });
      }
      resetForm();
      fetchPlans();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
  };

  const editPlan = (p: Plan) => {
    setEditing(p);
    setForm({ ...p, features: JSON.stringify(p.features, null, 2) as any });
  };

  const toggleActive = async (p: Plan) => {
    try {
      const { error } = await supabase.from("plans").update({ is_active: !p.is_active }).eq("id", p.id);
      if (error) throw error;
      fetchPlans();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Plans Management</h1>
        <p className="text-muted-foreground">Create and edit subscription plans and limits.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? `Edit Plan: ${editing.plan_name}` : "Create New Plan"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Plan Name</label>
              <Input value={form.plan_name} onChange={(e) => setForm({ ...form, plan_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Monthly Cost (USD)</label>
              <Input type="number" value={form.monthly_cost} onChange={(e) => setForm({ ...form, monthly_cost: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm">Stripe Price ID</label>
              <Input value={form.stripe_price_id || ""} onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })} placeholder="price_..." />
            </div>
            <div>
              <label className="text-sm">Active</label>
              <div className="flex gap-2">
                <Button type="button" variant={form.is_active ? "default" : "outline"} onClick={() => setForm({ ...form, is_active: true })}>Active</Button>
                <Button type="button" variant={!form.is_active ? "default" : "outline"} onClick={() => setForm({ ...form, is_active: false })}>Inactive</Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm">Features JSON</label>
              <Textarea rows={8} value={typeof form.features === "string" ? (form.features as any) : JSON.stringify(form.features, null, 2)} onChange={(e) => setForm({ ...form, features: e.target.value as any })} />
              <p className="text-xs text-muted-foreground mt-1">Example: {`{"limits": {"labels_per_month": 500, "repriced_skus": 50}}`}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={savePlan}>{editing ? "Save Changes" : "Create Plan"}</Button>
            {editing && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : plans.length === 0 ? (
            <p className="text-muted-foreground">No plans yet.</p>
          ) : (
            <div className="grid gap-3">
              {plans.map((p) => (
                <div key={p.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{p.plan_name} {p.is_active ? null : <span className="text-xs text-muted-foreground">(inactive)</span>}</div>
                    <div className="text-sm text-muted-foreground">${""}{p.monthly_cost}/mo • Price: {p.stripe_price_id || "—"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => editPlan(p)}>Edit</Button>
                    <Button variant="outline" onClick={() => toggleActive(p)}>{p.is_active ? "Deactivate" : "Activate"}</Button>
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

export default AdminPlans;
