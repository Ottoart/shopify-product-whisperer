import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store, Plus, Trash2, Eye, EyeOff } from "lucide-react";

interface StoreConfiguration {
  id: string;
  store_name: string;
  platform: string;
  domain: string;
  access_token: string;
  is_active: boolean;
  created_at: string;
}

export function StoreConfig() {
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    store_name: "",
    domain: "",
    access_token: ""
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('store_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching stores",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.store_name || !formData.domain || !formData.access_token) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('store_configurations')
        .insert({
          user_id: user.id,
          store_name: formData.store_name,
          platform: 'shopify',
          domain: formData.domain,
          access_token: formData.access_token
        });

      if (error) throw error;

      toast({
        title: "Store added successfully!",
        description: "Your Shopify store has been configured"
      });

      setFormData({ store_name: "", domain: "", access_token: "" });
      setShowForm(false);
      fetchStores();
    } catch (error: any) {
      toast({
        title: "Error adding store",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('store_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Store removed",
        description: "Store configuration has been deleted"
      });

      fetchStores();
    } catch (error: any) {
      toast({
        title: "Error removing store",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleTokenVisibility = (storeId: string) => {
    setShowTokens(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading store configurations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Configurations
              </CardTitle>
              <CardDescription>
                Manage your connected stores for order syncing and fulfillment
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </div>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t">
            <form onSubmit={handleSubmit} className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_name">Store Name</Label>
                  <Input
                    id="store_name"
                    placeholder="My Shopify Store"
                    value={formData.store_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Store Domain</Label>
                  <Input
                    id="domain"
                    placeholder="mystore.myshopify.com"
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="access_token">Access Token</Label>
                <Input
                  id="access_token"
                  type="password"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                  value={formData.access_token}
                  onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Store</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {stores.length > 0 && (
        <div className="space-y-4">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{store.store_name}</h3>
                      <Badge variant="outline">Shopify</Badge>
                      {store.is_active && <Badge variant="default">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Domain: {store.domain}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        Token: {showTokens[store.id] 
                          ? store.access_token 
                          : '••••••••••••••••••••••••••••••••'
                        }
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTokenVisibility(store.id)}
                      >
                        {showTokens[store.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(store.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {stores.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No stores configured</h3>
            <p className="text-muted-foreground mb-4">
              Add your first store to start syncing orders and managing fulfillment
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}