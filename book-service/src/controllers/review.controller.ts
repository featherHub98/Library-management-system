import { Request, Response } from 'express';
import ReviewService from '../services/review.service';

class ReviewController {
  // Create a new review
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const { bookId, userId, username, rating, title, text } = req.body;

      if (!bookId || !userId || !username || !rating || !title || !text) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const review = await ReviewService.createReview({
        bookId,
        userId,
        username,
        rating,
        title,
        text,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }

  // Get all reviews for a book
  async getBookReviews(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const reviews = await ReviewService.getBookReviews(bookId, page, limit);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  // Get review by ID
  async getReviewById(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const review = await ReviewService.getReviewById(reviewId);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json(review);
    } catch (error) {
      console.error('Error fetching review:', error);
      res.status(500).json({ error: 'Failed to fetch review' });
    }
  }

  // Update review
  async updateReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const { rating, title, text } = req.body;

      if (rating && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const review = await ReviewService.updateReview(reviewId, {
        rating,
        title,
        text,
      });

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json(review);
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Failed to update review' });
    }
  }

  // Delete review
  async deleteReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const deleted = await ReviewService.deleteReview(reviewId);

      if (!deleted) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  }

  // Get or update review approval (admin only)
  async approveReview(req: Request, res: Response): Promise<void> {
    try {
      const { reviewId } = req.params;
      const { isApproved } = req.body;

      if (typeof isApproved !== 'boolean') {
        res.status(400).json({ error: 'isApproved must be a boolean' });
        return;
      }

      const review = await ReviewService.updateReviewApproval(reviewId, isApproved);

      if (!review) {
        res.status(404).json({ error: 'Review not found' });
        return;
      }

      res.status(200).json(review);
    } catch (error) {
      console.error('Error approving review:', error);
      res.status(500).json({ error: 'Failed to approve review' });
    }
  }

  // Get average rating for a book
  async getBookAverageRating(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const stats = await ReviewService.getBookRatingStats(bookId);

      res.status(200).json(stats);
    } catch (error) {
      console.error('Error fetching book rating stats:', error);
      res.status(500).json({ error: 'Failed to fetch book rating stats' });
    }
  }

  // Get user's reviews
  async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const reviews = await ReviewService.getUserReviews(userId, page, limit);
      res.status(200).json(reviews);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      res.status(500).json({ error: 'Failed to fetch user reviews' });
    }
  }
}

export default new ReviewController();
