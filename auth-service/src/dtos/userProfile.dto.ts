export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
}

export interface UpdateNotificationPreferencesDto {
  emailNotifications?: boolean;
  bookAvailable?: boolean;
  newReleases?: boolean;
  dueReminders?: boolean;
}

export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
  memberSince?: Date;
  totalBooksRead?: number;
  totalBooksRating?: number;
  isActive?: boolean;
  notificationPreferences?: {
    emailNotifications?: boolean;
    bookAvailable?: boolean;
    newReleases?: boolean;
    dueReminders?: boolean;
  };
}

export interface UserStatisticsResponse {
  userId: string;
  username: string;
  totalBooksRead: number;
  totalBooksRating: number;
  averageRating: number;
  memberSince: Date;
}
