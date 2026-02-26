import { Document } from 'mongoose';

export interface IBooking extends Document {
  bookId: string;
  userId?: string; // optional for now (could be member ID)
  startDate: Date;
  endDate: Date;
}
