import { Router } from 'express';
import reservationController from '../controllers/reservation.controller';

const router = Router();

// Create and manage reservations
router.post('/', reservationController.createReservation.bind(reservationController));
router.get('/user/:userId', reservationController.getUserReservations.bind(reservationController));
router.get('/book/:bookId', reservationController.getBookReservations.bind(reservationController));
router.delete('/:reservationId', reservationController.cancelReservation.bind(reservationController));

// Admin endpoints
router.put('/:reservationId/ready', reservationController.markReservationAsReady.bind(reservationController));
router.put('/:reservationId/notified', reservationController.markReservationAsNotified.bind(reservationController));
router.get('/admin/expired', reservationController.getExpiredReservations.bind(reservationController));
router.post('/admin/cancel-expired', reservationController.cancelExpiredReservations.bind(reservationController));

export default router;
