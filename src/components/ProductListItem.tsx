import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ExternalLink, Edit3, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  handle?: string;
  variant_price?: number;
  variant_inventory_qty?: number;
  published?: boolean;
  vendor?: string;
  type?: string;
  image_src?: string;
}

interface ProductListItemProps {
  product: Product;
  storeUrl?: string;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  showActions?: boolean;
}

export const ProductListItem = ({ 
  product, 
  storeUrl, 
  onEdit, 
  onDelete, 
  showActions = true 
}: ProductListItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(product.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const getProductUrl = () => {
    if (!storeUrl || !product.handle) return null;
    const cleanUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${cleanUrl}/products/${product.handle}`;
  };

  const productUrl = getProductUrl();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 
                className={`font-medium text-sm truncate ${productUrl ? 'text-primary hover:underline cursor-pointer' : ''}`}
                onClick={() => productUrl && window.open(productUrl, '_blank')}
              >
                {product.title}
              </h3>
              {productUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(productUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {product.variant_price !== undefined && (
                <Badge variant="outline" className="text-xs">
                  ${product.variant_price}
                </Badge>
              )}
              {product.variant_inventory_qty !== undefined && (
                <Badge variant={product.variant_inventory_qty > 10 ? 'secondary' : 'destructive'} className="text-xs">
                  Stock: {product.variant_inventory_qty}
                </Badge>
              )}
              {product.published !== undefined && (
                <Badge variant={product.published ? 'default' : 'secondary'} className="text-xs">
                  {product.published ? 'Published' : 'Draft'}
                </Badge>
              )}
            </div>

            {(product.vendor || product.type) && (
              <div className="text-xs text-muted-foreground">
                {product.vendor && <span>Vendor: {product.vendor}</span>}
                {product.vendor && product.type && <span> • </span>}
                {product.type && <span>Type: {product.type}</span>}
              </div>
            )}
          </div>

          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(product)}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
              
              {onDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{product.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};