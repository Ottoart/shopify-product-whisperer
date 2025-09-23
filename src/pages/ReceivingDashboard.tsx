import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useReceivingData } from "@/hooks/useReceivingData";
import { useFulfillmentData } from "@/hooks/useFulfillmentData";
import { Package, Scan, ClipboardCheck, AlertTriangle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReceivingDashboard() {
  const { 
    bins, 
    receivingRecords, 
    cartons, 
    inspections, 
    discrepancies, 
    loading,
    createReceivingRecord,
    scanCarton,
    createInspection,
    reportDiscrepancy,
  } = useReceivingData();
  const { toast } = useToast();
  const [selectedReceivingRecord, setSelectedReceivingRecord] = useState<string>("");
  
  // Carton scanning form state
  const [cartonBarcode, setCartonBarcode] = useState("");
  const [cartonWeight, setCartonWeight] = useState("");
  const [cartonCondition, setCartonCondition] = useState("good");
  const [cartonLength, setCartonLength] = useState("");
  const [cartonWidth, setCartonWidth] = useState("");
  const [cartonHeight, setCartonHeight] = useState("");

  // Inspection form state
  const [selectedItem, setSelectedItem] = useState("");
  const [expectedQuantity, setExpectedQuantity] = useState("");
  const [receivedQuantity, setReceivedQuantity] = useState("");
  const [itemCondition, setItemCondition] = useState("good");
  const [qualityGrade, setQualityGrade] = useState("A");
  const [expirationCheck, setExpirationCheck] = useState(true);
  const [labelCheck, setLabelCheck] = useState(true);
  const [packagingCheck, setPackagingCheck] = useState(true);
  const [assignedBin, setAssignedBin] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");

  // Discrepancy form state
  const [discrepancyReceivingRecord, setDiscrepancyReceivingRecord] = useState("");
  const [discrepancyType, setDiscrepancyType] = useState("");
  const [discrepancyExpected, setDiscrepancyExpected] = useState("");
  const [discrepancyActual, setDiscrepancyActual] = useState("");
  const [discrepancySeverity, setDiscrepancySeverity] = useState("medium");
  const [discrepancyDescription, setDiscrepancyDescription] = useState("");

  const onScanCarton = async () => {
    if (!selectedReceivingRecord || !cartonBarcode) {
      toast({
        title: "Error",
        description: "Please select a receiving record and enter carton barcode",
        variant: "destructive",
      });
      return;
    }

    try {
      await scanCarton(selectedReceivingRecord, {
        carton_barcode: cartonBarcode,
        weight_lbs: cartonWeight ? parseFloat(cartonWeight) : undefined,
        length_inches: cartonLength ? parseFloat(cartonLength) : undefined,
        width_inches: cartonWidth ? parseFloat(cartonWidth) : undefined,
        height_inches: cartonHeight ? parseFloat(cartonHeight) : undefined,
        condition_status: cartonCondition,
      });
      
      // Reset form
      setCartonBarcode("");
      setCartonWeight("");
      setCartonLength("");
      setCartonWidth("");
      setCartonHeight("");
      setCartonCondition("good");
    } catch (error) {
      console.error('Error scanning carton:', error);
    }
  };

  const onCreateInspection = async () => {
    if (!selectedItem || !expectedQuantity || !receivedQuantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const inspectionData = {
        submission_item_id: selectedItem,
        received_carton_id: null,
        quantity_expected: parseInt(expectedQuantity),
        quantity_received: parseInt(receivedQuantity),
        condition_status: itemCondition,
        quality_grade: qualityGrade,
        expiration_check_passed: expirationCheck,
        label_check_passed: labelCheck,
        packaging_check_passed: packagingCheck,
        assigned_bin_id: assignedBin || null,
        notes: inspectionNotes || null,
      };
      
      await createInspection(inspectionData);
      
      // Reset form
      setSelectedItem("");
      setExpectedQuantity("");
      setReceivedQuantity("");
      setItemCondition("good");
      setQualityGrade("A");
      setExpirationCheck(true);
      setLabelCheck(true);
      setPackagingCheck(true);
      setAssignedBin("");
      setInspectionNotes("");
    } catch (error) {
      console.error('Error creating inspection:', error);
    }
  };

  const onReportDiscrepancy = async () => {
    if (!discrepancyReceivingRecord || !discrepancyType || !discrepancyDescription) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const discrepancyData = {
        receiving_record_id: discrepancyReceivingRecord,
        submission_item_id: null,
        discrepancy_type: discrepancyType,
        expected_quantity: discrepancyExpected ? parseInt(discrepancyExpected) : null,
        actual_quantity: discrepancyActual ? parseInt(discrepancyActual) : null,
        description: discrepancyDescription,
        severity: discrepancySeverity,
        resolution_status: "open",
        resolution_notes: null,
      };
      
      await reportDiscrepancy(discrepancyData);
      
      // Reset form
      setDiscrepancyReceivingRecord("");
      setDiscrepancyType("");
      setDiscrepancyExpected("");
      setDiscrepancyActual("");
      setDiscrepancySeverity("medium");
      setDiscrepancyDescription("");
    } catch (error) {
      console.error('Error reporting discrepancy:', error);
    }
  };

  // This should be fetched from the appropriate hook for submissions
  const submittedSubmissions: any[] = [];
  const availableBins = bins.filter(bin => bin.bin_type === 'storage' || bin.bin_type === 'staging');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Warehouse Receiving Dashboard</h1>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <span className="text-sm text-muted-foreground">
            {receivingRecords.filter(r => r.status === 'in_progress').length} Active Receiving
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Pending Submissions</p>
                <p className="text-2xl font-bold">{submittedSubmissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Scan className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Cartons Scanned</p>
                <p className="text-2xl font-bold">{cartons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Items Inspected</p>
                <p className="text-2xl font-bold">{inspections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Open Discrepancies</p>
                <p className="text-2xl font-bold">
                  {discrepancies.filter(d => d.resolution_status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="receiving" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receiving">Start Receiving</TabsTrigger>
          <TabsTrigger value="scan">Scan Cartons</TabsTrigger>
          <TabsTrigger value="inspect">Item Inspection</TabsTrigger>
          <TabsTrigger value="discrepancies">Discrepancies</TabsTrigger>
          <TabsTrigger value="bins">Bin Management</TabsTrigger>
        </TabsList>

        <TabsContent value="receiving" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Inventory Awaiting Receiving</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submittedSubmissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{submission.submission_number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {submission.total_items} items
                      </p>
                      <Badge variant="outline">{submission.status}</Badge>
                    </div>
                    <Button
                      onClick={() => createReceivingRecord(submission.id)}
                      disabled={loading}
                    >
                      Start Receiving
                    </Button>
                  </div>
                ))}
                {submittedSubmissions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No submissions awaiting receiving
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Incoming Cartons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="receiving-record">Receiving Record</Label>
                    <Select onValueChange={setSelectedReceivingRecord}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select receiving record" />
                      </SelectTrigger>
                      <SelectContent>
                        {receivingRecords
                          .filter(r => r.status === 'in_progress')
                          .map((record) => (
                            <SelectItem key={record.id} value={record.id}>
                              {record.inventory_submissions?.submission_number}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="carton-barcode">Carton Barcode</Label>
                    <Input
                      id="carton-barcode"
                      value={cartonBarcode}
                      onChange={(e) => setCartonBarcode(e.target.value)}
                      placeholder="Scan or enter barcode"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={cartonWeight}
                        onChange={(e) => setCartonWeight(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select onValueChange={setCartonCondition} defaultValue="good">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="wet">Wet</SelectItem>
                          <SelectItem value="crushed">Crushed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="length">Length (in)</Label>
                      <Input
                        id="length"
                        type="number"
                        step="0.1"
                        value={cartonLength}
                        onChange={(e) => setCartonLength(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="width">Width (in)</Label>
                      <Input
                        id="width"
                        type="number"
                        step="0.1"
                        value={cartonWidth}
                        onChange={(e) => setCartonWidth(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="height">Height (in)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={cartonHeight}
                        onChange={(e) => setCartonHeight(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={onScanCarton} disabled={loading || !selectedReceivingRecord}>
                    <Scan className="w-4 h-4 mr-2" />
                    Scan Carton
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Recent Scanned Cartons</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {cartons.slice(0, 10).map((carton) => (
                      <div key={carton.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">{carton.carton_barcode}</span>
                          <Badge variant={carton.condition_status === 'good' ? 'default' : 'destructive'}>
                            {carton.condition_status}
                          </Badge>
                        </div>
                        {carton.weight_lbs && (
                          <p className="text-xs text-muted-foreground">
                            Weight: {carton.weight_lbs} lbs
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Item Inspection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item">Item</Label>
                    <Select onValueChange={setSelectedItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item to inspect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder">Select receiving record first</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expected">Expected Quantity</Label>
                      <Input
                        id="expected"
                        type="number"
                        value={expectedQuantity}
                        onChange={(e) => setExpectedQuantity(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="received">Received Quantity</Label>
                      <Input
                        id="received"
                        type="number"
                        value={receivedQuantity}
                        onChange={(e) => setReceivedQuantity(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="item-condition">Condition</Label>
                      <Select onValueChange={setItemCondition} defaultValue="good">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="damaged">Damaged</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="missing_labels">Missing Labels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quality">Quality Grade</Label>
                      <Select onValueChange={setQualityGrade} defaultValue="A">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A - Excellent</SelectItem>
                          <SelectItem value="B">B - Good</SelectItem>
                          <SelectItem value="C">C - Fair</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="expiration"
                        checked={expirationCheck}
                        onCheckedChange={(checked) => setExpirationCheck(checked === true)}
                      />
                      <Label htmlFor="expiration">Expiration Date Check Passed</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="label"
                        checked={labelCheck}
                        onCheckedChange={(checked) => setLabelCheck(checked === true)}
                      />
                      <Label htmlFor="label">Label Check Passed</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="packaging"
                        checked={packagingCheck}
                        onCheckedChange={(checked) => setPackagingCheck(checked === true)}
                      />
                      <Label htmlFor="packaging">Packaging Check Passed</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bin">Assign to Bin</Label>
                    <Select onValueChange={setAssignedBin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bin location" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBins.map((bin) => (
                          <SelectItem key={bin.id} value={bin.id}>
                            {bin.bin_code} - {bin.zone_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Inspection Notes</Label>
                    <Textarea
                      id="notes"
                      value={inspectionNotes}
                      onChange={(e) => setInspectionNotes(e.target.value)}
                      placeholder="Any additional notes..."
                    />
                  </div>

                  <Button onClick={onCreateInspection} disabled={loading}>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Complete Inspection
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Recent Inspections</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {inspections.slice(0, 10).map((inspection) => (
                      <div key={inspection.id} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {inspection.submission_items?.sku}
                          </span>
                          <Badge variant={inspection.quality_grade === 'A' ? 'default' : 'secondary'}>
                            Grade {inspection.quality_grade}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {inspection.quantity_received}/{inspection.quantity_expected} received
                        </p>
                        {inspection.warehouse_bins && (
                          <p className="text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {inspection.warehouse_bins.bin_code}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discrepancies" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Discrepancy Management</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Discrepancy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report New Discrepancy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="disc-receiving">Receiving Record</Label>
                    <Select onValueChange={setDiscrepancyReceivingRecord}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select receiving record" />
                      </SelectTrigger>
                      <SelectContent>
                        {receivingRecords.map((record) => (
                          <SelectItem key={record.id} value={record.id}>
                            {record.inventory_submissions?.submission_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="disc-type">Discrepancy Type</Label>
                    <Select onValueChange={setDiscrepancyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quantity_short">Quantity Short</SelectItem>
                        <SelectItem value="quantity_over">Quantity Over</SelectItem>
                        <SelectItem value="condition_issue">Condition Issue</SelectItem>
                        <SelectItem value="wrong_item">Wrong Item</SelectItem>
                        <SelectItem value="missing_item">Missing Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="disc-expected">Expected Quantity</Label>
                      <Input
                        id="disc-expected"
                        type="number"
                        value={discrepancyExpected}
                        onChange={(e) => setDiscrepancyExpected(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="disc-actual">Actual Quantity</Label>
                      <Input
                        id="disc-actual"
                        type="number"
                        value={discrepancyActual}
                        onChange={(e) => setDiscrepancyActual(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="disc-severity">Severity</Label>
                    <Select onValueChange={setDiscrepancySeverity} defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="disc-description">Description</Label>
                    <Textarea
                      id="disc-description"
                      value={discrepancyDescription}
                      onChange={(e) => setDiscrepancyDescription(e.target.value)}
                      placeholder="Detailed description of the discrepancy..."
                    />
                  </div>

                  <Button onClick={onReportDiscrepancy} disabled={loading}>
                    Report Discrepancy
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {discrepancies.map((discrepancy) => (
              <Card key={discrepancy.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          discrepancy.severity === 'critical' ? 'destructive' :
                          discrepancy.severity === 'high' ? 'destructive' :
                          discrepancy.severity === 'medium' ? 'default' : 'secondary'
                        }>
                          {discrepancy.severity}
                        </Badge>
                        <Badge variant="outline">
                          {discrepancy.discrepancy_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="font-medium">{discrepancy.description}</p>
                      {discrepancy.expected_quantity && discrepancy.actual_quantity && (
                        <p className="text-sm text-muted-foreground">
                          Expected: {discrepancy.expected_quantity}, Actual: {discrepancy.actual_quantity}
                        </p>
                      )}
                    </div>
                    <Badge variant={discrepancy.resolution_status === 'resolved' ? 'default' : 'secondary'}>
                      {discrepancy.resolution_status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Bin Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bins.map((bin) => (
                  <Card key={bin.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-mono font-medium">{bin.bin_code}</h3>
                        <Badge variant={bin.bin_type === 'storage' ? 'default' : 'secondary'}>
                          {bin.bin_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{bin.zone_name}</p>
                      {bin.aisle_number && bin.shelf_level && (
                        <p className="text-xs text-muted-foreground">
                          Aisle {bin.aisle_number}, Level {bin.shelf_level}
                        </p>
                      )}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs">
                          <span>Capacity</span>
                          <span>{bin.current_capacity}/{bin.max_capacity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(bin.current_capacity / bin.max_capacity) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}