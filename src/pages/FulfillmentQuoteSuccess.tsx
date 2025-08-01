import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Mail, 
  Phone,
  Calendar,
  Star,
  Users
} from 'lucide-react';

const FulfillmentQuoteSuccess = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const submitted = searchParams.get('submitted');
  
  if (!submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Page Not Found</h1>
          <p className="text-xl text-muted-foreground mb-8">
            This page is only accessible after submitting a quote request.
          </p>
          <Button asChild>
            <Link to="/fulfillment-landing">
              Return to Fulfillment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-green-600">
            Quote Request Submitted!
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thank you for your interest in our fulfillment services. We've received your request and our team will be in touch soon.
          </p>
        </div>

        {/* What Happens Next */}
        <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Within 1 Hour</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation with your request details
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Within 24 Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Our fulfillment specialist will send you a detailed custom proposal
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Strategy Call</h3>
                <p className="text-sm text-muted-foreground">
                  Schedule a 1-on-1 consultation to discuss your specific needs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Industry Leading</h3>
                <p className="text-sm text-muted-foreground">Fastest growing logistics company 2025</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Average savings:</span>
                <Badge variant="secondary" className="text-green-600 bg-green-50">20-30%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Response time:</span>
                <span className="font-medium">&lt; 24 hours</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Trusted Partner</h3>
                <p className="text-sm text-muted-foreground">500+ brands served successfully</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Client satisfaction:</span>
                <Badge variant="secondary" className="text-blue-600 bg-blue-50">99%</Badge>
              </div>
              <div className="flex justify-between">
                <span>Implementation time:</span>
                <span className="font-medium">1-2 weeks</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="mb-8 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-center">Need Immediate Assistance?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              <div>
                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Call Us Directly</h3>
                <p className="text-primary font-medium">1-800-PREPFOX</p>
                <p className="text-sm text-muted-foreground">Mon-Fri, 9 AM - 6 PM EST</p>
              </div>
              
              <div>
                <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Our Team</h3>
                <p className="text-primary font-medium">quotes@prepfox.com</p>
                <p className="text-sm text-muted-foreground">Response within 4 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/fulfillment-landing">
                Explore More Services <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/fulfillment/pricing-detailed">
                View Pricing Details
              </Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Questions? Check our <Link to="/fulfillment/features" className="text-primary hover:underline">FAQ section</Link> or browse our <Link to="/fulfillment-landing" className="text-primary hover:underline">service offerings</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default FulfillmentQuoteSuccess;