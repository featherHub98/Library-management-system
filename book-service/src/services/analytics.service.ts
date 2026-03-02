import BorrowingRecord from '../models/mongo/BorrowingRecord';
import Book from '../models/mongo/Book';
import Review from '../models/mongo/Review';
import Notification from '../models/mongo/Notification';
import axios from 'axios';

export interface PopularBook {
  bookId: string;
  title: string;
  author: string;
  borrowCount: number;
  averageRating: number;
}

export interface MemberStatistics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  newMembersThisWeek: number;
}

export interface InventoryMetrics {
  totalBooks: number;
  inStockBooks: number;
  outOfStockBooks: number;
  averageStockLevel: number;
  stockTurnoverRate: number;
}

export interface FineMetrics {
  totalFineAmount: number;
  collectedFineAmount: number;
  unpaidFineAmount: number;
  overdueCount: number;
  overdueUsers: number;
}

export interface GenreStatistics {
  genre: string;
  bookCount: number;
  borrowCount: number;
  averageRating: number;
}

export interface AuthorStatistics {
  author: string;
  bookCount: number;
  borrowCount: number;
  averageRating: number;
}

export interface DashboardOverview {
  popularBooks: PopularBook[];
  memberStatistics: MemberStatistics;
  inventoryMetrics: InventoryMetrics;
  fineMetrics: FineMetrics;
  topGenres: GenreStatistics[];
  topAuthors: AuthorStatistics[];
  borrowingTrend: Array<{ date: string; count: number }>;
}

