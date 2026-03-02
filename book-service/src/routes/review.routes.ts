import { Router } from 'express';
import reviewController from '../controllers/review.controller';

const router = Router();

// Create review
router.post('/', reviewController.createReview.bind(reviewController));

// Get reviews for a book
router.get('/book/:bookId', reviewController.getBookReviews.bind(reviewController));

// Get user's reviews
router.get('/user/:userId', reviewController.getUserReviews.bind(reviewController));

// Get rating stats for a book
router.get('/stats/:bookId', reviewController.getBookAverageRating.bind(reviewController));

// Get single review
router.get('/:reviewId', reviewController.getReviewById.bind(reviewController));

// Update review
router.put('/:reviewId', reviewController.updateReview.bind(reviewController));

// Delete review
router.delete('/:reviewId', reviewController.deleteReview.bind(reviewController));

// Admin: Approve/reject review
router.patch('/:reviewId/approve', reviewController.approveReview.bind(reviewController));

export default router;
