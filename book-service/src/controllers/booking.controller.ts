import { Request, Response, NextFunction } from 'express';
import BookingService from '../services/booking.service';

export class BookingController {
  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId } = req.params;
      const { startDate, endDate, userId } = req.body;

      if (!startDate || !endDate) {
        res.status(400).json({ success: false, error: 'Start and end date are required' });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        res.status(400).json({ success: false, error: 'Invalid date range' });
        return;
      }

      const booking = await BookingService.createBooking(bookId, start, end, userId);

      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  }

  async getBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId } = req.params;
      const bookings = await BookingService.getBookingsForBook(bookId);
      res.status(200).json({ success: true, data: bookings });
    } catch (err) {
      next(err);
    }
  }
}

export default new BookingController();
