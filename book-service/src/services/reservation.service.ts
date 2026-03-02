import Reservation, { IReservation } from '../models/mongo/Reservation';
import { CreateReservationDto, IReservationResponse, RESERVATION_HOLD_DAYS, RESERVATION_EXPIRY_DAYS } from '../dtos/reservation.dto';

class ReservationService {
  async createReservation(dto: CreateReservationDto): Promise<IReservationResponse> {
    // Get the next position in queue
    const lastReservation = await Reservation.findOne({ bookId: dto.bookId })
      .sort({ position: -1 });

    const position = (lastReservation?.position || 0) + 1;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RESERVATION_EXPIRY_DAYS);

    const reservation = new Reservation({
      userId: dto.userId,
      username: dto.username,
      bookId: dto.bookId,
      position,
      status: 'waiting',
      expiresAt,
    });

    await reservation.save();
    return this.mapToResponse(reservation);
  }

  async getUserReservations(userId: string): Promise<IReservationResponse[]> {
    const reservations = await Reservation.find({
      userId,
      status: { $ne: 'cancelled' },
    }).sort({ position: 1 });

    return reservations.map((r) => this.mapToResponse(r));
  }

  async getBookReservations(bookId: string): Promise<IReservationResponse[]> {
    const reservations = await Reservation.find({
      bookId,
      status: { $ne: 'cancelled' },
    }).sort({ position: 1 });

    return reservations.map((r) => this.mapToResponse(r));
  }

  async cancelReservation(reservationId: string, userId: string): Promise<IReservationResponse | null> {
    const reservation = await Reservation.findOne({
      _id: reservationId,
      userId,
    });

    if (!reservation) return null;

    reservation.status = 'cancelled';
    await reservation.save();

    // Reposition remaining reservations
    await this.repositionQueue(reservation.bookId);

    return this.mapToResponse(reservation);
  }

  async markReservationAsReady(reservationId: string): Promise<IReservationResponse | null> {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      {
        status: 'ready',
        readyDate: new Date(),
      },
      { new: true }
    );

    if (!reservation) return null;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RESERVATION_HOLD_DAYS);
    reservation.expiresAt = expiresAt;
    await reservation.save();

    return this.mapToResponse(reservation);
  }

  async getReservationByPosition(bookId: string, position: number): Promise<IReservationResponse | null> {
    const reservation = await Reservation.findOne({
      bookId,
      position,
      status: { $ne: 'cancelled' },
    });

    if (!reservation) return null;
    return this.mapToResponse(reservation);
  }

  async getExpiredReservations(): Promise<IReservationResponse[]> {
    const reservations = await Reservation.find({
      status: { $in: ['ready', 'notified'] },
      expiresAt: { $lt: new Date() },
    });

    return reservations.map((r) => this.mapToResponse(r));
  }

  async markReservationAsNotified(reservationId: string): Promise<IReservationResponse | null> {
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      {
        $inc: { notificationsSent: 1 },
        status: 'notified',
      },
      { new: true }
    );

    if (!reservation) return null;
    return this.mapToResponse(reservation);
  }

  async cancelExpiredReservations(): Promise<number> {
    const result = await Reservation.deleteMany({
      status: { $in: ['ready', 'notified'] },
      expiresAt: { $lt: new Date() },
    });

    // Reposition all queues
    const allReservations = await Reservation.find({ status: { $ne: 'cancelled' } }).distinct('bookId');
    for (const bookId of allReservations) {
      await this.repositionQueue(bookId);
    }

    return result.deletedCount || 0;
  }

  private async repositionQueue(bookId: string): Promise<void> {
    const reservations = await Reservation.find({
      bookId,
      status: { $ne: 'cancelled' },
    }).sort({ createdAt: 1 });

    for (let i = 0; i < reservations.length; i++) {
      await Reservation.updateOne(
        { _id: reservations[i]._id },
        { position: i + 1 }
      );
    }
  }

  private mapToResponse(reservation: IReservation): IReservationResponse {
    return {
      id: reservation._id?.toString() || '',
      userId: reservation.userId,
      username: reservation.username,
      bookId: reservation.bookId,
      position: reservation.position,
      status: reservation.status,
      reservedDate: reservation.reservedDate,
      readyDate: reservation.readyDate,
      expiresAt: reservation.expiresAt,
      notificationsSent: reservation.notificationsSent,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }
}

export default new ReservationService();
