export interface CreateReviewDto {
  bookId: string;
  userId: string;
  username: string;
  rating: number;
  title: string;
  text: string;
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  text?: string;
}

export interface ApproveReviewDto {
  isApproved: boolean;
}
