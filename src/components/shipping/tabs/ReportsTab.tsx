import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  BarChart3,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Info,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportsTabProps {
  storeFilter: string | null;
  dateRange: string;
  dateRangeLabel: string;
}

interface Report {
  id: string;
  name: string;
  description: string;
  category: 'operations' | 'shipping' | 'inventory' | 'accounting' | 'prepfox';
  icon: any;
  tooltip: string;
  popular?: boolean;
  new?: boolean;
}

export function ReportsTab({ storeFilter, dateRange, dateRangeLabel }: ReportsTabProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const shipStationReports: Report[] = [
    {
      id: 'order-detail',
      name: 'Order Detail',
      description: 'Detailed list of customer orders with full information',
      category: 'operations',
      icon: Package,
      tooltip: 'Comprehensive order information including customer details, items, and status',
      popular: true
    },
    {
      id: 'buyer-comments',
      name: 'Buyer Comments',
      description: 'View special notes and customer requests',
      category: 'operations',
      icon: FileText,
      tooltip: 'Customer comments and special shipping instructions'
    },
    {
      id: 'country-comparison',
      name: 'Country Comparison',
      description: 'Evaluate geographic sales distribution',
      category: 'shipping',
      icon: BarChart3,
      tooltip: 'Compare sales performance across different countries'
    },
    {
      id: 'orders-by-lot',
      name: 'Orders by Lot',
      description: 'Batch processing insights and lot tracking',
      category: 'operations',
      icon: Package,
      tooltip: 'Track orders processed in batches for efficiency analysis'
    },
    {
      id: 'item-demand',
      name: 'Item Demand Summary',
      description: 'Identify bestselling products and trends',
      category: 'inventory',
      icon: TrendingUp,
      tooltip: 'Product performance metrics and demand analysis',
      popular: true
    },
    {
      id: 'returned-products',
      name: 'Returned Products',
      description: 'Review return trends and reasons',
      category: 'operations',
      icon: AlertTriangle,
      tooltip: 'Analyze return patterns to improve product quality'
    },
    {
      id: 'shipment-count-user',
      name: 'Shipment Count by User',
      description: 'User-level productivity tracking',
      category: 'operations',
      icon: Users,
      tooltip: 'Monitor individual team member performance'
    },
    {
      id: 'shipping-cost',
      name: 'Shipping Cost Analysis',
      description: 'Control carrier cost allocation and trends',
      category: 'accounting',
      icon: DollarSign,
      tooltip: 'Detailed breakdown of shipping expenses by carrier and service type'
    },
    {
      id: 'shipping-manifest',
      name: 'Shipping Manifest',
      description: 'Paper trail of order movement and fulfillment',
      category: 'shipping',
      icon: FileText,
      tooltip: 'Official record of all shipments for audit purposes'
    },
    {
      id: 'shipped-items',
      name: 'Shipped Items Report',
      description: 'Log of all fulfilled SKUs and quantities',
      category: 'inventory',
      icon: Package,
      tooltip: 'Track which products have been shipped and when'
    },
    {
      id: 'batch-detail',
      name: 'Batch Detail Report',
      description: 'Recent label printing and batch activity',
      category: 'operations',
      icon: FileText,
      tooltip: 'Details of batch processing operations'
    },
    {
      id: 'account-balance',
      name: 'Account Balance History',
      description: 'Track postage spending and account credits',
      category: 'accounting',
      icon: DollarSign,
      tooltip: 'Monitor carrier account balances and usage'
    }
  ];

  const prepFoxReports: Report[] = [
    {
      id: 'label-error-logs',
      name: 'Label Error Logs',
      description: 'System debug insights with timestamps and API messages',
      category: 'prepfox',
      icon: AlertTriangle,
      tooltip: 'Detailed error tracking for troubleshooting shipping issues',
      new: true
    },
    {
      id: 'return-reasons',
      name: 'Return Reasons Breakdown',
      description: 'Customer satisfaction indicators by return category',
      category: 'prepfox',
      icon: BarChart3,
      tooltip: 'Percentage breakdown of why customers return products'
    },
    {
      id: 'sla-violations',
      name: 'Carrier SLA Violation Report',
      description: 'Track contractual non-compliance and penalties',
      category: 'prepfox',
      icon: AlertTriangle,
      tooltip: 'Monitor carrier performance against service level agreements'
    },
    {
      id: 'cost-per-carrier-sku',
      name: 'Cost per Carrier per SKU',
      description: 'Target price improvement opportunities',
      category: 'prepfox',
      icon: DollarSign,
      tooltip: 'Detailed cost analysis to optimize carrier selection by product'
    },
    {
      id: 'split-order-reasons',
      name: 'Split Order Reasons Report',
      description: 'Review fulfillment logic and optimization',
      category: 'prepfox',
      icon: Package,
      tooltip: 'Understand why orders are split across multiple shipments'
    },
    {
      id: 'weekend-weekday-cost',
      name: 'Weekend vs Weekday Shipping Cost',
      description: 'Time-based shipping analysis and optimization',
      category: 'prepfox',
      icon: BarChart3,
      tooltip: 'Compare shipping costs and efficiency across different days'
    },
    {
      id: 'regional-delivery-analysis',
      name: 'Regional Delivery Success/Failure',
      description: 'Operational reliability by geographic region',
      category: 'prepfox',
      icon: BarChart3,
      tooltip: 'Identify problematic delivery regions and carrier performance'
    },
    {
      id: 'tag-based-reports',
      name: 'Tag-Based Reports',
      description: 'Sensitive product tracking (Fragile, Perishable, etc.)',
      category: 'prepfox',
      icon: Package,
      tooltip: 'Monitor special handling requirements and success rates'
    },
    {
      id: 'carrier-recommendations',
      name: 'Carrier Recommendation Report',
      description: 'AI-powered optimization guidance',
      category: 'prepfox',
      icon: Brain,
      tooltip: 'Smart recommendations for carrier selection based on performance data',
      new: true
    },
    {
      id: 'pick-pack-ship-efficiency',
      name: 'Pick-Pack-Ship Efficiency Tracker',
      description: 'Workflow performance analysis',
      category: 'prepfox',
      icon: TrendingUp,
      tooltip: 'Track efficiency across the entire fulfillment workflow'
    },
    {
      id: 'label-refund-recovery',
      name: 'Label Refund Recovery Log',
      description: 'Financial recovery tracking for unused labels',
      category: 'prepfox',
      icon: DollarSign,
      tooltip: 'Monitor refunds recovered from unused or voided shipping labels'
    },
    {
      id: 'incomplete-address-tracker',
      name: 'Incomplete Address Incident Tracker',
      description: 'Address hygiene reporting and improvement',
      category: 'prepfox',
      icon: AlertTriangle,
      tooltip: 'Track and resolve addressing issues that cause delivery problems'
    }
  ];

  const allReports = [...shipStationReports, ...prepFoxReports];

  const filteredReports = allReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleExportReport = (reportId: string, format: 'pdf' | 'csv' | 'xlsx') => {
    toast({
      title: "Export Started",
      description: `Generating ${format.toUpperCase()} report...`,
    });
    
    // In a real implementation, this would trigger the actual export
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Report downloaded as ${format.toUpperCase()}`,
      });
    }, 2000);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'operations': return 'Operations';
      case 'shipping': return 'Shipping';
      case 'inventory': return 'Inventory';
      case 'accounting': return 'Accounting';
      case 'prepfox': return 'PrepFox Enhanced';
      default: return 'All Categories';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'operations': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-green-100 text-green-800';
      case 'inventory': return 'bg-purple-100 text-purple-800';
      case 'accounting': return 'bg-orange-100 text-orange-800';
      case 'prepfox': return 'bg-gradient-primary text-primary-foreground';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const aiRecommendations = [
    {
      title: "Weekly Operations Review",
      description: "Review Label Error Logs and SLA Violations weekly",
      reports: ['label-error-logs', 'sla-violations'],
      priority: 'high'
    },
    {
      title: "Monthly Cost Optimization",
      description: "Analyze Cost per Carrier per SKU for savings opportunities",
      reports: ['cost-per-carrier-sku', 'shipping-cost'],
      priority: 'medium'
    },
    {
      title: "Quarterly Performance Review",
      description: "Generate comprehensive performance reports",
      reports: ['carrier-recommendations', 'pick-pack-ship-efficiency'],
      priority: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* AI Recommendations Section */}
      <Card className="bg-gradient-primary border-0">
        <CardHeader>
          <CardTitle className="text-primary-foreground flex items-center gap-2">
            <Brain className="h-5 w-5" />
            🧠 AI Report Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiRecommendations.map((rec, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-primary-foreground">{rec.title}</h4>
                  <p className="text-primary-foreground/90 text-sm">{rec.description}</p>
                </div>
                <Badge 
                  variant="secondary"
                  className="bg-white/20 text-primary-foreground border-white/20"
                >
                  {rec.priority}
                </Badge>
              </div>
              <div className="flex gap-2">
                {rec.reports.map(reportId => {
                  const report = allReports.find(r => r.id === reportId);
                  return report ? (
                    <Button 
                      key={reportId}
                      variant="secondary" 
                      size="sm"
                      className="text-xs bg-white/20 hover:bg-white/30 border-white/20"
                      onClick={() => handleExportReport(reportId, 'pdf')}
                    >
                      {report.name}
                    </Button>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="operations">Operations</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
              <TabsTrigger value="prepfox">PrepFox</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="transition-smooth hover:shadow-elegant">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <report.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      {report.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                      {report.new && (
                        <Badge className="text-xs bg-green-100 text-green-800">New</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{report.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${getCategoryColor(report.category)}`}>
                  {getCategoryLabel(report.category)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                {report.description}
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleExportReport(report.id, 'pdf')}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleExportReport(report.id, 'csv')}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleExportReport(report.id, 'xlsx')}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  XLS
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Export Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => handleExportReport('order-detail', 'csv')}
            >
              <Package className="h-4 w-4 mr-2" />
              Export All Orders
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => handleExportReport('shipping-cost', 'xlsx')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Cost Analysis
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => handleExportReport('carrier-recommendations', 'pdf')}
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => handleExportReport('sla-violations', 'csv')}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              SLA Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}