import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle, 
  Package, 
  Truck, 
  Globe,
  Star,
  Users,
  Clock
} from 'lucide-react';

const SERVICE_DETAILS = {
  'international-freight': {
    title: 'International Freight',
    description: 'Global freight forwarding services',
    icon: Globe,
    estimatedSavings: '20-30%',
    timeToImplement: '2-3 weeks'
  },
  'section-321': {
    title: 'Section 321',
    description: 'Duty-free cross-border fulfillment',
    icon: Package,
    estimatedSavings: '10-25%',
    timeToImplement: '1-2 weeks'
  },
  'middle-mile-logistics': {
    title: 'Middle Mile Logistics',
    description: 'Fast-track Amazon inbound shipping',
    icon: Truck,
    estimatedSavings: '25%',
    timeToImplement: '1 week'
  },
  'drip-feeding': {
    title: 'Drip Feeding',
    description: 'Strategic FBA inventory scheduling',
    icon: Clock,
    estimatedSavings: '40-60%',
    timeToImplement: '1 week'
  },
  'wholesale-prep': {
    title: 'Wholesale Prep',
    description: 'Enterprise-scale preparation services',
    icon: Package,
    estimatedSavings: '30%',
    timeToImplement: '2 weeks'
  },
  'global-marketplaces': {
    title: 'Global Marketplaces',
    description: 'Multi-marketplace expansion platform',
    icon: Globe,
    estimatedSavings: '150% revenue growth',
    timeToImplement: '3-4 weeks'
  },
  'market-expansion': {
    title: 'Market Expansion',
    description: 'Strategic marketplace growth services',
    icon: Users,
    estimatedSavings: '300% revenue growth',
    timeToImplement: '4-6 weeks'
  }
};

const FulfillmentQuotePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(location.search);
  const serviceType = searchParams.get('service') || 'general';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    monthlyVolume: '',
    currentProvider: '',
    painPoints: '',
    timeline: '',
    additionalServices: [] as string[],
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const serviceDetails = SERVICE_DETAILS[serviceType as keyof typeof SERVICE_DETAILS] || {
    title: 'Custom Fulfillment Solution',
    description: 'Tailored logistics services',
    icon: Package,
    estimatedSavings: 'Custom quote',
    timeToImplement: 'Varies'
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: checked 
        ? [...prev.additionalServices, service]
        : prev.additionalServices.filter(s => s !== service)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Store quote request data (database integration in Phase 4B)
      const quoteData = {
        service_type: serviceType,
        contact_info: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone
        },
        business_details: {
          monthlyVolume: formData.monthlyVolume,
          currentProvider: formData.currentProvider,
          timeline: formData.timeline
        },
        pain_points: formData.painPoints,
        additional_services: formData.additionalServices,
        message: formData.message,
        estimated_savings: serviceDetails.estimatedSavings
      };

      // For now, just log the data - database integration will be added in next step
      console.log('Quote request data:', quoteData);

      // Simulate API processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Quote Request Submitted!",
        description: "We'll get back to you within 24 hours with a detailed proposal.",
      });

      // Redirect to landing page with success message
      navigate('/fulfillment-landing?submitted=true');
      
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = serviceDetails.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6">
            <Star className="h-4 w-4 mr-2" />
            Get Custom Quote
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Get Your {serviceDetails.title} Quote
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of brands saving costs and optimizing their supply chain with our {serviceDetails.description.toLowerCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quote Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Calculator className="h-6 w-6 mr-3 text-primary" />
                  Request Custom Quote
                </CardTitle>
                <CardDescription>
                  Tell us about your business and we'll create a tailored solution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company Name *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Details</h3>
                    
                    <div>
                      <Label htmlFor="monthlyVolume">Monthly Volume</Label>
                      <Select onValueChange={(value) => handleInputChange('monthlyVolume', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select monthly volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0-1000">0 - 1,000 units</SelectItem>
                          <SelectItem value="1000-5000">1,000 - 5,000 units</SelectItem>
                          <SelectItem value="5000-10000">5,000 - 10,000 units</SelectItem>
                          <SelectItem value="10000-50000">10,000 - 50,000 units</SelectItem>
                          <SelectItem value="50000+">50,000+ units</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="currentProvider">Current Provider (if any)</Label>
                      <Input
                        id="currentProvider"
                        value={formData.currentProvider}
                        onChange={(e) => handleInputChange('currentProvider', e.target.value)}
                        placeholder="e.g., AMZ Prep, ShipBob, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="timeline">Implementation Timeline</Label>
                      <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you need this?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">ASAP</SelectItem>
                          <SelectItem value="1-month">Within 1 month</SelectItem>
                          <SelectItem value="3-months">Within 3 months</SelectItem>
                          <SelectItem value="6-months">Within 6 months</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <Label htmlFor="painPoints">Current Challenges</Label>
                    <Textarea
                      id="painPoints"
                      value={formData.painPoints}
                      onChange={(e) => handleInputChange('painPoints', e.target.value)}
                      placeholder="What problems are you trying to solve? (costs, speed, reliability, etc.)"
                      rows={3}
                    />
                  </div>

                  {/* Additional Services */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Services of Interest</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'FBA Prep',
                        'DTC Fulfillment', 
                        'Returns Processing',
                        'Kitting & Bundling',
                        'Quality Control',
                        'Inventory Management'
                      ].map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={formData.additionalServices.includes(service)}
                            onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                          />
                          <Label htmlFor={service} className="text-sm">{service}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Message */}
                  <div>
                    <Label htmlFor="message">Additional Details</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Any specific requirements or questions?"
                      rows={3}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Get Custom Quote'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Service Summary Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{serviceDetails.title}</h3>
                  <p className="text-sm text-muted-foreground">{serviceDetails.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Estimated Savings:</span>
                  <Badge variant="secondary" className="text-green-600 bg-green-50">
                    {serviceDetails.estimatedSavings}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Implementation:</span>
                  <span className="text-sm text-muted-foreground">{serviceDetails.timeToImplement}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <h3 className="font-semibold mb-4">What Happens Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Immediate Response</p>
                    <p className="text-xs text-muted-foreground">We'll confirm receipt within 1 hour</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Custom Proposal</p>
                    <p className="text-xs text-muted-foreground">Detailed quote within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Strategy Call</p>
                    <p className="text-xs text-muted-foreground">1-on-1 consultation scheduled</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FulfillmentQuotePage;