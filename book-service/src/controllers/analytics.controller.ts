import { Request, Response } from 'express';
import analyticsService from '../services/analytics.service';

class AnalyticsController {
  async getPopularBooks(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      if (isNaN(limit) || limit < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid limit parameter',
        });
        return;
      }

      const popularBooks = await analyticsService.getPopularBooks(limit);

      res.status(200).json({
        success: true,
        message: 'Popular books retrieved successfully',
        data: popularBooks,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch popular books',
      });
    }
  }

  async getMemberStatistics(req: Request, res: Response): Promise<void> {
    try {
      const memberStatistics = await analyticsService.getMemberStatistics();

      res.status(200).json({
        success: true,
        message: 'Member statistics retrieved successfully',
        data: memberStatistics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch member statistics',
      });
    }
  }

  async getInventoryMetrics(req: Request, res: Response): Promise<void> {
    try {
      const inventoryMetrics = await analyticsService.getInventoryMetrics();

      res.status(200).json({
        success: true,
        message: 'Inventory metrics retrieved successfully',
        data: inventoryMetrics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch inventory metrics',
      });
    }
  }

  async getFineMetrics(req: Request, res: Response): Promise<void> {
    try {
      const fineMetrics = await analyticsService.getFineMetrics();

      res.status(200).json({
        success: true,
        message: 'Fine metrics retrieved successfully',
        data: fineMetrics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch fine metrics',
      });
    }
  }

  async getTopGenres(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (isNaN(limit) || limit < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid limit parameter',
        });
        return;
      }

      const topGenres = await analyticsService.getTopGenres(limit);

      res.status(200).json({
        success: true,
        message: 'Top genres retrieved successfully',
        data: topGenres,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch top genres',
      });
    }
  }

  async getTopAuthors(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (isNaN(limit) || limit < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid limit parameter',
        });
        return;
      }

      const topAuthors = await analyticsService.getTopAuthors(limit);

      res.status(200).json({
        success: true,
        message: 'Top authors retrieved successfully',
        data: topAuthors,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch top authors',
      });
    }
  }

  async getBorrowingTrend(req: Request, res: Response): Promise<void> {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;

      if (isNaN(days) || days < 1) {
        res.status(400).json({
          success: false,
          message: 'Invalid days parameter',
        });
        return;
      }

      const borrowingTrend = await analyticsService.getBorrowingTrend(days);

      res.status(200).json({
        success: true,
        message: 'Borrowing trend retrieved successfully',
        data: borrowingTrend,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch borrowing trend',
      });
    }
  }

  async getDashboardOverview(req: Request, res: Response): Promise<void> {
    try {
      const dashboardOverview = await analyticsService.getDashboardOverview();

      res.status(200).json({
        success: true,
        message: 'Dashboard overview retrieved successfully',
        data: dashboardOverview,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch dashboard overview',
      });
    }
  }
}

export default new AnalyticsController();
