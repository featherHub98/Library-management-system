import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  bookId: string;
  userId: string;
  username: string;
  rating: number; // 1-5
  title: string;
  text: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ bookId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1 });

export default mongoose.model<IReview>('Review', ReviewSchema);
