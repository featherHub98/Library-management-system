import { Router } from 'express';
import recommendationController from '../controllers/recommendation.controller';

const router = Router();

router.get('/personalized/:userId', recommendationController.getPersonalizedRecommendations.bind(recommendationController));
router.get('/trending', recommendationController.getTrendingBooks.bind(recommendationController));
router.get('/similar-users/:userId', recommendationController.getSimilarUserRecommendations.bind(recommendationController));
router.get('/also-bought/:bookId', recommendationController.getAlsoBoughtRecommendations.bind(recommendationController));
router.get('/by-category/:category', recommendationController.getRecommendationsByCategory.bind(recommendationController));

export default router;
