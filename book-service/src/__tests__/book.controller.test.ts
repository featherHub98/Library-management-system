import request from 'supertest';
import express from 'express';
import { BookController } from '../controllers/book.controller';
import BookService from '../services/book.service';
import ImageService from '../services/image.service';

jest.mock('../services/book.service');
jest.mock('../services/image.service');

const mockBookService = BookService as jest.Mocked<typeof BookService>;
const mockImageService = ImageService as jest.Mocked<typeof ImageService>;

const app = express();
app.use(express.json());

const controller = new BookController();

app.post('/books', (req, res, next) => controller.createBook(req, res, next));
app.get('/books', (req, res, next) => controller.getAllBooks(req, res, next));
app.get('/books/author/:author?', (req, res, next) => controller.getBooksByAuthor(req, res, next));
app.get('/books/:id', (req, res, next) => controller.getBookById(req, res, next));
app.put('/books/:id', (req, res, next) => controller.updateBook(req, res, next));
app.delete('/books/:id', (req, res, next) => controller.deleteBook(req, res, next));
app.get('/books/price/range', (req, res, next) => controller.getBooksByPriceRange(req, res, next));

describe('BookController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /books', () => {
    it('should create a book successfully', async () => {
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        basePrice: 100,
        format: 'ebook',
        description: 'Test desc',
        isbn: '1234567890',
      };
      const mockBook = { ...bookData, _id: '123', price: 90, toObject: () => ({ ...bookData, _id: '123', price: 90 }) };

      mockBookService.createBook.mockResolvedValue(mockBook as any);
      mockImageService.saveImage.mockResolvedValue({ id: 'img1', mimeType: 'image/jpeg', fileName: 'test.jpg', createdAt: new Date() } as any);

      const response = await request(app)
        .post('/books')
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Book');
      expect(mockBookService.createBook).toHaveBeenCalledWith(bookData);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/books')
        .send({ title: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Please provide');
    });
  });

  describe('GET /books', () => {
    it('should return books with query', async () => {
      const mockBooks = [{ title: 'Book1' }, { title: 'Book2' }];
      mockBookService.queryBooks.mockResolvedValue({ books: mockBooks as any, total: 2 });

      const response = await request(app)
        .get('/books?search=test&page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(mockBookService.queryBooks).toHaveBeenCalledWith({
        search: 'test',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('GET /books/:id', () => {
    it('should return book by id', async () => {
      const mockBook = { _id: '123', title: 'Test Book' };
      mockBookService.getBookById.mockResolvedValue(mockBook as any);

      const response = await request(app)
        .get('/books/123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Book');
    });

    it('should return 404 for non-existent book', async () => {
      mockBookService.getBookById.mockResolvedValue(null);

      const response = await request(app)
        .get('/books/123')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Book not found');
    });
  });

  describe('PUT /books/:id', () => {
    it('should update book', async () => {
      const updateData = { title: 'Updated Title' };
      const mockBook = { _id: '123', title: 'Updated Title' };
      mockBookService.updateBook.mockResolvedValue(mockBook as any);

      const response = await request(app)
        .put('/books/123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent book', async () => {
      mockBookService.updateBook.mockResolvedValue(null);

      const response = await request(app)
        .put('/books/123')
        .send({ title: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /books/:id', () => {
    it('should delete book', async () => {
      const mockBook = { _id: '123', title: 'Test' };
      mockBookService.deleteBook.mockResolvedValue(mockBook as any);

      const response = await request(app)
        .delete('/books/123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Book deleted successfully');
    });

    it('should return 404 for non-existent book', async () => {
      mockBookService.deleteBook.mockResolvedValue(null);

      const response = await request(app)
        .delete('/books/123')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /books/author/:author', () => {
    it('should return books by author', async () => {
      const mockBooks = [{ title: 'Book1' }];
      mockBookService.getBooksByAuthor.mockResolvedValue(mockBooks as any);

      const response = await request(app)
        .get('/books/author/TestAuthor')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });

    it('should return 400 for missing author', async () => {
      const response = await request(app)
        .get('/books/author')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /books/price', () => {
    it('should return books by price range', async () => {
      const mockBooks = [{ title: 'Book1' }];
      mockBookService.getBooksByPriceRange.mockResolvedValue(mockBooks as any);

      const response = await request(app)
        .get('/books/price/range?min=10&max=50')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockBookService.getBooksByPriceRange).toHaveBeenCalledWith(10, 50);
    });

    it('should return 400 for invalid range', async () => {
      const response = await request(app)
        .get('/books/price/range?min=50&max=10')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});