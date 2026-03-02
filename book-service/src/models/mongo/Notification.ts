import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  type: 'book_available' | 'due_reminder' | 'overdue' | 'new_release' | 'reservation_ready' | 'general';
  title: string;
  message: string;
  bookId?: string;
  data?: Record<string, any>;
  isRead: boolean;
  sentVia: Array<'in_app' | 'email'>;
  createdAt: Date;
  readAt?: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['book_available', 'due_reminder', 'overdue', 'new_release', 'reservation_ready', 'general'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
    },
    data: {
      type: Schema.Types.Mixed,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentVia: [
      {
        type: String,
        enum: ['in_app', 'email'],
      },
    ],
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
