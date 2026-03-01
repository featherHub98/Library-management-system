import { Document } from 'mongoose';

export type UserRole = 'admin' | 'public';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  resetCode?: string;
  resetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface IAuthService {
  login(username: string, password: string): Promise<{ token: string; user: IUserResponse }>;
  register(username: string, email: string, password: string): Promise<IUserResponse>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}