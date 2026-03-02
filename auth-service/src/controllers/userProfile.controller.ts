import { Request, Response } from 'express';
import UserProfileService from '../services/userProfile.service';

class UserProfileController {
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await UserProfileService.getUserProfile(userId);

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { firstName, lastName, phoneNumber, profilePicture, bio } = req.body;

      const profile = await UserProfileService.updateUserProfile(userId, {
        firstName,
        lastName,
        phoneNumber,
        profilePicture,
        bio,
      });

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(profile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  }

  async updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { emailNotifications, bookAvailable, newReleases, dueReminders } = req.body;

      const profile = await UserProfileService.updateNotificationPreferences(userId, {
        emailNotifications,
        bookAvailable,
        newReleases,
        dueReminders,
      });

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(profile);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  }

  async deactivateAccount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await UserProfileService.deactivateAccount(userId);

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'Account deactivated', profile });
    } catch (error) {
      console.error('Error deactivating account:', error);
      res.status(500).json({ error: 'Failed to deactivate account' });
    }
  }

  async reactivateAccount(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const profile = await UserProfileService.reactivateAccount(userId);

      if (!profile) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'Account reactivated', profile });
    } catch (error) {
      console.error('Error reactivating account:', error);
      res.status(500).json({ error: 'Failed to reactivate account' });
    }
  }

  async getUserStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const stats = await UserProfileService.getUserStatistics(userId);

      if (!stats) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
    }
  }
}

export default new UserProfileController();
