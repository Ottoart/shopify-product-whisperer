import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Zap, MapPin, Package, Clock, CheckCircle, Copy, Mail, MessageSquare, Palette } from "lucide-react";

export function TrackingPage() {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState("1Z999AA1234567890");

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber);
    toast({
      title: "📋 Copied!",
      description: "Tracking number copied to clipboard",
    });
  };

  const sendTrackingEmail = () => {
    toast({
      title: "📦 Tracking shared with customer.",
      description: "You're all set.",
    });
  };

  // Mock tracking data
  const trackingData = {
    status: "In Transit",
    estimatedDelivery: "Jan 18, 2024",
    currentLocation: "Phoenix, AZ",
    events: [
      {
        date: "Jan 16, 2024",
        time: "3:42 PM",
        status: "In Transit",
        location: "Phoenix, AZ",
        description: "Package is on the way to the next facility"
      },
      {
        date: "Jan 16, 2024",
        time: "8:15 AM",
        status: "Departed Facility",
        location: "Los Angeles, CA",
        description: "Package has left the facility"
      },
      {
        date: "Jan 15, 2024",
        time: "11:30 PM",
        status: "Arrived at Facility",
        location: "Los Angeles, CA",
        description: "Package arrived at Los Angeles facility"
      },
      {
        date: "Jan 15, 2024",
        time: "2:15 PM",
        status: "Label Created",
        location: "Merchant Location",
        description: "Shipping label was created"
      }
    ]
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Branded Tracking Page & Notifications
          </CardTitle>
          <CardDescription>
            Let your customers feel like they're shopping with Amazon-level professionalism
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="tracking">Track Package</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
            <Button className="mt-6">
              <Package className="h-4 w-4 mr-2" />
              Track
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Status
              </CardTitle>
              <CardDescription>Tracking #{trackingNumber}</CardDescription>
            </div>
            <Button variant="outline" onClick={copyTrackingNumber}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Tracking #
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Overview */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-green-800">{trackingData.status}</h3>
                <p className="text-green-700">Expected delivery: {trackingData.estimatedDelivery}</p>
                <p className="text-green-600">Current location: {trackingData.currentLocation}</p>
              </div>
              <div className="text-6xl text-green-500">📦</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Order Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ordered</span>
              <span>Shipped</span>
              <span>Out for Delivery</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="font-semibold">Tracking History</h4>
            <div className="space-y-4">
              {trackingData.events.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    {index < trackingData.events.length - 1 && (
                      <div className="w-px h-8 bg-gray-300 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {event.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{event.location}</p>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Communication */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailTemplate">Email Template</Label>
              <Textarea
                id="emailTemplate"
                placeholder="Hi [First Name], your package is on the way! Track it here: [Tracking Link]"
                rows={4}
              />
            </div>
            <Button onClick={sendTrackingEmail} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Send Tracking Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>SMS Options</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Label created</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Out for delivery</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Delivered</span>
                </label>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Configure SMS
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Branding Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tracking Page Branding
          </CardTitle>
          <CardDescription>
            Customize your tracking page to match your brand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                placeholder="https://your-site.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandColor">Brand Color</Label>
              <Input
                id="brandColor"
                type="color"
                defaultValue="#3b82f6"
                className="h-10 w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Support Email</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@your-store.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportPhone">Support Phone</Label>
              <Input
                id="supportPhone"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message</Label>
            <Textarea
              id="customMessage"
              placeholder="Thank you for your order! We're working hard to get it to you as quickly as possible."
              rows={3}
            />
          </div>

          <Button>
            <Palette className="h-4 w-4 mr-2" />
            Save Branding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}