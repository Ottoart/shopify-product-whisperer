import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Truck, MapPin, Package, AlertCircle } from "lucide-react";

interface ShipmentDetailsFormProps {
  submissionId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ShipmentFormData {
  pickupAddress: {
    company: string;
    contactName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryPreferences: {
    urgency: string;
    deliveryWindow: string;
    signatureRequired: boolean;
    insuranceRequired: boolean;
  };
  specialInstructions: string;
  estimatedWeight: string;
  estimatedValue: string;
}

export function ShipmentDetailsForm({ submissionId, onSuccess, onCancel }: ShipmentDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ShipmentFormData>({
    defaultValues: {
      pickupAddress: {
        country: 'US'
      },
      deliveryPreferences: {
        urgency: 'standard',
        deliveryWindow: 'business_hours',
        signatureRequired: false,
        insuranceRequired: false
      }
    }
  });

  const signatureRequired = watch('deliveryPreferences.signatureRequired');
  const insuranceRequired = watch('deliveryPreferences.insuranceRequired');

  const onSubmit = async (data: ShipmentFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('inventory_submissions')
        .update({
          shipment_details: data as any,
          status: 'pending_approval'
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Shipping Details Saved!",
        description: "Your submission is now pending approval from our team.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error saving shipment details:', error);
      toast({
        title: "Error",
        description: "Failed to save shipping details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Shipment Details</h1>
        <p className="text-muted-foreground">
          Provide pickup and delivery information for your inventory submission
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Pickup Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pickup Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  {...register('pickupAddress.company', { required: 'Company name is required' })}
                  placeholder="Your Company Name"
                />
                {errors.pickupAddress?.company && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.company.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  {...register('pickupAddress.contactName', { required: 'Contact name is required' })}
                  placeholder="Contact Person"
                />
                {errors.pickupAddress?.contactName && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.contactName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('pickupAddress.phone', { required: 'Phone number is required' })}
                  placeholder="(555) 123-4567"
                />
                {errors.pickupAddress?.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.phone.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('pickupAddress.email', { required: 'Email is required' })}
                  placeholder="contact@company.com"
                />
                {errors.pickupAddress?.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                {...register('pickupAddress.address', { required: 'Address is required' })}
                placeholder="123 Main Street"
              />
              {errors.pickupAddress?.address && (
                <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.address.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register('pickupAddress.city', { required: 'City is required' })}
                  placeholder="City"
                />
                {errors.pickupAddress?.city && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.city.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register('pickupAddress.state', { required: 'State is required' })}
                  placeholder="CA"
                />
                {errors.pickupAddress?.state && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.state.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  {...register('pickupAddress.zipCode', { required: 'ZIP code is required' })}
                  placeholder="90210"
                />
                {errors.pickupAddress?.zipCode && (
                  <p className="text-sm text-red-500 mt-1">{errors.pickupAddress.zipCode.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="urgency">Delivery Urgency</Label>
                <Select onValueChange={(value) => setValue('deliveryPreferences.urgency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (5-7 business days)</SelectItem>
                    <SelectItem value="expedited">Expedited (2-3 business days)</SelectItem>
                    <SelectItem value="rush">Rush (Next business day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="deliveryWindow">Delivery Window</Label>
                <Select onValueChange={(value) => setValue('deliveryPreferences.deliveryWindow', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business_hours">Business Hours (9 AM - 5 PM)</SelectItem>
                    <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                    <SelectItem value="any_time">Any Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="estimatedWeight">Estimated Weight (lbs)</Label>
                <Input
                  id="estimatedWeight"
                  {...register('estimatedWeight')}
                  placeholder="50"
                  type="number"
                />
              </div>
              
              <div>
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  {...register('estimatedValue')}
                  placeholder="1000"
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="signatureRequired"
                  checked={signatureRequired}
                  onCheckedChange={(checked) => setValue('deliveryPreferences.signatureRequired', checked as boolean)}
                />
                <Label htmlFor="signatureRequired">Signature required upon delivery</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="insuranceRequired"
                  checked={insuranceRequired}
                  onCheckedChange={(checked) => setValue('deliveryPreferences.insuranceRequired', checked as boolean)}
                />
                <Label htmlFor="insuranceRequired">Insurance coverage required</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Special Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="specialInstructions">Additional Notes (Optional)</Label>
            <Textarea
              id="specialInstructions"
              {...register('specialInstructions')}
              placeholder="Any special handling instructions, access codes, or delivery notes..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-32"
          >
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
            <Package className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}