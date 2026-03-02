import { Router } from 'express';
import userProfileController from '../controllers/userProfile.controller';

const router = Router();

// User profile endpoints
router.get('/:userId', userProfileController.getUserProfile.bind(userProfileController));
router.put('/:userId', userProfileController.updateUserProfile.bind(userProfileController));
router.put('/:userId/notifications', userProfileController.updateNotificationPreferences.bind(userProfileController));
router.post('/:userId/deactivate', userProfileController.deactivateAccount.bind(userProfileController));
router.post('/:userId/reactivate', userProfileController.reactivateAccount.bind(userProfileController));
router.get('/:userId/statistics', userProfileController.getUserStatistics.bind(userProfileController));

export default router;
