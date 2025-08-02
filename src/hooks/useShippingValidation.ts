import { useState } from 'react';

export interface ShippingValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
  warnings: { field: string; message: string }[];
}

export interface ShippingFormData {
  shipFrom: {
    name?: string;
    company?: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };
  shipTo: {
    name?: string;
    company?: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phone?: string;
  };
  package: {
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    weightUnit?: string;
    dimensionUnit?: string;
    packageType?: string;
  };
  service?: {
    carrier?: string;
    serviceCode?: string;
  };
}

const VALIDATION_RULES: ShippingValidationRule[] = [
  // Ship From Validation
  { field: 'shipFrom.name', required: true, minLength: 2, maxLength: 35, message: 'Ship from name is required (2-35 characters)' },
  { field: 'shipFrom.address', required: true, minLength: 5, maxLength: 35, message: 'Ship from address is required (5-35 characters)' },
  { field: 'shipFrom.city', required: true, minLength: 2, maxLength: 30, message: 'Ship from city is required (2-30 characters)' },
  { field: 'shipFrom.state', required: true, minLength: 2, maxLength: 5, message: 'Ship from state/province is required (2-5 characters)' },
  { field: 'shipFrom.zip', required: true, minLength: 3, maxLength: 10, message: 'Ship from postal code is required (3-10 characters)' },
  { field: 'shipFrom.country', required: true, minLength: 2, maxLength: 2, message: 'Ship from country code is required (2 characters)' },
  
  // Ship To Validation
  { field: 'shipTo.name', required: true, minLength: 2, maxLength: 35, message: 'Ship to name is required (2-35 characters)' },
  { field: 'shipTo.address', required: true, minLength: 5, maxLength: 35, message: 'Ship to address is required (5-35 characters)' },
  { field: 'shipTo.city', required: true, minLength: 2, maxLength: 30, message: 'Ship to city is required (2-30 characters)' },
  { field: 'shipTo.state', required: true, minLength: 2, maxLength: 5, message: 'Ship to state/province is required (2-5 characters)' },
  { field: 'shipTo.zip', required: true, minLength: 3, maxLength: 10, message: 'Ship to postal code is required (3-10 characters)' },
  { field: 'shipTo.country', required: true, minLength: 2, maxLength: 2, message: 'Ship to country code is required (2 characters)' },
  
  // Package Validation
  { 
    field: 'package.weight', 
    required: true, 
    validator: (value) => value > 0 && value <= 150, 
    message: 'Package weight must be between 0.1 and 150 lbs' 
  },
  { 
    field: 'package.length', 
    required: true, 
    validator: (value) => value > 0 && value <= 108, 
    message: 'Package length must be between 0.1 and 108 inches' 
  },
  { 
    field: 'package.width', 
    required: true, 
    validator: (value) => value > 0 && value <= 108, 
    message: 'Package width must be between 0.1 and 108 inches' 
  },
  { 
    field: 'package.height', 
    required: true, 
    validator: (value) => value > 0 && value <= 108, 
    message: 'Package height must be between 0.1 and 108 inches' 
  }
];

const PHONE_PATTERN = /^[\+]?[\d\s\-\(\)]{10,15}$/;
const US_ZIP_PATTERN = /^\d{5}(-\d{4})?$/;
const CA_POSTAL_PATTERN = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