class AnalyticsService {
  async getPopularBooks(limit: number = 10): Promise<PopularBook[]> {
    try {
      const result = await BorrowingRecord.aggregate([
        {
          $group: {
            _id: '$bookId',
            borrowCount: { $sum: 1 },
          },
        },
        {
          $sort: { borrowCount: -1 },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: '_id',
            as: 'book',
          },
        },
        {
          $unwind: '$book',
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'bookId',
            as: 'reviews',
          },
        },
        {
          $project: {
            bookId: '$_id',
            title: '$book.title',
            author: '$book.author',
            borrowCount: 1,
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0,
              },
            },
          },
        },
      ]);

      return result.map((item) => ({
        bookId: item.bookId.toString(),
        title: item.title,
        author: item.author,
        borrowCount: item.borrowCount,
        averageRating: item.averageRating,
      }));
    } catch (error) {
      console.error('Error fetching popular books:', error);
      throw new Error('Failed to fetch popular books');
    }
  }

  async getMemberStatistics(): Promise<MemberStatistics> {
    try {
      const authServiceUrl =
        process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

      // Fetch all users from auth service
      const response = await axios.get(`${authServiceUrl}/api/users`, {
        headers: {
          Authorization: `Bearer ${process.env.SERVICE_TOKEN}`,
        },
      });

      const users = response.data.data || [];
      const totalMembers = users.length;

      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const newMembersThisMonth = users.filter(
        (user: any) =>
          new Date(user.createdAt) >= oneMonthAgo &&
          new Date(user.createdAt) <= now
      ).length;

      const newMembersThisWeek = users.filter(
        (user: any) =>
          new Date(user.createdAt) >= oneWeekAgo &&
          new Date(user.createdAt) <= now
      ).length;

      // Active members are those who borrowed a book in the last 30 days
      const activeMembers = await BorrowingRecord.distinct('userId', {
        borrowDate: { $gte: oneMonthAgo },
      });

      return {
        totalMembers,
        activeMembers: activeMembers.length,
        newMembersThisMonth,
        newMembersThisWeek,
      };
    } catch (error) {
      console.error('Error fetching member statistics:', error);
      throw new Error('Failed to fetch member statistics');
    }
  }

  async getInventoryMetrics(): Promise<InventoryMetrics> {
    try {
      const books = await Book.find();
      const totalBooks = books.length;
      const inStockBooks = books.filter((book) => book.stock > 0).length;
      const outOfStockBooks = totalBooks - inStockBooks;

      const totalStock = books.reduce(
        (sum, book) => sum + book.stock,
        0
      );
      const averageStockLevel =
        totalBooks > 0 ? totalStock / totalBooks : 0;

      // Stock turnover rate = total borrows / average stock level
      const totalBorrows = await BorrowingRecord.countDocuments();
      const stockTurnoverRate =
        averageStockLevel > 0 ? totalBorrows / averageStockLevel : 0;

      return {
        totalBooks,
        inStockBooks,
        outOfStockBooks,
        averageStockLevel: Math.round(averageStockLevel * 100) / 100,
        stockTurnoverRate: Math.round(stockTurnoverRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error fetching inventory metrics:', error);
      throw new Error('Failed to fetch inventory metrics');
    }
  }

  async getFineMetrics(): Promise<FineMetrics> {
    try {
      const fineRecords = await BorrowingRecord.aggregate([
        {
          $group: {
            _id: null,
            totalFineAmount: {
              $sum: { $toDecimal: '$fineAmount' },
            },
            collectedFineAmount: {
              $sum: {
                $cond: [{ $eq: ['$finePaid', true] }, { $toDecimal: '$fineAmount' }, 0],
              },
            },
          },
        },
      ]);

      const totalFineAmount =
        fineRecords.length > 0 ? Number(fineRecords[0].totalFineAmount) : 0;
      const collectedFineAmount =
        fineRecords.length > 0
          ? Number(fineRecords[0].collectedFineAmount)
          : 0;

      const overdueRecords = await BorrowingRecord.find({
        status: 'overdue',
      });

      const overdueCount = overdueRecords.length;
      const overdueUsers = new Set(
        overdueRecords.map((record) => record.userId.toString())
      ).size;

      return {
        totalFineAmount: Math.round(totalFineAmount * 100) / 100,
        collectedFineAmount:
          Math.round(collectedFineAmount * 100) / 100,
        unpaidFineAmount:
          Math.round((totalFineAmount - collectedFineAmount) * 100) / 100,
        overdueCount,
        overdueUsers,
      };
    } catch (error) {
      console.error('Error fetching fine metrics:', error);
      throw new Error('Failed to fetch fine metrics');
    }
  }

  async getTopGenres(limit: number = 5): Promise<GenreStatistics[]> {
    try {
      const genreStats = await Book.aggregate([
        {
          $unwind: '$categories',
        },
        {
          $group: {
            _id: '$categories',
            bookCount: { $sum: 1 },
          },
        },
        {
          $sort: { bookCount: -1 },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'borrowingrecords',
            localField: '_id',
            foreignField: 'bookId',
            as: 'borrows',
          },
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'bookId',
            as: 'reviews',
          },
        },
        {
          $project: {
            genre: '$_id',
            bookCount: 1,
            borrowCount: { $size: '$borrows' },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0,
              },
            },
          },
        },
      ]);

      return genreStats;
    } catch (error) {
      console.error('Error fetching top genres:', error);
      throw new Error('Failed to fetch top genres');
    }
  }

  async getTopAuthors(limit: number = 5): Promise<AuthorStatistics[]> {
    try {
      const authorStats = await Book.aggregate([
        {
          $group: {
            _id: '$author',
            bookCount: { $sum: 1 },
          },
        },
        {
          $sort: { bookCount: -1 },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'borrowingrecords',
            localField: '_id',
            foreignField: 'bookId',
            as: 'borrows',
          },
        },
        {
          $lookup: {
            from: 'reviews',
            localField: '_id',
            foreignField: 'bookId',
            as: 'reviews',
          },
        },
        {
          $project: {
            author: '$_id',
            bookCount: 1,
            borrowCount: { $size: '$borrows' },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: { $avg: '$reviews.rating' },
                else: 0,
              },
            },
          },
        },
      ]);

      return authorStats;
    } catch (error) {
      console.error('Error fetching top authors:', error);
      throw new Error('Failed to fetch top authors');
    }
  }

  async getBorrowingTrend(days: number = 30): Promise<Array<{ date: string; count: number }>> {
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const trend = await BorrowingRecord.aggregate([
        {
          $match: {
            borrowDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$borrowDate',
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return trend.map((item) => ({
        date: item._id,
        count: item.count,
      }));
    } catch (error) {
      console.error('Error fetching borrowing trend:', error);
      throw new Error('Failed to fetch borrowing trend');
    }
  }

  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const [
        popularBooks,
        memberStatistics,
        inventoryMetrics,
        fineMetrics,
        topGenres,
        topAuthors,
        borrowingTrend,
      ] = await Promise.all([
        this.getPopularBooks(5),
        this.getMemberStatistics(),
        this.getInventoryMetrics(),
        this.getFineMetrics(),
        this.getTopGenres(5),
        this.getTopAuthors(5),
        this.getBorrowingTrend(30),
      ]);

      return {
        popularBooks,
        memberStatistics,
        inventoryMetrics,
        fineMetrics,
        topGenres,
        topAuthors,
        borrowingTrend,
      };
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw new Error('Failed to fetch dashboard overview');
    }
  }
}

export default new AnalyticsService();
