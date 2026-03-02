import { Request, Response } from 'express';
import SearchService from '../services/search.service';

class SearchController {
  async advancedSearch(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        categories,
        author,
        language,
        minPrice,
        maxPrice,
        publicationYearStart,
        publicationYearEnd,
        minRating,
        inStock,
        format,
        sort,
      } = req.query;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const query = {
        search: search as string,
        categories: Array.isArray(categories) ? (categories as string[]) : categories ? [categories as string] : undefined,
        author: author as string,
        language: language as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        publicationYearStart: publicationYearStart ? parseInt(publicationYearStart as string) : undefined,
        publicationYearEnd: publicationYearEnd ? parseInt(publicationYearEnd as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        inStock: inStock ? inStock === 'true' : undefined,
        format: format as 'ebook' | 'physical' | undefined,
        sort: sort as 'relevance' | 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'rating' | undefined,
      };

      const result = await SearchService.advancedSearch(query, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error performing advanced search:', error);
      res.status(500).json({ error: 'Failed to perform advanced search' });
    }
  }

  async getBooksByGenre(req: Request, res: Response): Promise<void> {
    try {
      const { genre } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await SearchService.getBooksByGenre(genre, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching books by genre:', error);
      res.status(500).json({ error: 'Failed to fetch books by genre' });
    }
  }

  async getAuthorBooks(req: Request, res: Response): Promise<void> {
    try {
      const { author } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await SearchService.getAuthorBooks(author, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching author books:', error);
      res.status(500).json({ error: 'Failed to fetch author books' });
    }
  }

  async getSeriesBooks(req: Request, res: Response): Promise<void> {
    try {
      const { series } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await SearchService.getSeriesBooks(series, page, limit);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching series books:', error);
      res.status(500).json({ error: 'Failed to fetch series books' });
    }
  }

  async searchByISBN(req: Request, res: Response): Promise<void> {
    try {
      const { isbn } = req.params;

      const book = await SearchService.searchByISBN(isbn);

      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      res.status(200).json(book);
    } catch (error) {
      console.error('Error searching by ISBN:', error);
      res.status(500).json({ error: 'Failed to search by ISBN' });
    }
  }

  async searchByBarcode(req: Request, res: Response): Promise<void> {
    try {
      const { barcode } = req.params;

      const book = await SearchService.searchByBarcode(barcode);

      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      res.status(200).json(book);
    } catch (error) {
      console.error('Error searching by barcode:', error);
      res.status(500).json({ error: 'Failed to search by barcode' });
    }
  }

  async getNewReleases(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      const books = await SearchService.getNewReleases(limit);
      res.status(200).json({ books });
    } catch (error) {
      console.error('Error fetching new releases:', error);
      res.status(500).json({ error: 'Failed to fetch new releases' });
    }
  }

  async getFilterOptions(req: Request, res: Response): Promise<void> {
    try {
      const options = await SearchService.getFilterOptions();
      res.status(200).json(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({ error: 'Failed to fetch filter options' });
    }
  }
}

export default new SearchController();
