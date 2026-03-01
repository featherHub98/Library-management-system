import { IBook } from '../interfaces/book.interface';
import Book from '../models/mongo/Book';
import { CreateBookDto, UpdateBookDto } from '../dtos/book.dto';
import ImageService from './image.service';
import BookingService from './booking.service';

export class BookService {

  private calculatePrice(basePrice: number, format: string): number {
    if (format === 'ebook') {
      return basePrice * 0.9;
    }
    return basePrice;
  }

  private calculateStatus(format: string, stock: number): 'in_stock' | 'out_of_stock' {
    if (format === 'ebook') {
      return 'in_stock';
    }
    return stock > 0 ? 'in_stock' : 'out_of_stock';
  }

  private normalizeStock(format: string, stock?: number): number {
    if (format === 'ebook') {
      return 0;
    }
    return Math.max(0, stock ?? 0);
  }

  async createBook(bookData: CreateBookDto): Promise<IBook> {
    try {
      const price = this.calculatePrice(bookData.basePrice, bookData.format);
      const stock = this.normalizeStock(bookData.format, bookData.stock);
      const status = this.calculateStatus(bookData.format, stock);
      const book = new Book({ ...bookData, stock, status, price });
      return await book.save();
    } catch (error) {
      throw new Error(`Error creating book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  async getAllBooks(): Promise<IBook[]> {
    try {
      const books = await Book.find().sort({ createdAt: -1 });
      const now = new Date();
      return Promise.all(books.map(async b => {
        b.price = this.calculatePrice(b.basePrice, b.format);
        b.stock = this.normalizeStock(b.format, b.stock);
        b.status = this.calculateStatus(b.format, b.stock);
        if (b.format === 'physical') {
          const avail = await BookingService.isBookAvailable(b._id.toString(), now, now);
          (b as any).available = avail;
        }
        return b;
      }));
    } catch (error) {
      throw new Error(`Error fetching books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async queryBooks(
    options: {
      search?: string;
      author?: string;
      format?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
    }
  ): Promise<{ books: IBook[]; total: number }> {
    try {
      const {
        search,
        author,
        format,
        minPrice,
        maxPrice,
        page = 1,
        limit = 10,
      } = options;

      const query: any = {};

      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [{ title: regex }, { author: regex }];
      }
      if (author) {
        query.author = new RegExp(author, 'i');
      }
      if (format) {
        query.format = format;
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) query.price.$gte = minPrice;
        if (maxPrice !== undefined) query.price.$lte = maxPrice;
      }

      const skip = (page > 0 ? page - 1 : 0) * limit;

      const [books, total] = await Promise.all([
        Book.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Book.countDocuments(query),
      ]);

      const now = new Date();
      const priced = await Promise.all(books.map(async b => {
        b.price = this.calculatePrice(b.basePrice, b.format);
        b.stock = this.normalizeStock(b.format, b.stock);
        b.status = this.calculateStatus(b.format, b.stock);
        if (b.format === 'physical') {
          const avail = await BookingService.isBookAvailable(b._id.toString(), now, now);
          (b as any).available = avail;
        }
        return b;
      }));
      return { books: priced, total };
    } catch (error) {
      throw new Error(`Error querying books: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getBookById(bookId: string): Promise<IBook | null> {
    try {
      const book = await Book.findById(bookId);
      if (book) {
        book.price = this.calculatePrice(book.basePrice, book.format);
        book.stock = this.normalizeStock(book.format, book.stock);
        book.status = this.calculateStatus(book.format, book.stock);
        if (book.format === 'physical') {
          const now = new Date();
          const avail = await BookingService.isBookAvailable(book._id.toString(), now, now);
          (book as any).available = avail;
        }
      }
      return book;
    } catch (error) {
      throw new Error(`Error fetching book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateBook(bookId: string, updateData: UpdateBookDto): Promise<IBook | null> {
    try {
      if (updateData.basePrice !== undefined || updateData.format !== undefined) {
        const existing = await Book.findById(bookId);
        if (existing) {
          const base = updateData.basePrice !== undefined ? updateData.basePrice : existing.basePrice;
          const fmt = updateData.format !== undefined ? updateData.format : existing.format;
          const stock = this.normalizeStock(fmt, updateData.stock !== undefined ? updateData.stock : existing.stock);
          updateData = {
            ...updateData,
            stock,
            price: this.calculatePrice(base, fmt),
            status: this.calculateStatus(fmt, stock)
          } as any;
        }
      } else if (updateData.stock !== undefined) {
        const existing = await Book.findById(bookId);
        if (existing) {
          const stock = this.normalizeStock(existing.format, updateData.stock);
          updateData = {
            ...updateData,
            stock,
            status: this.calculateStatus(existing.format, stock)
          } as any;
        }
      }
      const updated = await Book.findByIdAndUpdate(
        bookId,
        { ...updateData },
        { new: true, runValidators: true }
      );
      if (updated) {
        updated.price = this.calculatePrice(updated.basePrice, updated.format);
        updated.stock = this.normalizeStock(updated.format, updated.stock);
        updated.status = this.calculateStatus(updated.format, updated.stock);
      }
      return updated;
    } catch (error) {
      throw new Error(`Error updating book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  async deleteBook(bookId: string): Promise<IBook | null> {
    try {
      const book = await Book.findByIdAndDelete(bookId);
      if (book) {
        await ImageService.deleteImage(bookId);
      }
      return book;
    } catch (error) {
      throw new Error(`Error deleting book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  async bookExists(bookId: string): Promise<boolean> {
    try {
      const book = await Book.findById(bookId);
      return !!book;
    } catch (error) {
      return false;
    }
  }

 
  async getBooksByAuthor(author: string): Promise<IBook[]> {
    try {
      return await Book.find({ author: new RegExp(author, 'i') }).sort({ title: 1 });
    } catch (error) {
      throw new Error(`Error fetching books by author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

 
  async getBooksByPriceRange(minPrice: number, maxPrice: number): Promise<IBook[]> {
    try {
      return await Book.find({
        price: { $gte: minPrice, $lte: maxPrice }
      }).sort({ price: 1 });
    } catch (error) {
      throw new Error(`Error fetching books by price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new BookService();