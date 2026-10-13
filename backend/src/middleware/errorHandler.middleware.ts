import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../errors/BusinessException.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. BusinessException
  if (err instanceof BusinessException) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      ...(err.validationErrors ? { validationErrors: err.validationErrors } : {}),
    });
    return;
  }

  // 2. Body-parser JSON parse error
  if (err.type === 'entity.parse.failed' || err.status === 400 && 'body' in err) {
    res.status(400).json({
      code: 'MALFORMED_REQUEST',
      message: 'Request body is invalid or malformed',
    });
    return;
  }

  // 3. PostgreSQL Database error codes
  if (err.code === '23505') {
    // Unique violation
    res.status(409).json({
      code: 'DATA_INTEGRITY_VIOLATION',
      message: 'A record with these details already exists.',
    });
    return;
  }

  if (err.code === '23503') {
    // Foreign key violation
    res.status(409).json({
      code: 'DATA_INTEGRITY_VIOLATION',
      message: 'The requested operation violates a database relational constraint.',
    });
    return;
  }

  console.error('[ServerError] Unhandled exception:', err);

  res.status(err.status || 500).json({
    code: err.code || 'ERR_INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected error occurred.',
  });
}
