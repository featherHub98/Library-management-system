import { Request, Response } from 'express';
import BulkOperationService from '../services/bulkOperation.service';

class BulkOperationController {
  async bulkImport(req: Request, res: Response): Promise<void> {
    try {
      const { books } = req.body;

      if (!Array.isArray(books) || books.length === 0) {
        res.status(400).json({ error: 'Books array is required and must not be empty' });
        return;
      }

      const result = await BulkOperationService.bulkImport(books);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error bulk importing books:', error);
      res.status(500).json({ error: 'Failed to bulk import books' });
    }
  }

  async bulkExport(req: Request, res: Response): Promise<void> {
    try {
      const { category, series, author } = req.query;

      const filters = {
        category: category as string | undefined,
        series: series as string | undefined,
        author: author as string | undefined,
      };

      const books = await BulkOperationService.bulkExport(filters);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="books.json"');
      res.status(200).json(books);
    } catch (error) {
      console.error('Error bulk exporting books:', error);
      res.status(500).json({ error: 'Failed to bulk export books' });
    }
  }

  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await BulkOperationService.getCategories();
      res.status(200).json({ categories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  async getSeries(req: Request, res: Response): Promise<void> {
    try {
      const series = await BulkOperationService.getSeries();
      res.status(200).json({ series });
    } catch (error) {
      console.error('Error fetching series:', error);
      res.status(500).json({ error: 'Failed to fetch series' });
    }
  }

  async getLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await BulkOperationService.getLanguages();
      res.status(200).json({ languages });
    } catch (error) {
      console.error('Error fetching languages:', error);
      res.status(500).json({ error: 'Failed to fetch languages' });
    }
  }

  async searchByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await BulkOperationService.searchByCategory(category, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error searching by category:', error);
      res.status(500).json({ error: 'Failed to search by category' });
    }
  }

  async searchBySeries(req: Request, res: Response): Promise<void> {
    try {
      const { series } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await BulkOperationService.searchBySeries(series, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error searching by series:', error);
      res.status(500).json({ error: 'Failed to search by series' });
    }
  }
}

export default new BulkOperationController();
