import { Request, Response, NextFunction } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: err.message
    });
    return;
  }

  if ((err as any).code === 11000) {
    res.status(400).json({
      success: false,
      error: 'Duplicate key error',
      details: 'A book with this information already exists'
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
    return;
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};