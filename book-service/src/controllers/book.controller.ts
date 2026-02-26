import { Request, Response, NextFunction } from 'express';
import BookService from '../services/book.service';
import ImageService from '../services/image.service';
import { CreateBookDto, UpdateBookDto } from '../dtos/book.dto';
import { IBook } from '../interfaces/book.interface';

export class BookController {

  async createBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookData: CreateBookDto = req.body;
      const file = req.file;

      if (!bookData.title || !bookData.author || bookData.basePrice === undefined || !bookData.format) {
        res.status(400).json({
          success: false,
          error: 'Please provide title, author, basePrice and format'
        });
        return;
      }
      const book = await BookService.createBook(bookData);
      let image = null;

      if (file) {
        try {
          image = await ImageService.saveImage(
            book._id.toString(),
            file.buffer,
            file.mimetype,
            file.originalname
          );
        } catch (imageError) {
          console.warn('Image upload failed, but book created successfully:', imageError);
        }
      }
      
      res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: {
          ...book.toObject(),
          image: image ? {
            id: image.id,
            mimeType: image.mimeType,
            fileName: image.fileName,
            createdAt: image.createdAt,
          } : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, author, format, minPrice, maxPrice, page, limit } = req.query as Record<string, string>;

      const opts: any = {};
      if (search) opts.search = search;
      if (author) opts.author = author;
      if (format) opts.format = format;
      if (minPrice !== undefined) opts.minPrice = parseFloat(minPrice);
      if (maxPrice !== undefined) opts.maxPrice = parseFloat(maxPrice);
      if (page !== undefined) opts.page = parseInt(page, 10);
      if (limit !== undefined) opts.limit = parseInt(limit, 10);

      const { books, total } = await BookService.queryBooks(opts);

      res.status(200).json({
        success: true,
        count: books.length,
        total,
        page: opts.page || 1,
        limit: opts.limit || books.length,
        data: books
      });
    } catch (error) {
      next(error);
    }
  }


  async getBookById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const book = await BookService.getBookById(id as string);
      
      if (!book) {
        res.status(404).json({
          success: false,
          error: 'Book not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }


  async updateBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateBookDto = req.body;

      const updatedBook = await BookService.updateBook(id as string, updateData);
      
      if (!updatedBook) {
        res.status(404).json({
          success: false,
          error: 'Book not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Book updated successfully',
        data: updatedBook
      });
    } catch (error) {
      next(error);
    }
  }


  async deleteBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const deletedBook = await BookService.deleteBook(id as string);
      
      if (!deletedBook) {
        res.status(404).json({
          success: false,
          error: 'Book not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'Book deleted successfully',
        data: deletedBook
      });
    } catch (error) {
      next(error);
    }
  }


  async getBooksByAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { author } = req.params;
      
      if (!author) {
        res.status(400).json({
          success: false,
          error: 'Author name is required'
        });
        return;
      }
      
      const books = await BookService.getBooksByAuthor(author as string);
      
      res.status(200).json({
        success: true,
        count: books.length,
        data: books
      });
    } catch (error) {
      next(error);
    }
  }


  async getBooksByPriceRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const minPrice = parseFloat(req.query.min as string) || 0;
      const maxPrice = parseFloat(req.query.max as string) || Number.MAX_SAFE_INTEGER;
      
      if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
        res.status(400).json({
          success: false,
          error: 'Invalid price range'
        });
        return;
      }
      
      const books = await BookService.getBooksByPriceRange(minPrice, maxPrice);
      
      res.status(200).json({
        success: true,
        count: books.length,
        data: books
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BookController();