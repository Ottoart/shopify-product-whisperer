import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Info, Search, Filter, Download, Edit, Target, TrendingUp, Users, BarChart3 } from "lucide-react";

interface ListingsTabProps {
  storeFilter: string | null;
  dateRange: string;
  dateRangeLabel: string;
}

interface Listing {
  sku: string;
  title: string;
  strategy: string;
  cost: number;
  minPrice: number;
  maxPrice: number;
  yourPrice: number;
  competitorPrice: number;
  buyBoxStatus: string;
  inventory: number;
  condition: string;
  vat: string;
  salesRank: string;
  status: string;
  daysLive: number;
}

export function ListingsTab({ storeFilter, dateRange, dateRangeLabel }: ListingsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Mock data - in real implementation, this would come from Supabase
  const listings: Listing[] = [
    {
      sku: "ABC-123",
      title: "Wireless Bluetooth Headphones - Premium Quality",
      strategy: "Buy Box",
      cost: 25.50,
      minPrice: 35.00,
      maxPrice: 65.00,
      yourPrice: 49.99,
      competitorPrice: 47.99,
      buyBoxStatus: "Won",
      inventory: 42,
      condition: "New",
      vat: "20%",
      salesRank: "12,450",
      status: "Live",
      daysLive: 45
    },
    {
      sku: "DEF-456",
      title: "Smart Phone Case - iPhone 15 Pro",
      strategy: "Fixed",
      cost: 8.20,
      minPrice: 15.00,
      maxPrice: 25.00,
      yourPrice: 19.99,
      competitorPrice: 18.50,
      buyBoxStatus: "Lost",
      inventory: 156,
      condition: "New",
      vat: "20%",
      salesRank: "8,920",
      status: "Live",
      daysLive: 23
    },
    {
      sku: "GHI-789",
      title: "Gaming Mouse RGB - High DPI",
      strategy: "Amazon",
      cost: 18.75,
      minPrice: 28.00,
      maxPrice: 45.00,
      yourPrice: 34.99,
      competitorPrice: 36.99,
      buyBoxStatus: "Won",
      inventory: 78,
      condition: "New",
      vat: "20%",
      salesRank: "15,670",
      status: "Suppressed",
      daysLive: 67
    }
  ];

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || listing.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBuyBoxBadgeColor = (status: string) => {
    switch (status) {
      case 'Won': return 'bg-green-100 text-green-800';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-green-100 text-green-800';
      case 'Suppressed': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="suppressed">Suppressed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              Bulk Edit
            </Button>
          </div>
        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Product Listings
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>All fields are sortable and filterable. Clicking values opens an edit popup.</p>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              Manage pricing and strategies for all your listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Your Price</TableHead>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Buy Box</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Days Live</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => (
                    <TableRow key={listing.sku}>
                      <TableCell className="font-mono text-sm">{listing.sku}</TableCell>
                      <TableCell className="max-w-xs truncate">{listing.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{listing.strategy}</Badge>
                      </TableCell>
                      <TableCell>${listing.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-sm">
                        ${listing.minPrice.toFixed(2)} - ${listing.maxPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-semibold">${listing.yourPrice.toFixed(2)}</TableCell>
                      <TableCell>${listing.competitorPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getBuyBoxBadgeColor(listing.buyBoxStatus)}>
                          {listing.buyBoxStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{listing.inventory}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{listing.daysLive}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedListing(listing)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit Listing: {listing.sku}</DialogTitle>
                              <DialogDescription>
                                Manage pricing, strategy, and listing details
                              </DialogDescription>
                            </DialogHeader>
                            
                            <Tabs defaultValue="edit" className="mt-4">
                              <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="edit">🔧 Edit</TabsTrigger>
                                <TabsTrigger value="details">📋 Details</TabsTrigger>
                                <TabsTrigger value="pricing">💰 Pricing</TabsTrigger>
                                <TabsTrigger value="competition">🎯 Competition</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="edit" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="minPrice">Min Price</Label>
                                    <Input 
                                      id="minPrice" 
                                      type="number" 
                                      defaultValue={listing.minPrice} 
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="maxPrice">Max Price</Label>
                                    <Input 
                                      id="maxPrice" 
                                      type="number" 
                                      defaultValue={listing.maxPrice} 
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="cost">Cost</Label>
                                    <Input 
                                      id="cost" 
                                      type="number" 
                                      defaultValue={listing.cost} 
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="manualPrice">Manual Price Override</Label>
                                    <Input 
                                      id="manualPrice" 
                                      type="number" 
                                      placeholder="Leave empty for auto pricing"
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="strategy">Strategy</Label>
                                    <Select defaultValue={listing.strategy}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Buy Box">Buy Box</SelectItem>
                                        <SelectItem value="Fixed">Fixed</SelectItem>
                                        <SelectItem value="Amazon">Amazon</SelectItem>
                                        <SelectItem value="eBay">eBay</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="condition">Condition</Label>
                                    <Select defaultValue={listing.condition}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Used">Used</SelectItem>
                                        <SelectItem value="Refurbished">Refurbished</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Switch id="managed" defaultChecked />
                                  <Label htmlFor="managed">Managed (Auto-repricing enabled)</Label>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="memo">Memo</Label>
                                  <Textarea 
                                    id="memo" 
                                    placeholder="Add notes about this listing..."
                                    rows={3}
                                  />
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="details" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Title</Label>
                                    <p className="text-sm text-muted-foreground">{listing.title}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">SKU</Label>
                                    <p className="text-sm text-muted-foreground font-mono">{listing.sku}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Sales Rank</Label>
                                    <p className="text-sm text-muted-foreground">{listing.salesRank}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Days Live</Label>
                                    <p className="text-sm text-muted-foreground">{listing.daysLive} days</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Inventory</Label>
                                    <p className="text-sm text-muted-foreground">{listing.inventory} units</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">VAT</Label>
                                    <p className="text-sm text-muted-foreground">{listing.vat}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="pricing" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Current Metrics</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-sm">Current Price:</span>
                                          <span className="font-semibold">${listing.yourPrice}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm">Break-even:</span>
                                          <span className="text-sm">${(listing.cost * 1.4).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm">Margin:</span>
                                          <span className="text-green-600 font-semibold">
                                            {(((listing.yourPrice - listing.cost) / listing.yourPrice) * 100).toFixed(1)}%
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-sm">ROI:</span>
                                          <span className="text-blue-600 font-semibold">
                                            {(((listing.yourPrice - listing.cost) / listing.cost) * 100).toFixed(1)}%
                                          </span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                    
                                    <Card>
                                      <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Recent Changes</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-2">
                                        <div className="text-xs space-y-1">
                                          <div className="flex justify-between">
                                            <span>2 days ago:</span>
                                            <span>$47.99 → $49.99</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>5 days ago:</span>
                                            <span>$45.99 → $47.99</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>1 week ago:</span>
                                            <span>$44.99 → $45.99</span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="competition" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Top 5 Competitors
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-3">
                                        {[
                                          { seller: "TechGear Pro", rating: "99%", price: 47.99, buyBox: true },
                                          { seller: "ElectroWorld", rating: "98%", price: 48.50, buyBox: false },
                                          { seller: "GadgetHub", rating: "96%", price: 49.99, buyBox: false },
                                          { seller: "AudioMax", rating: "97%", price: 51.99, buyBox: false },
                                          { seller: "TechDeals", rating: "95%", price: 52.99, buyBox: false }
                                        ].map((competitor, index) => (
                                          <div key={index} className="flex items-center justify-between p-2 rounded border">
                                            <div className="flex items-center gap-3">
                                              <div className="text-sm font-medium">{competitor.seller}</div>
                                              <Badge variant="outline" className="text-xs">{competitor.rating}</Badge>
                                              {competitor.buyBox && <Target className="h-3 w-3 text-green-600" />}
                                            </div>
                                            <div className="font-semibold">${competitor.price}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                            </Tabs>
                            
                            <div className="flex justify-end gap-2 mt-6">
                              <Button variant="outline">Cancel</Button>
                              <Button>Save Changes</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}