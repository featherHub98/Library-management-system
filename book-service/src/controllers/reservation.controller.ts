import { Request, Response } from 'express';
import ReservationService from '../services/reservation.service';

class ReservationController {
  async createReservation(req: Request, res: Response): Promise<void> {
    try {
      const { userId, username, bookId } = req.body;

      if (!userId || !username || !bookId) {
        res.status(400).json({ error: 'userId, username, and bookId are required' });
        return;
      }

      const reservation = await ReservationService.createReservation({
        userId,
        username,
        bookId,
      });

      res.status(201).json(reservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(500).json({ error: 'Failed to create reservation' });
    }
  }

  async getUserReservations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const reservations = await ReservationService.getUserReservations(userId);
      res.status(200).json({ reservations });
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      res.status(500).json({ error: 'Failed to fetch user reservations' });
    }
  }

  async getBookReservations(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const reservations = await ReservationService.getBookReservations(bookId);
      res.status(200).json({ reservations });
    } catch (error) {
      console.error('Error fetching book reservations:', error);
      res.status(500).json({ error: 'Failed to fetch book reservations' });
    }
  }

  async cancelReservation(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const reservation = await ReservationService.cancelReservation(reservationId, userId);

      if (!reservation) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }

      res.status(200).json(reservation);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  }

  async markReservationAsReady(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;

      const reservation = await ReservationService.markReservationAsReady(reservationId);

      if (!reservation) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }

      res.status(200).json(reservation);
    } catch (error) {
      console.error('Error marking reservation as ready:', error);
      res.status(500).json({ error: 'Failed to mark reservation as ready' });
    }
  }

  async getExpiredReservations(req: Request, res: Response): Promise<void> {
    try {
      const reservations = await ReservationService.getExpiredReservations();
      res.status(200).json({ reservations });
    } catch (error) {
      console.error('Error fetching expired reservations:', error);
      res.status(500).json({ error: 'Failed to fetch expired reservations' });
    }
  }

  async markReservationAsNotified(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;

      const reservation = await ReservationService.markReservationAsNotified(reservationId);

      if (!reservation) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }

      res.status(200).json(reservation);
    } catch (error) {
      console.error('Error marking reservation as notified:', error);
      res.status(500).json({ error: 'Failed to mark reservation as notified' });
    }
  }

  async cancelExpiredReservations(req: Request, res: Response): Promise<void> {
    try {
      const count = await ReservationService.cancelExpiredReservations();
      res.status(200).json({ message: `${count} expired reservations cancelled`, count });
    } catch (error) {
      console.error('Error cancelling expired reservations:', error);
      res.status(500).json({ error: 'Failed to cancel expired reservations' });
    }
  }
}

export default new ReservationController();
