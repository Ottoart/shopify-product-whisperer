import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface PhoneNumberValidatorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  description?: string;
}

export function PhoneNumberValidator({
  label,
  value,
  onChange,
  required = false,
  placeholder = "e.g., +1-555-123-4567",
  description
}: PhoneNumberValidatorProps) {
  const [isValid, setIsValid] = useState(false);
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (!value) {
      setIsValid(false);
      setFormatted("");
      return;
    }

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Check if it's a valid phone number length
    const isValidLength = digits.length >= 10 && digits.length <= 15;
    setIsValid(isValidLength);

    // Format the phone number for display
    if (digits.length >= 10) {
      if (digits.length === 10) {
        // US/Canada format: (555) 123-4567
        setFormatted(`(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`);
      } else if (digits.length === 11 && digits.startsWith('1')) {
        // US/Canada with country code: +1 (555) 123-4567
        setFormatted(`+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`);
      } else {
        // International format: +XX XXX XXX XXXX
        setFormatted(`+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -7)} ${digits.slice(-7, -4)} ${digits.slice(-4)}`);
      }
    } else {
      setFormatted(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={`phone-${label}`} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {value && (
          <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
            {isValid ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Valid
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Invalid
              </>
            )}
          </Badge>
        )}
      </div>
      
      <Input
        id={`phone-${label}`}
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${!isValid && value ? 'border-destructive' : ''}`}
      />
      
      {value && formatted !== value && (
        <p className="text-xs text-muted-foreground">
          Formatted: {formatted}
        </p>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {required && !value && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Phone number is required for UPS shipments
        </p>
      )}
    </div>
  );
}