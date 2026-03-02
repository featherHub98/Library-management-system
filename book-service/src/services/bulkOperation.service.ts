import Book from '../models/mongo/Book';
import { IBook } from '../interfaces/book.interface';

interface BulkImportData {
  title: string;
  author: string;
  basePrice: number;
  format: 'ebook' | 'physical';
  isbn?: string;
  barcode?: string;
  categories?: string[];
  language?: string;
  edition?: number;
  volume?: number;
  series?: string;
  description?: string;
  publishedDate?: string;
  publisher?: string;
  pages?: number;
  stock?: number;
}

class BulkOperationService {
  async bulkImport(books: BulkImportData[]): Promise<{
    imported: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const errors: Array<{ row: number; error: string }> = [];
    let imported = 0;

    for (let i = 0; i < books.length; i++) {
      try {
        const book = books[i];
        
        if (!book.title || !book.author || typeof book.basePrice !== 'number' || !book.format) {
          errors.push({ row: i + 1, error: 'Missing required fields' });
          continue;
        }

        const newBook = new Book({
          title: book.title,
          author: book.author,
          basePrice: book.basePrice,
          format: book.format,
          stock: book.stock || (book.format === 'ebook' ? 0 : 1),
          isbn: book.isbn,
          barcode: book.barcode,
          categories: book.categories || [],
          language: book.language || 'English',
          edition: book.edition || 1,
          volume: book.volume,
          series: book.series,
          description: book.description,
          publishedDate: book.publishedDate ? new Date(book.publishedDate) : undefined,
          publisher: book.publisher,
          pages: book.pages,
        });

        await newBook.save();
        imported++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push({ row: i + 1, error: message });
      }
    }

    return { imported, errors };
  }

  async bulkExport(filters?: {
    category?: string;
    series?: string;
    author?: string;
  }): Promise<BulkImportData[]> {
    const query: Record<string, any> = {};

    if (filters?.category) {
      query.categories = filters.category;
    }
    if (filters?.series) {
      query.series = filters.series;
    }
    if (filters?.author) {
      query.author = new RegExp(filters.author, 'i');
    }

    const books = await Book.find(query).lean();

    return books.map((book: any) => ({
      title: book.title,
      author: book.author,
      basePrice: book.basePrice,
      format: book.format,
      isbn: book.isbn,
      barcode: book.barcode,
      categories: book.categories,
      language: book.language,
      edition: book.edition,
      volume: book.volume,
      series: book.series,
      description: book.description,
      publishedDate: book.publishedDate?.toISOString().split('T')[0],
      publisher: book.publisher,
      pages: book.pages,
      stock: book.stock,
    }));
  }

  async getCategories(): Promise<string[]> {
    const results = await Book.distinct('categories');
    return results.filter(Boolean).sort();
  }

  async getSeries(): Promise<string[]> {
    const results = await Book.distinct('series');
    return results.filter(Boolean).sort();
  }

  async getLanguages(): Promise<string[]> {
    const results = await Book.distinct('language');
    return results.filter(Boolean).sort();
  }

  async searchByCategory(category: string, page: number = 1, limit: number = 20): Promise<{
    books: IBook[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const books = await Book.find({ categories: category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({ categories: category });

    return { books, total, page, limit };
  }

  async searchBySeries(series: string, page: number = 1, limit: number = 20): Promise<{
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
}

export default new BulkOperationService();
