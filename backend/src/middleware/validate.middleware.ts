import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BusinessException } from '../errors/BusinessException.js';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const validationErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          code: e.code,
          message: e.message,
        }));
        return next(
          new BusinessException(
            'VALIDATION_ERROR',
            'Request validation failed',
            validationErrors
          )
        );
      }
      return next(new BusinessException('MALFORMED_REQUEST', 'Invalid request body'));
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const validationErrors = err.errors.map((e) => ({
          field: e.path.join('.'),
          code: e.code,
          message: e.message,
        }));
        return next(
          new BusinessException(
            'VALIDATION_ERROR',
            'Request query validation failed',
            validationErrors
          )
        );
      }
      return next(new BusinessException('MALFORMED_REQUEST', 'Invalid query parameters'));
    }
  };
}
