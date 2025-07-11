import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAIOptimizationWithLearning } from "@/hooks/useAIOptimizationWithLearning";
import { useProductDrafts } from "@/hooks/useProductDrafts";
import { RefreshCw, Save, FolderOpen, Search, ExternalLink, Edit3, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionContext } from '@supabase/auth-helpers-react';

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  originalProduct: {
    id: string;
    handle: string;
    title: string;
    body_html: string | null;
    tags: string | null;
    type: string | null;
    category: string | null;
    vendor: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    published?: boolean | null;
    variant_price?: number | null;
    variant_compare_at_price?: number | null;
    variant_sku?: string | null;
    variant_barcode?: string | null;
    variant_grams?: number | null;
    variant_inventory_qty?: number | null;
    variant_inventory_policy?: string | null;
    variant_requires_shipping?: boolean | null;
    variant_taxable?: boolean | null;
    google_shopping_condition?: string | null;
    google_shopping_gender?: string | null;
    google_shopping_age_group?: string | null;
  };
  optimizedProduct: {
    title: string;
    description: string;
    tags: string;
    type: string;
    category: string;
    vendor?: string;
    seo_title?: string;
    seo_description?: string;
    published?: boolean;
    variant_price?: number;
    variant_compare_at_price?: number;
    variant_sku?: string;
    variant_barcode?: string;
    variant_grams?: number;
    variant_inventory_qty?: number;
    variant_inventory_policy?: string;
    variant_requires_shipping?: boolean;
    variant_taxable?: boolean;
    google_shopping_condition?: string;
    google_shopping_gender?: string;
    google_shopping_age_group?: string;
  };
  onSave: () => void;
  onReprocess?: (productData: any) => void;
}

