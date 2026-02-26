import BookImage, { IBookImage } from '../models/postgres/BookImage';

export class ImageService {

  async saveImage(bookId: string, imageData: Buffer, mimeType: string, fileName: string): Promise<IBookImage> {
    try {
      const image = await BookImage.create({
        id: bookId,
        imageData,
        mimeType,
        fileName,
      });
      return image;
    } catch (error) {
      throw new Error(`Error saving image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getImage(bookId: string): Promise<IBookImage | null> {
    try {
      return await BookImage.findByPk(bookId);
    } catch (error) {
      throw new Error(`Error fetching image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteImage(bookId: string): Promise<boolean> {
    try {
      const deletedRows = await BookImage.destroy({
        where: { id: bookId }
      });
      return deletedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async imageExists(bookId: string): Promise<boolean> {
    try {
      const image = await BookImage.findByPk(bookId);
      return !!image;
    } catch (error) {
      return false;
    }
  }
}

export default new ImageService();