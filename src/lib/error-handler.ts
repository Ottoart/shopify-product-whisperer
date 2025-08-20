import { logger } from './logger';
import { supabase } from '@/integrations/supabase/client';

export interface ErrorContext {
  correlationId: string;
  operation: string;
  component: string;
  metadata?: Record<string, any>;
  userId?: string;
  timestamp: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export class EnhancedError extends Error {
  public readonly correlationId: string;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    context: Partial<ErrorContext>,
    originalError?: Error,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'EnhancedError';
    this.correlationId = context.correlationId || crypto.randomUUID();
    this.context = {
      correlationId: this.correlationId,
      operation: context.operation || 'unknown',
      component: context.component || 'unknown',
      metadata: context.metadata || {},
      userId: context.userId,
      timestamp: new Date().toISOString(),
    };
    this.originalError = originalError;
    this.isRetryable = isRetryable;
  }
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private circuitBreakers = new Map<string, { failures: number; lastFailure: number; isOpen: boolean }>();

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public async handleError(error: Error | EnhancedError, context: Partial<ErrorContext>): Promise<void> {
    const enhancedError = error instanceof EnhancedError 
      ? error 
      : new EnhancedError(error.message, context, error);

    // Log structured error
    await this.logStructuredError(enhancedError);

    // Update circuit breaker
    this.updateCircuitBreaker(enhancedError.context.operation, true);

    // Store error in database for analytics
    await this.storeError(enhancedError);
  }

  public async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context: ErrorContext
  ): Promise<T> {
    let lastError: Error;
    let attempt = 0;

    // Check circuit breaker
    if (this.isCircuitOpen(context.operation)) {
      throw new EnhancedError(
        `Circuit breaker is open for operation: ${context.operation}`,
        context,
        undefined,
        false
      );
    }

    while (attempt < config.maxAttempts) {
      try {
        const result = await operation();
        
        // Reset circuit breaker on success
        this.updateCircuitBreaker(context.operation, false);
        
        if (attempt > 0) {
          logger.info('retry_success', `Operation succeeded after ${attempt} retries`, {
            correlationId: context.correlationId,
            operation: context.operation,
            attempts: attempt + 1
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        const isRetryable = this.isRetryableError(error as Error, config.retryableErrors);
        
        if (attempt >= config.maxAttempts || !isRetryable) {
          await this.handleError(lastError, {
            ...context,
            metadata: { 
              ...context.metadata, 
              attempts: attempt,
              finalAttempt: true 
            }
          });
          throw new EnhancedError(
            `Operation failed after ${attempt} attempts: ${lastError.message}`,
            context,
            lastError,
            false
          );
        }

        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
          config.maxDelay
        );

        logger.warning('retry_attempt', `Attempt ${attempt} failed, retrying in ${delay}ms`, {
          correlationId: context.correlationId,
          operation: context.operation,
          error: lastError.message,
          nextDelay: delay
        });

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  private async logStructuredError(error: EnhancedError): Promise<void> {
    logger.error('structured_error', error.message, {
      correlationId: error.correlationId,
      operation: error.context.operation,
      component: error.context.component,
      metadata: error.context.metadata,
      userId: error.context.userId,
      stack: error.stack,
      originalError: error.originalError?.message,
      isRetryable: error.isRetryable
    });
  }

  private async storeError(error: EnhancedError): Promise<void> {
    try {
      // Store in audit_logs instead since error_logs table doesn't exist
      await supabase.from('audit_logs').insert({
        event_type: 'application_error',
        user_id: error.context.userId,
        details: {
          correlation_id: error.correlationId,
          error_message: error.message,
          error_context: JSON.parse(JSON.stringify(error.context)),
          stack_trace: error.stack || '',
          original_error: error.originalError?.message || '',
          is_retryable: error.isRetryable
        }
      });
    } catch (dbError) {
      // Fallback to console logging if database insert fails
      console.error('Failed to store error in database:', dbError);
    }
  }

  private isRetryableError(error: Error, retryableErrors?: string[]): boolean {
    const defaultRetryableErrors = [
      'fetch failed',
      'network error',
      'timeout',
      'connection refused',
      'rate limit',
      'service unavailable',
      'internal server error'
    ];

    const errorsToCheck = retryableErrors || defaultRetryableErrors;
    const errorMessage = error.message.toLowerCase();
    
    return errorsToCheck.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase())
    );
  }

  private updateCircuitBreaker(operation: string, isFailure: boolean): void {
    const breaker = this.circuitBreakers.get(operation) || {
      failures: 0,
      lastFailure: 0,
      isOpen: false
    };

    if (isFailure) {
      breaker.failures++;
      breaker.lastFailure = Date.now();
      breaker.isOpen = breaker.failures >= 5; // Open after 5 consecutive failures
    } else {
      breaker.failures = 0;
      breaker.isOpen = false;
    }

    this.circuitBreakers.set(operation, breaker);
  }

  private isCircuitOpen(operation: string): boolean {
    const breaker = this.circuitBreakers.get(operation);
    if (!breaker || !breaker.isOpen) return false;

    // Auto-reset after 5 minutes
    const resetTime = 5 * 60 * 1000;
    if (Date.now() - breaker.lastFailure > resetTime) {
      breaker.isOpen = false;
      breaker.failures = 0;
      this.circuitBreakers.set(operation, breaker);
      return false;
    }

    return true;
  }
}

export const errorHandler = ErrorHandler.getInstance();