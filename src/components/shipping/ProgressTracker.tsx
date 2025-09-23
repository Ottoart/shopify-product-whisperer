import { useState, useEffect } from "react";
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  estimatedTime?: number; // in seconds
  actualTime?: number;
  errorMessage?: string;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStepId?: string;
  showProgress?: boolean;
  className?: string;
}

export function ProgressTracker({ 
  steps, 
  currentStepId, 
  showProgress = true, 
  className = "" 
}: ProgressTrackerProps) {
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

  // Track elapsed time for active steps
  useEffect(() => {
    const activeStep = steps.find(step => step.status === 'active');
    if (!activeStep) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTimes(prev => ({
        ...prev,
        [activeStep.id]: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [steps]);

  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepStatus = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {step.actualTime ? `${step.actualTime}s` : 'Done'}
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            {elapsedTimes[step.id] ? `${elapsedTimes[step.id]}s` : 'Running...'}
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            Error
          </Badge>
        );
      default:
        return step.estimatedTime ? (
          <Badge variant="outline" className="text-xs">
            ~{step.estimatedTime}s
          </Badge>
        ) : null;
    }
  };

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const hasError = steps.some(s => s.status === 'error');
  const isCompleted = completedSteps === totalSteps && !hasError;
  const activeStep = steps.find(s => s.status === 'active');

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {isCompleted ? 'Completed' : activeStep ? `Step ${completedSteps + 1} of ${totalSteps}` : 'Ready to start'}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${hasError ? 'bg-red-100' : ''}`}
          />
        </div>
      )}

      {/* Step List */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            {/* Step Number and Icon */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200">
                {getStepIcon(step)}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-px h-8 mt-2 ${
                  step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`text-sm font-medium ${
                    step.status === 'active' ? 'text-blue-900' : 
                    step.status === 'completed' ? 'text-green-900' :
                    step.status === 'error' ? 'text-red-900' :
                    'text-gray-900'
                  }`}>
                    {step.label}
                  </h4>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}
                  {step.status === 'error' && step.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">
                      {step.errorMessage}
                    </p>
                  )}
                </div>
                <div className="ml-2">
                  {getStepStatus(step)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {(isCompleted || hasError) && (
        <div className={`p-3 rounded-lg border ${
          isCompleted ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              isCompleted ? 'text-green-900' : 'text-red-900'
            }`}>
              {isCompleted ? 'Process completed successfully!' : 'Process failed with errors'}
            </span>
          </div>
          {isCompleted && (
            <p className="text-xs text-green-700 mt-1">
              Total time: {steps.reduce((acc, step) => acc + (step.actualTime || 0), 0)}s
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Hook for managing progress steps
export function useProgressTracker(initialSteps: Omit<ProgressStep, 'status'>[]) {
  const [steps, setSteps] = useState<ProgressStep[]>(
    initialSteps.map(step => ({ ...step, status: 'pending' as const }))
  );

  const setStepStatus = (stepId: string, status: ProgressStep['status'], errorMessage?: string) => {
    setSteps(current => 
      current.map(step => 
        step.id === stepId 
          ? { ...step, status, errorMessage }
          : step
      )
    );
  };

  const setStepActualTime = (stepId: string, actualTime: number) => {
    setSteps(current =>
      current.map(step =>
        step.id === stepId
          ? { ...step, actualTime }
          : step
      )
    );
  };

  const startStep = (stepId: string) => {
    setStepStatus(stepId, 'active');
  };

  const completeStep = (stepId: string, actualTime?: number) => {
    setStepStatus(stepId, 'completed');
    if (actualTime) {
      setStepActualTime(stepId, actualTime);
    }
  };

  const failStep = (stepId: string, errorMessage: string) => {
    setStepStatus(stepId, 'error', errorMessage);
  };

  const resetSteps = () => {
    setSteps(current =>
      current.map(step => ({ ...step, status: 'pending' as const, errorMessage: undefined, actualTime: undefined }))
    );
  };

  const getCurrentStep = () => {
    return steps.find(step => step.status === 'active');
  };

  const getNextStep = () => {
    const currentIndex = steps.findIndex(step => step.status === 'active');
    return currentIndex >= 0 && currentIndex < steps.length - 1 
      ? steps[currentIndex + 1] 
      : null;
  };

  return {
    steps,
    setStepStatus,
    setStepActualTime,
    startStep,
    completeStep,
    failStep,
    resetSteps,
    getCurrentStep,
    getNextStep
  };
}