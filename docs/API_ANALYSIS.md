# API Data Flow Analysis: UPS & Canada Post Integration

## 🔍 Current Data Flow Status

Based on my analysis of the codebase, here's the comprehensive breakdown of the API integration requirements and current status:

---

## 📦 **UPS Rating API Analysis**

### **Input Requirements (✅ Complete)**
```typescript
interface UPSRatingRequest {
  shipFrom: {
    name: string          // ✅ Fed from store config
    company?: string      // ✅ Fed from store config
    address: string       // ✅ Fed from store config
    city: string         // ✅ Fed from store config
    state: string        // ✅ Fed from store config
    zip: string          // ✅ Fed from store config
    country: string      // ✅ Fed from store config
  }
  shipTo: {
    name: string         // ✅ Fed from order data
    address: string      // ✅ Fed from order data
    city: string         // ✅ Fed from order data
    state: string        // ✅ Fed from order data
    zip: string          // ✅ Fed from order data
    country: string      // ✅ Fed from order data
  }
  package: {
    weight: number       // ✅ Fed from package details
    length: number       // ✅ Fed from package details
    width: number        // ✅ Fed from package details
    height: number       // ✅ Fed from package details
    value: number        // ✅ Fed from order total
  }
  order: {
    orderNumber: string  // ✅ Fed from order data
    currency: string     // ✅ Fed from order data
    items: Array<{       // ✅ Fed from order items
      product_title: string
      quantity: number
      price: number
      weight_lbs: number
      origin_country: string
      commodity_code: string
    }>
  }
}
```

### **Output Structure (✅ Standardized)**
```typescript
interface UPSRateResponse {
  rates: Array<{
    carrier: "UPS"
    service_code: string      // e.g., "07", "08", "11"
    service_name: string      // e.g., "UPS Worldwide Express"
    service_type: string      // "international"
    cost: number             // Decimal rate
    currency: string         // "USD"
    estimated_days: string   // "1-3 business days"
    supports_tracking: boolean
    supports_insurance: boolean
    supports_signature: boolean
  }>
  debug: {
    services_checked: number
    rates_found: number
    account_country: string
    ship_route: string
    package_weight: number
    timestamp: string
  }
}
```

### **⚠️ Issues Found:**
1. **Weight Minimum**: UPS requires minimum 1 lb for international - ✅ **FIXED**
2. **Phone Number Missing**: UPS shipment requires phone numbers - ⚠️ **NEEDS FIX**
3. **Product Weight Distribution**: Individual items need minimum 1 lb - ✅ **FIXED**

---

## 🇨🇦 **Canada Post Rating API Analysis**

### **Input Requirements (✅ Complete)**
```typescript
interface CanadaPostRatingRequest {
  shipFrom: {
    zip: string          // ✅ Used as origin postal code
  }
  shipTo: {
    zip: string          // ✅ Used as destination postal code
    country: string      // ✅ Used for routing logic
  }
  package: {
    weight: number       // ✅ Converted to kg
    length: number       // ✅ Converted to cm
    width: number        // ✅ Converted to cm
    height: number       // ✅ Converted to cm
    value: number        // ✅ For insurance
  }
}
```

### **Output Structure (✅ Standardized)**
```typescript
interface CanadaPostRateResponse {
  rates: Array<{
    carrier: "Canada Post"
    service_code: string      // e.g., "USA.SP.AIR", "USA.TP"
    service_name: string      // e.g., "Small Packet - USA Air"
    service_type: string      // "standard", "expedited"
    cost: number             // Decimal rate in CAD
    currency: "CAD"
    estimated_days: string   // "7-14 business days"
    supports_tracking: boolean
    supports_insurance: boolean
    supports_signature: boolean
  }>
}
```

### **✅ Working Correctly:**
- Fallback rates system for API failures
- Proper unit conversions (lbs→kg, inches→cm)
- Service filtering by destination country

---

## 🚀 **UPS Shipment API Analysis**

