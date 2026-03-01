import mongoose, { Schema, Document } from 'mongoose';
import { IAuditLog, AuditAction } from '../../interfaces/auditLog.interface';

const AuditLogSchema: Schema = new Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'READ'] as AuditAction[]
  },
  entityType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  entityId: {
    type: String,
    required: false,
    trim: true
  },
  details: {
    type: Schema.Types.Mixed,
    required: false
  },
  ipAddress: {
    type: String,
    required: false,
    trim: true
  },
  userAgent: {
    type: String,
    required: false,
    trim: true
  },
  userId: {
    type: String,
    required: false,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: false
});

// Indexes for faster queries
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1 });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
