import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Star, 
  StarOff, 
  LogOut, 
  UserIcon, 
  MapPin, 
  Phone, 
  Building, 
  Mail, 
  CreditCard, 
  Settings,
  RefreshCw,
  MessageSquare,
  Plus,
  Home
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface CustomerProfile {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
}

interface CustomerAddress {
  id: string;
  address_type: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
}

interface OrderFeedback {
  id: string;
  order_id: string;
  package_id?: string;
  rating?: number;
  delivery_rating?: number;
  feedback_text?: string;
  delivery_experience?: string;
  would_recommend?: boolean;
  created_at: string;
}

export default function CustomerPortal() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [feedback, setFeedback] = useState<OrderFeedback[]>([]);
  const [packages, setPackages] = useState<any[]>([]);

  // Form states
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });

  const [newFeedback, setNewFeedback] = useState({
    order_id: '',
    rating: 5,
    delivery_rating: 5,
    feedback_text: '',
    delivery_experience: '',
    would_recommend: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      setUser(session.user);
      await loadUserData(session.user.id);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate('/auth');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Load addresses
      const { data: addressData, error: addressError } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (addressError) {
        console.error('Address error:', addressError);
      } else if (addressData) {
        setAddresses(addressData);
      }

      // Load support tickets
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ticketError) {
        console.error('Ticket error:', ticketError);
      } else if (ticketData) {
        setTickets(ticketData);
      }

      // Load feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('order_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('Feedback error:', feedbackError);
      } else if (feedbackData) {
        setFeedback(feedbackData);
      }

      // Load packages (orders)
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (packageError) {
        console.error('Package error:', packageError);
      } else if (packageData) {
        setPackages(packageData);
      }

    } catch (error: any) {
      console.error('Load user data error:', error);
      toast({
        title: 'Error loading data',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const createTicket = async () => {
    if (!user || !newTicket.subject || !newTicket.description) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: ticketNumber } = await supabase.rpc('generate_ticket_number');

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          ticket_number: ticketNumber,
          subject: newTicket.subject,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
          customer_email: user.email,
          customer_name: profile ? `${profile.first_name} ${profile.last_name}` : user.email
        });

      if (error) throw error;

      toast({
        title: 'Ticket created',
        description: `Support ticket ${ticketNumber} has been created.`,
      });

      setNewTicket({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium'
      });

      // Reload tickets
      loadUserData(user.id);
    } catch (error: any) {
      toast({
        title: 'Error creating ticket',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const submitFeedback = async () => {
    if (!user || !newFeedback.order_id) {
      toast({
        title: 'Missing information',
        description: 'Please enter an order ID.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('order_feedback')
        .insert({
          user_id: user.id,
          order_id: newFeedback.order_id,
          rating: newFeedback.rating,
          delivery_rating: newFeedback.delivery_rating,
          feedback_text: newFeedback.feedback_text,
          delivery_experience: newFeedback.delivery_experience,
          would_recommend: newFeedback.would_recommend
        });

      if (error) throw error;

      toast({
        title: 'Feedback submitted',
        description: 'Thank you for your feedback!',
      });

      setNewFeedback({
        order_id: '',
        rating: 5,
        delivery_rating: 5,
        feedback_text: '',
        delivery_experience: '',
        would_recommend: true
      });

      // Reload feedback
      loadUserData(user.id);
    } catch (error: any) {
      toast({
        title: 'Error submitting feedback',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'packed': return 'bg-yellow-500';
      case 'processing': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'open': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            {star <= rating ? (
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>
            <h1 className="text-2xl font-bold">Customer Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.first_name || user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order History
                </CardTitle>
                <CardDescription>
                  View your recent orders and track their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {packages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <Card key={pkg.id} className="border-border/50">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{pkg.package_number}</h3>
                              <p className="text-sm text-muted-foreground">
                                {pkg.package_type} • {pkg.weight_lbs ? `${pkg.weight_lbs} lbs` : 'Weight not specified'}
                              </p>
                              {pkg.tracking_number && (
                                <p className="text-sm font-mono">{pkg.tracking_number}</p>
                              )}
                            </div>
                            <Badge className={getStatusColor(pkg.status)}>
                              {pkg.status}
                            </Badge>
                          </div>
                          {pkg.shipped_at && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Shipped: {new Date(pkg.shipped_at).toLocaleDateString()}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create New Ticket */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Create Support Ticket
                  </CardTitle>
                  <CardDescription>
                    Need help? Create a support ticket and we'll get back to you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ticket-subject">Subject</Label>
                    <Input
                      id="ticket-subject"
                      placeholder="Brief description of your issue"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ticket-category">Category</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="order">Order Issue</SelectItem>
                          <SelectItem value="shipping">Shipping</SelectItem>
                          <SelectItem value="return">Return/Refund</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ticket-priority">Priority</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ticket-description">Description</Label>
                    <Textarea
                      id="ticket-description"
                      placeholder="Please provide detailed information about your issue"
                      rows={4}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <Button onClick={createTicket} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle>My Support Tickets</CardTitle>
                  <CardDescription>
                    View and track your support requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No support tickets yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <Card key={ticket.id} className="border-border/50">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{ticket.ticket_number}</h4>
                              <Badge className={getTicketStatusColor(ticket.status)}>
                                {ticket.status}
                              </Badge>
                            </div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground">
                              {ticket.category} • {ticket.priority} priority
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(ticket.created_at).toLocaleDateString()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Submit Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    Submit Feedback
                  </CardTitle>
                  <CardDescription>
                    Share your experience with us
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="feedback-order">Order ID</Label>
                    <Input
                      id="feedback-order"
                      placeholder="Enter your order ID"
                      value={newFeedback.order_id}
                      onChange={(e) => setNewFeedback(prev => ({ ...prev, order_id: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Overall Rating</Label>
                    <div className="mt-2">
                      {renderStars(newFeedback.rating, true, (rating) => 
                        setNewFeedback(prev => ({ ...prev, rating }))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Delivery Rating</Label>
                    <div className="mt-2">
                      {renderStars(newFeedback.delivery_rating, true, (rating) => 
                        setNewFeedback(prev => ({ ...prev, delivery_rating: rating }))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="feedback-text">Comments</Label>
                    <Textarea
                      id="feedback-text"
                      placeholder="Tell us about your experience"
                      rows={3}
                      value={newFeedback.feedback_text}
                      onChange={(e) => setNewFeedback(prev => ({ ...prev, feedback_text: e.target.value }))}
                    />
                  </div>

                  <Button onClick={submitFeedback} className="w-full">
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>

              {/* Previous Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Feedback History</CardTitle>
                  <CardDescription>
                    View your previous reviews and ratings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feedback.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No feedback submitted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedback.map((fb) => (
                        <Card key={fb.id} className="border-border/50">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">Order: {fb.order_id}</h4>
                              <span className="text-sm text-muted-foreground">
                                {new Date(fb.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">Rating:</span>
                                {renderStars(fb.rating || 0)}
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">Delivery:</span>
                                {renderStars(fb.delivery_rating || 0)}
                              </div>
                            </div>
                            {fb.feedback_text && (
                              <p className="text-sm text-muted-foreground">{fb.feedback_text}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Manage your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <p className="text-sm font-medium">{profile?.first_name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <p className="text-sm font-medium">{profile?.last_name || 'Not set'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm font-medium">{profile?.phone || 'Not set'}</p>
                  </div>
                  {profile?.company_name && (
                    <div className="md:col-span-2">
                      <Label>Company</Label>
                      <p className="text-sm font-medium">{profile.company_name}</p>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Account Information
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Delivery Addresses
                </CardTitle>
                <CardDescription>
                  Manage your shipping and billing addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No addresses saved</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <Card key={address.id} className="border-border/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold capitalize">{address.address_type} Address</h4>
                            {address.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <div className="text-sm">
                            <p>{address.first_name} {address.last_name}</p>
                            {address.company && <p>{address.company}</p>}
                            <p>{address.address_line1}</p>
                            {address.address_line2 && <p>{address.address_line2}</p>}
                            <p>{address.city}, {address.state} {address.postal_code}</p>
                            <p>{address.country}</p>
                            {address.phone && <p>{address.phone}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
