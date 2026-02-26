import BookService from '../services/book.service';
import Book from '../models/mongo/Book';
import BookingService from '../services/booking.service';
import ImageService from '../services/image.service';

jest.mock('../services/booking.service');
jest.mock('../services/image.service');
jest.mock('../models/mongo/Book', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  }),
}));

const mockBookingService = BookingService as jest.Mocked<typeof BookingService>;
const mockImageService = ImageService as jest.Mocked<typeof ImageService>;
const mockBook = Book as jest.Mocked<typeof Book>;

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBookingService.isBookAvailable.mockResolvedValue(true);
  });

  describe('calculatePrice', () => {
    it('should apply 10% discount for ebooks', () => {
      const price = (BookService as any).calculatePrice(100, 'ebook');
      expect(price).toBe(90);
    });

    it('should not discount physical books', () => {
      const price = (BookService as any).calculatePrice(100, 'physical');
      expect(price).toBe(100);
    });
  });

  describe('createBook', () => {
    it('should create a book with calculated price', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        basePrice: 100,
        format: 'ebook' as const,
        description: 'Test description',
        isbn: '1234567890',
      };
      const mockSavedBook = { ...bookData, _id: '123', price: 90 };

      (Book as unknown as jest.Mock).mockImplementation(() => ({
        ...mockSavedBook,
        save: jest.fn().mockResolvedValue(mockSavedBook),
      }));

      const createdBook = await BookService.createBook(bookData);

      expect(createdBook.title).toBe('Test Book');
      expect(createdBook.price).toBe(90);
      expect(createdBook.format).toBe('ebook');
    });
  });

  describe('getAllBooks', () => {
    it('should return all books with prices and availability', async () => {
      const mockBooks = [
        { title: 'Book 1', author: 'Author 1', basePrice: 50, format: 'physical', description: 'Desc 1', isbn: '111', price: 50, _id: '1' },
        { title: 'Book 2', author: 'Author 2', basePrice: 60, format: 'ebook', description: 'Desc 2', isbn: '222', price: 54, _id: '2' },
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((resolve) => resolve(mockBooks)),
      };

      (Book.find as any).mockReturnValue(mockQuery);

      const books = await BookService.getAllBooks();

      expect(books).toHaveLength(2);
      expect(books[0].price).toBe(50);
      expect(books[1].price).toBe(54);
      expect(mockBookingService.isBookAvailable).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBookById', () => {
    it('should return book with updated price and availability', async () => {
      const mockBookData = { _id: '123', title: 'Test Book', basePrice: 100, format: 'physical', price: 100 };
      (Book.findById as any).mockResolvedValue(mockBookData);

      const found = await BookService.getBookById('123');

      expect(found?.title).toBe('Test Book');
      expect(found?.price).toBe(100);
      expect((found as any).available).toBe(true);
      expect(mockBookingService.isBookAvailable).toHaveBeenCalledWith('123', expect.any(Date), expect.any(Date));
    });

    it('should return null for non-existent book', async () => {
      (Book.findById as any).mockResolvedValue(null);

      const found = await BookService.getBookById('nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('updateBook', () => {
    it('should update book and recalculate price', async () => {
      const existingBook = { _id: '123', title: 'Old Title', author: 'Author', basePrice: 100, format: 'physical', price: 100 };
      (Book.findById as any).mockResolvedValue(existingBook);
      const updatedBook = { ...existingBook, title: 'New Title', basePrice: 120, price: 120 };
      (Book.findByIdAndUpdate as any).mockResolvedValue(updatedBook);

      const updated = await BookService.updateBook('123', { title: 'New Title', basePrice: 120 });

      expect(updated?.title).toBe('New Title');
      expect(updated?.price).toBe(120);
    });
  });

  describe('deleteBook', () => {
    it('should delete book and call image service', async () => {
      const mockBookData = { _id: '123', title: 'Test' };
      (Book.findByIdAndDelete as any).mockResolvedValue(mockBookData);

      const deleted = await BookService.deleteBook('123');

      expect(deleted?.title).toBe('Test');
      expect(mockImageService.deleteImage).toHaveBeenCalledWith('123');
    });
  });

  describe('bookExists', () => {
    it('should return true for existing book', async () => {
      (Book.findById as any).mockResolvedValue({ _id: '123' });

      const exists = await BookService.bookExists('123');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent book', async () => {
      (Book.findById as any).mockResolvedValue(null);

      const exists = await BookService.bookExists('nonexistent');
      expect(exists).toBe(false);
    });
  });
});