import Notification, { INotification } from '../models/mongo/Notification';
import { CreateNotificationDto, INotificationResponse } from '../dtos/notification.dto';

class NotificationService {
  async createNotification(dto: CreateNotificationDto): Promise<INotificationResponse> {
    const sentVia: Array<'in_app' | 'email'> = ['in_app'];

    // Check user's notification preferences
    if (dto.sendEmail) {
      try {
        // Get user preferences (if available)
        // For now, we'll add email if requested
        sentVia.push('email');
      } catch (error) {
        console.error('Error checking user preferences:', error);
      }
    }

    const notification = new Notification({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      bookId: dto.bookId,
      data: dto.data,
      sentVia,
    });

    await notification.save();
    return this.mapToResponse(notification);
  }

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20): Promise<{
    notifications: INotificationResponse[];
    total: number;
    unread: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, isRead: false });

    return {
      notifications: notifications.map((n) => this.mapToResponse(n)),
      total,
      unread,
      page,
      limit,
    };
  }

  async getUnreadNotifications(userId: string): Promise<INotificationResponse[]> {
    const notifications = await Notification.find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .limit(50);

    return notifications.map((n) => this.mapToResponse(n));
  }

  async markAsRead(notificationId: string): Promise<INotificationResponse | null> {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) return null;
    return this.mapToResponse(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return result.modifiedCount || 0;
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    const result = await Notification.findByIdAndDelete(notificationId);
    return result !== null;
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }

  async sendBookAvailableNotification(userId: string, bookId: string, bookTitle: string): Promise<INotificationResponse> {
    return this.createNotification({
      userId,
      type: 'book_available',
      title: 'Book Available',
      message: `${bookTitle} is now available for checkout`,
      bookId,
      sendEmail: true,
    });
  }

  async sendDueReminderNotification(userId: string, bookId: string, bookTitle: string, daysLeft: number): Promise<INotificationResponse> {
    return this.createNotification({
      userId,
      type: 'due_reminder',
      title: 'Book Due Soon',
      message: `${bookTitle} is due in ${daysLeft} day(s)`,
      bookId,
      sendEmail: true,
      data: { daysLeft },
    });
  }

  async sendReservationReadyNotification(userId: string, bookId: string, bookTitle: string): Promise<INotificationResponse> {
    return this.createNotification({
      userId,
      type: 'reservation_ready',
      title: 'Reservation Ready',
      message: `Your reservation for ${bookTitle} is ready for pickup`,
      bookId,
      sendEmail: true,
    });
  }

  async sendOverdueNotification(userId: string, bookId: string, bookTitle: string, daysOverdue: number): Promise<INotificationResponse> {
    return this.createNotification({
      userId,
      type: 'overdue',
      title: 'Book Overdue',
      message: `${bookTitle} is ${daysOverdue} day(s) overdue. Please return it to avoid fines.`,
      bookId,
      sendEmail: true,
      data: { daysOverdue },
    });
  }

  async sendNewReleaseNotification(userId: string, bookId: string, bookTitle: string, author: string): Promise<INotificationResponse> {
    return this.createNotification({
      userId,
      type: 'new_release',
      title: 'New Release',
      message: `New book available: ${bookTitle} by ${author}`,
      bookId,
      data: { author },
    });
  }

  private mapToResponse(notification: INotification): INotificationResponse {
    return {
      id: notification._id?.toString() || '',
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      bookId: notification.bookId,
      isRead: notification.isRead,
      sentVia: notification.sentVia,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
    };
  }
}

export default new NotificationService();
