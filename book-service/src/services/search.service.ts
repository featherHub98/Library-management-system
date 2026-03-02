import Book from '../models/mongo/Book';
import { IBook } from '../interfaces/book.interface';

interface AdvancedSearchQuery {
  search?: string;
  categories?: string[];
  author?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  publicationYearStart?: number;
  publicationYearEnd?: number;
  minRating?: number;
  inStock?: boolean;
  format?: 'ebook' | 'physical';
  sort?: 'relevance' | 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
}

class SearchService {
  async advancedSearch(query: AdvancedSearchQuery, page: number = 1, limit: number = 20): Promise<{
    books: IBook[];
    total: number;
    page: number;
    limit: number;
    filters: AdvancedSearchQuery;
  }> {
    const skip = (page - 1) * limit;
    const mongoQuery: Record<string, any> = {};

    // Text search
    if (query.search) {
      mongoQuery.$text = { $search: query.search };
    }

    // Category filter
    if (query.categories && query.categories.length > 0) {
      mongoQuery.categories = { $in: query.categories };
    }

    // Author filter
    if (query.author) {
      mongoQuery.author = new RegExp(query.author, 'i');
    }

    // Language filter
    if (query.language) {
      mongoQuery.language = query.language;
    }

    // Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      mongoQuery.price = {};
      if (query.minPrice !== undefined) mongoQuery.price.$gte = query.minPrice;
      if (query.maxPrice !== undefined) mongoQuery.price.$lte = query.maxPrice;
    }

    // Publication year range
    if (query.publicationYearStart || query.publicationYearEnd) {
      mongoQuery.publishedDate = {};
      if (query.publicationYearStart) {
        mongoQuery.publishedDate.$gte = new Date(`${query.publicationYearStart}-01-01`);
      }
      if (query.publicationYearEnd) {
        mongoQuery.publishedDate.$lte = new Date(`${query.publicationYearEnd}-12-31`);
      }
    }

    // In-stock filter
    if (query.inStock !== undefined) {
      mongoQuery.status = query.inStock ? 'in_stock' : 'out_of_stock';
    }

    // Format filter
    if (query.format) {
      mongoQuery.format = query.format;
    }

    // Determine sort
    let sortQuery: any = { createdAt: -1 };

    if (query.sort === 'relevance' && query.search) {
      sortQuery = { score: { $meta: 'textScore' } };
    } else if (query.sort === 'popularity') {
      sortQuery = { rating: -1 };
    } else if (query.sort === 'price_asc') {
      sortQuery = { price: 1 };
    } else if (query.sort === 'price_desc') {
      sortQuery = { price: -1 };
    } else if (query.sort === 'newest') {
      sortQuery = { publishedDate: -1 };
    } else if (query.sort === 'rating') {
      sortQuery = { rating: -1 };
    }

    let findQuery = Book.find(mongoQuery);

    if (query.sort === 'relevance' && query.search) {
      findQuery = findQuery.select({ score: { $meta: 'textScore' } });
    }

    const books = await findQuery
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(mongoQuery);

    return {
      books,
      total,
      page,
      limit,
      filters: query,
    };
  }

  async getBooksByGenre(genre: string, page: number = 1, limit: number = 20): Promise<{
    books: IBook[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const books = await Book.find({ categories: genre })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({ categories: genre });

    return { books, total, page, limit };
  }

  async getAuthorBooks(author: string, page: number = 1, limit: number = 20): Promise<{
    books: IBook[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const books = await Book.find({ author: new RegExp(author, 'i') })
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({ author: new RegExp(author, 'i') });

    return { books, total, page, limit };
  }

  async getSeriesBooks(series: string, page: number = 1, limit: number = 20): Promise<{
    books: IBook[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const books = await Book.find({ series })
      .sort({ volume: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({ series });

    return { books, total, page, limit };
  }

  async searchByISBN(isbn: string): Promise<IBook | null> {
    return Book.findOne({ isbn }).lean();
  }

  async searchByBarcode(barcode: string): Promise<IBook | null> {
    return Book.findOne({ barcode }).lean();
  }

  async getNewReleases(limit: number = 20): Promise<IBook[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return Book.find({ createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getFilterOptions(): Promise<{
    genres: string[];
    languages: string[];
    priceRanges: Array<{ min: number; max: number; label: string }>;
    authors: string[];
  }> {
    const genres = await Book.distinct('categories');
    const languages = await Book.distinct('language');
    const authors = await Book.distinct('author');

    const priceRanges = [
      { min: 0, max: 10, label: 'Under $10' },
      { min: 10, max: 20, label: '$10 - $20' },
      { min: 20, max: 40, label: '$20 - $40' },
      { min: 40, max: Infinity, label: 'Over $40' },
    ];

    return {
      genres: genres.filter(Boolean).sort(),
      languages: languages.filter(Boolean).sort(),
      priceRanges,
      authors: authors.filter(Boolean).sort().slice(0, 100),
    };
  }
}

export default new SearchService();
