import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

export interface AuditLogEntry {
  event_type: string;
  user_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditLogger {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async log(entry: AuditLogEntry) {
    try {
      const { error } = await this.supabase
        .from('audit_logs')
        .insert({
          event_type: entry.event_type,
          user_id: entry.user_id,
          details: entry.details,
          ip_address: entry.ip_address,
          user_agent: entry.user_agent,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  async logAuthEvent(eventType: string, userId: string, details: Record<string, any> = {}) {
    await this.log({
      event_type: `auth.${eventType}`,
      user_id: userId,
      details,
    });
  }

  async logPermissionCheck(userId: string, permission: string, resource: string, granted: boolean) {
    await this.log({
      event_type: 'permission.check',
      user_id: userId,
      details: {
        permission,
        resource,
        granted,
      },
    });
  }

  async logSecurityViolation(eventType: string, details: Record<string, any> = {}) {
    await this.log({
      event_type: `security.${eventType}`,
      details,
    });
  }
}