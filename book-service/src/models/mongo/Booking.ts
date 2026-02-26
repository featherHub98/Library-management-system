import mongoose, { Schema } from 'mongoose';
import { IBooking } from '../../interfaces/booking.interface';

const BookingSchema: Schema = new Schema({
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  userId: {
    type: String,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