### **Input Requirements (⚠️ Partially Complete)**
```typescript
interface UPSShipmentRequest {
  orderId: string
  serviceCode: string      // e.g., "07", "08"
  shipFrom: {
    name: string
    company?: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone?: string         // ⚠️ REQUIRED but often missing
  }
  shipTo: {
    name: string
    company?: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone?: string         // ⚠️ REQUIRED but often missing
  }
  package: {
    weight: number
    length: number
    width: number
    height: number
    packageType: string    // "02" = Customer Supplied Package
  }
  paymentInfo: {
    shipperAccountNumber: string
    paymentType: "prepaid"
  }
  additionalServices?: {
    signatureRequired?: boolean
    insuranceValue?: number
  }
}
```

### **Output Structure (✅ Complete)**
```typescript
interface UPSShipmentResponse {
  tracking_number: string
  label_image_data: string  // Base64 GIF
  shipping_cost: number
  service_name: string
  estimated_delivery: string
}
```

### **❌ Critical Issues:**
1. **Missing Phone Numbers**: UPS requires phone numbers for both shipper and recipient
2. **Error Code 120209**: "Missing or invalid ship to phone number"

---

## 🇨🇦 **Canada Post Shipment API Analysis**

### **Input Requirements (✅ Complete)**
```typescript
interface CanadaPostShipmentRequest {
  orderId: string
  serviceCode: string      // e.g., "USA.SP.AIR"
  shipFrom: {
    name: string
    company?: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone?: string         // Optional, defaults to "514-555-0123"
  }
  shipTo: {
    name: string
    company?: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  package: {
    weight: number
    length: number
    width: number
    height: number
    value: number
  }
}
```

### **Output Structure (✅ Complete)**
```typescript
interface CanadaPostShipmentResponse {
  shipment: {
    tracking_number: string
    label_url: string       // URL to PDF label
    label_id: string        // Database record ID
    carrier: "Canada Post"
    service_code: string
  }
}
```

### **✅ Working Correctly:**
- XML API integration with proper escaping
- Label URL extraction and storage
- Database record creation

---

## 📊 **Frontend Data Transformation**

### **Rate Display (✅ Working)**
```typescript
// Backend → Frontend transformation
const transformedRates = calculatedRates.map((rate: any) => ({
  carrier: rate.carrier,
  serviceCode: rate.service_code,        // snake_case → camelCase
  serviceName: rate.service_name,        // snake_case → camelCase
  cost: rate.cost,
  estimatedDays: rate.estimated_days,    // snake_case → camelCase
  estimatedDelivery: rate.estimated_delivery || `Delivery in ${rate.estimated_days}`
}));
```

### **Label Purchase Flow (⚠️ Partially Working)**
```typescript
// Frontend → Backend flow
const labelRequest = {
  orderId: order.id,
  serviceCode: selectedRate.serviceCode,
  shipFrom: { ...config, phone: phone || "514-555-0123" },  // ✅ Phone fallback
  shipTo: { ...address, phone: recipientPhone || "" },      // ⚠️ Empty phone
  package: packageDetails,
  additionalServices: services
};
```

---

## 🛠️ **Required Fixes**

### **1. Phone Number Collection (HIGH PRIORITY)**
```typescript
// Need to add phone number fields to:
// - Store shipping configuration
// - Order creation/editing
// - Label purchase dialog
```

### **2. UPS Error Handling (MEDIUM PRIORITY)**
```typescript
// Better error parsing for UPS responses:
// - Token expiration (250002)
// - Address validation errors
// - Service availability errors
```

### **3. Data Validation (MEDIUM PRIORITY)**
```typescript
// Add validation for:
// - Required phone numbers for UPS
// - Minimum package weights
// - Valid postal codes/zip codes
```

---

## ✅ **Working Components**

1. **Rate Calculation**: Both carriers returning proper rate structures
2. **Canada Post Label Creation**: Full XML integration working
3. **Database Storage**: Proper label record creation
4. **Frontend Display**: Rates displayed correctly with proper formatting
5. **Error Fallbacks**: Canada Post has fallback rates for API failures

---

## 🚨 **Immediate Action Required**

1. **Add phone number collection to shipping forms**
2. **Update UPS shipment request to include phone numbers**
3. **Add validation for required fields before API calls**
4. **Improve error messages for missing data**

This analysis shows that the API integrations are largely complete but missing critical phone number handling for UPS shipments.