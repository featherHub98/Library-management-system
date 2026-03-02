import mongoose, { Schema, Document } from 'mongoose';

export interface IBorrowingRecord extends Document {
  userId: string;
  username: string;
  bookId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  fineAmount: number;
  finePaid: boolean;
  status: 'borrowed' | 'overdue' | 'returned';
  createdAt: Date;
  updatedAt: Date;
}

const BorrowingRecordSchema: Schema = new Schema(
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
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    fineAmount: {
      type: Number,
      default: 0,
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['borrowed', 'overdue', 'returned'],
      default: 'borrowed',
    },
  },
  {
    timestamps: true,
  }
);

BorrowingRecordSchema.index({ userId: 1, status: 1 });
BorrowingRecordSchema.index({ bookId: 1 });
BorrowingRecordSchema.index({ dueDate: 1 });

export default mongoose.model<IBorrowingRecord>('BorrowingRecord', BorrowingRecordSchema);
