import { IBooking } from '../interfaces/booking.interface';
import Booking from '../models/mongo/Booking';
import Book from '../models/mongo/Book';

export class BookingService {
  async createBooking(bookId: string, startDate: Date, endDate: Date, userId?: string): Promise<IBooking> {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    if (book.format !== 'physical') {
      throw new Error('Only physical books can be booked');
    }

    const overlapping = await Booking.findOne({
      bookId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });
    if (overlapping) {
      throw new Error('Book is already booked for the given period');
    }

    const booking = new Booking({ bookId, startDate, endDate, userId });
    return await booking.save();
  }

  async getBookingsForBook(bookId: string): Promise<IBooking[]> {
    return await Booking.find({ bookId }).sort({ startDate: 1 });
  }

  async isBookAvailable(bookId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const overlap = await Booking.findOne({
      bookId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });
    return !overlap;
  }
}

export default new BookingService();
