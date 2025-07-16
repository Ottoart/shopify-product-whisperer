import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  MapPin, 
  Weight, 
  Ruler, 
  Shield, 
  FileText,
  Zap,
  Settings,
  CheckCircle
} from "lucide-react";

interface ShipmentConfigurationProps {
  orderId?: string;
  onRatesFetched?: (rates: any[]) => void;
}

interface ShipmentConfig {
  // Basic info
  requested: string;
  shipFrom: string;
  
  // Package details
  weight: number;
  weightUnit: 'lbs' | 'kg';
  weightOz: number;
  weightOzUnit: 'oz' | 'g';
  
  // Service selection
  service: string;
  packageType: string;
  
  // Dimensions
  length: number;
  width: number;
  height: number;
  dimensionUnit: 'in' | 'cm';
  
  // Additional services
  confirmation: string;
  insurance: number;
  insuranceCurrency: string;
}

const defaultConfig: ShipmentConfig = {
  requested: "standard",
  shipFrom: "Park Ave",
  weight: 4.8,
  weightUnit: 'lbs',
  weightOz: 0,
  weightOzUnit: 'oz',
  service: "",
  packageType: "custom",
  length: 12,
  width: 8,
  height: 4,
  dimensionUnit: 'in',
  confirmation: "none",
  insurance: 100,
  insuranceCurrency: "CAD"
};

const packageTypes = [
  { value: "envelope", label: "Envelope", dimensions: "12 x 9 x 0.75" },
  { value: "small-box", label: "Small Box", dimensions: "8 x 6 x 4" },
  { value: "medium-box", label: "Medium Box", dimensions: "12 x 9 x 6" },
  { value: "large-box", label: "Large Box", dimensions: "18 x 12 x 8" },
  { value: "tube", label: "Tube", dimensions: "38 x 6 x 6" },
  { value: "custom", label: "Custom Package", dimensions: "Manual entry" }
];

const services = [
  { value: "canada-post-regular", label: "Canada Post Regular Parcel", type: "standard" },
  { value: "canada-post-expedited", label: "Canada Post Expedited", type: "expedited" },
  { value: "canada-post-xpresspost", label: "Canada Post Xpresspost", type: "expedited" },
  { value: "ups-ground", label: "UPS Ground", type: "standard" },
  { value: "ups-expedited", label: "UPS Expedited", type: "expedited" },
  { value: "ups-express", label: "UPS Express", type: "overnight" },
  { value: "fedex-ground", label: "FedEx Ground", type: "standard" },
  { value: "fedex-express", label: "FedEx Express Saver", type: "expedited" },
  { value: "fedex-priority", label: "FedEx Priority Overnight", type: "overnight" }
];

const shipFromLocations = [
  { value: "park-ave", label: "Park Ave", address: "123 Park Ave, Toronto, ON M5V 3A8" },
  { value: "warehouse-1", label: "Warehouse 1", address: "456 Industrial St, Mississauga, ON L5A 2B3" },
  { value: "warehouse-2", label: "Warehouse 2", address: "789 Commerce Blvd, Markham, ON L3R 8C4" }
];

