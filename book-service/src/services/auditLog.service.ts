import AuditLog from '../models/mongo/AuditLog';
import { IAuditLog, IAuditLogFilter, AuditAction } from '../interfaces/auditLog.interface';

export interface LogActionData {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export class AuditLogService {
  /**
   * Log an action to the audit log
   * @param auditData - The audit log data
   */
  async logAction(auditData: LogActionData): Promise<void> {
    try {
      const auditLog = new AuditLog({
        action: auditData.action,
        entityType: auditData.entityType,
        entityId: auditData.entityId,
        details: auditData.details,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        userId: auditData.userId,
        timestamp: new Date()
      });
      
      await auditLog.save();
    } catch (error) {
      console.error('Failed to log audit action:', error);
      // Don't throw - audit logging should not break the main operation
    }
  }

  /**
   * Get audit logs with optional filters
   * @param filters - Optional filters for the query
   * @returns Array of audit logs
   */
  async getLogs(filters?: IAuditLogFilter): Promise<IAuditLog[]> {
    try {
      const query: any = {};
      
      if (filters) {
        if (filters.action) {
          query.action = filters.action;
        }
        if (filters.entityType) {
          query.entityType = filters.entityType;
        }
        if (filters.entityId) {
          query.entityId = filters.entityId;
        }
        if (filters.userId) {
          query.userId = filters.userId;
        }
        if (filters.startDate || filters.endDate) {
          query.timestamp = {};
          if (filters.startDate) {
            query.timestamp.$gte = filters.startDate;
          }
          if (filters.endDate) {
            query.timestamp.$lte = filters.endDate;
          }
        }
      }
      
      const page = filters?.page || 1;
      const limit = filters?.limit || 100;
      const skip = (page - 1) * limit;
      
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
      
      return logs;
    } catch (error) {
      throw new Error(`Error fetching audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get count of audit logs matching filters
   * @param filters - Optional filters for the query
   * @returns Count of matching audit logs
   */
  async getLogsCount(filters?: IAuditLogFilter): Promise<number> {
    try {
      const query: any = {};
      
      if (filters) {
        if (filters.action) {
          query.action = filters.action;
        }
        if (filters.entityType) {
          query.entityType = filters.entityType;
        }
        if (filters.entityId) {
          query.entityId = filters.entityId;
        }
        if (filters.userId) {
          query.userId = filters.userId;
        }
        if (filters.startDate || filters.endDate) {
          query.timestamp = {};
          if (filters.startDate) {
            query.timestamp.$gte = filters.startDate;
          }
          if (filters.endDate) {
            query.timestamp.$lte = filters.endDate;
          }
        }
      }
      
      return await AuditLog.countDocuments(query);
    } catch (error) {
      throw new Error(`Error counting audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get audit logs for a specific entity
   * @param entityType - The type of entity
   * @param entityId - The ID of the entity
   * @returns Array of audit logs for the entity
   */
  async getEntityLogs(entityType: string, entityId: string): Promise<IAuditLog[]> {
    return this.getLogs({ entityType, entityId });
  }

  /**
   * Delete old audit logs (cleanup)
   * @param olderThanDays - Delete logs older than this many days
   * @returns Number of deleted logs
   */
  async deleteOldLogs(olderThanDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate }
      });
      
      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(`Error deleting old audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new AuditLogService();
