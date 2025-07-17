import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Printer, FileText, Package, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PrinterConfig {
  label_format: string;
  dpi: number;
  print_method: string;
  default_printer: string;
}

interface DocumentRoute {
  document_type: string;
  print_to: string;
  format: string;
  options: string;
}

const defaultDocumentRoutes: DocumentRoute[] = [
  { document_type: 'Label', print_to: 'Munbyn_Printer_1', format: '4" × 6"', options: 'Auto Print' },
  { document_type: 'Packing Slip', print_to: 'Same as Label', format: 'Included w/Label', options: 'Auto Include' },
  { document_type: 'Return Label', print_to: 'Munbyn_Printer_1', format: '4" × 6"', options: 'PDF Preview' },
  { document_type: 'Pick List', print_to: 'Canon_G7000_series', format: '8.5" × 11"', options: 'Always Prompt' },
  { document_type: 'Manifest / Others', print_to: 'Always Prompt', format: '8.5" × 11"', options: 'PDF Download' },
];

export function PrintingSettings() {
  const { toast } = useToast();
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>({
    label_format: '4x6',
    dpi: 300,
    print_method: 'pdf_preview',
    default_printer: 'Munbyn_Printer_1'
  });
  const [documentRoutes, setDocumentRoutes] = useState<DocumentRoute[]>(defaultDocumentRoutes);

  const handleSaveSettings = () => {
    // Store settings in localStorage for now
    localStorage.setItem('printer_config', JSON.stringify(printerConfig));
    localStorage.setItem('document_routes', JSON.stringify(documentRoutes));
    
    toast({
      title: "Settings Saved",
      description: "Printer configuration has been saved successfully",
    });
  };

  const loadSettings = () => {
    try {
      const savedConfig = localStorage.getItem('printer_config');
      const savedRoutes = localStorage.getItem('document_routes');
      
      if (savedConfig) {
        setPrinterConfig(JSON.parse(savedConfig));
      }
      if (savedRoutes) {
        setDocumentRoutes(JSON.parse(savedRoutes));
      }
    } catch (error) {
      console.error('Error loading printer settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Label Format & Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Label Format & Layout
          </CardTitle>
          <CardDescription>
            Configure your default label format and printing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="label-format">Default Label Layout</Label>
              <Select 
                value={printerConfig.label_format} 
                onValueChange={(value) => setPrinterConfig(prev => ({...prev, label_format: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4x6">4" × 6" (thermal)</SelectItem>
                  <SelectItem value="4x6+slip">4" × 6" + Packing Slip</SelectItem>
                  <SelectItem value="8.5x11">8.5" × 11" (standard)</SelectItem>
                  <SelectItem value="8.5x11+slip">8.5" × 11" + Packing Slip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dpi">Print Quality (DPI)</Label>
              <Select 
                value={printerConfig.dpi.toString()} 
                onValueChange={(value) => setPrinterConfig(prev => ({...prev, dpi: parseInt(value)}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select DPI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="203">203 DPI (Standard)</SelectItem>
                  <SelectItem value="300">300 DPI (High Quality)</SelectItem>
                  <SelectItem value="600">600 DPI (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Default Print Method</Label>
            <RadioGroup 
              value={printerConfig.print_method} 
              onValueChange={(value) => setPrinterConfig(prev => ({...prev, print_method: value}))}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto_print" id="auto_print" />
                <Label htmlFor="auto_print">Auto Print to Default Printer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf_preview" id="pdf_preview" />
                <Label htmlFor="pdf_preview">Preview in Browser</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf_download" id="pdf_download" />
                <Label htmlFor="pdf_download">Download as PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="always_prompt" id="always_prompt" />
                <Label htmlFor="always_prompt">Always Prompt</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Default Printer Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Default Printer Setup
          </CardTitle>
          <CardDescription>
            Configure your default printer for different document types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default-printer">Default Label Printer</Label>
              <Select 
                value={printerConfig.default_printer} 
                onValueChange={(value) => setPrinterConfig(prev => ({...prev, default_printer: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select printer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Munbyn_Printer_1">Munbyn Printer 1</SelectItem>
                  <SelectItem value="Canon_G7000_series">Canon G7000 Series</SelectItem>
                  <SelectItem value="DYMO_LabelWriter">DYMO LabelWriter</SelectItem>
                  <SelectItem value="Zebra_ZP450">Zebra ZP450</SelectItem>
                  <SelectItem value="system_default">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Package className="h-4 w-4" />
                PrepFox Connect Integration
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Connect with local printers via PrepFox Connect desktop app for seamless printing
              </p>
              <Button variant="outline" size="sm">
                Download PrepFox Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Type Routing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Type Routing
          </CardTitle>
          <CardDescription>
            Configure how different document types are printed and formatted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Print To</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Options</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentRoutes.map((route, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{route.document_type}</TableCell>
                  <TableCell>{route.print_to}</TableCell>
                  <TableCell>{route.format}</TableCell>
                  <TableCell>{route.options}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Save Printing Settings
        </Button>
      </div>
    </div>
  );
}