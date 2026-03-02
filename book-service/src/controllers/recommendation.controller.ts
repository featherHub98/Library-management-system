import { Request, Response } from 'express';
import RecommendationService from '../services/recommendation.service';

class RecommendationController {
  async getPersonalizedRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const recommendations = await RecommendationService.getPersonalizedRecommendations(userId, limit);
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch personalized recommendations' });
    }
  }

  async getTrendingBooks(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const books = await RecommendationService.getTrendingBooks(limit);
      res.status(200).json({ books });
    } catch (error) {
      console.error('Error fetching trending books:', error);
      res.status(500).json({ error: 'Failed to fetch trending books' });
    }
  }

  async getSimilarUserRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const recommendations = await RecommendationService.getSimilarUserRecommendations(userId, limit);
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error fetching similar user recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch similar user recommendations' });
    }
  }

  async getAlsoBoughtRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const recommendations = await RecommendationService.getAlsoBoughtRecommendations(bookId, limit);
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error fetching also bought recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch also bought recommendations' });
    }
  }

  async getRecommendationsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;

      const recommendations = await RecommendationService.getRecommendationsByCategory(category, limit);
      res.status(200).json({ recommendations });
    } catch (error) {
      console.error('Error fetching category recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch category recommendations' });
    }
  }
}

export default new RecommendationController();
