import { supabase } from '@/integrations/supabase/client';
import { errorHandler, EnhancedError, ErrorContext } from './error-handler';
import { logger } from './logger';

export interface TransactionOperation {
  table: string;
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  data?: any;
  conditions?: Record<string, any>;
  rollbackData?: any;
}

export interface TransactionResult {
  success: boolean;
  results: any[];
  rollbackOperations: TransactionOperation[];
  error?: EnhancedError;
}

export class TransactionManager {
  private static instance: TransactionManager;
  private activeTransactions = new Map<string, TransactionOperation[]>();

  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  public async executeTransaction(
    operations: TransactionOperation[],
    context: ErrorContext
  ): Promise<TransactionResult> {
    const transactionId = crypto.randomUUID();
    const rollbackOperations: TransactionOperation[] = [];
    const results: any[] = [];

    this.activeTransactions.set(transactionId, operations);

    logger.info('transaction_start', `Starting transaction with ${operations.length} operations`, {
      correlationId: context.correlationId,
      transactionId,
      operationCount: operations.length
    });

    try {
      // Execute operations sequentially to maintain consistency
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        
        logger.info('transaction_operation', `Executing operation ${i + 1}/${operations.length}`, {
          correlationId: context.correlationId,
          transactionId,
          table: operation.table,
          operation: operation.operation
        });

        const result = await this.executeOperation(operation, context);
        results.push(result);

        // Prepare rollback operation
        const rollbackOp = await this.prepareRollbackOperation(operation, result);
        if (rollbackOp) {
          rollbackOperations.unshift(rollbackOp); // Add to front for reverse order
        }
      }

      this.activeTransactions.delete(transactionId);

      logger.success('transaction_complete', `Transaction completed successfully`, {
        correlationId: context.correlationId,
        transactionId,
        operationsExecuted: operations.length
      });

      return {
        success: true,
        results,
        rollbackOperations
      };

    } catch (error) {
      logger.error('transaction_failed', `Transaction failed, initiating rollback`, {
        correlationId: context.correlationId,
        transactionId,
        error: error instanceof Error ? error.message : String(error)
      });

      // Attempt rollback
      await this.rollback(rollbackOperations, context, transactionId);

      const enhancedError = new EnhancedError(
        `Transaction failed: ${error instanceof Error ? error.message : String(error)}`,
        context,
        error instanceof Error ? error : new Error(String(error)),
        false
      );

      this.activeTransactions.delete(transactionId);

      return {
        success: false,
        results,
        rollbackOperations,
        error: enhancedError
      };
    }
  }

  private async executeOperation(
    operation: TransactionOperation,
    context: ErrorContext
  ): Promise<any> {
    const { table, operation: op, data, conditions } = operation;

    try {
      switch (op) {
        case 'insert':
          const { data: insertData, error: insertError } = await supabase
            .from(table as any)
            .insert(data)
            .select();
          
          if (insertError) throw insertError;
          return insertData;

        case 'update':
          let updateQuery = supabase.from(table as any).update(data);
          
          if (conditions) {
            Object.entries(conditions).forEach(([key, value]) => {
              updateQuery = updateQuery.eq(key, value);
            });
          }
          
          const { data: updateData, error: updateError } = await updateQuery.select();
          
          if (updateError) throw updateError;
          return updateData;

        case 'delete':
          let deleteQuery = supabase.from(table as any).delete();
          
          if (conditions) {
            Object.entries(conditions).forEach(([key, value]) => {
              deleteQuery = deleteQuery.eq(key, value);
            });
          }
          
          const { data: deleteData, error: deleteError } = await deleteQuery.select();
          
          if (deleteError) throw deleteError;
          return deleteData;

        case 'upsert':
          const { data: upsertData, error: upsertError } = await supabase
            .from(table as any)
            .upsert(data)
            .select();
          
          if (upsertError) throw upsertError;
          return upsertData;

        default:
          throw new Error(`Unsupported operation: ${op}`);
      }
    } catch (error) {
      logger.error('transaction_operation_failed', `Operation ${op} failed on table ${table}`, {
        correlationId: context.correlationId,
        table,
        operation: op,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  private async prepareRollbackOperation(
    operation: TransactionOperation,
    result: any
  ): Promise<TransactionOperation | null> {
    if (!result || !Array.isArray(result) || result.length === 0) {
      return null;
    }

    const { table, operation: op } = operation;

    switch (op) {
      case 'insert':
        // Rollback: delete the inserted records
        return {
          table,
          operation: 'delete',
          conditions: { id: result[0].id }
        };

      case 'update':
        // Rollback: restore original values
        if (operation.rollbackData) {
          return {
            table,
            operation: 'update',
            data: operation.rollbackData,
            conditions: { id: result[0].id }
          };
        }
        return null;

      case 'delete':
        // Rollback: re-insert deleted records
        return {
          table,
          operation: 'insert',
          data: result[0]
        };

      case 'upsert':
        // Complex rollback logic needed based on whether it was insert or update
        return null;

      default:
        return null;
    }
  }

  private async rollback(
    rollbackOperations: TransactionOperation[],
    context: ErrorContext,
    transactionId: string
  ): Promise<void> {
    if (rollbackOperations.length === 0) {
      logger.info('rollback_skip', 'No rollback operations needed', {
        correlationId: context.correlationId,
        transactionId
      });
      return;
    }

    logger.info('rollback_start', `Starting rollback of ${rollbackOperations.length} operations`, {
      correlationId: context.correlationId,
      transactionId,
      rollbackCount: rollbackOperations.length
    });

    let rollbackErrors = 0;

    for (const rollbackOp of rollbackOperations) {
      try {
        await this.executeOperation(rollbackOp, context);
        logger.info('rollback_operation_success', `Rollback operation completed`, {
          correlationId: context.correlationId,
          transactionId,
          table: rollbackOp.table,
          operation: rollbackOp.operation
        });
      } catch (error) {
        rollbackErrors++;
        logger.error('rollback_operation_failed', `Rollback operation failed`, {
          correlationId: context.correlationId,
          transactionId,
          table: rollbackOp.table,
          operation: rollbackOp.operation,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    if (rollbackErrors > 0) {
      logger.error('rollback_partial_failure', `Rollback completed with ${rollbackErrors} failures`, {
        correlationId: context.correlationId,
        transactionId,
        totalOperations: rollbackOperations.length,
        failures: rollbackErrors
      });
    } else {
      logger.success('rollback_complete', 'All rollback operations completed successfully', {
        correlationId: context.correlationId,
        transactionId
      });
    }
  }

  public async withTransaction<T>(
    operations: TransactionOperation[],
    context: ErrorContext
  ): Promise<T> {
    const result = await this.executeTransaction(operations, context);
    
    if (!result.success) {
      throw result.error || new Error('Transaction failed');
    }

    return result.results as T;
  }
}

export const transactionManager = TransactionManager.getInstance();