import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  userId: string;
  username: string;
  bookId: string;
  position: number; // Queue position (1, 2, 3...)
  status: 'waiting' | 'ready' | 'notified' | 'cancelled';
  reservedDate: Date;
  readyDate?: Date;
  expiresAt?: Date; // When hold expires if not picked up
  notificationsSent: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['waiting', 'ready', 'notified', 'cancelled'],
      default: 'waiting',
    },
    reservedDate: {
      type: Date,
      default: Date.now,
    },
    readyDate: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    notificationsSent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ReservationSchema.index({ bookId: 1, status: 1, position: 1 });
ReservationSchema.index({ userId: 1, status: 1 });
ReservationSchema.index({ expiresAt: 1 });

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
