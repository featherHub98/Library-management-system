import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';

const router = Router();

// GET endpoints for analytics
router.get('/popular-books', (req, res) =>
  analyticsController.getPopularBooks(req, res)
);
router.get('/member-statistics', (req, res) =>
  analyticsController.getMemberStatistics(req, res)
);
router.get('/inventory-metrics', (req, res) =>
  analyticsController.getInventoryMetrics(req, res)
);
router.get('/fine-metrics', (req, res) =>
  analyticsController.getFineMetrics(req, res)
);
router.get('/top-genres', (req, res) =>
  analyticsController.getTopGenres(req, res)
);
router.get('/top-authors', (req, res) =>
  analyticsController.getTopAuthors(req, res)
);
router.get('/borrowing-trend', (req, res) =>
  analyticsController.getBorrowingTrend(req, res)
);
router.get('/dashboard-overview', (req, res) =>
  analyticsController.getDashboardOverview(req, res)
);

export default router;