export function ProductComparison({ 
  isOpen, 
  onClose, 
  originalProduct, 
  optimizedProduct, 
  onSave,
  onReprocess
}: ProductComparisonProps) {
  // Basic fields
  const [editedTitle, setEditedTitle] = useState(optimizedProduct.title);
  const [editedDescription, setEditedDescription] = useState(optimizedProduct.description);
  const [editedTags, setEditedTags] = useState(optimizedProduct.tags);
  const [editedType, setEditedType] = useState(optimizedProduct.type);
  const [editedCategory, setEditedCategory] = useState(optimizedProduct.category);
  const [editedVendor, setEditedVendor] = useState(optimizedProduct.vendor || '');
  
  // SEO fields
  const [editedSeoTitle, setEditedSeoTitle] = useState(optimizedProduct.seo_title || '');
  const [editedSeoDescription, setEditedSeoDescription] = useState(optimizedProduct.seo_description || '');
  
  // Product settings
  const [editedPublished, setEditedPublished] = useState(optimizedProduct.published || false);
  
  // Variant fields
  const [editedVariantPrice, setEditedVariantPrice] = useState(optimizedProduct.variant_price || 0);
  const [editedVariantCompareAtPrice, setEditedVariantCompareAtPrice] = useState(optimizedProduct.variant_compare_at_price || 0);
  const [editedVariantSku, setEditedVariantSku] = useState(optimizedProduct.variant_sku || '');
  const [editedVariantBarcode, setEditedVariantBarcode] = useState(optimizedProduct.variant_barcode || '');
  const [editedVariantGrams, setEditedVariantGrams] = useState(optimizedProduct.variant_grams || 0);
  const [editedVariantInventoryQty, setEditedVariantInventoryQty] = useState(optimizedProduct.variant_inventory_qty || 0);
  const [editedVariantInventoryPolicy, setEditedVariantInventoryPolicy] = useState(optimizedProduct.variant_inventory_policy || 'deny');
  const [editedVariantRequiresShipping, setEditedVariantRequiresShipping] = useState(optimizedProduct.variant_requires_shipping !== false);
  const [editedVariantTaxable, setEditedVariantTaxable] = useState(optimizedProduct.variant_taxable !== false);
  
  // Google Shopping fields
  const [editedGoogleShoppingCondition, setEditedGoogleShoppingCondition] = useState(optimizedProduct.google_shopping_condition || 'new');
  const [editedGoogleShoppingGender, setEditedGoogleShoppingGender] = useState(optimizedProduct.google_shopping_gender || 'unisex');
  const [editedGoogleShoppingAgeGroup, setEditedGoogleShoppingAgeGroup] = useState(optimizedProduct.google_shopping_age_group || 'adult');
  
  // Price search state
  const [isSearchingPrices, setIsSearchingPrices] = useState(false);
  const [priceResults, setPriceResults] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState<string>('');
  const { toast } = useToast();
  const { session } = useSessionContext();
  
  // Initialize hooks for AI reprocessing and draft management
  const { optimizeWithLearning, isOptimizing } = useAIOptimizationWithLearning();
  const { drafts, saveDraft, deleteDraft, isSaving } = useProductDrafts(originalProduct.handle);

  // Reset edited values when optimizedProduct changes
  useEffect(() => {
    setEditedTitle(optimizedProduct.title);
    setEditedDescription(optimizedProduct.description);
    setEditedTags(optimizedProduct.tags);
    setEditedType(optimizedProduct.type);
    setEditedCategory(optimizedProduct.category);
    setEditedVendor(optimizedProduct.vendor || '');
    setEditedSeoTitle(optimizedProduct.seo_title || '');
    setEditedSeoDescription(optimizedProduct.seo_description || '');
    setEditedPublished(optimizedProduct.published || false);
    setEditedVariantPrice(optimizedProduct.variant_price || 0);
    setEditedVariantCompareAtPrice(optimizedProduct.variant_compare_at_price || 0);
    setEditedVariantSku(optimizedProduct.variant_sku || '');
    setEditedVariantBarcode(optimizedProduct.variant_barcode || '');
    setEditedVariantGrams(optimizedProduct.variant_grams || 0);
    setEditedVariantInventoryQty(optimizedProduct.variant_inventory_qty || 0);
    setEditedVariantInventoryPolicy(optimizedProduct.variant_inventory_policy || 'deny');
    setEditedVariantRequiresShipping(optimizedProduct.variant_requires_shipping !== false);
    setEditedVariantTaxable(optimizedProduct.variant_taxable !== false);
    setEditedGoogleShoppingCondition(optimizedProduct.google_shopping_condition || 'new');
    setEditedGoogleShoppingGender(optimizedProduct.google_shopping_gender || 'unisex');
    setEditedGoogleShoppingAgeGroup(optimizedProduct.google_shopping_age_group || 'adult');
  }, [optimizedProduct]);

  // Helper functions to check if fields have been modified
  const isFieldModified = (field: keyof typeof optimizedProduct, currentValue: any) => {
    const originalValue = optimizedProduct[field];
    return originalValue !== currentValue;
  };

  // Get Shopify credentials
  const getShopifyCredentials = () => {
    const storeUrl = localStorage.getItem('shopify_domain');
    const accessToken = localStorage.getItem('shopify_access_token');
    return { storeUrl, accessToken };
  };

  const handleSave = async () => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save changes.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Saving product changes...', {
        handle: originalProduct.handle,
        userId: session.user.id,
        title: editedTitle
      });

      const { error } = await supabase
        .from('products')
        .update({
          title: editedTitle,
          type: editedType,
          category: editedCategory,
          body_html: editedDescription,
          tags: editedTags,
          vendor: editedVendor,
          seo_title: editedSeoTitle,
          seo_description: editedSeoDescription,
          published: editedPublished,
          variant_price: editedVariantPrice,
          variant_compare_at_price: editedVariantCompareAtPrice,
          variant_sku: editedVariantSku,
          variant_barcode: editedVariantBarcode,
          variant_grams: editedVariantGrams,
          variant_inventory_qty: editedVariantInventoryQty,
          variant_inventory_policy: editedVariantInventoryPolicy,
          variant_requires_shipping: editedVariantRequiresShipping,
          variant_taxable: editedVariantTaxable,
          google_shopping_condition: editedGoogleShoppingCondition,
          google_shopping_gender: editedGoogleShoppingGender,
          google_shopping_age_group: editedGoogleShoppingAgeGroup,
          updated_at: new Date().toISOString(),
        })
        .eq('handle', originalProduct.handle)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Product updated successfully');

      // Also sync to Shopify
      try {
        console.log('Syncing to Shopify...');
        const { data: syncData, error: syncError } = await supabase.functions.invoke('manage-products', {
          body: {
            action: 'update',
            productData: {
              handle: originalProduct.handle,
              title: editedTitle,
              body_html: editedDescription,
              vendor: editedVendor,
              type: editedType,
              tags: editedTags,
              published: editedPublished,
            },
            productId: originalProduct.id,
          }
        });

        if (syncError) {
          console.error('Shopify sync error:', syncError);
          toast({
            title: "Saved locally but Shopify sync failed",
            description: "Changes saved to database but couldn't sync to Shopify.",
            variant: "destructive",
          });
          return;
        }

        console.log('Shopify sync successful:', syncData);
      } catch (syncError) {
        console.error('Shopify sync failed:', syncError);
        toast({
          title: "Saved locally but Shopify sync failed",
          description: "Changes saved to database but couldn't sync to Shopify.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Product updated successfully",
        description: "Changes saved and synced to Shopify.",
      });
      
      // Notify QueueManager that user accepted changes
      if ((window as any).tempOnSave) {
        (window as any).tempOnSave();
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Notify QueueManager that user canceled changes
    if ((window as any).tempOnCancel) {
      (window as any).tempOnCancel();
    }
    onClose();
  };

  const handleReprocess = async () => {
    if (!onReprocess) return;
    
    try {
      const productData = {
        title: originalProduct.title,
        type: originalProduct.type,
        description: originalProduct.body_html,
        tags: originalProduct.tags,
        vendor: originalProduct.vendor
      };
      
      onReprocess(productData);
      toast({
        title: "Reprocessing Product",
        description: "AI is generating a new optimized version...",
      });
    } catch (error) {
      toast({
        title: "Reprocess Failed",
        description: "Failed to reprocess product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveAsDraft = async () => {
    if (!draftName.trim()) {
      toast({
        title: "Draft Name Required",
        description: "Please enter a name for your draft.",
        variant: "destructive",
      });
      return;
    }

    const optimizedData = {
      title: editedTitle,
      description: editedDescription,
      tags: editedTags,
      type: editedType,
      category: editedCategory,
      vendor: editedVendor,
      seo_title: editedSeoTitle,
      seo_description: editedSeoDescription,
      published: editedPublished,
      variant_price: editedVariantPrice,
      variant_compare_at_price: editedVariantCompareAtPrice,
      variant_sku: editedVariantSku,
      variant_barcode: editedVariantBarcode,
      variant_grams: editedVariantGrams,
      variant_inventory_qty: editedVariantInventoryQty,
      variant_inventory_policy: editedVariantInventoryPolicy,
      variant_requires_shipping: editedVariantRequiresShipping,
      variant_taxable: editedVariantTaxable,
      google_shopping_condition: editedGoogleShoppingCondition,
      google_shopping_gender: editedGoogleShoppingGender,
      google_shopping_age_group: editedGoogleShoppingAgeGroup,
    };

    saveDraft(draftName, optimizedData);
    setDraftName('');
  };

  const handleLoadDraft = (draftId: string) => {
    const draft = drafts?.find(d => d.id === draftId);
    if (draft && draft.optimized_data && typeof draft.optimized_data === 'object') {
      const data = draft.optimized_data as any;
      
      setEditedTitle(data.title || '');
      setEditedDescription(data.description || '');
      setEditedTags(data.tags || '');
      setEditedType(data.type || '');
      setEditedCategory(data.category || '');
      setEditedVendor(data.vendor || '');
      setEditedSeoTitle(data.seo_title || '');
      setEditedSeoDescription(data.seo_description || '');
      setEditedPublished(data.published || false);
      setEditedVariantPrice(data.variant_price || 0);
      setEditedVariantCompareAtPrice(data.variant_compare_at_price || 0);
      setEditedVariantSku(data.variant_sku || '');
      setEditedVariantBarcode(data.variant_barcode || '');
      setEditedVariantGrams(data.variant_grams || 0);
      setEditedVariantInventoryQty(data.variant_inventory_qty || 0);
      setEditedVariantInventoryPolicy(data.variant_inventory_policy || 'deny');
      setEditedVariantRequiresShipping(data.variant_requires_shipping !== false);
      setEditedVariantTaxable(data.variant_taxable !== false);
      setEditedGoogleShoppingCondition(data.google_shopping_condition || 'new');
      setEditedGoogleShoppingGender(data.google_shopping_gender || 'unisex');
      setEditedGoogleShoppingAgeGroup(data.google_shopping_age_group || 'adult');
      
      toast({
        title: "Draft Loaded",
        description: `Loaded draft: ${draft.draft_name}`,
      });
    }
  };

  const handleFindBestPrice = async () => {
    setIsSearchingPrices(true);
    setPriceResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('find-best-price', {
        body: {
          productTitle: originalProduct.title,
          currentPrice: originalProduct.variant_price,
          vendor: originalProduct.vendor
        }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Price search failed');
      }

      setPriceResults(data.results);
      toast({
        title: "Price Search Complete",
        description: `Found pricing data from ${data.results?.length || 0} sources`,
      });

    } catch (error: any) {
      toast({
        title: "Price Search Failed",
        description: error.message || "Failed to search for prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingPrices(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Product Optimization Comparison</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison">Before vs After</TabsTrigger>
            <TabsTrigger value="edit">Edit Optimized Version</TabsTrigger>
          </TabsList>
          
            <TabsContent value="comparison" className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="seo">SEO & Publishing</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing & Inventory</TabsTrigger>
                  <TabsTrigger value="shopping">Google Shopping</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-red-600">Original Version</h3>
                      
                      <div>
                        <Label className="text-sm font-medium">Title:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">{originalProduct.title}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Vendor:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">{originalProduct.vendor || 'No vendor'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Type:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">{originalProduct.type || 'No type'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Category:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">{originalProduct.category || 'No category'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Tags:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">{originalProduct.tags || 'No tags'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">AI Optimized Version</h3>
                      
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           Title:
                           {isFieldModified('title', editedTitle) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <Input
                           value={editedTitle}
                           onChange={(e) => setEditedTitle(e.target.value)}
                           className={`mt-1 ${isFieldModified('title', editedTitle) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                         />
                       </div>
                       
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           Vendor:
                           {isFieldModified('vendor', editedVendor) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <Input
                           value={editedVendor}
                           onChange={(e) => setEditedVendor(e.target.value)}
                           className={`mt-1 ${isFieldModified('vendor', editedVendor) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                           placeholder="Enter vendor or brand name"
                         />
                       </div>
                       
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           Type:
                           {isFieldModified('type', editedType) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <Input
                           value={editedType}
                           onChange={(e) => setEditedType(e.target.value)}
                           className={`mt-1 ${isFieldModified('type', editedType) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                           placeholder="e.g., Leave-In Hair Conditioner"
                         />
                       </div>
                       
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           Category:
                           {isFieldModified('category', editedCategory) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <Input
                           value={editedCategory}
                           onChange={(e) => setEditedCategory(e.target.value)}
                           className={`mt-1 ${isFieldModified('category', editedCategory) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                           placeholder="e.g., Health & Beauty > Hair Care"
                         />
                       </div>
                       
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           Tags:
                           {isFieldModified('tags', editedTags) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <Input
                           value={editedTags}
                           onChange={(e) => setEditedTags(e.target.value)}
                           className={`mt-1 ${isFieldModified('tags', editedTags) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                           placeholder="Comma-separated tags"
                         />
                       </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-red-600 mb-2">Original Description:</h4>
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md max-h-60 overflow-y-auto">
                        <div className="text-sm prose prose-sm max-w-none" 
                             dangerouslySetInnerHTML={{ __html: originalProduct.body_html || 'No description' }} />
                      </div>
                    </div>
                    
                     <div>
                       <h4 className="text-md font-medium text-green-600 mb-2 flex items-center gap-2">
                         Optimized Description:
                         {isFieldModified('description', editedDescription) && (
                           <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                             <Edit3 className="h-3 w-3" />
                             Modified
                           </span>
                         )}
                       </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-md font-medium text-green-600">Optimized Description Preview:</h4>
                            {isFieldModified('description', editedDescription) && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Edit3 className="h-3 w-3" />
                                Modified
                              </span>
                            )}
                          </div>
                          <div className={`p-4 border rounded-md max-h-60 overflow-y-auto ${isFieldModified('description', editedDescription) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}>
                            <div className="prose prose-sm max-w-none" 
                                 dangerouslySetInnerHTML={{ __html: editedDescription || 'No description' }} />
                          </div>
                          <details className="mt-2">
                            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                              Edit HTML Source
                            </summary>
                            <Textarea
                              value={editedDescription}
                              onChange={(e) => setEditedDescription(e.target.value)}
                              className={`mt-2 max-h-40 resize-none text-xs font-mono ${isFieldModified('description', editedDescription) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                              placeholder="Enter product description (HTML supported)"
                              rows={6}
                            />
                          </details>
                        </div>
                     </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="seo" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-red-600">Original Version</h3>
                      
                      <div>
                        <Label className="text-sm font-medium">SEO Title:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">Not available in original</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">SEO Description:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">Not available in original</p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Published:</Label>
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                          <p className="text-sm">Not available in original</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">AI Optimized Version</h3>
                      
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           SEO Title:
                           {isFieldModified('seo_title', editedSeoTitle) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <Input
                           value={editedSeoTitle}
                           onChange={(e) => setEditedSeoTitle(e.target.value)}
                           className={`mt-1 ${isFieldModified('seo_title', editedSeoTitle) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                           placeholder="SEO optimized title (max 60 chars)"
                           maxLength={60}
                         />
                         <p className="text-xs text-gray-500 mt-1">{editedSeoTitle.length}/60 characters</p>
                       </div>
                       
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           SEO Description:
                           {isFieldModified('seo_description', editedSeoDescription) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <Textarea
                           value={editedSeoDescription}
                           onChange={(e) => setEditedSeoDescription(e.target.value)}
                           className={`mt-1 resize-none ${isFieldModified('seo_description', editedSeoDescription) ? 'border-blue-300 bg-blue-50' : 'bg-green-50 border-green-200'}`}
                           placeholder="SEO meta description (max 160 chars)"
                           maxLength={160}
                           rows={3}
                         />
                         <p className="text-xs text-gray-500 mt-1">{editedSeoDescription.length}/160 characters</p>
                       </div>
                       
                       <div>
                         <Label className="text-sm font-medium flex items-center gap-2">
                           Published:
                           {isFieldModified('published', editedPublished) && (
                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                               <Edit3 className="h-3 w-3" />
                               Modified
                             </span>
                           )}
                         </Label>
                         <div className="mt-1">
                           <Switch
                             checked={editedPublished}
                             onCheckedChange={setEditedPublished}
                             className={isFieldModified('published', editedPublished) ? 'data-[state=checked]:bg-blue-500' : ''}
                           />
                           <span className="ml-2 text-sm">{editedPublished ? 'Published' : 'Draft'}</span>
                         </div>
                       </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-4">
                  {/* Price Search Button */}
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleFindBestPrice} 
                      disabled={isSearchingPrices}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center gap-2"
                    >
                      {isSearchingPrices ? (
                        <>
                          <div className="fox-digging-animation">
                            🦊
                          </div>
                          Digging for best prices...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Find Best Price
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Price Results */}
                  {priceResults && (
                    <Card className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-0">
                        <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          🏆 Best Price Results
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {priceResults.lowest && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-green-800">💰 Lowest Price</h5>
                                <span className="text-2xl font-bold text-green-700">${priceResults.lowest.price}</span>
                              </div>
                              <p className="text-sm text-green-600 mb-2">{priceResults.lowest.store}</p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-green-300 text-green-700 hover:bg-green-100"
                                onClick={() => window.open(priceResults.lowest.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Deal
                              </Button>
                            </div>
                          )}
                          
                          {priceResults.highest && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold text-red-800">💎 Highest Price</h5>
                                <span className="text-2xl font-bold text-red-700">${priceResults.highest.price}</span>
                              </div>
                              <p className="text-sm text-red-600 mb-2">{priceResults.highest.store}</p>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-100" 
                                onClick={() => window.open(priceResults.highest.url, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View Deal
                              </Button>
                            </div>
                          )}
                        </div>
                        {priceResults.savings && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 font-medium text-center">
                              💡 You could save up to <span className="font-bold">${priceResults.savings}</span> by choosing the lowest price!
                            </p>
                          </div>
                        )}
                        
                        {/* Best Price Recommendation */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                          <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                            🎯 PrepFox Price Recommendation
                          </h5>
                          <p className="text-purple-700 text-sm leading-relaxed">
                            Based on our market analysis, we recommend pricing your product at <span className="font-bold">${priceResults.lowest ? (priceResults.lowest.price * 1.15).toFixed(2) : 'N/A'}</span> - this is 15% above the lowest market price of ${priceResults.lowest?.price}, giving you competitive positioning while maintaining healthy margins. This strategy allows you to undercut higher-priced competitors while ensuring profitability.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-red-600">Original Version</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Price:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">${originalProduct.variant_price || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Compare At Price:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">${originalProduct.variant_compare_at_price || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">SKU:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">{originalProduct.variant_sku || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Barcode:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">{originalProduct.variant_barcode || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Weight (g):</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">{originalProduct.variant_grams || 0}g</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Inventory:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">{originalProduct.variant_inventory_qty || 0} units</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">AI Optimized Version</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Price:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">${optimizedProduct.variant_price || 0}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Compare At Price:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">${optimizedProduct.variant_compare_at_price || 0}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">SKU:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">{optimizedProduct.variant_sku || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Barcode:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">{optimizedProduct.variant_barcode || 'Not set'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Weight (g):</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">{optimizedProduct.variant_grams || 0}g</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Inventory:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">{optimizedProduct.variant_inventory_qty || 0} units</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Inventory Policy:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">{optimizedProduct.variant_inventory_policy || 'deny'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Requires Shipping:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">{optimizedProduct.variant_requires_shipping !== false ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Taxable:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm">{optimizedProduct.variant_taxable !== false ? 'Yes' : 'No'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="shopping" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-red-600">Original Version</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Condition:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">Not available</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Gender:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">Not available</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Age Group:</Label>
                          <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-1">
                            <p className="text-sm">Not available</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-600">AI Optimized Version</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Condition:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm capitalize">{optimizedProduct.google_shopping_condition || 'new'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Gender:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm capitalize">{optimizedProduct.google_shopping_gender || 'unisex'}</p>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Age Group:</Label>
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md mt-1">
                            <p className="text-sm capitalize">{optimizedProduct.google_shopping_age_group || 'adult'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            
            <div className="flex flex-wrap justify-between items-center gap-2 pt-4">
              <div className="flex space-x-2">
                {onReprocess && (
                  <Button 
                    variant="outline" 
                    onClick={handleReprocess} 
                    disabled={isOptimizing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                    {isOptimizing ? 'Reprocessing...' : 'Reprocess'}
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Accept Changes'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="space-y-4">
            {/* Draft Management Section */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Draft Management
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="draft-name">Save Current as Draft</Label>
                  <div className="flex gap-2">
                    <Input
                      id="draft-name"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Enter draft name..."
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSaveAsDraft} 
                      disabled={isSaving || !draftName.trim()}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="load-draft">Load Existing Draft</Label>
                  <div className="flex gap-2">
                    <Select value={selectedDraftId} onValueChange={setSelectedDraftId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a draft..." />
                      </SelectTrigger>
                      <SelectContent>
                        {drafts?.map((draft) => (
                          <SelectItem key={draft.id} value={draft.id}>
                            {draft.draft_name} ({new Date(draft.created_at).toLocaleDateString()})
                          </SelectItem>
                        ))}
                        {!drafts?.length && (
                          <SelectItem value="none" disabled>No drafts available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => handleLoadDraft(selectedDraftId)} 
                      disabled={!selectedDraftId}
                      variant="outline"
                    >
                      Load
                    </Button>
                    <Button 
                      onClick={() => deleteDraft(selectedDraftId)} 
                      disabled={!selectedDraftId}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="variant">Variant Details</TabsTrigger>
                <TabsTrigger value="shopping">Google Shopping</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-title">Product Title</Label>
                    <Input
                      id="edit-title"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-vendor">Vendor/Brand</Label>
                    <Input
                      id="edit-vendor"
                      value={editedVendor}
                      onChange={(e) => setEditedVendor(e.target.value)}
                      className="mt-1"
                      placeholder="Enter vendor or brand name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-type">Product Type</Label>
                    <Input
                      id="edit-type"
                      value={editedType}
                      onChange={(e) => setEditedType(e.target.value)}
                      className="mt-1"
                      placeholder="e.g., Shampoo, Conditioner, Hair Oil"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-category">Product Category</Label>
                    <Input
                      id="edit-category"
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="mt-1"
                      placeholder="e.g., Health & Beauty > Personal Care > Cosmetics > Hair Care"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                  <Input
                    id="edit-tags"
                    value={editedTags}
                    onChange={(e) => setEditedTags(e.target.value)}
                    className="mt-1"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Product Description (HTML)</Label>
                  <Textarea
                    id="edit-description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={15}
                    className="mt-1 font-mono text-sm"
                    placeholder="Enter HTML formatted description..."
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={editedPublished}
                    onCheckedChange={setEditedPublished}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="seo" className="space-y-4">
                <div>
                  <Label htmlFor="edit-seo-title">SEO Title</Label>
                  <Input
                    id="edit-seo-title"
                    value={editedSeoTitle}
                    onChange={(e) => setEditedSeoTitle(e.target.value)}
                    className="mt-1"
                    placeholder="SEO optimized title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-seo-description">SEO Description</Label>
                  <Textarea
                    id="edit-seo-description"
                    value={editedSeoDescription}
                    onChange={(e) => setEditedSeoDescription(e.target.value)}
                    rows={4}
                    className="mt-1"
                    placeholder="SEO meta description"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="variant" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      step="0.01"
                      value={editedVariantPrice}
                      onChange={(e) => setEditedVariantPrice(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-compare-price">Compare At Price ($)</Label>
                    <Input
                      id="edit-compare-price"
                      type="number"
                      step="0.01"
                      value={editedVariantCompareAtPrice}
                      onChange={(e) => setEditedVariantCompareAtPrice(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input
                      id="edit-sku"
                      value={editedVariantSku}
                      onChange={(e) => setEditedVariantSku(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-barcode">Barcode</Label>
                    <Input
                      id="edit-barcode"
                      value={editedVariantBarcode}
                      onChange={(e) => setEditedVariantBarcode(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-weight">Weight (grams)</Label>
                    <Input
                      id="edit-weight"
                      type="number"
                      value={editedVariantGrams}
                      onChange={(e) => setEditedVariantGrams(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-inventory">Inventory Quantity</Label>
                    <Input
                      id="edit-inventory"
                      type="number"
                      value={editedVariantInventoryQty}
                      onChange={(e) => setEditedVariantInventoryQty(parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-inventory-policy">Inventory Policy</Label>
                  <Select value={editedVariantInventoryPolicy} onValueChange={setEditedVariantInventoryPolicy}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deny">Deny (Don't allow overselling)</SelectItem>
                      <SelectItem value="continue">Continue (Allow overselling)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires-shipping"
                      checked={editedVariantRequiresShipping}
                      onCheckedChange={setEditedVariantRequiresShipping}
                    />
                    <Label htmlFor="requires-shipping">Requires Shipping</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="taxable"
                      checked={editedVariantTaxable}
                      onCheckedChange={setEditedVariantTaxable}
                    />
                    <Label htmlFor="taxable">Taxable</Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="shopping" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-condition">Condition</Label>
                    <Select value={editedGoogleShoppingCondition} onValueChange={setEditedGoogleShoppingCondition}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                        <SelectItem value="used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select value={editedGoogleShoppingGender} onValueChange={setEditedGoogleShoppingGender}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unisex">Unisex</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-age-group">Age Group</Label>
                    <Select value={editedGoogleShoppingAgeGroup} onValueChange={setEditedGoogleShoppingAgeGroup}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adult">Adult</SelectItem>
                        <SelectItem value="kids">Kids</SelectItem>
                        <SelectItem value="toddler">Toddler</SelectItem>
                        <SelectItem value="infant">Infant</SelectItem>
                        <SelectItem value="newborn">Newborn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}