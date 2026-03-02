import { Router } from 'express';
import notificationController from '../controllers/notification.controller';

const router = Router();

router.get('/:userId', notificationController.getUserNotifications.bind(notificationController));
router.get('/:userId/unread', notificationController.getUnreadNotifications.bind(notificationController));
router.put('/:notificationId/read', notificationController.markAsRead.bind(notificationController));
router.put('/:userId/read-all', notificationController.markAllAsRead.bind(notificationController));
router.delete('/:notificationId', notificationController.deleteNotification.bind(notificationController));

export default router;
