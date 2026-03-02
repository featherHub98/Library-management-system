export interface CreateNotificationDto {
  userId: string;
  type: 'book_available' | 'due_reminder' | 'overdue' | 'new_release' | 'reservation_ready' | 'general';
  title: string;
  message: string;
  bookId?: string;
  data?: Record<string, any>;
  sendEmail?: boolean;
}

export interface INotificationResponse {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  bookId?: string;
  isRead: boolean;
  sentVia: string[];
  createdAt: Date;
  readAt?: Date;
}
