import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query } from 'express-validator';

export const validateBookCreation = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('author').notEmpty().withMessage('Author is required').trim(),
  body('basePrice')
    .isFloat({ min: 0 }).withMessage('Base price must be a positive number')
    .toFloat(),
  body('format')
    .isIn(['ebook','physical']).withMessage('Format must be ebook or physical'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt(),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateBookUpdate = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('author').optional().notEmpty().withMessage('Author cannot be empty').trim(),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Base price must be a positive number')
    .toFloat(),
  body('format')
    .optional()
    .isIn(['ebook','physical']).withMessage('Format must be ebook or physical'),
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
    .toInt(),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateBookQuery = [
  query('search').optional().isString().trim(),
  query('author').optional().isString().trim(),
  query('format').optional().isIn(['ebook','physical']),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1 }).toInt(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateBooking = [
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().toDate(),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().toDate(),
  body('userId').optional().isString().trim(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Author validation middlewares
export const validateAuthorCreation = [
  body('name')
    .notEmpty().withMessage('Author name is required')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 5000 }).withMessage('Bio cannot exceed 5000 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters')
    .trim(),
  body('nationality')
    .optional()
    .isLength({ max: 100 }).withMessage('Nationality cannot exceed 100 characters')
    .trim(),
  body('birthDate')
    .optional()
    .isISO8601().withMessage('Invalid birth date format')
    .toDate(),
  body('website')
    .optional()
    .isURL().withMessage('Invalid website URL')
    .isLength({ max: 500 }).withMessage('Website URL cannot exceed 500 characters')
    .trim(),
  body('cvData')
    .optional()
    .isObject().withMessage('CV data must be an object'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateAuthorUpdate = [
  body('name')
    .optional()
    .notEmpty().withMessage('Author name cannot be empty')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters')
    .trim(),
  body('bio')
    .optional()
    .isLength({ max: 5000 }).withMessage('Bio cannot exceed 5000 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters')
    .trim(),
  body('nationality')
    .optional()
    .isLength({ max: 100 }).withMessage('Nationality cannot exceed 100 characters')
    .trim(),
  body('birthDate')
    .optional()
    .isISO8601().withMessage('Invalid birth date format')
    .toDate(),
  body('website')
    .optional()
    .isURL().withMessage('Invalid website URL')
    .isLength({ max: 500 }).withMessage('Website URL cannot exceed 500 characters')
    .trim(),
  body('cvData')
    .optional()
    .isObject().withMessage('CV data must be an object'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateAuthorQuery = [
  query('search').optional().isString().trim(),
  query('nationality').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];