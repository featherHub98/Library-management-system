import { Request, Response } from 'express';
import BorrowingService from '../services/borrowing.service';

class BorrowingController {
  async borrowBook(req: Request, res: Response): Promise<void> {
    try {
      const { userId, username, bookId } = req.body;

      if (!userId || !username || !bookId) {
        res.status(400).json({ error: 'userId, username, and bookId are required' });
        return;
      }

      const record = await BorrowingService.borrowBook({ userId, username, bookId });
      res.status(201).json(record);
    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({ error: 'Failed to borrow book' });
    }
  }

  async returnBook(req: Request, res: Response): Promise<void> {
    try {
      const { userId, bookId } = req.body;

      if (!userId || !bookId) {
        res.status(400).json({ error: 'userId and bookId are required' });
        return;
      }

      const record = await BorrowingService.returnBook(userId, bookId);

      if (!record) {
        res.status(404).json({ error: 'Borrowing record not found' });
        return;
      }

      res.status(200).json(record);
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(500).json({ error: 'Failed to return book' });
    }
  }

  async getUserBorrowingHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await BorrowingService.getUserBorrowingHistory(userId, page, limit);
      res.status(200).json(history);
    } catch (error) {
      console.error('Error fetching borrowing history:', error);
      res.status(500).json({ error: 'Failed to fetch borrowing history' });
    }
  }

  async getOverdueBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BorrowingService.getOverdueBooks();
      res.status(200).json({ books });
    } catch (error) {
      console.error('Error fetching overdue books:', error);
      res.status(500).json({ error: 'Failed to fetch overdue books' });
    }
  }

  async getUserOverdueBooks(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const books = await BorrowingService.getUserOverdueBooks(userId);
      res.status(200).json({ books });
    } catch (error) {
      console.error('Error fetching user overdue books:', error);
      res.status(500).json({ error: 'Failed to fetch user overdue books' });
    }
  }

  async updateFineStatus(req: Request, res: Response): Promise<void> {
    try {
      const { recordId } = req.params;
      const { finePaid } = req.body;

      if (typeof finePaid !== 'boolean') {
        res.status(400).json({ error: 'finePaid must be a boolean' });
        return;
      }

      const record = await BorrowingService.updateFineStatus(recordId, finePaid);

      if (!record) {
        res.status(404).json({ error: 'Record not found' });
        return;
      }

      res.status(200).json(record);
    } catch (error) {
      console.error('Error updating fine status:', error);
      res.status(500).json({ error: 'Failed to update fine status' });
    }
  }

  async getTotalUnpaidFines(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const totalFines = await BorrowingService.getTotalUnpaidFines(userId);
      res.status(200).json({ userId, totalFines });
    } catch (error) {
      console.error('Error fetching total unpaid fines:', error);
      res.status(500).json({ error: 'Failed to fetch total unpaid fines' });
    }
  }
}

export default new BorrowingController();
