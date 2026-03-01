import { Request, Response, NextFunction } from 'express';
import AuthorService from '../services/author.service';
import AuditLogService from '../services/auditLog.service';
import { CreateAuthorDto, UpdateAuthorDto, AuthorQueryDto } from '../dtos/author.dto';

export class AuthorController {
  /**
   * Create a new author
   */
  async createAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authorData: CreateAuthorDto = req.body;
      const file = req.file;
      
      // Validate required fields
      if (!authorData.name) {
        res.status(400).json({
          success: false,
          error: 'Author name is required'
        });
        return;
      }
      
      const author = await AuthorService.createAuthor(authorData, file ? {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname
      } : undefined);
      
      // Log the action
      await AuditLogService.logAction({
        action: 'CREATE',
        entityType: 'Author',
        entityId: author._id.toString(),
        details: { name: author.name },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(201).json({
        success: true,
        message: 'Author created successfully',
        data: author
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all authors with pagination
   */
  async getAllAuthors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query: AuthorQueryDto = {
        search: req.query.search as string,
        nationality: req.query.nationality as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10
      };
      
      const { authors, total, page, limit } = await AuthorService.getAllAuthors(query);
      
      res.status(200).json({
        success: true,
        count: authors.length,
        total,
        page,
        limit,
        data: authors
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get author by ID
   */
  async getAuthorById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const author = await AuthorService.getAuthorById(id);
      
      if (!author) {
        res.status(404).json({
          success: false,
          error: 'Author not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: author
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an author
   */
  async updateAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateAuthorDto = req.body;
      const file = req.file;
      
      const updatedAuthor = await AuthorService.updateAuthor(id, updateData, file ? {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname
      } : undefined);
      
      if (!updatedAuthor) {
        res.status(404).json({
          success: false,
          error: 'Author not found'
        });
        return;
      }
      
      // Log the action
      await AuditLogService.logAction({
        action: 'UPDATE',
        entityType: 'Author',
        entityId: id,
        details: { updates: Object.keys(updateData) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(200).json({
        success: true,
        message: 'Author updated successfully',
        data: updatedAuthor
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an author
   */
  async deleteAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const deletedAuthor = await AuthorService.deleteAuthor(id);
      
      if (!deletedAuthor) {
        res.status(404).json({
          success: false,
          error: 'Author not found'
        });
        return;
      }
      
      // Log the action
      await AuditLogService.logAction({
        action: 'DELETE',
        entityType: 'Author',
        entityId: id,
        details: { name: deletedAuthor.name },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(200).json({
        success: true,
        message: 'Author deleted successfully',
        data: { id: deletedAuthor._id, name: deletedAuthor.name }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate CV from author's cvData
   */
  async generateCV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const generatedCV = await AuthorService.generateCV(id);
      
      if (!generatedCV) {
        res.status(404).json({
          success: false,
          error: 'Author not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: 'CV generated successfully',
        data: generatedCV
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download CV file
   */
  async downloadCV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const cvFile = await AuthorService.downloadCV(id);
      
      if (!cvFile) {
        res.status(404).json({
          success: false,
          error: 'CV file not found'
        });
        return;
      }
      
      // Log the action
      await AuditLogService.logAction({
        action: 'READ',
        entityType: 'AuthorCV',
        entityId: id,
        details: { action: 'download' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.setHeader('Content-Type', cvFile.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${cvFile.fileName}"`);
      res.send(cvFile.data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload CV file
   */
  async uploadCV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file;
      
      if (!file) {
        res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
        return;
      }
      
      const updatedAuthor = await AuthorService.uploadCV(id, {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname
      });
      
      if (!updatedAuthor) {
        res.status(404).json({
          success: false,
          error: 'Author not found'
        });
        return;
      }
      
      // Log the action
      await AuditLogService.logAction({
        action: 'UPDATE',
        entityType: 'AuthorCV',
        entityId: id,
        details: { fileName: file.originalname, mimeType: file.mimetype },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });
      
      res.status(200).json({
        success: true,
        message: 'CV uploaded successfully',
        data: {
          authorId: updatedAuthor._id,
          fileName: file.originalname,
          mimeType: file.mimetype
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthorController();
