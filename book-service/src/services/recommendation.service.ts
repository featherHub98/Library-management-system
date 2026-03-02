import Book from '../models/mongo/Book';
import Review from '../models/mongo/Review';
import ReadingList from '../models/mongo/ReadingList';

interface RecommendationResult {
  bookId: string;
  title: string;
  author: string;
  score: number;
  reason: string;
}

class RecommendationService {
  // Get personalized recommendations based on user's reading history
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<RecommendationResult[]> {
    // Get user's reading list
    const readingList = await ReadingList.findOne({ userId });
    
    if (!readingList || readingList.items.length === 0) {
      // If no reading history, return trending books
      return this.getTrendingBooks(limit);
    }

    const recommendations: Map<string, RecommendationResult> = new Map();

    // Get books from user's finished list
    const finishedItems = readingList.items.filter((item) => item.status === 'finished');

    for (const item of finishedItems) {
      const book = await Book.findById(item.bookId).lean();

      if (!book) continue;

      // Find similar books based on author and categories
      const similarBooks = await Book.find({
        $or: [
          { author: book.author },
          { categories: { $in: book.categories } },
          { series: book.series },
        ],
        _id: { $ne: book._id },
      }).limit(20);

      for (const similar of similarBooks) {
        const key = similar._id.toString();

        if (!recommendations.has(key)) {
          let score = 0;
          let reason = '';

          if (similar.author === book.author) {
            score += 3;
            reason = `More from author ${book.author}`;
          }
          if (similar.categories?.some((cat) => book.categories?.includes(cat))) {
            score += 2;
            reason = 'Similar category';
          }
          if (similar.series === book.series) {
            score += 4;
            reason = `Next in series: ${book.series}`;
          }

          if (item.rating && item.rating >= 4) {
            score *= 1.5; // Boost if user rated highly
          }

          recommendations.set(key, {
            bookId: key,
            title: similar.title,
            author: similar.author,
            score,
            reason,
          });
        }
      }
    }

    // Sort by score and return top N
    return Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Get trending books based on review count
  async getTrendingBooks(limit: number = 10): Promise<RecommendationResult[]> {
    const trendingReviews = await Review.aggregate([
      {
        $group: {
          _id: '$bookId',
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { reviewCount: -1, avgRating: -1 } },
      { $limit: limit },
    ] as any);

    const recommendations: RecommendationResult[] = [];

    for (const review of trendingReviews) {
      const book = await Book.findById(review._id).lean();

      if (book) {
        recommendations.push({
          bookId: review._id.toString(),
          title: book.title,
          author: book.author,
          score: review.reviewCount * review.avgRating,
          reason: `Trending (${review.reviewCount} reviews, ${review.avgRating.toFixed(1)} rating)`,
        });
      }
    }

    return recommendations;
  }

  // Get recommendations based on similar users (collaborative filtering)
  async getSimilarUserRecommendations(userId: string, limit: number = 10): Promise<RecommendationResult[]> {
    // Get user's rated books
    const userReviews = await Review.find({ userId }).lean();

    if (userReviews.length === 0) {
      return this.getTrendingBooks(limit);
    }

    const userBookIds = userReviews.map((r) => r.bookId.toString());

    // Find other users who rated similar books
    const similarUsers = await Review.aggregate([
      {
        $match: {
          bookId: { $in: userBookIds.map((id) => require('mongoose').Types.ObjectId(id)) },
          userId: { $ne: userId },
        },
      },
      {
        $group: {
          _id: '$userId',
          commonBooks: { $sum: 1 },
        },
      },
      { $sort: { commonBooks: -1 } },
      { $limit: 5 },
    ]);

    const recommendations: Map<string, RecommendationResult> = new Map();

    for (const similar of similarUsers) {
      // Get books reviewed by similar users
      const similarUserBooks = await Review.find({
        userId: similar._id,
        bookId: { $nin: userBookIds.map((id) => require('mongoose').Types.ObjectId(id)) },
      })
        .sort({ rating: -1 })
        .limit(10);

      for (const review of similarUserBooks) {
        const book = await Book.findById(review.bookId).lean();

        if (book) {
          const key = review.bookId.toString();
          const existing = recommendations.get(key);

          recommendations.set(key, {
            bookId: key,
            title: book.title,
            author: book.author,
            score: (existing?.score || 0) + review.rating,
            reason: 'Users who read similar books also enjoyed this',
          });
        }
      }
    }

    return Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Get "Users who read this also read" recommendations
  async getAlsoBoughtRecommendations(bookId: string, limit: number = 10): Promise<RecommendationResult[]> {
    // Find users who read this book
    const usersWhoRead = await ReadingList.find({
      'items.bookId': bookId,
    }).distinct('userId');

    const recommendations: Map<string, RecommendationResult> = new Map();

    // Find other books they read
    for (const userId of usersWhoRead.slice(0, 50)) {
      const userList = await ReadingList.findOne({ userId });

      if (userList) {
        for (const item of userList.items) {
          if (item.bookId.toString() !== bookId) {
            const key = item.bookId.toString();
            const existing = recommendations.get(key);

            recommendations.set(key, {
              bookId: key,
              title: '',
              author: '',
              score: (existing?.score || 0) + 1,
              reason: 'Users who read this book also enjoyed this',
            });
          }
        }
      }
    }

    // Fetch book details for top recommendations
    const sorted = Array.from(recommendations.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    for (const rec of sorted) {
      const book = await Book.findById(rec.bookId).lean();

      if (book) {
        rec.title = book.title;
        rec.author = book.author;
      }
    }

    return sorted;
  }

  // Get recommendations by category
  async getRecommendationsByCategory(category: string, limit: number = 10): Promise<RecommendationResult[]> {
    const books = await Book.find({ categories: category })
      .sort({ basePrice: 1 })
      .limit(limit);

    return books.map((book) => ({
      bookId: book._id.toString(),
      title: book.title,
      author: book.author,
      score: 1,
      reason: `Popular in ${category}`,
    }));
  }
}

export default new RecommendationService();
