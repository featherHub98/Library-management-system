import { Router } from 'express';
import AuthorController from '../controllers/author.controller';
import multer from 'multer';
import { 
  validateAuthorCreation, 
  validateAuthorUpdate, 
  validateAuthorQuery 
} from '../middleware/validation.middleware';

const router = Router();

// Configure multer for file uploads (CV files)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept common document formats for CV
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.'));
    }
  }
});

// GET /authors - List all authors
router.get('/', validateAuthorQuery, AuthorController.getAllAuthors);

// GET /authors/:id - Get author by ID
router.get('/:id', AuthorController.getAuthorById);

// POST /authors - Create author (with optional CV file)
router.post('/', upload.single('cvFile'), validateAuthorCreation, AuthorController.createAuthor);

// PUT /authors/:id - Update author
router.put('/:id', upload.single('cvFile'), validateAuthorUpdate, AuthorController.updateAuthor);

// DELETE /authors/:id - Delete author
router.delete('/:id', AuthorController.deleteAuthor);

// GET /authors/:id/cv - Download CV
router.get('/:id/cv', AuthorController.downloadCV);

// POST /authors/:id/cv - Upload CV file
router.post('/:id/cv', upload.single('cvFile'), AuthorController.uploadCV);

// GET /authors/:id/cv/generate - Generate formatted CV from cvData
router.get('/:id/cv/generate', AuthorController.generateCV);

export default router;
