import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';

class NotificationController {
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await NotificationService.getUserNotifications(userId, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async getUnreadNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const notifications = await NotificationService.getUnreadNotifications(userId);
      res.status(200).json({ notifications });
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      res.status(500).json({ error: 'Failed to fetch unread notifications' });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      const notification = await NotificationService.markAsRead(notificationId);

      if (!notification) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.status(200).json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const count = await NotificationService.markAllAsRead(userId);
      res.status(200).json({ message: `${count} notifications marked as read`, count });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;
      const deleted = await NotificationService.deleteNotification(notificationId);

      if (!deleted) {
        res.status(404).json({ error: 'Notification not found' });
        return;
      }

      res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  }
}

export default new NotificationController();
