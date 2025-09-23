export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  details?: any;
  user_id: string;
}

class Logger {
  private getUserId(): string | null {
    // Try to get user from localStorage or sessionStorage
    const session = localStorage.getItem('sb-rtaomiqsnctigleqjojt-auth-token') || 
                   sessionStorage.getItem('sb-rtaomiqsnctigleqjojt-auth-token');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        return parsed?.user?.id || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private addLog(level: LogEntry['level'], category: string, message: string, details?: any) {
    const userId = this.getUserId();
    if (!userId) return;

    const log: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details,
      user_id: userId
    };

    try {
      const existingLogs = localStorage.getItem(`logs_${userId}`);
      const logs: LogEntry[] = existingLogs ? JSON.parse(existingLogs) : [];
      
      // Keep only the last 1000 logs
      logs.unshift(log);
      if (logs.length > 1000) {
        logs.splice(1000);
      }
      
      localStorage.setItem(`logs_${userId}`, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  }

  info(category: string, message: string, details?: any) {
    console.info(`[${category}] ${message}`, details);
    this.addLog('info', category, message, details);
  }

  warning(category: string, message: string, details?: any) {
    console.warn(`[${category}] ${message}`, details);
    this.addLog('warning', category, message, details);
  }

  error(category: string, message: string, details?: any) {
    console.error(`[${category}] ${message}`, details);
    this.addLog('error', category, message, details);
  }

  success(category: string, message: string, details?: any) {
    console.log(`[${category}] ${message}`, details);
    this.addLog('success', category, message, details);
  }
}

export const logger = new Logger();
