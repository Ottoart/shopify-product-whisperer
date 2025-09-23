import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidationResult } from "@/hooks/useShippingValidation";

interface EnhancedValidationDisplayProps {
  validation: ValidationResult;
  onFixField?: (fieldPath: string) => void;
  showSuccessMessage?: boolean;
}

export function EnhancedValidationDisplay({
  validation,
  onFixField,
  showSuccessMessage = true
}: EnhancedValidationDisplayProps) {
  if (validation.isValid && validation.warnings.length === 0) {
    return showSuccessMessage ? (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Validation Passed</AlertTitle>
        <AlertDescription className="text-green-700">
          All shipping information is valid and ready for processing.
        </AlertDescription>
      </Alert>
    ) : null;
  }

  const getFieldDisplayName = (fieldPath: string): string => {
    const fieldNames: { [key: string]: string } = {
      'shipFrom.name': 'Ship From Name',
      'shipFrom.address': 'Ship From Address',
      'shipFrom.city': 'Ship From City',
      'shipFrom.state': 'Ship From State/Province',
      'shipFrom.zip': 'Ship From Postal Code',
      'shipFrom.country': 'Ship From Country',
      'shipFrom.phone': 'Ship From Phone',
      'shipTo.name': 'Ship To Name',
      'shipTo.address': 'Ship To Address',
      'shipTo.city': 'Ship To City',
      'shipTo.state': 'Ship To State/Province',
      'shipTo.zip': 'Ship To Postal Code',
      'shipTo.country': 'Ship To Country',
      'shipTo.phone': 'Ship To Phone',
      'package.weight': 'Package Weight',
      'package.length': 'Package Length',
      'package.width': 'Package Width',
      'package.height': 'Package Height',
      'package.dimensions': 'Package Dimensions',
      'phone': 'Phone Numbers'
    };
    
    return fieldNames[fieldPath] || fieldPath;
  };

  const groupIssuesBySection = (issues: { field: string; message: string }[]) => {
    const sections: { [key: string]: { field: string; message: string }[] } = {
      'Ship From': [],
      'Ship To': [],
      'Package': [],
      'Other': []
    };

    issues.forEach(issue => {
      if (issue.field.startsWith('shipFrom')) {
        sections['Ship From'].push(issue);
      } else if (issue.field.startsWith('shipTo')) {
        sections['Ship To'].push(issue);
      } else if (issue.field.startsWith('package')) {
        sections['Package'].push(issue);
      } else {
        sections['Other'].push(issue);
      }
    });

    return sections;
  };

  const errorSections = groupIssuesBySection(validation.errors);
  const warningSections = groupIssuesBySection(validation.warnings);

  return (
    <div className="space-y-4">
      {/* Errors */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Validation Errors
            <Badge variant="destructive" className="text-xs">
              {validation.errors.length} issue{validation.errors.length !== 1 ? 's' : ''}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-3 space-y-3">
              {Object.entries(errorSections).map(([section, issues]) => {
                if (issues.length === 0) return null;
                
                return (
                  <div key={section}>
                    <h4 className="font-medium text-sm mb-2">{section}:</h4>
                    <ul className="space-y-1">
                      {issues.map((issue, index) => (
                        <li key={index} className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="text-destructive mt-1">•</span>
                            <div>
                              <div className="text-sm">{getFieldDisplayName(issue.field)}</div>
                              <div className="text-xs text-muted-foreground">{issue.message}</div>
                            </div>
                          </div>
                          {onFixField && (
                            <Button
                              onClick={() => onFixField(issue.field)}
                              variant="outline"
                              size="sm"
                              className="ml-2 h-6 text-xs"
                            >
                              Fix
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Recommendations
            <Badge variant="secondary" className="text-xs">
              {validation.warnings.length} suggestion{validation.warnings.length !== 1 ? 's' : ''}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-3 space-y-3">
              {Object.entries(warningSections).map(([section, issues]) => {
                if (issues.length === 0) return null;
                
                return (
                  <div key={section}>
                    <h4 className="font-medium text-sm mb-2">{section}:</h4>
                    <ul className="space-y-1">
                      {issues.map((issue, index) => (
                        <li key={index} className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <div>
                              <div className="text-sm">{getFieldDisplayName(issue.field)}</div>
                              <div className="text-xs text-muted-foreground">{issue.message}</div>
                            </div>
                          </div>
                          {onFixField && (
                            <Button
                              onClick={() => onFixField(issue.field)}
                              variant="outline"
                              size="sm"
                              className="ml-2 h-6 text-xs"
                            >
                              Improve
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validation Summary</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-muted-foreground">
              {validation.errors.length > 0 && (
                <div>✗ {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''} must be fixed before shipping</div>
              )}
              {validation.warnings.length > 0 && (
                <div>⚠ {validation.warnings.length} recommendation{validation.warnings.length !== 1 ? 's' : ''} for better service</div>
              )}
              {validation.isValid && (
                <div>✓ Ready to proceed with shipping rate calculation</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}