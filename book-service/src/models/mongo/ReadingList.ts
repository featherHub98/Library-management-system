import mongoose, { Schema, Document } from 'mongoose';

export interface IReadingListItem {
  bookId: string;
  status: 'want_to_read' | 'reading' | 'finished';
  rating?: number;
  notes?: string;
  addedAt: Date;
  finishedAt?: Date;
}

export interface IReadingList extends Document {
  userId: string;
  username: string;
  name: string;
  description?: string;
  items: IReadingListItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingListSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        status: {
          type: String,
          enum: ['want_to_read', 'reading', 'finished'],
          default: 'want_to_read',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        notes: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
        finishedAt: Date,
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ReadingListSchema.index({ userId: 1 });
ReadingListSchema.index({ 'items.bookId': 1 });
ReadingListSchema.index({ isPublic: 1 });

export default mongoose.model<IReadingList>('ReadingList', ReadingListSchema);