export function useShippingValidation() {
  const [validationResults, setValidationResults] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const validatePhoneNumber = (phone: string | undefined, fieldName: string): { field: string; message: string }[] => {
    const issues: { field: string; message: string }[] = [];
    
    if (!phone || phone.trim() === '') {
      issues.push({
        field: fieldName,
        message: 'Phone number is strongly recommended for UPS shipments'
      });
    } else if (!PHONE_PATTERN.test(phone.replace(/\s/g, ''))) {
      issues.push({
        field: fieldName,
        message: 'Phone number format is invalid (should be 10-15 digits)'
      });
    }
    
    return issues;
  };

  const validatePostalCode = (zip: string | undefined, country: string | undefined, fieldName: string): { field: string; message: string }[] => {
    const issues: { field: string; message: string }[] = [];
    
    if (zip && country) {
      if (country === 'US' && !US_ZIP_PATTERN.test(zip)) {
        issues.push({
          field: fieldName,
          message: 'US ZIP code format is invalid (should be 12345 or 12345-6789)'
        });
      } else if (country === 'CA' && !CA_POSTAL_PATTERN.test(zip)) {
        issues.push({
          field: fieldName,
          message: 'Canadian postal code format is invalid (should be A1A 1A1)'
        });
      }
    }
    
    return issues;
  };

  const validatePackageDimensions = (packageData: ShippingFormData['package']): { field: string; message: string }[] => {
    const issues: { field: string; message: string }[] = [];
    
    if (packageData.length && packageData.width && packageData.height) {
      const girth = 2 * (packageData.width + packageData.height);
      const lengthPlusGirth = packageData.length + girth;
      
      // UPS maximum size limit
      if (lengthPlusGirth > 165) {
        issues.push({
          field: 'package.dimensions',
          message: `Package is oversized. Length + girth (${lengthPlusGirth.toFixed(1)}") exceeds 165" limit`
        });
      }
      
      // Check for extremely small packages
      if (packageData.length < 6 || packageData.width < 4 || packageData.height < 0.75) {
        issues.push({
          field: 'package.dimensions',
          message: 'Package may be too small for standard shipping (minimum 6" x 4" x 0.75")'
        });
      }
    }
    
    return issues;
  };

  const validateShippingData = (data: ShippingFormData): ValidationResult => {
    const errors: { field: string; message: string }[] = [];
    const warnings: { field: string; message: string }[] = [];

    // Standard field validation
    VALIDATION_RULES.forEach(rule => {
      const value = getNestedValue(data, rule.field);
      
      if (rule.required && (!value || value === '')) {
        errors.push({ field: rule.field, message: rule.message });
        return;
      }
      
      if (value) {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({ field: rule.field, message: rule.message });
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({ field: rule.field, message: rule.message });
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push({ field: rule.field, message: rule.message });
        }
        
        if (rule.validator && !rule.validator(value)) {
          errors.push({ field: rule.field, message: rule.message });
        }
      }
    });

    // Phone number validation (warnings for missing, errors for invalid format)
    const shipFromPhoneIssues = validatePhoneNumber(data.shipFrom?.phone, 'shipFrom.phone');
    const shipToPhoneIssues = validatePhoneNumber(data.shipTo?.phone, 'shipTo.phone');
    
    shipFromPhoneIssues.forEach(issue => {
      if (issue.message.includes('recommended')) {
        warnings.push(issue);
      } else {
        errors.push(issue);
      }
    });
    
    shipToPhoneIssues.forEach(issue => {
      if (issue.message.includes('recommended')) {
        warnings.push(issue);
      } else {
        errors.push(issue);
      }
    });

    // Postal code validation
    errors.push(...validatePostalCode(data.shipFrom?.zip, data.shipFrom?.country, 'shipFrom.zip'));
    errors.push(...validatePostalCode(data.shipTo?.zip, data.shipTo?.country, 'shipTo.zip'));

    // Package dimension validation
    warnings.push(...validatePackageDimensions(data.package));

    // Service-specific validation
    if (data.service?.carrier === 'UPS') {
      if (!data.shipFrom?.phone && !data.shipTo?.phone) {
        warnings.push({
          field: 'phone',
          message: 'UPS strongly recommends phone numbers for all shipments'
        });
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    setValidationResults(result);
    return result;
  };

  const validateField = (data: ShippingFormData, fieldPath: string): boolean => {
    const rule = VALIDATION_RULES.find(r => r.field === fieldPath);
    if (!rule) return true;

    const value = getNestedValue(data, fieldPath);
    
    if (rule.required && (!value || value === '')) {
      return false;
    }
    
    if (value) {
      if (rule.minLength && value.length < rule.minLength) return false;
      if (rule.maxLength && value.length > rule.maxLength) return false;
      if (rule.pattern && !rule.pattern.test(value)) return false;
      if (rule.validator && !rule.validator(value)) return false;
    }
    
    return true;
  };

  const getFieldError = (fieldPath: string): string | null => {
    const error = validationResults.errors.find(e => e.field === fieldPath);
    return error ? error.message : null;
  };

  const getFieldWarning = (fieldPath: string): string | null => {
    const warning = validationResults.warnings.find(w => w.field === fieldPath);
    return warning ? warning.message : null;
  };

  return {
    validateShippingData,
    validateField,
    getFieldError,
    getFieldWarning,
    validationResults,
    isValid: validationResults.isValid,
    hasWarnings: validationResults.warnings.length > 0
  };
}

// Helper function to get nested object values by string path
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}