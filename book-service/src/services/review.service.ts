import Review from '../models/mongo/Review';
import { CreateReviewDto, UpdateReviewDto } from '../dtos/review.dto';
import { IReview, IReviewResponse } from '../interfaces/review.interface';

class ReviewService {
  async createReview(dto: CreateReviewDto): Promise<IReviewResponse> {
    const review = new Review({
      bookId: dto.bookId,
      userId: dto.userId,
      username: dto.username,
      rating: dto.rating,
      title: dto.title,
      text: dto.text,
      isApproved: true,
    });

    await review.save();
    return this.mapToResponse(review);
  }

  async getBookReviews(
    bookId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reviews: IReviewResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ bookId, isApproved: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ bookId, isApproved: true });

    return {
      reviews: reviews.map((r) => this.mapToResponse(r as IReview)),
      total,
      page,
      limit,
    };
  }

  async getReviewById(reviewId: string): Promise<IReviewResponse | null> {
    const review = await Review.findById(reviewId).lean();
    if (!review) return null;
    return this.mapToResponse(review as IReview);
  }

  async updateReview(
    reviewId: string,
    dto: UpdateReviewDto
  ): Promise<IReviewResponse | null> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { ...dto },
      { new: true }
    ).lean();

    if (!review) return null;
    return this.mapToResponse(review as IReview);
  }

  async deleteReview(reviewId: string): Promise<boolean> {
    const result = await Review.findByIdAndDelete(reviewId);
    return result !== null;
  }

  async updateReviewApproval(reviewId: string, isApproved: boolean): Promise<IReviewResponse | null> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved },
      { new: true }
    ).lean();

    if (!review) return null;
    return this.mapToResponse(review as IReview);
  }

  async getBookRatingStats(bookId: string): Promise<{
    averageRating: number;
    reviewCount: number;
    ratingDistribution: Record<number, number>;
  }> {
    const reviews = await Review.find({ bookId, isApproved: true }).lean();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        reviewCount: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((total / reviews.length).toFixed(1));

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      ratingDistribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
    });

    return {
      averageRating,
      reviewCount: reviews.length,
      ratingDistribution,
    };
  }

  async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    reviews: IReviewResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments({ userId });

    return {
      reviews: reviews.map((r) => this.mapToResponse(r as IReview)),
      total,
      page,
      limit,
    };
  }

  private mapToResponse(review: IReview): IReviewResponse {
    return {
      id: review._id?.toString() || '',
      bookId: review.bookId,
      userId: review.userId,
      username: review.username,
      rating: review.rating,
      title: review.title,
      text: review.text,
      isApproved: review.isApproved,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}

export default new ReviewService();
