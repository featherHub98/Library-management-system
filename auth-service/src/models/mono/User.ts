// @ts-nocheck
import { Schema, model, Document } from 'mongoose';

export type UserAttributes = {
  _id?: string;
  id?: string;
  username: string;
  password: string;
  email: string;
  resetCode?: string;
  resetExpires?: Date;
};

export type UserDocument = UserAttributes & Document;

const userSchema = new Schema({
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
  resetCode: {
    type: String,
  },
  resetExpires: {
    type: Date,
  },
} as any, { timestamps: false });

userSchema.virtual('id').get(function() {
  return this._id?.toString();
});

userSchema.set('toJSON', { virtuals: true });

export const UserModel = model('User', userSchema);