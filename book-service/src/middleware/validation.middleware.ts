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