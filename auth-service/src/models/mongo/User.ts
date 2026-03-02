import { Schema, model, Document } from 'mongoose';

export type UserAttributes = {
  _id?: string;
  id?: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'public';
  resetCode?: string;
  resetExpires?: Date;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
  memberSince?: Date;
  totalBooksRead?: number;
  totalBooksRating?: number;
  isActive?: boolean;
  deactivatedAt?: Date;
  notificationPreferences?: {
    emailNotifications?: boolean;
    bookAvailable?: boolean;
    newReleases?: boolean;
    dueReminders?: boolean;
  };
};

export type UserDocument = UserAttributes & Document;

const userSchema = new Schema<UserDocument>(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    role: {
      type: String,
      enum: ['admin', 'public'],
      required: true,
      default: 'public'
    },
    resetCode: {
      type: String,
    },
    resetExpires: {
      type: Date,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    bio: {
      type: String,
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    totalBooksRead: {
      type: Number,
      default: 0,
    },
    totalBooksRating: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
    },
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      bookAvailable: {
        type: Boolean,
        default: true,
      },
      newReleases: {
        type: Boolean,
        default: true,
      },
      dueReminders: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: false }
);

userSchema.virtual('id').get(function() {
  return this._id?.toString();
});

userSchema.set('toJSON', { virtuals: true });

export const UserModel = model<UserDocument>('User', userSchema);