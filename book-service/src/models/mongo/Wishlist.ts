import mongoose, { Schema, Document } from 'mongoose';

export interface IWishlistItem {
  bookId: string;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: string;
  username: string;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    items: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: 'Book',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

WishlistSchema.index({ userId: 1 });
WishlistSchema.index({ 'items.bookId': 1 });

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
