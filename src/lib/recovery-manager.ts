import { supabase } from '@/integrations/supabase/client';
import { errorHandler, EnhancedError, ErrorContext } from './error-handler';
import { transactionManager, TransactionOperation } from './transaction-manager';
import { logger } from './logger';

export interface RecoveryStrategy {
  name: string;
  description: string;
  execute: () => Promise<boolean>;
  rollback?: () => Promise<void>;
}

export interface RecoveryResult {
  success: boolean;
  strategy: string;
  message: string;
  data?: any;
  nextSteps?: string[];
}

export class RecoveryManager {
  private static instance: RecoveryManager;

  public static getInstance(): RecoveryManager {
    if (!RecoveryManager.instance) {
      RecoveryManager.instance = new RecoveryManager();
    }
    return RecoveryManager.instance;
  }

  public async executeRecovery(
    strategies: RecoveryStrategy[],
    context: ErrorContext
  ): Promise<RecoveryResult> {
    logger.info('recovery_start', `Starting recovery with ${strategies.length} strategies`, {
      correlationId: context.correlationId,
      strategies: strategies.map(s => s.name)
    });

    for (const strategy of strategies) {
      try {
        logger.info('recovery_strategy_attempt', `Attempting strategy: ${strategy.name}`, {
          correlationId: context.correlationId,
          strategy: strategy.name,
          description: strategy.description
        });

        const success = await strategy.execute();

        if (success) {
          logger.success('recovery_strategy_success', `Strategy succeeded: ${strategy.name}`, {
            correlationId: context.correlationId,
            strategy: strategy.name
          });

          return {
            success: true,
            strategy: strategy.name,
            message: `Recovery successful using strategy: ${strategy.description}`,
            nextSteps: ['Monitor system stability', 'Review logs for root cause']
          };
        } else {
          logger.warning('recovery_strategy_failed', `Strategy failed: ${strategy.name}`, {
            correlationId: context.correlationId,
            strategy: strategy.name
          });
        }

      } catch (error) {
        logger.error('recovery_strategy_error', `Strategy error: ${strategy.name}`, {
          correlationId: context.correlationId,
          strategy: strategy.name,
          error: error instanceof Error ? error.message : String(error)
        });

        // Attempt rollback if available
        if (strategy.rollback) {
          try {
            await strategy.rollback();
            logger.info('recovery_rollback_success', `Rollback completed for strategy: ${strategy.name}`, {
              correlationId: context.correlationId,
              strategy: strategy.name
            });
          } catch (rollbackError) {
            logger.error('recovery_rollback_failed', `Rollback failed for strategy: ${strategy.name}`, {
              correlationId: context.correlationId,
              strategy: strategy.name,
              rollbackError: rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
            });
          }
        }
      }
    }

    return {
      success: false,
      strategy: 'none',
      message: 'All recovery strategies failed',
      nextSteps: [
        'Review system logs',
        'Check network connectivity',
        'Contact system administrator',
        'Consider manual intervention'
      ]
    };
  }

  public createSyncRecoveryStrategies(
    userId: string,
    marketplace: string,
    context: ErrorContext
  ): RecoveryStrategy[] {
    return [
      // Strategy 1: Simple database update without transaction manager
      {
        name: 'resume_sync',
        description: 'Resume sync from last known good state',
        execute: async () => {
          await supabase
            .from('marketplace_sync_status')
            .update({ 
              sync_status: 'pending',
              error_message: null,
              updated_at: new Date().toISOString()
            } as any)
            .eq('user_id', userId)
            .eq('marketplace_name', marketplace);
          return true;
        }
      },

      // Strategy 2: Reset and restart
      {
        name: 'reset_pagination',
        description: 'Reset pagination data and restart sync',
        execute: async () => {
          await Promise.all([
            supabase
              .from('marketplace_sync_status')
              .update({
                sync_status: 'pending',
                current_page: 1,
                last_page_info: null,
                updated_at: new Date().toISOString()
              } as any)
              .eq('user_id', userId)
              .eq('marketplace_name', marketplace),
            supabase
              .from('shopify_sync_status')
              .update({
                sync_status: 'idle',
                last_page_info: null,
                updated_at: new Date().toISOString()
              } as any)
              .eq('user_id', userId)
          ]);
          return true;
        }
      }
    ];
  }

  public async handleSyncFailure(
    userId: string,
    marketplace: string,
    error: Error,
    context: ErrorContext
  ): Promise<RecoveryResult> {
    // Log the failure
    await errorHandler.handleError(error, context);

    // Create recovery strategies
    const strategies = this.createSyncRecoveryStrategies(userId, marketplace, context);

    // Execute recovery
    return await this.executeRecovery(strategies, context);
  }
}

export const recoveryManager = RecoveryManager.getInstance();