import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowLeft, 
  Calendar, 
  MessageSquare,
  Star
} from 'lucide-react';

const FulfillmentQuoteSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const serviceType = searchParams.get('service') || 'general';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/5 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <Badge variant="secondary" className="mb-4">
            <Star className="h-4 w-4 mr-2" />
            Quote Submitted Successfully
          </Badge>
          
          <h1 className="text-4xl font-bold mb-4">
            Thank You for Your Interest!
          </h1>
          
          <p className="text-xl text-muted-foreground">
            Your quote request has been received and is being reviewed by our team.
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              What Happens Next
            </CardTitle>
            <CardDescription>
              Here's what you can expect in the coming hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold">Immediate Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation within 1 hour with your quote reference number.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold">Custom Proposal</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will prepare a detailed proposal tailored to your specific needs within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold">Strategy Consultation</h3>
                <p className="text-sm text-muted-foreground">
                  We'll schedule a 1-on-1 consultation to discuss your quote and answer any questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-6 text-center bg-card/80 backdrop-blur-sm">
            <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Have Questions?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Need to discuss your requirements in more detail?
            </p>
            <Button variant="outline" size="sm">
              Contact Sales Team
            </Button>
          </Card>

          <Card className="p-6 text-center bg-card/80 backdrop-blur-sm">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Schedule a Call</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Want to speak with an expert right away?
            </p>
            <Button variant="outline" size="sm">
              Book Consultation
            </Button>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/fulfillment-landing')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Fulfillment Services
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FulfillmentQuoteSuccessPage;