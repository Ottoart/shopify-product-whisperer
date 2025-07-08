import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader,
  Settings,
  ExternalLink,
  AlertTriangle 
} from 'lucide-react';
import { Product, UpdatedProduct } from '@/pages/Index';
import { useToast } from '@/hooks/use-toast';

interface QueueItem {
  productId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

interface QueueManagerProps {
  queueItems: QueueItem[];
  products: Product[];
  onUpdateStatus: (productId: string, status: 'pending' | 'processing' | 'completed' | 'error', error?: string) => void;
  onUpdateProduct: (productId: string, updatedData: UpdatedProduct) => void;
}

export const QueueManager = ({ 
  queueItems, 
  products, 
  onUpdateStatus, 
  onUpdateProduct 
}: QueueManagerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatGptUrl, setChatGptUrl] = useState('https://chatgpt.com/share/686d6a64-6330-8013-a445-b6b90fce4589');
  const [processingDelay, setProcessingDelay] = useState(3000);
  const { toast } = useToast();

  const completedCount = queueItems.filter(item => item.status === 'completed').length;
  const errorCount = queueItems.filter(item => item.status === 'error').length;
  const progress = queueItems.length > 0 ? (completedCount / queueItems.length) * 100 : 0;

  const startProcessing = async () => {
    setIsProcessing(true);
    
    for (const item of queueItems) {
      if (item.status === 'pending') {
        const product = products.find(p => p.id === item.productId);
        if (!product) continue;

        onUpdateStatus(item.productId, 'processing');
        
        try {
          // Simulate API call to ChatGPT
          await new Promise(resolve => setTimeout(resolve, processingDelay));
          
          // Simulate getting updated product data from ChatGPT
          const updatedProduct: UpdatedProduct = {
            title: `${product.title} - AI Optimized`,
            type: product.type || 'Enhanced Product',
            description: `${product.bodyHtml || 'AI-enhanced product description with SEO optimization and compelling copy that converts.'}`,
            tags: `${product.tags}, ai-optimized, seo-enhanced`.split(',').filter(Boolean).join(', ')
          };

          onUpdateProduct(item.productId, updatedProduct);
          onUpdateStatus(item.productId, 'completed');
          
          toast({
            title: "Product Updated",
            description: `${product.title} has been successfully optimized.`,
          });
          
        } catch (error) {
          onUpdateStatus(item.productId, 'error', 'Failed to process product');
          toast({
            title: "Processing Error",
            description: `Failed to update ${product.title}`,
            variant: "destructive",
          });
        }
      }
    }
    
    setIsProcessing(false);
  };

  const pauseProcessing = () => {
    setIsProcessing(false);
  };

  const resetQueue = () => {
    queueItems.forEach(item => {
      if (item.status !== 'completed') {
        onUpdateStatus(item.productId, 'pending');
      }
    });
    setIsProcessing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-primary animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-gradient-primary">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-gradient-success">Completed</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  if (queueItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-secondary flex items-center justify-center">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No items in queue</h3>
        <p className="text-sm text-muted-foreground">
          Select products to start processing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="p-6 border-b">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Processing Progress</h3>
            <div className="text-sm text-muted-foreground">
              {completedCount}/{queueItems.length} completed
            </div>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2"
          />
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span>{completedCount} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span>{errorCount} errors</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
              <span>{queueItems.length - completedCount - errorCount} pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 space-y-4">
        <div className="flex items-center gap-2">
          {!isProcessing ? (
            <Button 
              onClick={startProcessing} 
              className="bg-gradient-primary flex-1"
              disabled={queueItems.every(item => item.status === 'completed')}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Processing
            </Button>
          ) : (
            <Button 
              onClick={pauseProcessing} 
              variant="outline" 
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={resetQueue} 
            variant="outline"
            disabled={isProcessing}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Settings */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <Label className="text-sm font-medium">Settings</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="chatgpt-url" className="text-xs">ChatGPT URL</Label>
            <div className="flex items-center gap-2">
              <Input
                id="chatgpt-url"
                value={chatGptUrl}
                onChange={(e) => setChatGptUrl(e.target.value)}
                className="text-xs"
                placeholder="https://chatgpt.com/share/..."
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(chatGptUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="delay" className="text-xs">Processing Delay (ms)</Label>
            <Input
              id="delay"
              type="number"
              value={processingDelay}
              onChange={(e) => setProcessingDelay(Number(e.target.value))}
              className="text-xs"
              min="1000"
              max="10000"
            />
          </div>
        </Card>

        {/* Demo Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Products will be updated with AI-optimized titles, descriptions, and tags. Processing simulates real API calls.
          </AlertDescription>
        </Alert>
      </div>

      {/* Queue Items */}
      <div className="space-y-2 px-6 pb-6">
        {queueItems.map((item) => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return null;

          return (
            <Card key={item.productId} className="p-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(item.status)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium truncate">
                      {product.title}
                    </h4>
                    {getStatusBadge(item.status)}
                  </div>
                  
                  {item.error && (
                    <p className="text-xs text-destructive mt-1">{item.error}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};