export function ShipmentConfiguration({ orderId, onRatesFetched }: ShipmentConfigurationProps) {
  const [config, setConfig] = useState<ShipmentConfig>(defaultConfig);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [availableRates, setAvailableRates] = useState<any[]>([]);
  const { toast } = useToast();

  const updateConfig = (field: keyof ShipmentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const convertWeight = (weight: number, fromUnit: 'lbs' | 'kg', toUnit: 'lbs' | 'kg') => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'lbs' && toUnit === 'kg') return weight * 0.453592;
    if (fromUnit === 'kg' && toUnit === 'lbs') return weight * 2.20462;
    return weight;
  };

  const convertDimension = (dimension: number, fromUnit: 'in' | 'cm', toUnit: 'in' | 'cm') => {
    if (fromUnit === toUnit) return dimension;
    if (fromUnit === 'in' && toUnit === 'cm') return dimension * 2.54;
    if (fromUnit === 'cm' && toUnit === 'in') return dimension / 2.54;
    return dimension;
  };

  const handleWeightUnitChange = (newUnit: 'lbs' | 'kg') => {
    const convertedWeight = convertWeight(config.weight, config.weightUnit, newUnit);
    setConfig(prev => ({
      ...prev,
      weight: Math.round(convertedWeight * 100) / 100,
      weightUnit: newUnit,
      weightOzUnit: newUnit === 'lbs' ? 'oz' : 'g'
    }));
  };

  const handleDimensionUnitChange = (newUnit: 'in' | 'cm') => {
    const convertedLength = convertDimension(config.length, config.dimensionUnit, newUnit);
    const convertedWidth = convertDimension(config.width, config.dimensionUnit, newUnit);
    const convertedHeight = convertDimension(config.height, config.dimensionUnit, newUnit);
    
    setConfig(prev => ({
      ...prev,
      length: Math.round(convertedLength * 100) / 100,
      width: Math.round(convertedWidth * 100) / 100,
      height: Math.round(convertedHeight * 100) / 100,
      dimensionUnit: newUnit
    }));
  };

  const handlePackageTypeChange = (packageType: string) => {
    const selectedPackage = packageTypes.find(p => p.value === packageType);
    if (selectedPackage && packageType !== 'custom') {
      // Set default dimensions based on package type
      let dimensions = { length: 12, width: 8, height: 4 };
      
      switch (packageType) {
        case 'envelope':
          dimensions = { length: 12, width: 9, height: 0.75 };
          break;
        case 'small-box':
          dimensions = { length: 8, width: 6, height: 4 };
          break;
        case 'medium-box':
          dimensions = { length: 12, width: 9, height: 6 };
          break;
        case 'large-box':
          dimensions = { length: 18, width: 12, height: 8 };
          break;
        case 'tube':
          dimensions = { length: 38, width: 6, height: 6 };
          break;
      }
      
      setConfig(prev => ({
        ...prev,
        packageType,
        ...dimensions
      }));
    } else {
      setConfig(prev => ({ ...prev, packageType }));
    }
  };

  const handleBrowseRates = async () => {
    if (!orderId) {
      toast({
        title: "No Order Selected",
        description: "Please select an order to browse shipping rates",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingRates(true);
    try {
      // Prepare shipment configuration for API
      const shipmentData = {
        order_id: orderId,
        ship_from: shipFromLocations.find(loc => loc.value === config.shipFrom),
        package: {
          weight: config.weightUnit === 'kg' ? convertWeight(config.weight, 'kg', 'lbs') : config.weight,
          weight_unit: 'lbs',
          length: config.dimensionUnit === 'cm' ? convertDimension(config.length, 'cm', 'in') : config.length,
          width: config.dimensionUnit === 'cm' ? convertDimension(config.width, 'cm', 'in') : config.width,
          height: config.dimensionUnit === 'cm' ? convertDimension(config.height, 'cm', 'in') : config.height,
          dimension_unit: 'in',
          package_type: config.packageType
        },
        service_preferences: config.service ? [config.service] : [],
        additional_services: {
          signature_required: config.confirmation !== 'none',
          insurance_value: config.insurance > 0 ? config.insurance : 0,
          confirmation_type: config.confirmation
        }
      };

      const { data, error } = await supabase.functions.invoke('calculate-shipping-rates', {
        body: shipmentData
      });

      if (error) {
        console.error('Rate calculation error:', error);
        toast({
          title: "Rate Calculation Failed",
          description: error.message || "Failed to calculate shipping rates",
          variant: "destructive"
        });
        return;
      }

      if (data?.rates && data.rates.length > 0) {
        setAvailableRates(data.rates);
        onRatesFetched?.(data.rates);
        toast({
          title: "Rates Found",
          description: `Found ${data.rates.length} shipping options from ${new Set(data.rates.map(r => r.carrier)).size} carriers`,
        });
      } else {
        setAvailableRates([]);
        toast({
          title: "No Rates Available",
          description: "No shipping rates found with current configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error browsing rates:', error);
      toast({
        title: "Error",
        description: "Failed to browse shipping rates",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRates(false);
    }
  };

  const getServiceBadge = (serviceValue: string) => {
    const service = services.find(s => s.value === serviceValue);
    if (!service) return null;
    
    const typeColors = {
      standard: "bg-blue-100 text-blue-800",
      expedited: "bg-orange-100 text-orange-800", 
      overnight: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={typeColors[service.type] || "bg-gray-100 text-gray-800"}>
        {service.type}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          🧾 Configure Shipment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Requested Service Level */}
        <div className="space-y-2">
          <Label htmlFor="requested" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Requested
          </Label>
          <Select value={config.requested} onValueChange={(value) => updateConfig('requested', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select requested service level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Shipping</SelectItem>
              <SelectItem value="expedited">Expedited Shipping</SelectItem>
              <SelectItem value="overnight">Overnight Shipping</SelectItem>
              <SelectItem value="international">International Shipping</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Service level indicator. Required for accurate rate generation.
          </p>
        </div>

        {/* Browse Rates Button */}
        <Button 
          onClick={handleBrowseRates} 
          disabled={isLoadingRates}
          className="w-full"
          size="lg"
        >
          {isLoadingRates ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Finding Best Rates...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Browse Rates
            </>
          )}
        </Button>

        <Separator />

        {/* Ship From */}
        <div className="space-y-2">
          <Label htmlFor="shipFrom" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ship From
          </Label>
          <Select value={config.shipFrom} onValueChange={(value) => updateConfig('shipFrom', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select origin location" />
            </SelectTrigger>
            <SelectContent>
              {shipFromLocations.map(location => (
                <SelectItem key={location.value} value={location.value}>
                  <div>
                    <div className="font-medium">{location.label}</div>
                    <div className="text-xs text-muted-foreground">{location.address}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Origin address for distance and zone calculations.
          </p>
        </div>

        {/* Weight */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Weight className="h-4 w-4" />
            Weight
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={config.weight}
                onChange={(e) => updateConfig('weight', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                placeholder="Weight"
              />
            </div>
            <Select value={config.weightUnit} onValueChange={handleWeightUnitChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lbs">lbs</SelectItem>
                <SelectItem value="kg">kg</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1">
              <Input
                type="number"
                value={config.weightOz}
                onChange={(e) => updateConfig('weightOz', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                placeholder="Oz/g"
              />
            </div>
            <Select value={config.weightOzUnit} onValueChange={(value) => updateConfig('weightOzUnit', value)}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oz">oz</SelectItem>
                <SelectItem value="g">g</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            Essential for rate tier and surcharge determination.
          </p>
        </div>

        {/* Service */}
        <div className="space-y-2">
          <Label htmlFor="service" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Service
          </Label>
          <div className="flex gap-2">
            <Select value={config.service} onValueChange={(value) => updateConfig('service', value)}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select shipping service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Service</SelectItem>
                {services.map(service => (
                  <SelectItem key={service.value} value={service.value}>
                    {service.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {config.service && (
              <div className="flex items-center">
                {getServiceBadge(config.service)}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Filtered by destination, package type, and eligibility.
          </p>
        </div>

        {/* Package Type */}
        <div className="space-y-2">
          <Label htmlFor="packageType" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Package
          </Label>
          <Select value={config.packageType} onValueChange={handlePackageTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select package type" />
            </SelectTrigger>
            <SelectContent>
              {packageTypes.map(pkg => (
                <SelectItem key={pkg.value} value={pkg.value}>
                  <div>
                    <div className="font-medium">{pkg.label}</div>
                    <div className="text-xs text-muted-foreground">{pkg.dimensions}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Affects dimensional weight calculations and rate brackets.
          </p>
        </div>

        {/* Package Dimensions */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Size ({config.dimensionUnit})
          </Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={config.length}
                onChange={(e) => updateConfig('length', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                placeholder="Length"
                disabled={config.packageType !== 'custom'}
              />
            </div>
            <span className="flex items-center text-muted-foreground">×</span>
            <div className="flex-1">
              <Input
                type="number"
                value={config.width}
                onChange={(e) => updateConfig('width', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                placeholder="Width"
                disabled={config.packageType !== 'custom'}
              />
            </div>
            <span className="flex items-center text-muted-foreground">×</span>
            <div className="flex-1">
              <Input
                type="number"
                value={config.height}
                onChange={(e) => updateConfig('height', parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                placeholder="Height"
                disabled={config.packageType !== 'custom'}
              />
            </div>
            <Select value={config.dimensionUnit} onValueChange={handleDimensionUnitChange}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">in</SelectItem>
                <SelectItem value="cm">cm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">
            {config.packageType === 'custom' 
              ? "Custom dimensions for rate calculation."
              : "Dimensions set by package type. Switch to 'Custom Package' to modify."}
          </p>
        </div>

        {/* Confirmation */}
        <div className="space-y-2">
          <Label htmlFor="confirmation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Confirmation
          </Label>
          <Select value={config.confirmation} onValueChange={(value) => updateConfig('confirmation', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select delivery confirmation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Confirmation</SelectItem>
              <SelectItem value="authority-to-leave">Authority to Leave</SelectItem>
              <SelectItem value="signature-required">Signature Required</SelectItem>
              <SelectItem value="adult-signature">Adult Signature Required</SelectItem>
              <SelectItem value="direct-signature">Direct Signature Only</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Affects service eligibility and pricing (some carriers charge extra).
          </p>
        </div>

        {/* Insurance */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Insurance
          </Label>
          <div className="flex gap-2">
            <Select value={config.insuranceCurrency} onValueChange={(value) => updateConfig('insuranceCurrency', value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1">
              <Input
                type="number"
                value={config.insurance}
                onChange={(e) => updateConfig('insurance', parseFloat(e.target.value) || 0)}
                step="1"
                min="0"
                placeholder="Insurance value"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Declared value for shipment insurance. Rates may differ based on coverage amount.
          </p>
        </div>

        {/* Configuration Summary */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="font-medium">Configuration Summary</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Weight:</span>
              <span className="ml-1">{config.weight} {config.weightUnit} {config.weightOz} {config.weightOzUnit}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Dimensions:</span>
              <span className="ml-1">{config.length} × {config.width} × {config.height} {config.dimensionUnit}</span>
            </div>
            <div>
              <span className="text-muted-foreground">From:</span>
              <span className="ml-1">{shipFromLocations.find(l => l.value === config.shipFrom)?.label || 'Not selected'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Insurance:</span>
              <span className="ml-1">{config.insuranceCurrency} ${config.insurance}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}