export const RESERVATION_HOLD_DAYS = 3; // Days to hold a reserved book
export const RESERVATION_EXPIRY_DAYS = 30; // Days before reservation expires

export interface CreateReservationDto {
  userId: string;
  username: string;
  bookId: string;
}

export interface CancelReservationDto {
  userId: string;
  reservationId: string;
}

export interface IReservationResponse {
  id: string;
  userId: string;
  username: string;
  bookId: string;
  position: number;
  status: 'waiting' | 'ready' | 'notified' | 'cancelled';
  reservedDate: Date;
  readyDate?: Date;
  expiresAt?: Date;
  notificationsSent: number;
  createdAt: Date;
  updatedAt: Date;
}
