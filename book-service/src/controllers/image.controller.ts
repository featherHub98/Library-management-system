import { Request, Response } from 'express';
import ImageService from '../services/image.service';
import BookService from '../services/book.service';

export class ImageController {

  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const bookExists = await BookService.bookExists(bookId);
      if (!bookExists) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      const existingImage = await ImageService.imageExists(bookId);
      if (existingImage) {
        res.status(409).json({ message: 'Image already exists for this book' });
        return;
      }

      const image = await ImageService.saveImage(
        bookId,
        file.buffer,
        file.mimetype,
        file.originalname
      );

      res.status(201).json({
        message: 'Image uploaded successfully',
        image: {
          id: image.id,
          mimeType: image.mimeType,
          fileName: image.fileName,
          createdAt: image.createdAt,
        }
      });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getImage(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;

      const image = await ImageService.getImage(bookId);
      if (!image) {
        res.status(404).json({ message: 'Image not found' });
        return;
      }

      res.setHeader('Content-Type', image.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${image.fileName}"`);
      res.send(image.imageData);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async deleteImage(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;

      const bookExists = await BookService.bookExists(bookId);
      if (!bookExists) {
        res.status(404).json({ message: 'Book not found' });
        return;
      }

      const deleted = await ImageService.deleteImage(bookId);
      if (!deleted) {
        res.status(404).json({ message: 'Image not found' });
        return;
      }

      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}

export default new ImageController();