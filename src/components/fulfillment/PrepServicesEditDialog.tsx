import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Package, DollarSign, Edit3 } from "lucide-react";

interface PrepService {
  id: string;
  name: string;
  code: string;
  description: string;
  base_price: number;
}

interface PrepServicesEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  items: any[];
  onSuccess: () => void;
}

export function PrepServicesEditDialog({
  open,
  onOpenChange,
  submissionId,
  items,
  onSuccess
}: PrepServicesEditDialogProps) {
  const [availableServices, setAvailableServices] = useState<PrepService[]>([]);
  const [itemServices, setItemServices] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPrepServices();
      initializeItemServices();
    }
  }, [open, items]);

  const fetchPrepServices = async () => {
    try {
      const { data, error } = await supabase
        .from('prep_services')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setAvailableServices(data || []);
    } catch (error) {
      console.error('Error fetching prep services:', error);
      toast({
        title: "Error",
        description: "Failed to load prep services",
        variant: "destructive",
      });
    }
  };

  const initializeItemServices = () => {
    const services: Record<string, string[]> = {};
    items.forEach(item => {
      services[item.id] = item.submission_prep_services?.map((sps: any) => sps.prep_service_id) || [];
    });
    setItemServices(services);
  };

  const toggleService = (itemId: string, serviceId: string) => {
    setItemServices(prev => ({
      ...prev,
      [itemId]: prev[itemId]?.includes(serviceId)
        ? prev[itemId].filter(id => id !== serviceId)
        : [...(prev[itemId] || []), serviceId]
    }));
  };

  const calculateItemCost = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return 0;

    const selectedServiceIds = itemServices[itemId] || [];
    return selectedServiceIds.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return total + (service ? service.base_price * item.quantity : 0);
    }, 0);
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => total + calculateItemCost(item.id), 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get all submission item IDs
      const itemIds: string[] = [];
      items.forEach(item => itemIds.push(item.id));

      // Delete existing prep services for this submission
      const { error: deleteError } = await (supabase as any)
        .from('submission_prep_services')
        .delete()
        .in('submission_item_id', itemIds);

      if (deleteError) throw deleteError;

      // Insert new prep services
      const prepServiceInserts: any[] = [];
      for (const item of items) {
        const selectedServiceIds = itemServices[item.id] || [];
        
        for (const serviceId of selectedServiceIds) {
          const service = availableServices.find(s => s.id === serviceId);
          if (service) {
            prepServiceInserts.push({
              submission_item_id: item.id,
              prep_service_id: serviceId,
              quantity: item.quantity,
              unit_price: service.base_price,
              total_price: service.base_price * item.quantity
            });
          }
        }
      }

      if (prepServiceInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('submission_prep_services')
          .insert(prepServiceInserts);

        if (insertError) throw insertError;
      }

      // Update submission total cost
      const totalCost = calculateTotalCost();
      const { error: updateError } = await supabase
        .from('inventory_submissions')
        .update({ total_prep_cost: totalCost })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Prep services updated successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving prep services:', error);
      toast({
        title: "Error",
        description: "Failed to update prep services",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Prep Services
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.product_title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>SKU: {item.sku}</span>
                  <span>Qty: {item.quantity}</span>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Prep Cost: ${calculateItemCost(item.id).toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start space-x-2 p-3 border rounded-lg"
                    >
                      <Checkbox
                        id={`${item.id}-${service.id}`}
                        checked={itemServices[item.id]?.includes(service.id) || false}
                        onCheckedChange={() => toggleService(item.id, service.id)}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`${item.id}-${service.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {service.name}
                          </label>
                          <Badge variant="outline" className="text-xs">
                            ${service.base_price.toFixed(2)} each
                          </Badge>
                        </div>
                        {service.description && (
                          <p className="text-xs text-muted-foreground">
                            {service.description}
                          </p>
                        )}
                        {itemServices[item.id]?.includes(service.id) && (
                          <p className="text-xs font-medium text-green-600">
                            Total: ${(service.base_price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Separator />

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="text-lg font-medium">Total Prep Cost</div>
            <div className="text-xl font-bold">${calculateTotalCost().toFixed(2)}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}