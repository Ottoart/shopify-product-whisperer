import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";

export function UpdateShippingAddress() {
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const updateToUPSAddress = async () => {
    setUpdating(true);
    try {
      // Update shipping address to match exact UPS account format
      const { data, error } = await supabase.functions.invoke('update-store-shipping-address', {
        body: {
          address: {
            address_line1: '9200 Park ave',
            address_line2: '301',
            city: 'MONTREAL', 
            state: 'QC',
            zip: 'H2N1Z4',
            country: 'CA'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Shipping Address Updated",
        description: "Store shipping address now matches your UPS account address exactly",
      });

      console.log('✅ Shipping address updated successfully:', data);
      
    } catch (error) {
      console.error('❌ Error updating shipping address:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update shipping address",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <div className="flex items-start gap-3">
        <MapPin className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800">UPS Address Configuration</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Update your shipping address to match your UPS account address exactly: 
            <br />
            <strong>9200 Park ave, 301, MONTREAL, QC, H2N1Z4, CA</strong>
          </p>
          <Button 
            onClick={updateToUPSAddress} 
            disabled={updating}
            className="mt-3"
            size="sm"
          >
            {updating ? "Updating..." : "Update to UPS Address"}
          </Button>
        </div>
      </div>
    </div>
  );
}