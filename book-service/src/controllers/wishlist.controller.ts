import { Request, Response } from 'express';
import WishlistService from '../services/wishlist.service';
import ReadingListService from '../services/readingList.service';

class WishlistController {
  // Wishlist endpoints
  async addToWishlist(req: Request, res: Response): Promise<void> {
    try {
      const { userId, username, bookId } = req.body;

      if (!userId || !username || !bookId) {
        res.status(400).json({ error: 'userId, username, and bookId are required' });
        return;
      }

      const wishlist = await WishlistService.addToWishlist(userId, username, bookId);
      res.status(200).json(wishlist);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).json({ error: 'Failed to add to wishlist' });
    }
  }

  async removeFromWishlist(req: Request, res: Response): Promise<void> {
    try {
      const { userId, bookId } = req.body;

      if (!userId || !bookId) {
        res.status(400).json({ error: 'userId and bookId are required' });
        return;
      }

      const wishlist = await WishlistService.removeFromWishlist(userId, bookId);
      res.status(200).json(wishlist);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
  }

  async getWishlist(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const wishlist = await WishlistService.getWishlist(userId);

      if (!wishlist) {
        res.status(404).json({ error: 'Wishlist not found' });
        return;
      }

      res.status(200).json(wishlist);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
  }

  // Reading List endpoints
  async createReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { userId, username, name, description } = req.body;

      if (!userId || !username || !name) {
        res.status(400).json({ error: 'userId, username, and name are required' });
        return;
      }

      const readingList = await ReadingListService.createReadingList({
        userId,
        username,
        name,
        description,
      });

      res.status(201).json(readingList);
    } catch (error) {
      console.error('Error creating reading list:', error);
      res.status(500).json({ error: 'Failed to create reading list' });
    }
  }

  async updateReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { readingListId } = req.params;
      const { name, description, isPublic } = req.body;

      const readingList = await ReadingListService.updateReadingList(readingListId, {
        name,
        description,
        isPublic,
      });

      if (!readingList) {
        res.status(404).json({ error: 'Reading list not found' });
        return;
      }

      res.status(200).json(readingList);
    } catch (error) {
      console.error('Error updating reading list:', error);
      res.status(500).json({ error: 'Failed to update reading list' });
    }
  }

  async deleteReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { readingListId } = req.params;
      const deleted = await ReadingListService.deleteReadingList(readingListId);

      if (!deleted) {
        res.status(404).json({ error: 'Reading list not found' });
        return;
      }

      res.status(200).json({ message: 'Reading list deleted successfully' });
    } catch (error) {
      console.error('Error deleting reading list:', error);
      res.status(500).json({ error: 'Failed to delete reading list' });
    }
  }

  async getReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { readingListId } = req.params;
      const readingList = await ReadingListService.getReadingList(readingListId);

      if (!readingList) {
        res.status(404).json({ error: 'Reading list not found' });
        return;
      }

      res.status(200).json(readingList);
    } catch (error) {
      console.error('Error fetching reading list:', error);
      res.status(500).json({ error: 'Failed to fetch reading list' });
    }
  }

  async getUserReadingLists(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const readingLists = await ReadingListService.getUserReadingLists(userId);

      res.status(200).json(readingLists);
    } catch (error) {
      console.error('Error fetching user reading lists:', error);
      res.status(500).json({ error: 'Failed to fetch user reading lists' });
    }
  }

  async addToReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { readingListId } = req.params;
      const { userId, bookId } = req.body;

      if (!userId || !bookId) {
        res.status(400).json({ error: 'userId and bookId are required' });
        return;
      }

      const readingList = await ReadingListService.addToReadingList(
        readingListId,
        userId,
        bookId
      );

      if (!readingList) {
        res.status(404).json({ error: 'Reading list not found' });
        return;
      }

      res.status(200).json(readingList);
    } catch (error) {
      console.error('Error adding to reading list:', error);
      res.status(500).json({ error: 'Failed to add to reading list' });
    }
  }

  async removeFromReadingList(req: Request, res: Response): Promise<void> {
    try {
      const { readingListId } = req.params;
      const { userId, bookId } = req.body;

      if (!userId || !bookId) {
        res.status(400).json({ error: 'userId and bookId are required' });
        return;
      }

      const readingList = await ReadingListService.removeFromReadingList(
        readingListId,
        userId,
        bookId
      );

      if (!readingList) {
        res.status(404).json({ error: 'Reading list not found' });
        return;
      }

      res.status(200).json(readingList);
    } catch (error) {
      console.error('Error removing from reading list:', error);
      res.status(500).json({ error: 'Failed to remove from reading list' });
    }
  }

  async updateReadingListItem(req: Request, res: Response): Promise<void> {
    try {
      const { readingListId, bookId } = req.params;
      const { userId, status, rating, notes } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const readingList = await ReadingListService.updateReadingListItem(
        readingListId,
        userId,
        bookId,
        { status, rating, notes }
      );

      if (!readingList) {
        res.status(404).json({ error: 'Reading list or item not found' });
        return;
      }

      res.status(200).json(readingList);
    } catch (error) {
      console.error('Error updating reading list item:', error);
      res.status(500).json({ error: 'Failed to update reading list item' });
    }
  }

  async getPublicReadingLists(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const readingLists = await ReadingListService.getPublicReadingLists(page, limit);
      res.status(200).json(readingLists);
    } catch (error) {
      console.error('Error fetching public reading lists:', error);
      res.status(500).json({ error: 'Failed to fetch public reading lists' });
    }
  }
}

export default new WishlistController();
