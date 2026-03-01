import Author from '../models/mongo/Author';
import { IAuthor, IAuthorResponse, CVData } from '../interfaces/author.interface';
import { CreateAuthorDto, UpdateAuthorDto, AuthorQueryDto, GeneratedCVDto } from '../dtos/author.dto';
import { sanitizeObject, sanitizeString, sanitizeEmail, sanitizeURL, containsNoSQLInjection } from '../utils/sanitization';

export interface AuthorWithCVFile {
  author: IAuthor;
  cvFile?: {
    data: Buffer;
    mimeType: string;
    fileName: string;
  };
}

export class AuthorService {
  /**
   * Create a new author
   * @param data - Author data
   * @param file - Optional CV file
   * @returns Created author
   */
  async createAuthor(data: CreateAuthorDto, file?: { buffer: Buffer; mimetype: string; originalname: string }): Promise<IAuthor> {
    try {
      // Sanitize input data
      const sanitizedData = this.sanitizeAuthorData(data);
      
      // Check for NoSQL injection
      if (containsNoSQLInjection(sanitizedData)) {
        throw new Error('Invalid input data detected');
      }
      
      const authorData: any = {
        name: sanitizedData.name,
        bio: sanitizedData.bio,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        nationality: sanitizedData.nationality,
        website: sanitizedData.website,
        cvData: sanitizedData.cvData
      };
      
      // Handle birthDate
      if (sanitizedData.birthDate) {
        authorData.birthDate = new Date(sanitizedData.birthDate);
      }
      
      // Handle CV file upload
      if (file) {
        authorData.cvFile = {
          data: file.buffer,
          mimeType: file.mimetype,
          fileName: file.originalname
        };
      }
      
      const author = new Author(authorData);
      return await author.save();
    } catch (error) {
      throw new Error(`Error creating author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all authors with pagination
   * @param query - Query parameters
   * @returns Authors and pagination info
   */
  async getAllAuthors(query?: AuthorQueryDto): Promise<{ authors: IAuthorResponse[]; total: number; page: number; limit: number }> {
    try {
      const page = query?.page || 1;
      const limit = query?.limit || 10;
      const skip = (page - 1) * limit;
      
      const mongoQuery: any = {};
      
      // Search filter
      if (query?.search) {
        const searchRegex = new RegExp(sanitizeString(query.search), 'i');
        mongoQuery.$or = [
          { name: searchRegex },
          { bio: searchRegex },
          { nationality: searchRegex }
        ];
      }
      
      // Nationality filter
      if (query?.nationality) {
        mongoQuery.nationality = new RegExp(sanitizeString(query.nationality), 'i');
      }
      
      const [authors, total] = await Promise.all([
        Author.find(mongoQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-cvFile.data'), // Exclude CV file data for list view
        Author.countDocuments(mongoQuery)
      ]);
      
      const authorResponses: IAuthorResponse[] = authors.map(author => this.toAuthorResponse(author));
      
      return {
        authors: authorResponses,
        total,
        page,
        limit
      };
    } catch (error) {
      throw new Error(`Error fetching authors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get author by ID
   * @param id - Author ID
   * @returns Author or null
   */
  async getAuthorById(id: string): Promise<IAuthor | null> {
    try {
      const author = await Author.findById(id).select('-cvFile.data');
      return author;
    } catch (error) {
      if ((error as any).name === 'CastError') {
        return null;
      }
      throw new Error(`Error fetching author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an author
   * @param id - Author ID
   * @param data - Update data
   * @param file - Optional CV file
   * @returns Updated author or null
   */
  async updateAuthor(id: string, data: UpdateAuthorDto, file?: { buffer: Buffer; mimetype: string; originalname: string }): Promise<IAuthor | null> {
    try {
      // Sanitize input data
      const sanitizedData = this.sanitizeAuthorData(data);
      
      // Check for NoSQL injection
      if (containsNoSQLInjection(sanitizedData)) {
        throw new Error('Invalid input data detected');
      }
      
      const updateData: any = {};
      
      // Only update fields that are provided
      if (sanitizedData.name !== undefined) updateData.name = sanitizedData.name;
      if (sanitizedData.bio !== undefined) updateData.bio = sanitizedData.bio;
      if (sanitizedData.email !== undefined) updateData.email = sanitizedData.email;
      if (sanitizedData.phone !== undefined) updateData.phone = sanitizedData.phone;
      if (sanitizedData.nationality !== undefined) updateData.nationality = sanitizedData.nationality;
      if (sanitizedData.website !== undefined) updateData.website = sanitizedData.website;
      if (sanitizedData.cvData !== undefined) updateData.cvData = sanitizedData.cvData;
      if (sanitizedData.birthDate !== undefined) updateData.birthDate = new Date(sanitizedData.birthDate);
      
      // Handle CV file upload
      if (file) {
        updateData.cvFile = {
          data: file.buffer,
          mimeType: file.mimetype,
          fileName: file.originalname
        };
      }
      
      const updated = await Author.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select('-cvFile.data');
      
      return updated;
    } catch (error) {
      if ((error as any).name === 'CastError') {
        return null;
      }
      throw new Error(`Error updating author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete an author
   * @param id - Author ID
   * @returns Deleted author or null
   */
  async deleteAuthor(id: string): Promise<IAuthor | null> {
    try {
      const author = await Author.findByIdAndDelete(id);
      return author;
    } catch (error) {
      if ((error as any).name === 'CastError') {
        return null;
      }
      throw new Error(`Error deleting author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a formatted CV from author's cvData
   * @param authorId - Author ID
   * @returns Generated CV data
   */
  async generateCV(authorId: string): Promise<GeneratedCVDto | null> {
    try {
      const author = await Author.findById(authorId);
      if (!author) {
        return null;
      }
      
      const generatedCV: GeneratedCVDto = {
        authorName: author.name,
        generatedAt: new Date(),
        bio: author.bio,
        email: author.email,
        phone: author.phone,
        nationality: author.nationality,
        website: author.website,
        cvData: author.cvData
      };
      
      return generatedCV;
    } catch (error) {
      if ((error as any).name === 'CastError') {
        return null;
      }
      throw new Error(`Error generating CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download CV file for an author
   * @param authorId - Author ID
   * @returns CV file data or null
   */
  async downloadCV(authorId: string): Promise<{ data: Buffer; mimeType: string; fileName: string } | null> {
    try {
      const author = await Author.findById(authorId);
      if (!author || !author.cvFile) {
        return null;
      }
      
      return {
        data: author.cvFile.data,
        mimeType: author.cvFile.mimeType,
        fileName: author.cvFile.fileName
      };
    } catch (error) {
      if ((error as any).name === 'CastError') {
        return null;
      }
      throw new Error(`Error downloading CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload CV file for an author
   * @param authorId - Author ID
   * @param file - CV file
   * @returns Updated author or null
   */
  async uploadCV(authorId: string, file: { buffer: Buffer; mimetype: string; originalname: string }): Promise<IAuthor | null> {
    try {
      const updated = await Author.findByIdAndUpdate(
        authorId,
        {
          $set: {
            cvFile: {
              data: file.buffer,
              mimeType: file.mimetype,
              fileName: file.originalname
            }
          }
        },
        { new: true, runValidators: true }
      ).select('-cvFile.data');
      
      return updated;
    } catch (error) {
      if ((error as any).name === 'CastError') {
        return null;
      }
      throw new Error(`Error uploading CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if author exists
   * @param id - Author ID
   * @returns True if author exists
   */
  async authorExists(id: string): Promise<boolean> {
    try {
      const author = await Author.findById(id);
      return !!author;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sanitize author data
   * @param data - Author data to sanitize
   * @returns Sanitized data
   */
  private sanitizeAuthorData(data: CreateAuthorDto | UpdateAuthorDto): any {
    const sanitized: any = {};
    
    if (data.name !== undefined) {
      sanitized.name = sanitizeString(data.name);
    }
    if (data.bio !== undefined) {
      sanitized.bio = sanitizeString(data.bio);
    }
    if (data.email !== undefined) {
      sanitized.email = sanitizeEmail(data.email);
    }
    if (data.phone !== undefined) {
      sanitized.phone = sanitizeString(data.phone);
    }
    if (data.nationality !== undefined) {
      sanitized.nationality = sanitizeString(data.nationality);
    }
    if (data.website !== undefined) {
      sanitized.website = sanitizeURL(data.website);
    }
    if (data.birthDate !== undefined) {
      sanitized.birthDate = data.birthDate;
    }
    if (data.cvData !== undefined) {
      sanitized.cvData = sanitizeObject(data.cvData);
    }
    
    return sanitized;
  }

  /**
   * Convert author document to response format
   * @param author - Author document
   * @returns Author response
   */
  private toAuthorResponse(author: IAuthor): IAuthorResponse {
    return {
      id: author._id.toString(),
      name: author.name,
      bio: author.bio,
      email: author.email,
      phone: author.phone,
      nationality: author.nationality,
      birthDate: author.birthDate,
      website: author.website,
      cvData: author.cvData,
      hasCVFile: !!author.cvFile,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt
    };
  }
}

export default new AuthorService();
