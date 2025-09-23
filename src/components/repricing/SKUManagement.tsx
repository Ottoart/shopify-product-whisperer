import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductPricing {
  id: string;
  sku: string;
  product_title: string;
  marketplace: string;
  current_price: number;
  min_price: number;
  max_price: number;
  cost_of_goods: number;
  competitor_price: number;
  rule_id: string | null;
  status: string;
  profit_margin?: number;
  rule_name?: string;
}

interface RepricingRule {
  id: string;
  name: string;
}

export default function SKUManagement() {
  const [products, setProducts] = useState<ProductPricing[]>([]);
  const [rules, setRules] = useState<RepricingRule[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductPricing | null>(null);
  const [editedProduct, setEditedProduct] = useState<Partial<ProductPricing>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMarketplace, setFilterMarketplace] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
    loadRules();
  }, []);

  const loadProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('product_pricing')
        .select(`
          *,
          repricing_rules(id, name)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const productsWithMargin = data?.map(product => ({
        ...product,
        rule_name: product.repricing_rules?.name,
        profit_margin: product.current_price && product.cost_of_goods 
          ? ((product.current_price - product.cost_of_goods) / product.current_price) * 100
          : 0
      })) || [];

      setProducts(productsWithMargin);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('repricing_rules')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading rules:', error);
    }
  };

  const openEditDialog = (product: ProductPricing) => {
    setSelectedProduct(product);
    setEditedProduct({
      current_price: product.current_price,
      min_price: product.min_price,
      max_price: product.max_price,
      cost_of_goods: product.cost_of_goods,
      rule_id: product.rule_id
    });
  };

  const saveProductChanges = async () => {
    if (!selectedProduct) return;

    try {
      const { error } = await supabase
        .from('product_pricing')
        .update(editedProduct)
        .eq('id', selectedProduct.id);

      if (error) throw error;

      // Record price change if price was updated
      if (editedProduct.current_price && editedProduct.current_price !== selectedProduct.current_price) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('price_changes')
            .insert({
              user_id: user.id,
            product_pricing_id: selectedProduct.id,
            rule_id: editedProduct.rule_id,
            old_price: selectedProduct.current_price,
            new_price: editedProduct.current_price,
            reason: 'Manual update',
            change_type: 'manual'
            });
        }
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setSelectedProduct(null);
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarketplace = filterMarketplace === "all" || product.marketplace === filterMarketplace;
    return matchesSearch && matchesMarketplace;
  });

  const getMarginBadge = (margin: number) => {
    if (margin < 10) return <Badge variant="destructive">Low</Badge>;
    if (margin < 25) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="default">High</Badge>;
  };

  const getPriceChangeIndicator = (current: number, competitor: number) => {
    if (!competitor) return null;
    if (current < competitor) return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (current > competitor) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return null;
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SKU Management</h2>
          <p className="text-muted-foreground">Manage individual product pricing</p>
        </div>
        
        <div className="flex gap-4">
          <Input
            placeholder="Search SKU or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={filterMarketplace} onValueChange={setFilterMarketplace}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Marketplaces</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Walmart">Walmart</SelectItem>
              <SelectItem value="eBay">eBay</SelectItem>
              <SelectItem value="Shopify">Shopify</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Title</TableHead>
                <TableHead>Marketplace</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Competitor Price</TableHead>
                <TableHead>Min/Max</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell className="max-w-xs truncate">{product.product_title}</TableCell>
                  <TableCell>{product.marketplace}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      ${product.current_price?.toFixed(2) || 'N/A'}
                      {getPriceChangeIndicator(product.current_price, product.competitor_price)}
                    </div>
                  </TableCell>
                  <TableCell>${product.competitor_price?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>
                    ${product.min_price?.toFixed(2) || 'N/A'} - ${product.max_price?.toFixed(2) || 'N/A'}
                  </TableCell>
                  <TableCell>${product.cost_of_goods?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.profit_margin?.toFixed(1)}%
                      {getMarginBadge(product.profit_margin || 0)}
                    </div>
                  </TableCell>
                  <TableCell>{product.rule_name || 'No Rule'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Product Pricing</DialogTitle>
                          </DialogHeader>
                          
                          {selectedProduct && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">SKU: {selectedProduct.sku}</Label>
                                <p className="text-sm text-muted-foreground truncate">
                                  {selectedProduct.product_title}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="current_price">Current Price</Label>
                                  <Input
                                    id="current_price"
                                    type="number"
                                    step="0.01"
                                    value={editedProduct.current_price || ''}
                                    onChange={(e) => setEditedProduct(prev => ({
                                      ...prev,
                                      current_price: parseFloat(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cost_of_goods">Cost of Goods</Label>
                                  <Input
                                    id="cost_of_goods"
                                    type="number"
                                    step="0.01"
                                    value={editedProduct.cost_of_goods || ''}
                                    onChange={(e) => setEditedProduct(prev => ({
                                      ...prev,
                                      cost_of_goods: parseFloat(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="min_price">Min Price</Label>
                                  <Input
                                    id="min_price"
                                    type="number"
                                    step="0.01"
                                    value={editedProduct.min_price || ''}
                                    onChange={(e) => setEditedProduct(prev => ({
                                      ...prev,
                                      min_price: parseFloat(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="max_price">Max Price</Label>
                                  <Input
                                    id="max_price"
                                    type="number"
                                    step="0.01"
                                    value={editedProduct.max_price || ''}
                                    onChange={(e) => setEditedProduct(prev => ({
                                      ...prev,
                                      max_price: parseFloat(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="rule">Assigned Rule</Label>
                                <Select 
                                  value={editedProduct.rule_id || 'none'} 
                                  onValueChange={(value) => setEditedProduct(prev => ({
                                    ...prev,
                                    rule_id: value === 'none' ? null : value
                                  }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No Rule</SelectItem>
                                    {rules.map(rule => (
                                      <SelectItem key={rule.id} value={rule.id}>
                                        {rule.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {editedProduct.current_price && editedProduct.cost_of_goods && (
                                <div className="p-3 bg-muted rounded-lg">
                                  <div className="text-sm">
                                    <div className="flex justify-between">
                                      <span>Profit Margin:</span>
                                      <span className="font-medium">
                                        {(((editedProduct.current_price - editedProduct.cost_of_goods) / editedProduct.current_price) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2 pt-4">
                                <Button onClick={saveProductChanges} className="flex-1">
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setSelectedProduct(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}