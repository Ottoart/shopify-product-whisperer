import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { Link2, Unlink, Plus, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Product {
  id: string;
  handle: string;
  title: string;
  variant_price: number | null;
  variant_inventory_qty: number | null;
  variant_sku: string | null;
  type: string | null;
  vendor: string | null;
}

interface ProductGroup {
  id: string;
  name: string;
  master_sku: string;
  products: Product[];
  unified_price: number | null;
  unified_inventory: number | null;
  created_at: string;
}

export function CrossMarketVariationLinking() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [ungroupedProducts, setUngroupedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSku, setNewGroupSku] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const user = { id: 'demo-user-id' };
  const { toast } = useToast();

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);

      if (productsError) throw productsError;

      // For demo purposes, create mock groups since we don't have a groups table yet
      const mockGroups: ProductGroup[] = [
        {
          id: 'group-1',
          name: 'Wireless Headphones Series',
          master_sku: 'WH-SERIES-001',
          products: productsData?.slice(0, 3) || [],
          unified_price: 99.99,
          unified_inventory: 25,
          created_at: new Date().toISOString()
        },
        {
          id: 'group-2', 
          name: 'Smart Watch Collection',
          master_sku: 'SW-SERIES-002',
          products: productsData?.slice(3, 6) || [],
          unified_price: 199.99,
          unified_inventory: 15,
          created_at: new Date().toISOString()
        }
      ];

      const groupedProductIds = mockGroups.flatMap(g => g.products.map(p => p.id));
      const ungrouped = productsData?.filter(p => !groupedProductIds.includes(p.id)) || [];

      setProducts(productsData || []);
      setProductGroups(mockGroups);
      setUngroupedProducts(ungrouped);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createProductGroup = async () => {
    if (!newGroupName || !newGroupSku || selectedProducts.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields and select at least one product',
        variant: 'destructive'
      });
      return;
    }

    const newGroup: ProductGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName,
      master_sku: newGroupSku,
      products: selectedProducts,
      unified_price: selectedProducts[0]?.variant_price || null,
      unified_inventory: selectedProducts.reduce((sum, p) => sum + (p.variant_inventory_qty || 0), 0),
      created_at: new Date().toISOString()
    };

    setProductGroups([...productGroups, newGroup]);
    setUngroupedProducts(ungroupedProducts.filter(p => !selectedProducts.includes(p)));
    setSelectedProducts([]);
    setNewGroupName('');
    setNewGroupSku('');
    setShowCreateGroup(false);

    toast({
      title: 'Group created',
      description: `Successfully linked ${selectedProducts.length} products`
    });
  };

  const unlinkProduct = (groupId: string, productId: string) => {
    const group = productGroups.find(g => g.id === groupId);
    if (!group) return;

    const productToUnlink = group.products.find(p => p.id === productId);
    if (!productToUnlink) return;

    const updatedGroups = productGroups.map(g => 
      g.id === groupId 
        ? { ...g, products: g.products.filter(p => p.id !== productId) }
        : g
    ).filter(g => g.products.length > 0); // Remove empty groups

    setProductGroups(updatedGroups);
    setUngroupedProducts([...ungroupedProducts, productToUnlink]);

    toast({
      title: 'Product unlinked',
      description: 'Product has been removed from the group'
    });
  };

  const updateUnifiedPricing = async (groupId: string, price: number, inventory: number) => {
    setProductGroups(productGroups.map(g => 
      g.id === groupId 
        ? { ...g, unified_price: price, unified_inventory: inventory }
        : g
    ));

    toast({
      title: 'Pricing updated',
      description: 'Unified pricing has been updated for the group'
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === 'ungrouped' && destination.droppableId.startsWith('group-')) {
      const productId = result.draggableId;
      const product = ungroupedProducts.find(p => p.id === productId);
      if (!product) return;

      const groupId = destination.droppableId;
      setProductGroups(productGroups.map(g => 
        g.id === groupId 
          ? { ...g, products: [...g.products, product] }
          : g
      ));
      setUngroupedProducts(ungroupedProducts.filter(p => p.id !== productId));
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-muted-foreground">Organizing your product variations… ⚙️</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                Cross-Market Variation Linking
              </CardTitle>
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Product Group</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g., Wireless Headphones Series"
                      />
                    </div>
                    <div>
                      <Label htmlFor="master-sku">Master SKU</Label>
                      <Input
                        id="master-sku"
                        value={newGroupSku}
                        onChange={(e) => setNewGroupSku(e.target.value)}
                        placeholder="e.g., WH-SERIES-001"
                      />
                    </div>
                    <div>
                      <Label>Select Products to Group</Label>
                      <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
                        {ungroupedProducts.map(product => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProducts([...selectedProducts, product]);
                                } else {
                                  setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
                                }
                              }}
                            />
                            <span className="text-sm">{product.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button onClick={createProductGroup} className="w-full">
                      Create Group
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Link variations of the same product across different marketplaces for centralized management.
              <span className="block mt-1 text-xs">
                💡 Drag and drop products between groups to reorganize them.
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Product Groups */}
        <div className="space-y-4">
          {productGroups.map((group) => (
            <Card key={group.id} className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Master SKU: {group.master_sku} • {group.products.length} products linked
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <Input
                        type="number"
                        value={group.unified_price || ''}
                        onChange={(e) => updateUnifiedPricing(group.id, parseFloat(e.target.value), group.unified_inventory || 0)}
                        className="w-20"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <Input
                        type="number"
                        value={group.unified_inventory || ''}
                        onChange={(e) => updateUnifiedPricing(group.id, group.unified_price || 0, parseInt(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={group.id} direction="horizontal">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex gap-2 min-h-[80px] p-2 border-2 border-dashed border-muted rounded-lg"
                    >
                      {group.products.map((product, index) => (
                        <Draggable key={product.id} draggableId={product.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-card border rounded p-3 min-w-[200px] ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm">{product.title}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => unlinkProduct(group.id, product.id)}
                                >
                                  <Unlink className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <p>SKU: {product.variant_sku || 'N/A'}</p>
                                <p>Price: ${product.variant_price || 0}</p>
                                <p>Stock: {product.variant_inventory_qty || 0}</p>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ungrouped Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ungrouped Products ({ungroupedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Droppable droppableId="ungrouped" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-2 flex-wrap min-h-[80px] p-2 border-2 border-dashed border-muted rounded-lg"
                >
                  {ungroupedProducts.map((product, index) => (
                    <Draggable key={product.id} draggableId={product.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-card border rounded p-3 min-w-[200px] ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <h4 className="font-medium text-sm mb-2">{product.title}</h4>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>SKU: {product.variant_sku || 'N/A'}</p>
                            <p>Price: ${product.variant_price || 0}</p>
                            <p>Stock: {product.variant_inventory_qty || 0}</p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {ungroupedProducts.length === 0 && (
                    <div className="flex items-center justify-center w-full text-muted-foreground">
                      <p className="text-sm">All products are grouped! 🎉</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>
      </div>
    </DragDropContext>
  );
}