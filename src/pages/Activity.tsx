import { Activity as ActivityIcon } from 'lucide-react';
import { ProductActivity } from '@/components/ProductActivity';
// Shopify integration removed

const Activity = () => {
  // Shopify credentials removed
  const storeUrl = null;

  const handleProductsUpdated = () => {
    // This will trigger a refetch of products
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <ActivityIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Product Activity</h1>
              <p className="text-muted-foreground">Track recent changes and Shopify uploads</p>
            </div>
          </div>
        </div>

        <ProductActivity 
          onProductsUpdated={handleProductsUpdated} 
          storeUrl={storeUrl} 
        />
      </div>
    </div>
  );
};

export default Activity;