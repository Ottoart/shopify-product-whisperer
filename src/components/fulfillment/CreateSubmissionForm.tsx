import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package } from "lucide-react";
import { useFulfillmentData } from "@/hooks/useFulfillmentData";
import { useToast } from "@/hooks/use-toast";

const submissionSchema = z.object({
  destination_id: z.string().min(1, "Please select a fulfillment destination"),
  special_instructions: z.string().optional(),
});

const itemSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  product_title: z.string().min(1, "Product title is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_cost: z.number().optional(),
  weight_lbs: z.number().optional(),
  length_inches: z.number().optional(),
  width_inches: z.number().optional(),
  height_inches: z.number().optional(),
  expiration_date: z.string().optional(),
  lot_number: z.string().optional(),
});

type SubmissionFormData = z.infer<typeof submissionSchema>;
type ItemFormData = z.infer<typeof itemSchema>;

interface ItemWithPrepServices extends ItemFormData {
  id: string;
  prep_services: string[];
}

export function CreateSubmissionForm() {
  const { destinations, prepServices, createSubmission, addSubmissionItems, addPrepServices, loading } = useFulfillmentData();
  const { toast } = useToast();
  const [items, setItems] = useState<ItemWithPrepServices[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      destination_id: "",
      special_instructions: "",
    },
  });

  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      sku: "",
      product_title: "",
      quantity: 1,
      unit_cost: undefined,
      weight_lbs: undefined,
      length_inches: undefined,
      width_inches: undefined,
      height_inches: undefined,
      expiration_date: "",
      lot_number: "",
    },
  });

  const addItem = (data: ItemFormData) => {
    const newItem: ItemWithPrepServices = {
      ...data,
      id: `temp-${Date.now()}`,
      prep_services: [],
    };
    setItems(prev => [...prev, newItem]);
    itemForm.reset();
    setShowItemForm(false);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const togglePrepService = (itemId: string, serviceId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const services = item.prep_services.includes(serviceId)
          ? item.prep_services.filter(s => s !== serviceId)
          : [...item.prep_services, serviceId];
        return { ...item, prep_services: services };
      }
      return item;
    }));
  };

  const calculateTotalCost = () => {
    return items.reduce((total, item) => {
      const itemPrepCost = item.prep_services.reduce((prepTotal, serviceId) => {
        const service = prepServices.find(s => s.id === serviceId);
        return prepTotal + (service ? service.base_price * item.quantity : 0);
      }, 0);
      return total + itemPrepCost;
    }, 0);
  };

  const onSubmit = async (data: SubmissionFormData) => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item to the submission",
        variant: "destructive",
      });
      return;
    }

    const submissionId = await createSubmission({
      destination_id: data.destination_id,
      special_instructions: data.special_instructions,
      total_items: items.length,
      total_prep_cost: calculateTotalCost(),
    });

    if (submissionId) {
      // Add items
      await addSubmissionItems(submissionId, items.map(({ id, prep_services, ...item }) => ({
        sku: item.sku,
        product_title: item.product_title,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        weight_lbs: item.weight_lbs,
        length_inches: item.length_inches,
        width_inches: item.width_inches,
        height_inches: item.height_inches,
        expiration_date: item.expiration_date,
        lot_number: item.lot_number,
      })));

      // Add prep services
      const prepServiceRequests = items.flatMap(item =>
        item.prep_services.map(serviceId => ({
          prep_service_id: serviceId,
          quantity: item.quantity,
          unit_price: prepServices.find(s => s.id === serviceId)?.base_price || 0,
          total_price: (prepServices.find(s => s.id === serviceId)?.base_price || 0) * item.quantity,
        }))
      );

      if (prepServiceRequests.length > 0) {
        await addPrepServices(submissionId, prepServiceRequests);
      }

      // Reset form
      form.reset();
      setItems([]);
      
      toast({
        title: "Success",
        description: "Inventory submission created successfully!",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Submission Details */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="destination_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fulfillment Destination</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinations.map((destination) => (
                        <SelectItem key={destination.id} value={destination.id}>
                          <div>
                            <div className="font-medium">{destination.name}</div>
                            <div className="text-sm text-muted-foreground">{destination.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose where your inventory will be sent for fulfillment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="special_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special handling instructions..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional instructions for the warehouse team
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items ({items.length})
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowItemForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Item Form */}
              {showItemForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...itemForm}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={itemForm.control}
                          name="sku"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SKU</FormLabel>
                              <FormControl>
                                <Input placeholder="ITEM-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={itemForm.control}
                          name="product_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Product name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={itemForm.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={itemForm.control}
                          name="unit_cost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Cost ($)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={itemForm.control}
                          name="weight_lbs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.1"
                                  placeholder="0.0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={itemForm.control}
                          name="expiration_date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Expiration Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button type="button" onClick={itemForm.handleSubmit(addItem)}>
                          Add Item
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowItemForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.sku}</Badge>
                          <span className="font-medium">{item.product_title}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                          {item.unit_cost && ` • Unit Cost: $${item.unit_cost.toFixed(2)}`}
                          {item.weight_lbs && ` • Weight: ${item.weight_lbs} lbs`}
                        </div>

                        {/* Prep Services Selection */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Prep Services:</div>
                          <div className="grid gap-2 md:grid-cols-2">
                            {prepServices.map((service) => (
                              <div key={service.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${item.id}-${service.id}`}
                                  checked={item.prep_services.includes(service.id)}
                                  onCheckedChange={() => togglePrepService(item.id, service.id)}
                                />
                                <label
                                  htmlFor={`${item.id}-${service.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {service.name} (${service.base_price.toFixed(2)})
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet. Click "Add Item" to get started.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {items.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Total Items: {items.length}</div>
                    <div className="text-sm text-muted-foreground">
                      Estimated Prep Cost: ${calculateTotalCost().toFixed(2)}
                    </div>
                  </div>
                  <Button type="submit" disabled={loading || items.length === 0}>
                    {loading ? "Creating..." : "Create Submission"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </Form>
    </div>
  );
}