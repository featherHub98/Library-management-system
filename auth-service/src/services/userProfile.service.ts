import { UserModel, UserDocument } from '../models/mongo/User';
import { UpdateUserProfileDto, UpdateNotificationPreferencesDto, UserProfileResponse } from '../dtos/userProfile.dto';

class UserProfileService {
  async getUserProfile(userId: string): Promise<UserProfileResponse | null> {
    const user = await UserModel.findById(userId).lean();

    if (!user) return null;

    return this.mapToProfileResponse(user as any);
  }

  async updateUserProfile(userId: string, dto: UpdateUserProfileDto): Promise<UserProfileResponse | null> {
    const user = await UserModel.findByIdAndUpdate(userId, dto, { new: true }).lean();

    if (!user) return null;

    return this.mapToProfileResponse(user as any);
  }

  async updateNotificationPreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto
  ): Promise<UserProfileResponse | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'notificationPreferences.emailNotifications':
            dto.emailNotifications !== undefined ? dto.emailNotifications : undefined,
          'notificationPreferences.bookAvailable':
            dto.bookAvailable !== undefined ? dto.bookAvailable : undefined,
          'notificationPreferences.newReleases':
            dto.newReleases !== undefined ? dto.newReleases : undefined,
          'notificationPreferences.dueReminders':
            dto.dueReminders !== undefined ? dto.dueReminders : undefined,
        },
      },
      { new: true }
    ).lean();

    if (!user) return null;

    return this.mapToProfileResponse(user as any);
  }

  async deactivateAccount(userId: string): Promise<UserProfileResponse | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        isActive: false,
        deactivatedAt: new Date(),
      },
      { new: true }
    ).lean();

    if (!user) return null;

    return this.mapToProfileResponse(user as any);
  }

  async reactivateAccount(userId: string): Promise<UserProfileResponse | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        isActive: true,
        deactivatedAt: null,
      },
      { new: true }
    ).lean();

    if (!user) return null;

    return this.mapToProfileResponse(user as any);
  }

  async updateBooksReadCount(userId: string, increment: number): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $inc: { totalBooksRead: increment } }
    );

    return result.modifiedCount > 0;
  }

  async updateBooksRatingCount(userId: string, increment: number): Promise<boolean> {
    const result = await UserModel.updateOne(
      { _id: userId },
      { $inc: { totalBooksRating: increment } }
    );

    return result.modifiedCount > 0;
  }

  async getUserStatistics(userId: string): Promise<any> {
    const user = await UserModel.findById(userId).lean();

    if (!user) return null;

    const averageRating = user.totalBooksRating && user.totalBooksRead
      ? (user.totalBooksRating / user.totalBooksRead).toFixed(2)
      : 0;

    return {
      userId: user._id?.toString(),
      username: user.username,
      totalBooksRead: user.totalBooksRead || 0,
      totalBooksRating: user.totalBooksRating || 0,
      averageRating: parseFloat(averageRating as any),
      memberSince: user.memberSince,
    };
  }

  private mapToProfileResponse(user: any): UserProfileResponse {
    return {
      id: user._id?.toString() || '',
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      bio: user.bio,
      memberSince: user.memberSince,
      totalBooksRead: user.totalBooksRead,
      totalBooksRating: user.totalBooksRating,
      isActive: user.isActive,
      notificationPreferences: user.notificationPreferences,
    };
  }
}

export default new UserProfileService();
