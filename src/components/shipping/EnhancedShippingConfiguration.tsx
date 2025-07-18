import { useState, useEffect } from "react";
import { RefreshUPSTokenButton } from "./RefreshUPSTokenButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { 
  Package, 
  MapPin, 
  Weight, 
  Ruler, 
  Shield, 
  Plus,
  Clock,
  DollarSign,
  ArrowUpDown,
  Zap,
  CheckCircle
} from "lucide-react";

interface ShippingRate {
  service_code: string;
  service_name: string;
  service_type: string;
  cost: number;
  currency: string;
  estimated_days: string;
  carrier: string;
  confirmation_options?: {
    type: string;
    label: string;
    fee: number;
  }[];
}

interface ShipFromAddress {
  id?: string;
  label: string;
  name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

interface PackageOption {
  id?: string;
  label: string;
  source: 'carrier' | 'custom';
  length: number;
  width: number;
  height: number;
  unit: 'in' | 'cm';
  carrier?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  packageDetails?: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
  };
  shippingDetails?: {
    cost?: number;
    carrier?: string;
    serviceType?: string;
    trackingNumber?: string;
  };
}

interface EnhancedShippingConfigurationProps {
  selectedOrder?: Order;
  onUpdateOrder?: (orderId: string, updates: any) => void;
  onRateSelected?: (rate: any) => void;
  selectedRate?: any;
  orderId?: string;
  onShippingSelected?: (data: any) => void;
}

