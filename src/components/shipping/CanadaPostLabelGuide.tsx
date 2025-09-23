import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  FileText, 
  Download, 
  CheckCircle, 
  ArrowRight,
  Truck,
  Calendar,
  DollarSign,
  MapPin,
  Info
} from 'lucide-react';

export function CanadaPostLabelGuide() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Canada Post Label Creation Process
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Process Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Complete Process</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Calculate Rates</div>
                  <div className="text-sm text-muted-foreground">Get live Canada Post shipping rates</div>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Select Service</div>
                  <div className="text-sm text-muted-foreground">Choose your preferred shipping service</div>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">Create Label</div>
                  <div className="text-sm text-muted-foreground">Generate shipping label via Canada Post API</div>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-muted-foreground mx-auto" />

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-success text-success-foreground rounded-full text-sm font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium">Download & Print</div>
                  <div className="text-sm text-muted-foreground">Get your PDF label ready for shipping</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Features</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Live rate calculation</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Multiple service options (Air, Tracked, Expedited, Xpresspost)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Automatic insurance coverage</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">PDF label generation</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Tracking number generation</span>
              </div>
              
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Label storage and re-download</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Service Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Canada Post Service Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Small Packet - USA Air</span>
                  <Badge variant="secondary">Economy</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>7-14 business days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Most economical option</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Tracked Packet - USA</span>
                  <Badge variant="outline">Standard</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>7-10 business days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Includes tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">Expedited Parcel - USA</span>
                  <Badge variant="default">Expedited</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>4-7 business days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>Faster delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Xpresspost - USA</span>
                  <Badge variant="destructive">Express</Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>2-3 business days</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>Fastest option</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* API Integration Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Technical Implementation</h3>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <div className="font-medium">PrepFox Managed Integration</div>
                <div className="text-sm text-muted-foreground">
                  Canada Post labels are created using PrepFox's managed Canada Post account, ensuring reliable service
                  and competitive rates. The system automatically handles authentication, rate calculation, and label generation.
                </div>
                <div className="text-sm">
                  <strong>Features:</strong> XML API integration, automatic error handling, label caching, 
                  real-time tracking number generation, and PDF label download.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}