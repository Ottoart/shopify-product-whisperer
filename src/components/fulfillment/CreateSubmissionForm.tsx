import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Package } from "lucide-react";
import { useFulfillmentData } from "@/hooks/useFulfillmentData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentDialog } from "./PaymentDialog";

const submissionSchema = z.object({
  destination_id: z.string().min(1, "Please select a fulfillment destination"),
  custom_fulfillment_channel: z.string().optional(),
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

interface PrepService {
  id: string;
  name: string;
  code: string;
  description: string;
  base_price: number;
}

interface FulfillmentDestination {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface ItemWithPrepServices extends ItemFormData {
  id: string;
  prep_services: string[];
}

export function CreateSubmissionForm() {
  const { toast } = useToast();
  const [items, setItems] = useState<ItemWithPrepServices[]>([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [prepServices, setPrepServices] = useState<PrepService[]>([]);
  const [destinations, setDestinations] = useState<FulfillmentDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSubmission, setPaymentSubmission] = useState<any>(null);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      destination_id: "",
      custom_fulfillment_channel: "",
      special_instructions: "",
    },
  });

  // Fetch destinations and prep services on component mount
  useEffect(() => {
    fetchDestinations();
    fetchPrepServices();
  }, []);

  const fetchDestinations = async () => {
    try {
      const { data, error } = await supabase
        .from('fulfillment_destinations')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setDestinations(data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
      toast({
        title: "Error",
        description: "Failed to load fulfillment destinations",
        variant: "destructive",
      });
    }
  };

  const fetchPrepServices = async () => {
    try {
      const { data, error } = await supabase
        .from('prep_services')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setPrepServices(data || []);
    } catch (error) {
      console.error('Error fetching prep services:', error);
      toast({
        title: "Error",
        description: "Failed to load prep services",
        variant: "destructive",
      });
    }
  };

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

    // Validate custom fulfillment channel if Omni Fulfillment is selected
    const selectedDest = destinations.find(d => d.id === data.destination_id);
    if (selectedDest?.code === 'OMNI' && !data.custom_fulfillment_channel?.trim()) {
      toast({
        title: "Error",
        description: "Please specify your custom fulfillment channel",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate submission number
      const submissionNumber = `SUB-${Date.now()}`;
      
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Create the submission
      const { data: submission, error: submissionError } = await supabase
        .from('inventory_submissions')
        .insert({
          user_id: user.id,
          submission_number: submissionNumber,
          destination_id: data.destination_id,
          special_instructions: data.special_instructions || '',
          total_items: items.length,
          total_prep_cost: calculateTotalCost(),
          status: 'draft'
        })
        .select('*, fulfillment_destinations!inner(*)')
        .single();

      if (submissionError) throw submissionError;

      // Add items
      const { error: itemsError } = await supabase
        .from('submission_items')
        .insert(items.map(({ id, prep_services, ...item }) => ({
          submission_id: submission.id,
          sku: item.sku,
          product_title: item.product_title,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          weight_lbs: item.weight_lbs,
          length_inches: item.length_inches,
          width_inches: item.width_inches,
          height_inches: item.height_inches,
          expiration_date: item.expiration_date || null,
          lot_number: item.lot_number || null,
        })));

      if (itemsError) throw itemsError;

      const totalCost = calculateTotalCost();

      // Show payment dialog if there are costs
      if (totalCost > 0) {
        setPaymentSubmission({
          ...submission,
          destination: submission.fulfillment_destinations
        });
        setShowPaymentDialog(true);
      } else {
        // If no costs, directly submit for approval
        const { error: updateError } = await supabase
          .from('inventory_submissions')
          .update({ 
            status: 'pending_approval',
            submitted_at: new Date().toISOString()
          })
          .eq('id', submission.id);

        if (updateError) throw updateError;

        // Reset form
        form.reset();
        setItems([]);
        setSelectedDestination("");
        
        toast({
          title: "Success",
          description: "Submission created and sent for approval!",
        });
      }
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({
        title: "Error", 
        description: "Failed to create submission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDestination(value);
                    }} 
                    defaultValue={field.value}
                  >
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

            {/* Custom Fulfillment Channel field - show only for Omni Fulfillment */}
            {selectedDestination && destinations.find(d => d.id === selectedDestination)?.code === 'OMNI' && (
              <FormField
                control={form.control}
                name="custom_fulfillment_channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Fulfillment Channel</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your fulfillment provider name" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Specify the name of your preferred fulfillment provider
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                          <Label className="text-sm font-medium">Prep Services</Label>
                          <div className="grid grid-cols-1 gap-2">
                            {prepServices.map((service) => (
                              <label
                                key={service.id}
                                className="flex items-center justify-between p-2 rounded-md border cursor-pointer hover:bg-muted/50"
                              >
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={item.prep_services.includes(service.id)}
                                    onCheckedChange={() => togglePrepService(item.id, service.id)}
                                  />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{service.name}</span>
                                    <span className="text-xs text-muted-foreground">{service.description}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-medium">${service.base_price.toFixed(2)}</span>
                                  <div className="text-xs text-muted-foreground">
                                    × {item.quantity} = ${(service.base_price * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm">
                              <span>Item prep total:</span>
                              <span className="font-medium">
                                ${item.prep_services.reduce((total, serviceId) => {
                                  const service = prepServices.find(s => s.id === serviceId);
                                  return total + (service ? service.base_price * item.quantity : 0);
                                }, 0).toFixed(2)}
                              </span>
                            </div>
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

      {/* Payment Dialog */}
      {paymentSubmission && (
        <PaymentDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          submission={paymentSubmission}
          items={items.map(item => ({
            sku: item.sku,
            quantity: item.quantity,
            prep_services: item.prep_services.map(serviceId => {
              const service = prepServices.find(s => s.id === serviceId);
              return service ? { name: service.name, cost_per_item: service.base_price } : { name: '', cost_per_item: 0 };
            }).filter(s => s.name)
          }))}
          onPaymentSuccess={() => {
            setShowPaymentDialog(false);
            form.reset();
            setItems([]);
            setSelectedDestination("");
            toast({
              title: "Payment Successful",
              description: "Your submission has been sent for approval!",
            });
          }}
        />
      )}
    </div>
  );
}