export function EnhancedShippingConfiguration({ 
  selectedOrder, 
  onUpdateOrder, 
  onRateSelected, 
  selectedRate,
  orderId, 
  onShippingSelected 
}: EnhancedShippingConfigurationProps) {
  const [shipFromAddresses, setShipFromAddresses] = useState<ShipFromAddress[]>([]);
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedShipFrom, setSelectedShipFrom] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [customDimensions, setCustomDimensions] = useState({
    length: 12,
    width: 8,
    height: 4,
    unit: 'in' as 'in' | 'cm'
  });
  const [weight, setWeight] = useState(2.5);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [confirmationType, setConfirmationType] = useState<string>("none");
  const [sortBy, setSortBy] = useState<'fastest' | 'cheapest'>('cheapest');
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [newAddress, setNewAddress] = useState<ShipFromAddress>({
    label: "",
    name: "",
    company: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
    phone: "",
    email: ""
  });
  const [newPackage, setNewPackage] = useState<PackageOption>({
    label: "",
    source: 'custom',
    length: 12,
    width: 8,
    height: 4,
    unit: 'in'
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchShipFromAddresses();
    fetchPackages();
    fetchAvailableServices();
  }, []);

  // Auto-fetch rates when shipment details change
  useEffect(() => {
    if (selectedOrder && selectedShipFrom && customDimensions.length > 0 && weight > 0) {
      fetchShippingRates();
    }
  }, [selectedOrder?.id, selectedShipFrom, weight, customDimensions.length, customDimensions.width, customDimensions.height, selectedOrder?.shippingAddress]);

  // Initialize form data from selected order
  useEffect(() => {
    if (selectedOrder) {
      if (selectedOrder.packageDetails?.weight) {
        setWeight(selectedOrder.packageDetails.weight);
      }
      if (selectedOrder.packageDetails?.length) {
        setCustomDimensions(prev => ({
          ...prev,
          length: selectedOrder.packageDetails?.length || prev.length,
          width: selectedOrder.packageDetails?.width || prev.width,
          height: selectedOrder.packageDetails?.height || prev.height
        }));
      }
    }
  }, [selectedOrder]);

  const fetchShipFromAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('store_shipping_configs')
        .select('*')
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Fix country code if Montreal is set to US
        let correctedCountry = data.from_country;
        if (data.from_city?.toLowerCase().includes('montreal') && data.from_country === 'US') {
          correctedCountry = 'CA';
          
          // Update in database
          await supabase
            .from('store_shipping_configs')
            .update({ from_country: 'CA' })
            .eq('id', data.id);
        }

        const address: ShipFromAddress = {
          id: data.id,
          label: data.store_name,
          name: data.from_name,
          company: data.from_company,
          address_line1: data.from_address_line1,
          address_line2: data.from_address_line2,
          city: data.from_city,
          state: data.from_state,
          zip: data.from_zip,
          country: correctedCountry,
          phone: data.from_phone
        };
        setShipFromAddresses([address]);
        setSelectedShipFrom(address.id!);
      } else {
        // No default address found, show message
        toast({
          title: "No Ship From Address",
          description: "Please add a default shipping address first",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching ship from addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load shipping addresses",
        variant: "destructive"
      });
    }
  };

  const fetchPackages = async () => {
    // Load default carrier packages
    const carrierPackages: PackageOption[] = [
      { label: "UPS Express Box - Small", source: 'carrier', length: 13, width: 11, height: 2, unit: 'in', carrier: 'UPS' },
      { label: "UPS Express Box - Medium", source: 'carrier', length: 16, width: 11, height: 3, unit: 'in', carrier: 'UPS' },
      { label: "UPS Express Box - Large", source: 'carrier', length: 18, width: 13, height: 3, unit: 'in', carrier: 'UPS' },
      { label: "FedEx Small Box", source: 'carrier', length: 12.25, width: 10.75, height: 2, unit: 'in', carrier: 'FedEx' },
      { label: "FedEx Medium Box", source: 'carrier', length: 13.25, width: 11.5, height: 2.38, unit: 'in', carrier: 'FedEx' },
      { label: "Custom Package", source: 'custom', length: 12, width: 8, height: 4, unit: 'in' }
    ];

    setPackages(carrierPackages);
    setSelectedPackage("custom");
  };

  const fetchAvailableServices = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_services')
        .select('*')
        .eq('is_available', true);

      if (error) throw error;

      setAvailableServices(data || []);
    } catch (error) {
      console.error('Error fetching available services:', error);
    }
  };

  const addShipFromAddress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if a config with this store name already exists
      const { data: existingConfig, error: checkError } = await supabase
        .from('store_shipping_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('store_name', newAddress.label)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing config:', checkError);
        throw new Error('Failed to check existing configuration');
      }

      let data;
      let error;

      if (existingConfig) {
        // Update existing configuration
        const { data: updateData, error: updateError } = await supabase
          .from('store_shipping_configs')
          .update({
            from_name: newAddress.name,
            from_company: newAddress.company,
            from_address_line1: newAddress.address_line1,
            from_address_line2: newAddress.address_line2,
            from_city: newAddress.city,
            from_state: newAddress.state,
            from_zip: newAddress.zip,
            from_country: newAddress.country,
            from_phone: newAddress.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id)
          .select()
          .single();
        
        data = updateData;
        error = updateError;
        
        if (!error) {
          toast({
            title: "Address Updated",
            description: "Ship from address has been updated successfully",
          });
        }
      } else {
        // Create new configuration
        const { data: insertData, error: insertError } = await supabase
          .from('store_shipping_configs')
          .insert({
            user_id: user.id,
            store_name: newAddress.label,
            from_name: newAddress.name,
            from_company: newAddress.company,
            from_address_line1: newAddress.address_line1,
            from_address_line2: newAddress.address_line2,
            from_city: newAddress.city,
            from_state: newAddress.state,
            from_zip: newAddress.zip,
            from_country: newAddress.country,
            from_phone: newAddress.phone,
            is_default: shipFromAddresses.length === 0 // Make first address default
          })
          .select()
          .single();
        
        data = insertData;
        error = insertError;
        
        if (!error) {
          toast({
            title: "Address Added",
            description: "New ship from address has been added successfully",
          });
        }
      }

      if (error) throw error;

      const address: ShipFromAddress = {
        id: data.id,
        label: newAddress.label,
        name: newAddress.name,
        company: newAddress.company,
        address_line1: newAddress.address_line1,
        address_line2: newAddress.address_line2,
        city: newAddress.city,
        state: newAddress.state,
        zip: newAddress.zip,
        country: newAddress.country,
        phone: newAddress.phone
      };

      // Update or add to the addresses list
      if (existingConfig) {
        setShipFromAddresses(prev => 
          prev.map(addr => addr.id === data.id ? address : addr)
        );
      } else {
        setShipFromAddresses(prev => [...prev, address]);
      }
      
      setSelectedShipFrom(address.id!);
      setShowAddressDialog(false);

      // Reset form
      setNewAddress({
        label: "",
        name: "",
        company: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        zip: "",
        country: "US",
        phone: "",
        email: ""
      });
    } catch (error) {
      console.error('Error adding address:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add ship from address",
        variant: "destructive"
      });
    }
  };

  const saveCustomPackage = () => {
    const customPkg: PackageOption = {
      id: Date.now().toString(),
      label: newPackage.label,
      source: 'custom',
      length: newPackage.length,
      width: newPackage.width,
      height: newPackage.height,
      unit: newPackage.unit
    };

    setPackages(prev => [...prev, customPkg]);
    setSelectedPackage(customPkg.id!);
    setShowPackageDialog(false);
    
    toast({
      title: "Package Saved",
      description: "Custom package has been added to your library"
    });

    // Reset form
    setNewPackage({
      label: "",
      source: 'custom',
      length: 12,
      width: 8,
      height: 4,
      unit: 'in'
    });
  };

  const handlePackageSelection = (packageId: string) => {
    setSelectedPackage(packageId);
    const pkg = packages.find(p => p.id === packageId || p.label === packageId);
    if (pkg) {
      setCustomDimensions({
        length: pkg.length,
        width: pkg.width,
        height: pkg.height,
        unit: pkg.unit
      });
    }
  };

  const fetchShippingRates = async () => {
    const currentOrderId = selectedOrder?.id || orderId;
    
    if (!currentOrderId || !selectedShipFrom) {
      toast({
        title: "Missing Information",
        description: "Please select an order and ship from address",
        variant: "destructive"
      });
      return;
    }

    // Check for active carriers first
    try {
      const { data: carriers, error: carriersError } = await supabase
        .from('carrier_configurations')
        .select('*')
        .eq('is_active', true);

      if (carriersError || !carriers || carriers.length === 0) {
        toast({
          title: "No Active Carriers",
          description: "Please activate a carrier in your shipping settings first",
          variant: "destructive"
        });
        return;
      }
    } catch (error) {
      console.error('Error checking carriers:', error);
      return;
    }

    setIsLoadingRates(true);
    try {
      const shipFromAddress = shipFromAddresses.find(addr => addr.id === selectedShipFrom);
      
      // Fix country code for Montreal (should be CA, not US)
      let shipFromCountry = shipFromAddress?.country || 'US';
      if (shipFromAddress?.city?.toLowerCase() === 'montreal' && shipFromCountry === 'US') {
        shipFromCountry = 'CA';
      }
      
      const requestData = {
        order_id: currentOrderId,
        ship_from: {
          name: shipFromAddress?.name,
          company: shipFromAddress?.company,
          address: shipFromAddress?.address_line1,
          address2: shipFromAddress?.address_line2,
          city: shipFromAddress?.city,
          state: shipFromAddress?.state,
          zip: shipFromAddress?.zip,
          country: shipFromCountry
        },
        ship_to: selectedOrder ? {
          name: selectedOrder.customerName,
          address: selectedOrder.shippingAddress.line1,
          address2: selectedOrder.shippingAddress.line2,
          city: selectedOrder.shippingAddress.city,
          state: selectedOrder.shippingAddress.state,
          zip: selectedOrder.shippingAddress.zip,
          country: selectedOrder.shippingAddress.country
        } : undefined,
        package: {
          weight: weightUnit === 'kg' ? weight * 2.20462 : weight,
          weight_unit: 'lbs',
          length: customDimensions.unit === 'cm' ? customDimensions.length / 2.54 : customDimensions.length,
          width: customDimensions.unit === 'cm' ? customDimensions.width / 2.54 : customDimensions.width,
          height: customDimensions.unit === 'cm' ? customDimensions.height / 2.54 : customDimensions.height,
          dimension_unit: 'in'
        }
      };

      console.log('📦 Fetching shipping rates with corrected data:', requestData);

      const { data, error } = await supabase.functions.invoke('calculate-shipping-rates', {
        body: requestData
      });

      if (error) throw error;

      if (data?.rates && data.rates.length > 0) {
        // Add confirmation options to each rate
        const ratesWithConfirmation = data.rates.map((rate: ShippingRate) => ({
          ...rate,
          confirmation_options: [
            { type: 'none', label: 'No Confirmation', fee: 0 },
            { type: 'signature', label: 'Signature Required', fee: 2.50 },
            { type: 'adult_signature', label: 'Adult Signature Required', fee: 3.75 }
          ]
        }));

        setShippingRates(ratesWithConfirmation);
        toast({
          title: "Rates Found",
          description: `Found ${data.rates.length} shipping options`
        });
      } else {
        setShippingRates([]);
        toast({
          title: "No Rates Available", 
          description: "No shipping rates found. Check that your carrier is active and addresses are valid.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shipping rates. Check your carrier configuration.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  const sortedRates = [...shippingRates].sort((a, b) => {
    if (sortBy === 'cheapest') {
      const aTotal = a.cost + (a.confirmation_options?.find(opt => opt.type === confirmationType)?.fee || 0);
      const bTotal = b.cost + (b.confirmation_options?.find(opt => opt.type === confirmationType)?.fee || 0);
      return aTotal - bTotal;
    } else {
      // Sort by estimated days (fastest first)
      const aDays = parseInt(a.estimated_days) || 999;
      const bDays = parseInt(b.estimated_days) || 999;
      return aDays - bDays;
    }
  });

  const handleServiceSelection = (serviceCode: string) => {
    setSelectedService(serviceCode);
    const rate = shippingRates.find(r => r.service_code === serviceCode);
    if (rate) {
      const confirmationFee = rate.confirmation_options?.find(opt => opt.type === confirmationType)?.fee || 0;
      
      // Call the dialog's rate selected callback
      if (onRateSelected) {
        onRateSelected({
          service_code: serviceCode,
          service_name: rate.service_name,
          service_type: rate.service_type,
          cost: rate.cost + confirmationFee,
          currency: rate.currency,
          estimated_days: rate.estimated_days,
          carrier: rate.carrier,
          supports_tracking: true,
          supports_insurance: true,
          supports_signature: confirmationType === 'signature' || confirmationType === 'adult_signature'
        });
      }

      // Also call the legacy callback if it exists
      if (onShippingSelected) {
        onShippingSelected({
          requestedService: rate.service_name,
          serviceCode: serviceCode,
          carrier: rate.carrier,
          cost: rate.cost + confirmationFee,
          confirmationType: confirmationType,
          estimatedDays: rate.estimated_days
        });
      }
    }
  };

  const createShippingLabel = async () => {
    if (!selectedService || !selectedOrder) {
      toast({
        title: "Missing Information",
        description: "Please select a service and ensure order is loaded",
        variant: "destructive"
      });
      return;
    }

    const rate = shippingRates.find(r => r.service_code === selectedService);
    if (!rate) {
      toast({
        title: "Service Not Found",
        description: "Selected service rate not available",
        variant: "destructive"
      });
      return;
    }

    try {
      const shipFromAddress = shipFromAddresses.find(addr => addr.id === selectedShipFrom);
      const confirmationFee = rate.confirmation_options?.find(opt => opt.type === confirmationType)?.fee || 0;

      const { data, error } = await supabase.functions.invoke('ups-shipment', {
        body: {
          orderId: selectedOrder.id,
          serviceCode: selectedService,
          shipFrom: {
            name: shipFromAddress?.name,
            company: shipFromAddress?.company,
            address: shipFromAddress?.address_line1,
            city: shipFromAddress?.city,
            state: shipFromAddress?.state,
            zip: shipFromAddress?.zip,
            country: shipFromAddress?.country
          },
          shipTo: {
            name: selectedOrder.customerName,
            address: selectedOrder.shippingAddress.line1,
            city: selectedOrder.shippingAddress.city,
            state: selectedOrder.shippingAddress.state,
            zip: selectedOrder.shippingAddress.zip,
            country: selectedOrder.shippingAddress.country
          },
          package: {
            weight: weightUnit === 'kg' ? weight * 2.20462 : weight,
            length: customDimensions.unit === 'cm' ? customDimensions.length / 2.54 : customDimensions.length,
            width: customDimensions.unit === 'cm' ? customDimensions.width / 2.54 : customDimensions.width,
            height: customDimensions.unit === 'cm' ? customDimensions.height / 2.54 : customDimensions.height,
            packageType: "02"
          },
          paymentInfo: {
            shipperAccountNumber: "A906G5",
            paymentType: "prepaid"
          },
          additionalServices: {
            signatureRequired: confirmationType === 'signature' || confirmationType === 'adult_signature',
            insuranceValue: selectedOrder.totalAmount
          }
        }
      });

      if (error) {
        logger.error('Shipping', 'Label creation failed', { 
          error: error.message || error, 
          orderId: selectedOrder.id,
          serviceCode: selectedService 
        });
        console.error('Label creation error:', error);
        toast({
          title: "Label creation failed",
          description: error.message || "Failed to create shipping label",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        logger.success('Shipping', 'Label created successfully', { 
          trackingNumber: data.trackingNumber,
          orderId: selectedOrder.id,
          serviceCode: selectedService 
        });
        toast({
          title: "Label created successfully",
          description: `Tracking number: ${data.trackingNumber}`,
        });

        // Update order with tracking info
        if (onUpdateOrder) {
          onUpdateOrder(selectedOrder.id, {
            shippingDetails: {
              ...selectedOrder.shippingDetails,
              carrier: rate.carrier,
              serviceType: rate.service_name,
              trackingNumber: data.trackingNumber,
              cost: rate.cost + confirmationFee
            },
            status: 'shipped'
          });
        }
      }
    } catch (error) {
      logger.error('Shipping', 'Label creation exception', { 
        error: error instanceof Error ? error.message : String(error),
        orderId: selectedOrder.id,
        serviceCode: selectedService 
      });
      console.error('Label creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create shipping label",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Shipment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
      {/* Ship From Address Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Ship From Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedShipFrom} onValueChange={setSelectedShipFrom}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select ship from address" />
              </SelectTrigger>
              <SelectContent>
                {shipFromAddresses.map(address => (
                  <SelectItem key={address.id} value={address.id!}>
                    <div>
                      <div className="font-medium">{address.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {address.address_line1}, {address.city}, {address.state} {address.zip}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Ship From Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Address Label</Label>
                    <Input
                      value={newAddress.label}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g., Montreal Warehouse"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Contact Name</Label>
                      <Input
                        value={newAddress.name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label>Company (Optional)</Label>
                      <Input
                        value={newAddress.company}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={newAddress.address_line1}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <Label>Address Line 2 (Optional)</Label>
                    <Input
                      value={newAddress.address_line2}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                      placeholder="Suite 100"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label>City</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Montreal"
                      />
                    </div>
                    <div>
                      <Label>State/Province</Label>
                      <Input
                        value={newAddress.state}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="QC"
                      />
                    </div>
                    <div>
                      <Label>Postal Code</Label>
                      <Input
                        value={newAddress.zip}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, zip: e.target.value }))}
                        placeholder="H3A 0G4"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Phone (Optional)</Label>
                    <Input
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <Button onClick={addShipFromAddress} className="w-full">
                    Save Address
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Package Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package & Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={selectedPackage} onValueChange={handlePackageSelection}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Custom Package</SelectItem>
                {packages.map(pkg => (
                  <SelectItem key={pkg.id || pkg.label} value={pkg.id || pkg.label}>
                    <div>
                      <div className="font-medium">
                        {pkg.source === 'carrier' && `📦 `}{pkg.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pkg.length} x {pkg.width} x {pkg.height} {pkg.unit}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Save Custom Package</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Package Name</Label>
                    <Input
                      value={newPackage.label}
                      onChange={(e) => setNewPackage(prev => ({ ...prev, label: e.target.value }))}
                      placeholder="e.g., PrepFox Medium Box"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label>Length</Label>
                      <Input
                        type="number"
                        value={newPackage.length}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Width</Label>
                      <Input
                        type="number"
                        value={newPackage.width}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Height</Label>
                      <Input
                        type="number"
                        value={newPackage.height}
                        onChange={(e) => setNewPackage(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Select value={newPackage.unit} onValueChange={(value: 'in' | 'cm') => setNewPackage(prev => ({ ...prev, unit: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in">in</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={saveCustomPackage} className="w-full">
                    Save Package
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Always visible dimension fields */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Dimensions ({customDimensions.unit})
              </Label>
              <Select value={customDimensions.unit} onValueChange={(value: 'in' | 'cm') => setCustomDimensions(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">in</SelectItem>
                  <SelectItem value="cm">cm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Input
                  type="number"
                  value={customDimensions.length}
                  onChange={(e) => setCustomDimensions(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                  placeholder="Length"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={customDimensions.width}
                  onChange={(e) => setCustomDimensions(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                  placeholder="Width"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={customDimensions.height}
                  onChange={(e) => setCustomDimensions(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                  placeholder="Height"
                />
              </div>
            </div>
            {selectedPackage !== "custom" && (
              <div className="p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                These dimensions will be used for rate calculation. Changes override the selected package for this shipment only.
              </div>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Weight className="h-4 w-4" />
              Weight
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                placeholder="Weight"
                step="0.1"
                className="flex-1"
              />
              <Select value={weightUnit} onValueChange={(value: 'lbs' | 'kg') => setWeightUnit(value)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">lbs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {customDimensions.length > 0 && customDimensions.width > 0 && customDimensions.height > 0 && (
              <Button onClick={() => setShowPackageDialog(true)} variant="outline" size="sm" className="w-full">
                💾 Save This Package
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Select a service" />
            </SelectTrigger>
            <SelectContent>
              {availableServices.length === 0 ? (
                <SelectItem value="no-services" disabled>
                  No services available - configure carriers first
                </SelectItem>
              ) : (
                availableServices.map(service => (
                  <SelectItem key={service.service_code} value={service.service_code}>
                    <div className="flex items-center justify-between w-full">
                      <span>{service.service_name}</span>
                      {service.estimated_days && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {service.estimated_days}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <div className="mt-2">
            <RefreshUPSTokenButton />
          </div>
        </CardContent>
      </Card>

      {/* Smart Rate/Label Button */}
      <Button 
        onClick={selectedService && shippingRates.length > 0 ? createShippingLabel : fetchShippingRates} 
        disabled={isLoadingRates} 
        className="w-full" 
        size="lg"
        variant={selectedService && shippingRates.length > 0 ? "default" : "outline"}
      >
        {isLoadingRates ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Finding Rates...
          </>
        ) : selectedService && shippingRates.length > 0 ? (
          <>
            <Package className="h-4 w-4 mr-2" />
            Create Label - ${(() => {
              const rate = shippingRates.find(r => r.service_code === selectedService);
              const confirmationFee = rate?.confirmation_options?.find(opt => opt.type === confirmationType)?.fee || 0;
              return (rate ? rate.cost + confirmationFee : 0).toFixed(2);
            })()}
          </>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Get Shipping Rates
          </>
        )}
      </Button>

      {/* Shipping Service Selection */}
      {shippingRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Select Shipping Service
              </span>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Sort by:</Label>
                <Button
                  variant={sortBy === 'cheapest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('cheapest')}
                  className="h-8"
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  Cheapest
                </Button>
                <Button
                  variant={sortBy === 'fastest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('fastest')}
                  className="h-8"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Fastest
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {sortedRates.map((rate) => {
                const confirmationFee = rate.confirmation_options?.find(opt => opt.type === confirmationType)?.fee || 0;
                const totalCost = rate.cost + confirmationFee;
                
                return (
                  <div 
                    key={rate.service_code}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedService === rate.service_code ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleServiceSelection(rate.service_code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {rate.carrier.toLowerCase() === 'ups' && '📦'}
                          {rate.carrier.toLowerCase() === 'fedex' && '🚚'}
                          {rate.carrier.toLowerCase() === 'usps' && '📮'}
                        </div>
                        <div>
                          <div className="font-semibold">{rate.service_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rate.carrier} • Delivers in {rate.estimated_days}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">${totalCost.toFixed(2)}</div>
                        {confirmationFee > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Base: ${rate.cost.toFixed(2)} + Confirmation: ${confirmationFee.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confirmation Type Selection */}
            {selectedService && (
              <div className="space-y-2 pt-4 border-t">
                <Label className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Delivery Confirmation
                </Label>
                <Select value={confirmationType} onValueChange={setConfirmationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shippingRates.find(r => r.service_code === selectedService)?.confirmation_options?.map(option => (
                      <SelectItem key={option.type} value={option.type}>
                        <div className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <span className="ml-2 text-muted-foreground">
                            {option.fee > 0 ? `+$${option.fee.toFixed(2)}` : 'Included'}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
           </CardContent>
        </Card>
      )}
        </div>
      </CardContent>
    </Card>
  );
}